<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Penjualan;
use App\Models\User;
use App\Models\MetodePembayaran;

class LaporanController extends Controller
{
    /**
     * Menampilkan halaman laporan penjualan dengan filter.
     */
    public function index(Request $request)
    {
        // Memulai query dengan eager loading untuk performa
        $query = Penjualan::with(['user', 'metodePembayaran']);

        // =======================================================
        // INI ADALAH LOGIKA FILTER YANG HILANG
        // =======================================================
        // Terapkan filter berdasarkan request jika ada nilainya
        $query->when($request->filled('tanggal'), function ($q) use ($request) {
            $q->whereDate('tanggal_penjualan', $request->tanggal);
        });

        $query->when($request->filled('user_id'), function ($q) use ($request) {
            $q->where('user_id', $request->user_id);
        });

        $query->when($request->filled('metode_pembayaran_id'), function ($q) use ($request) {
            $q->where('metode_pembayaran_id', $request->metode_pembayaran_id);
        });
        // =======================================================

        // Mengambil data dengan paginasi dan menyertakan query string
        // agar filter tetap aktif saat pindah halaman
        $laporan = $query->orderBy('tanggal_penjualan', 'desc')->paginate(15)->withQueryString();

        // Mengirim data ke komponen React
        return Inertia::render('Laporan', [
            'laporan' => $laporan,
            // Mengirim kembali filter yang aktif ke frontend
            'filters' => $request->only(['tanggal', 'user_id', 'metode_pembayaran_id']),
            // Mengirim data untuk mengisi dropdown filter
            'admins' => User::select('id', 'name')->get(),
            'metodePembayarans' => MetodePembayaran::select('id', 'nama_metode')->get(),
        ]);
    }
}