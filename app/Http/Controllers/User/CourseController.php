<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Invoice;
use App\Services\TripayService;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourseController extends Controller
{
    private const ADMIN_WHATSAPP_URL = 'https://wa.me/+6285606391730';

    // protected $tripayService;
    protected $midtransService;

    public function __construct( MidtransService $midtransService)
    {
        // $this->tripayService = $tripayService;
        $this->midtransService = $midtransService;
    }

    public function index()
    {
        $categories = Category::all();
        $courses = Course::with(['category', 'user'])
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->get();

        $myCourseIds = [];
        if (Auth::check()) {
            $userId = Auth::id();
            $myCourseIds = Invoice::with('courseItems.course.category')
                ->where('user_id', $userId)
                ->where('status', 'paid')
                ->get()
                ->flatMap(function ($invoice) {
                    return $invoice->courseItems->pluck('course_id');
                })
                ->unique()
                ->values()
                ->all();
        }
        return Inertia::render('user/course/dashboard/index', ['categories' => $categories, 'courses' => $courses, 'myCourseIds' => $myCourseIds]);
    }

    public function detail(Request $request, Course $course)
    {
        $this->handleReferralCode($request);

        if ($course->status !== 'published') {
            return Inertia::render('user/unavailable/index', [
                'title' => 'Kelas Tidak Tersedia',
                'item' => $course->only(['title', 'slug', 'status']),
                'adminWhatsappUrl' => self::ADMIN_WHATSAPP_URL,
                'message' => 'Kelas tidak tersedia. Silahkan hubungi admin.',
                'backUrl' => route('course.index'),
                'backLabel' => 'Kembali ke Daftar Kelas',
            ])->toResponse($request)->setStatusCode(404);
        }

        $course->load(['category', 'user', 'tools', 'images', 'modules.lessons.quizzes.questions']);

        $relatedCourses = Course::with(['category'])
            ->where('status', 'published')
            ->where('category_id', $course->category_id)
            ->where('id', '!=', $course->id)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        $myCourseIds = [];
        if (Auth::check()) {
            $userId = Auth::id();
            $myCourseIds = Invoice::with('courseItems.course.category')
                ->where('user_id', $userId)
                ->where('status', 'paid')
                ->get()
                ->flatMap(function ($invoice) {
                    return $invoice->courseItems->pluck('course_id');
                })
                ->unique()
                ->values()
                ->all();
        }

        return Inertia::render('user/course/detail/index', [
            'course' => $course,
            'relatedCourses' => $relatedCourses,
            'myCourseIds' => $myCourseIds,
            'referralInfo' => $this->getReferralInfo(),
        ]);
    }

    public function showCheckout(Request $request, Course $course)
    {
        $this->handleReferralCode($request);

        if ($course->status !== 'published') {
            return Inertia::render('user/unavailable/index', [
                'title' => 'Kelas Tidak Tersedia',
                'item' => $course->only(['title', 'slug', 'status']),
                'adminWhatsappUrl' => self::ADMIN_WHATSAPP_URL,
                'message' => 'Kelas tidak tersedia. Silahkan hubungi admin.',
                'backUrl' => route('course.index'),
                'backLabel' => 'Kembali ke Daftar Kelas',
            ])->toResponse($request)->setStatusCode(404);
        }

        if (!Auth::check()) {
            $currentUrl = $request->fullUrl();
            return redirect()->route('login', ['redirect' => $currentUrl]);
        }

        $course->load(['modules.lessons']);
        $hasAccess = false;
        $activeInstallment = null;
        $pendingInvoice = null;
        $transactionDetail = null;

        $userId = Auth::id();

        if ($userId) {
            $activeInstallment = Invoice::getActiveInstallmentForUser($userId, 'course', $course->id);

            $hasAccess = Invoice::where('user_id', $userId)
                ->where('status', 'paid')
                ->whereHas('courseItems', function ($query) use ($course) {
                    $query->where('course_id', $course->id);
                })
                ->exists();

            // Cek akses via cicilan aktif
            if (!$hasAccess && $activeInstallment) {
                $firstTermPaid = ($activeInstallment['terms'][0]['status'] ?? '') === 'paid';
                $hasAccess = $firstTermPaid && empty($activeInstallment['access_suspended_at']);
            }

            if (!$hasAccess) {
                $invoice = Invoice::where('user_id', $userId)
                    ->where('status', 'pending')
                    ->whereHas('courseItems', function ($query) use ($course) {
                        $query->where('course_id', $course->id);
                    })
                    ->latest()
                    ->first();

                if ($invoice) {
                    $pendingInvoice = [
                        'id' => $invoice->id,
                        'invoice_code' => $invoice->invoice_code,
                        'status' => $invoice->status,
                        'amount' => $invoice->amount,
                        'payment_method' => $invoice->payment_method,
                        'invoice_url' => $invoice->invoice_url,
                        // 'payment_channel' => $invoice->payment_channel,
                        'va_number' => $invoice->va_number,
                        'qr_code_url' => $invoice->qr_code_url,
                        'bank_name' => $invoice->bank_name ?? null,
                        'created_at' => $invoice->created_at,
                        'expires_at' => $invoice->expires_at,
                    ];
                }
            }
        }

        return Inertia::render('user/course/checkout/index', [
            'course' => $course,
            'hasAccess' => $hasAccess,
            'activeInstallment' => $activeInstallment,
            'pendingInvoice' => $pendingInvoice,
            'transactionDetail' => $transactionDetail,
            // 'channels' => $this->midtransService->getPaymentChannels(),
            'referralInfo' => $this->getReferralInfo(),
            'installmentTerms' => $course->installmentTerms()->get(['term_number', 'amount', 'due_date']),
        ]);
    }

    public function showCheckoutSuccess()
    {
        return Inertia::render('user/checkout/success');
    }

    /**
     * Handle affiliate code dari URL parameter
     */
    private function handleReferralCode(Request $request): void
    {
        $affiliateCode = $request->query('ref');

        if ($affiliateCode) {
            session([
                'affiliate_code' => $affiliateCode,
            ]);
            cookie()->queue('affiliate_code', $affiliateCode, 60 * 24 * 30);
        }
    }

    /**
     * Get referral info untuk frontend
     */
    private function getReferralInfo(): array
    {
        $code = session('referral_code');
        return [
            'code' => $code,
            'hasActive' => !empty($code) && $code !== 'TAL2025',
        ];
    }
}
