<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function index()
    {
        return Inertia::render('user/galery/index', [
            'breadcrumbs' => [
                ['label' => 'Beranda', 'href' => route('home')],
                ['label' => 'Galeri', 'href' => null],
            ],
        ]);
    }
}
