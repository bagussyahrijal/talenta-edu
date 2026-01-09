<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        return Inertia::render('user/review/index', [
            'breadcrumbs' => [
                ['label' => 'Beranda', 'href' => route('home')],
                ['label' => 'Review', 'href' => null],
            ],
        ]);
    }
}
