<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Penjualan;
use App\Models\DetailPenjualan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // PASTIKAN BARIS INI ADA!

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // --- 1. Data Ringkasan Widget ---
        $totalPenjualanHariIni = Penjualan::whereDate('tanggal_penjualan', today())->sum('total_harga');
        $barangTersediaCount = Barang::where('stok', '>', 0)->count();

        // Produk terlaris bulan ini
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

        // --- 2. Data untuk Grafik (Nilai Barang Masuk vs Nilai Barang Terjual) ---
        $chartPeriod = $request->input('chart_period', 'monthly');
        $chartData = $this->getChartData($chartPeriod); // Panggil metode yang sudah diperbarui

        // --- 3. Data untuk Tabel Terbaru ---
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
            'totalPenjualanHariIni' => $totalPenjualanHariIni,
            'barangTersediaCount' => $barangTersediaCount,
            'produkTerlarisBulanIni' => $produkTerlarisBulanIni,
            'chartData' => $chartData,
            'chartPeriod' => $chartPeriod,
            'latestSoldItems' => $latestSoldItems,
            'latestAddedItems' => $latestAddedItems,
        ]);
    }

    // --- METODE GETCHARTDATA YANG SUDAH DIUBAH UNTUK MENGHITUNG NILAI RUPIAH ---
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

                    // Hitung total nilai barang masuk (harga * stok)
                    $barangMasukData[] = Barang::whereDate('created_at', $date)->sum(DB::raw('harga * stok'));
                    // Hitung total nilai barang terjual (subtotal)
                    $barangTerjualData[] = DetailPenjualan::whereDate('created_at', $date)->sum('subtotal');
                }
                break;
            case 'weekly':
                $now = Carbon::now();
                for ($i = 3; $i >= 0; $i--) {
                    $startOfWeek = $now->copy()->subWeeks($i)->startOfWeek(Carbon::MONDAY);
                    $endOfWeek = $now->copy()->subWeeks($i)->endOfWeek(Carbon::SUNDAY);

                    $labels[] = $startOfWeek->format('d/m') . ' - ' . $endOfWeek->format('d/m');

                    // Hitung total nilai barang masuk (harga * stok)
                    $barangMasukData[] = Barang::whereBetween('created_at', [$startOfWeek, $endOfWeek])->sum(DB::raw('harga * stok'));
                    // Hitung total nilai barang terjual (subtotal)
                    $barangTerjualData[] = DetailPenjualan::whereBetween('created_at', [$startOfWeek, $endOfWeek])->sum('subtotal');
                }
                break;
            case 'monthly':
            default:
                $now = Carbon::now();
                for ($i = 5; $i >= 0; $i--) {
                    $month = $now->copy()->subMonths($i);
                    $labels[] = $month->format('M Y');

                    // Hitung total nilai barang masuk (harga * stok)
                    $barangMasukData[] = Barang::whereMonth('created_at', $month->month)
                                                ->whereYear('created_at', $month->year)
                                                ->sum(DB::raw('harga * stok'));
                    // Hitung total nilai barang terjual (subtotal)
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
                    'label' => 'Total Nilai Barang Masuk', // Ubah label
                    'data' => $barangMasukData,
                    'backgroundColor' => 'rgba(75, 192, 192, 0.6)',
                    'borderColor' => 'rgba(75, 192, 192, 1)',
                    'borderWidth' => 1,
                ],
                [
                    'label' => 'Total Nilai Barang Terjual', // Ubah label
                    'data' => $barangTerjualData,
                    'backgroundColor' => 'rgba(153, 102, 255, 0.6)',
                    'borderColor' => 'rgba(153, 102, 255, 1)',
                    'borderWidth' => 1,
                ],
            ],
        ];
    }
}