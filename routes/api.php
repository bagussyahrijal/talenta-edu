<?php

use App\Http\Controllers\DiscountCodeController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TripayCallbackController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Route::post('/discount-codes/validate', [DiscountCodeController::class, 'validate'])->name('discount-codes.validate');

Route::post('/xendit/callback', [InvoiceController::class, 'callbackXendit'])->name('xendit.callback');

Route::post('/callback/tripay', [TripayCallbackController::class, 'handle'])->name('tripay.callback');

Route::get('/search', [SearchController::class, 'search']);
