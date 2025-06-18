<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PenjualanController; // PASTIKAN INI DIIMPORT, bukan TransaksiController
use App\Http\Controllers\LaporanController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Di sini Anda dapat mendaftarkan rute web untuk aplikasi Anda. Rute-rute ini
| dimuat oleh RouteServiceProvider dalam sebuah grup yang
| berisi middleware "web". Sekarang, buatlah sesuatu yang hebat!
|
*/

// TAMPILKAN LANDING PAGE KETIKA MENGAKSES URL UTAMA
Route::get('/', function () {
    return Inertia::render('LandingPage'); // Render komponen LandingPage.jsx
});

// Rute yang memerlukan autentikasi
Route::middleware(['auth', 'verified'])->group(function () {
    // Rute untuk Dashboard Admin
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rute Profil Pengguna (Default Laravel Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rute Resource untuk Manajemen Kategori
    // Menyediakan rute CRUD (index, create, store, show, edit, update, destroy)
    Route::resource('kategori', KategoriController::class)->names([
        'index' => 'kategori.index',
        'create' => 'kategori.create',
        'store' => 'kategori.store',
        'show' => 'kategori.show',
        'edit' => 'kategori.edit',
        'update' => 'kategori.update',
        'destroy' => 'kategori.destroy',
    ]);

    // Rute Resource untuk Manajemen Barang
    // Menyediakan rute CRUD (index, create, store, show, edit, update, destroy)
    Route::resource('barang', BarangController::class)->names([
        'index' => 'barang.index',
        'create' => 'barang.create',
        'store' => 'barang.store',
        'show' => 'barang.show',
        'edit' => 'barang.edit',
        'update' => 'barang.update',
        'destroy' => 'barang.destroy',
    ]);

    // Rute untuk Transaksi Penjualan
    // Route GET untuk menampilkan form pembuatan transaksi baru
    Route::get('/transaksi/baru', [PenjualanController::class, 'create'])->name('transaksi.baru');
    // Route POST untuk menyimpan data transaksi baru
    Route::post('/transaksi', [PenjualanController::class, 'store'])->name('transaksi.simpan');

    // Rute untuk Laporan Penjualan
    // Route GET untuk menampilkan halaman laporan penjualan dengan filter
    Route::get('/laporan/penjualan', [LaporanController::class, 'index'])->name('laporan.penjualan');
    // Route GET untuk mengunduh laporan penjualan dalam format PDF
    Route::get('/laporan/penjualan/export-pdf', [LaporanController::class, 'exportPdf'])->name('laporan.exportPdf');

});

// Menyertakan rute autentikasi bawaan dari Laravel Breeze
require __DIR__.'/auth.php';