<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlumniController extends Controller
{
    public function index()
    {
        return Inertia::render('user/alumni/index', [
            'breadcrumbs' => [
                ['label' => 'Beranda', 'href' => route('home')],
                ['label' => 'Alumni', 'href' => null],
            ],
        ]);
    }
}
