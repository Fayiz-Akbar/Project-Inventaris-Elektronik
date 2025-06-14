<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Penjualan;
use App\Models\DetailPenjualan;
use App\Models\Kategori; // Perlu diimpor untuk widget kategori terbanyak
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // --- Data Ringkasan Umum (Opsional, bisa tetap ditampilkan di bawah) ---
        $totalPenjualanHariIni = Penjualan::whereDate('tanggal_penjualan', today())->sum('total_harga');
        $barangTersediaCount = Barang::where('stok', '>', 0)->count();

        $produkTerlarisBulanIni = 'Belum ada data';
        $topSellingItems = DetailPenjualan::select('barang_id', DB::raw('SUM(jumlah) as total_qty'))
            ->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->groupBy('barang_id')
            ->orderByDesc('total_qty')
            ->with('barang')
            ->first();

        if ($topSellingItems && $topSellingItems->barang) {
            $produkTerlarisBulanIni = $topSellingItems->barang->nama_barang . ' (' . $topSellingItems->total_qty . ' pcs)';
        }


        // --- Data Widget Rekapitulasi BARU (sesuai permintaan) ---

        // 1. Pencapaian Target Penjualan Bulanan (Target 135 Juta)
        $totalPenjualanBulanIniActual = Penjualan::whereBetween('tanggal_penjualan', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
                                            ->sum('total_harga');
        $targetPenjualanBulanIni = 135000000; // Target 135 juta
        $persentasePenjualanTerpenuhi = $targetPenjualanBulanIni > 0 ? round(($totalPenjualanBulanIniActual / $targetPenjualanBulanIni) * 100, 1) : 0;
        if ($persentasePenjualanTerpenuhi > 100) $persentasePenjualanTerpenuhi = 100;


        // 2. Barang Stok Rendah
        $barangStokRendahCount = Barang::where('stok', '>', 0)->where('stok', '<=', 5)->count(); // Batas rendah: 5
        $totalBarangDiSistem = Barang::count(); // Total barang di sistem
        $persentaseStokRendah = $totalBarangDiSistem > 0 ? round(($barangStokRendahCount / $totalBarangDiSistem) * 100, 1) : 0;


        // 3. Barang Stok Habis (Baru)
        $barangStokHabisCount = Barang::where('stok', 0)->count();
        $persentaseStokHabis = $totalBarangDiSistem > 0 ? round(($barangStokHabisCount / $totalBarangDiSistem) * 100, 1) : 0;

        // 4. Transaksi Berhasil Hari Ini (Baru)
        $jumlahTransaksiHariIni = Penjualan::whereDate('tanggal_penjualan', today())->count();
        $targetTransaksiHarian = 20; // Contoh: Target 20 transaksi per hari
        $persentaseTransaksiHarianTerpenuhi = $targetTransaksiHarian > 0 ? round(($jumlahTransaksiHariIni / $targetTransaksiHarian) * 100, 1) : 0;
        if ($persentaseTransaksiHarianTerpenuhi > 100) $persentaseTransaksiHarianTerpenuhi = 100;


        // --- Data untuk Grafik (Nilai Barang Masuk vs Nilai Barang Terjual) ---
        $chartPeriod = $request->input('chart_period', 'monthly');
        $chartData = $this->getChartData($chartPeriod);


        // --- Data untuk Tabel Terbaru ---
        $latestSoldItems = DetailPenjualan::orderBy('created_at', 'desc')
            ->limit(5)
            ->with(['barang', 'penjualan'])
            ->get()
            ->map(function($detail) {
                return [
                    'nama_barang' => $detail->barang->nama_barang,
                    'jumlah' => $detail->jumlah,
                    'tanggal_transaksi' => $detail->created_at->format('d M Y H:i'),
                    'nama_pelanggan' => $detail->penjualan->nama_pelanggan ?: 'Umum',
                ];
            });

        $latestAddedItems = Barang::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($barang) {
                return [
                    'nama_barang' => $barang->nama_barang,
                    'stok' => $barang->stok,
                    'tanggal_masuk' => $barang->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('Dashboard', [
            // Props lama (sebagian akan dipakai di widget umum atau tabel)
            'totalPenjualanHariIni' => $totalPenjualanHariIni,
            'barangTersediaCount' => $barangTersediaCount,
            'produkTerlarisBulanIni' => $produkTerlarisBulanIni,

            // Props untuk Grafik
            'chartData' => $chartData,
            'chartPeriod' => $chartPeriod,

            // Props untuk Tabel Terbaru
            'latestSoldItems' => $latestSoldItems,
            'latestAddedItems' => $latestAddedItems,

            // Props BARU untuk widget rekapitulasi (sesuai permintaan)
            'targetPenjualanBulanIni' => $targetPenjualanBulanIni,
            'totalPenjualanBulanIniActual' => $totalPenjualanBulanIniActual,
            'persentasePenjualanTerpenuhi' => $persentasePenjualanTerpenuhi,

            'barangStokRendahCount' => $barangStokRendahCount,
            'totalBarangDiSistem' => $totalBarangDiSistem,
            'persentaseStokRendah' => $persentaseStokRendah,

            'barangStokHabisCount' => $barangStokHabisCount,
            'persentaseStokHabis' => $persentaseStokHabis,

            'jumlahTransaksiHariIni' => $jumlahTransaksiHariIni,
            'targetTransaksiHarian' => $targetTransaksiHarian,
            'persentaseTransaksiHarianTerpenuhi' => $persentaseTransaksiHarianTerpenuhi,
        ]);
    }

    private function getChartData($period)
    {
        $labels = [];
        $barangMasukData = [];
        $barangTerjualData = [];

        switch ($period) {
            case 'daily':
                $now = Carbon::now();
                for ($i = 6; $i >= 0; $i--) {
                    $date = $now->copy()->subDays($i);
                    $labels[] = $date->format('D, d M');
                    $barangMasukData[] = Barang::whereDate('created_at', $date)->sum(DB::raw('harga * stok'));
                    $barangTerjualData[] = DetailPenjualan::whereDate('created_at', $date)->sum('subtotal');
                }
                break;
            case 'weekly':
                $now = Carbon::now();
                for ($i = 3; $i >= 0; $i--) {
                    $startOfWeek = $now->copy()->subWeeks($i)->startOfWeek(Carbon::MONDAY);
                    $endOfWeek = $now->copy()->subWeeks($i)->endOfWeek(Carbon::SUNDAY);
                    $labels[] = $startOfWeek->format('d/m') . ' - ' . $endOfWeek->format('d/m');
                    $barangMasukData[] = Barang::whereBetween('created_at', [$startOfWeek, $endOfWeek])->sum(DB::raw('harga * stok'));
                    $barangTerjualData[] = DetailPenjualan::whereBetween('created_at', [$startOfWeek, $endOfWeek])->sum('subtotal');
                }
                break;
            case 'monthly':
            default:
                $now = Carbon::now();
                for ($i = 5; $i >= 0; $i--) {
                    $month = $now->copy()->subMonths($i);
                    $labels[] = $month->format('M Y');
                    $barangMasukData[] = Barang::whereMonth('created_at', $month->month)
                                                ->whereYear('created_at', $month->year)
                                                ->sum(DB::raw('harga * stok'));
                    $barangTerjualData[] = DetailPenjualan::whereMonth('created_at', $month->month)
                                                          ->whereYear('created_at', $month->year)
                                                          ->sum('subtotal');
                }
                break;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Total Nilai Barang Masuk',
                    'data' => $barangMasukData,
                    'backgroundColor' => 'rgba(75, 192, 192, 0.6)',
                    'borderColor' => 'rgba(75, 192, 192, 1)',
                    'borderWidth' => 1,
                ],
                [
                    'label' => 'Total Nilai Barang Terjual',
                    'data' => $barangTerjualData,
                    'backgroundColor' => 'rgba(153, 102, 255, 0.6)',
                    'borderColor' => 'rgba(153, 102, 255, 1)',
                    'borderWidth' => 1,
                ],
            ],
        ];
    }
}