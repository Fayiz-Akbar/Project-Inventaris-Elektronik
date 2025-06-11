<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\DashboardController;
// Pastikan controller baru ini sudah di-import
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\LaporanController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Rute untuk Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rute Profil (Breeze default)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Rute Resource untuk Kategori
    Route::resource('kategori', KategoriController::class)->names([
        'index' => 'kategori.index',
        'create' => 'kategori.create',
        'store' => 'kategori.store',
        'show' => 'kategori.show',
        'edit' => 'kategori.edit',
        'update' => 'kategori.update',
        'destroy' => 'kategori.destroy',
    ]);

    // Rute Resource untuk Barang
    Route::resource('barang', BarangController::class)->names([
        'index' => 'barang.index',
        'create' => 'barang.create',
        'store' => 'barang.store',
        'show' => 'barang.show',
        'edit' => 'barang.edit',
        'update' => 'barang.update',
        'destroy' => 'barang.destroy',
    ]);

    // ===== BAGIAN YANG KITA UBAH DIMULAI DI SINI =====

    // Rute untuk Transaksi
    // Rute untuk Transaksi (Dengan nama yang sudah diperbaiki)
Route::get('/transaksi/baru', [TransaksiController::class, 'create'])->name('transaksi.create'); // <-- PASTIKAN NAMANYA INI
Route::post('/transaksi/baru', [TransaksiController::class, 'store'])->name('transaksi.simpan');


    // Rute untuk Laporan
    Route::get('/laporan/penjualan', [LaporanController::class, 'index'])->name('laporan.penjualan');

    // ===== AKHIR BAGIAN YANG DIUBAH =====

});

require __DIR__.'/auth.php'; // Rute autentikasi dari Breeze