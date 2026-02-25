<?php

use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TripayCallbackController;
use App\Http\Controllers\MidtransCallbackController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::post('/discount-codes/validate', [DiscountCodeController::class, 'validate'])->name('discount-codes.validate');

Route::post('/xendit/callback', [InvoiceController::class, 'callbackXendit'])->name('xendit.callback');

Route::post('/callback/tripay', [TripayCallbackController::class, 'handle'])->name('tripay.callback');

Route::post('/callback/midtrans', [MidtransCallbackController::class, 'handle'])->name('midtrans.callback');

Route::get('/search', [SearchController::class, 'search']);

Route::post('/check-email', function (Request $request) {
    $user = \App\Models\User::where('email', $request->email)->first();
    
    if ($user) {
        return response()->json([
            'exists' => true,
            'name' => $user->name,
            'phone_number' => $user->phone_number,
        ]);
    }
    
    return response()->json(['exists' => false]);
});
Route::post('/auto-login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'phone_number' => 'required|string',
    ]);

    $user = \App\Models\User::where('email', $request->email)
        ->where('phone_number', $request->phone_number)
        ->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Email atau nomor telepon tidak sesuai'
        ], 401);
    }

    // Login user tanpa password
    Auth::login($user, true); // true untuk remember me
    
    // Regenerate session untuk security
    $request->session()->regenerate();

    return response()->json([
        'success' => true,
        'message' => 'Login berhasil',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
        ]
    ]);
});
