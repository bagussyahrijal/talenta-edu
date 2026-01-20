<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Bootcamp;
use App\Models\Category;
use App\Models\Invoice;
use App\Services\TripayService;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BootcampController extends Controller
{
    // protected $tripayService;
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        // $this->tripayService = $tripayService;
        $this->midtransService = $midtransService;
    }
    public function index()
    {
        $categories = Category::all();
        $bootcamps = Bootcamp::with(['category', 'user'])
            ->where('status', 'published')
            ->where('registration_deadline', '>=', now())
            ->orderBy('start_date', 'asc')
            ->get();

        $myBootcampIds = [];
        if (Auth::check()) {
            $userId = Auth::id();
            $myBootcampIds = Invoice::with('bootcampItems.bootcamp.category')
                ->where('user_id', $userId)
                ->where('status', 'paid')
                ->get()
                ->flatMap(function ($invoice) {
                    return $invoice->bootcampItems->pluck('bootcamp_id');
                })
                ->unique()
                ->values()
                ->all();
        }
        return Inertia::render('user/bootcamp/dashboard/index', ['categories' => $categories, 'bootcamps' => $bootcamps, 'myBootcampIds' => $myBootcampIds]);
    }

    public function detail(Request $request, Bootcamp $bootcamp)
    {
        $this->handleReferralCode($request);

        $bootcamp->load(['category', 'schedules', 'tools', 'user']);

        $relatedBootcamps = Bootcamp::with(['category', 'user'])
            ->where('status', 'published')
            ->where('category_id', $bootcamp->category_id)
            ->where('id', '!=', $bootcamp->id)
            ->where('registration_deadline', '>=', now())
            ->orderBy('registration_deadline', 'asc')
            ->limit(3)
            ->get();

        $myBootcampIds = [];
        if (Auth::check()) {
            $userId = Auth::id();
            $myBootcampIds = Invoice::with('bootcampItems.bootcamp.category')
                ->where('user_id', $userId)
                ->where('status', 'paid')
                ->get()
                ->flatMap(function ($invoice) {
                    return $invoice->bootcampItems->pluck('bootcamp_id');
                })
                ->unique()
                ->values()
                ->all();
        }

        return Inertia::render('user/bootcamp/detail/index', [
            'bootcamp' => $bootcamp,
            'relatedBootcamps' => $relatedBootcamps,
            'myBootcampIds' => $myBootcampIds,
            'referralInfo' => $this->getReferralInfo(),
        ]);
    }

    public function showRegister(Request $request, Bootcamp $bootcamp)
    {
        $this->handleReferralCode($request);

        if (!Auth::check()) {
            $currentUrl = $request->fullUrl();
            return redirect()->route('login', ['redirect' => $currentUrl]);
        }

        $bootcamp->load(['schedules', 'tools', 'user', 'category']);
        $hasAccess = false;
        $pendingInvoice = null;
        $transactionDetail = null;

        $userId = Auth::id();

        $hasAccess = Invoice::where('user_id', $userId)
            ->where('status', 'paid')
            ->whereHas('bootcampItems', function ($query) use ($bootcamp) {
                $query->where('bootcamp_id', $bootcamp->id);
            })
            ->exists();

        if (!$hasAccess) {
            $invoice = Invoice::where('user_id', $userId)
                ->where('status', 'pending')
                ->whereHas('bootcampItems', function ($query) use ($bootcamp) {
                    $query->where('bootcamp_id', $bootcamp->id);
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
                    // 'payment_channel' => $invoice->payment_channel,
                    'va_number' => $invoice->va_number,
                    'qr_code_url' => $invoice->qr_code_url,
                    'bank_name' => $invoice->bank_name ?? null,
                    'created_at' => $invoice->created_at,
                    'expires_at' => $invoice->expires_at,
                ];

                // if ($invoice->payment_reference) {
                //     try {
                //         $tripayDetail = $this->tripayService->detailTransaction($invoice->payment_reference);
                //         if (isset($tripayDetail->data)) {
                //             $transactionDetail = [
                //                 'reference' => $tripayDetail->data->reference ?? null,
                //                 'payment_name' => $tripayDetail->data->payment_name ?? null,
                //                 'pay_code' => $tripayDetail->data->pay_code ?? null,
                //                 'instructions' => $tripayDetail->data->instructions ?? [],
                //                 'status' => $tripayDetail->data->status ?? 'PENDING',
                //                 'paid_at' => $tripayDetail->data->paid_at ?? null,
                //             ];
                //         }
                //     } catch (\Exception $e) {
                //         \Illuminate\Support\Facades\Log::warning('Failed to fetch Tripay details', [
                //             'invoice_code' => $invoice->invoice_code,
                //             'error' => $e->getMessage()
                //         ]);
                //     }
                // }
            }
        }

        return Inertia::render('user/bootcamp/register/index', [
            'bootcamp' => $bootcamp,
            'hasAccess' => $hasAccess,
            'pendingInvoice' => $pendingInvoice,
            'transactionDetail' => $transactionDetail,
            // 'channels' => $this->midtransService->getPaymentChannels(),
            'referralInfo' => $this->getReferralInfo(),
        ]);
    }

    public function showRegisterSuccess()
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
