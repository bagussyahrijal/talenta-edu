<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\Invoice;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourseController extends Controller
{
    protected $tripayService;

    public function __construct(TripayService $tripayService)
    {
        $this->tripayService = $tripayService;
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

        if (!Auth::check()) {
            $currentUrl = $request->fullUrl();
            return redirect()->route('login', ['redirect' => $currentUrl]);
        }

        $course->load(['modules.lessons']);
        $hasAccess = false;
        $pendingInvoice = null;
        $transactionDetail = null;

        $userId = Auth::id();

        $hasAccess = Invoice::where('user_id', $userId)
            ->where('status', 'paid')
            ->whereHas('courseItems', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })
            ->exists();

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
                    'payment_channel' => $invoice->payment_channel,
                    'va_number' => $invoice->va_number,
                    'qr_code_url' => $invoice->qr_code_url,
                    'bank_name' => $invoice->bank_name ?? null,
                    'created_at' => $invoice->created_at,
                    'expires_at' => $invoice->expires_at,
                ];

                if ($invoice->payment_reference) {
                    try {
                        $tripayDetail = $this->tripayService->detailTransaction($invoice->payment_reference);
                        if (isset($tripayDetail->data)) {
                            $transactionDetail = [
                                'reference' => $tripayDetail->data->reference ?? null,
                                'payment_name' => $tripayDetail->data->payment_name ?? null,
                                'pay_code' => $tripayDetail->data->pay_code ?? null,
                                'instructions' => $tripayDetail->data->instructions ?? [],
                                'status' => $tripayDetail->data->status ?? 'PENDING',
                                'paid_at' => $tripayDetail->data->paid_at ?? null,
                            ];
                        }
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::warning('Failed to fetch Tripay details', [
                            'invoice_code' => $invoice->invoice_code,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
        }

        return Inertia::render('user/course/checkout/index', [
            'course' => $course,
            'hasAccess' => $hasAccess,
            'pendingInvoice' => $pendingInvoice,
            'transactionDetail' => $transactionDetail,
            'channels' => $this->tripayService->getPaymentChannels(),
            'referralInfo' => $this->getReferralInfo(),
        ]);
    }

    public function showCheckoutSuccess()
    {
        return Inertia::render('user/checkout/success');
    }

    /**
     * Handle referral code dari URL parameter
     */
    private function handleReferralCode(Request $request): void
    {
        $referralCode = $request->query('ref');

        if ($referralCode) {
            session([
                'referral_code' => $referralCode,
            ]);
        }
    }

    /**
     * Get referral info untuk frontend
     */
    private function getReferralInfo(): array
    {
        return [
            'code' => session('referral_code'),
            'hasActive' => session('referral_code') && session('referral_code') !== 'TAL2025',
        ];
    }
}
