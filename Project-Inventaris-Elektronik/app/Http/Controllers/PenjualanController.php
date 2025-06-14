<?php
namespace App\Http\Controllers;

use App\Models\Penjualan;
use App\Models\DetailPenjualan;
use App\Models\Barang;
use App\Models\MetodePembayaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PenjualanController extends Controller
{
    public function create()
    {
        $barangs = Barang::select('id', 'nama_barang', 'harga', 'stok')->orderBy('nama_barang')->get();
        $metodePembayarans = MetodePembayaran::select('id', 'nama_metode')->orderBy('nama_metode')->get();

        return Inertia::render('Transaksi/Create', [
            'barangs' => $barangs,
            'metodePembayarans' => $metodePembayarans,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_pelanggan' => 'nullable|string|max:255',
            'metode_pembayaran_id' => 'required|exists:metode_pembayarans,id',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ], [
            'items.required' => 'Minimal ada satu barang dalam transaksi.',
            'items.min' => 'Minimal ada satu barang dalam transaksi.',
            'items.*.barang_id.required' => 'Barang tidak boleh kosong.',
            'items.*.barang_id.exists' => 'Barang yang dipilih tidak valid.',
            'items.*.jumlah.required' => 'Jumlah barang wajib diisi.',
            'items.*.jumlah.integer' => 'Jumlah barang harus berupa angka bulat.',
            'items.*.jumlah.min' => 'Jumlah barang minimal 1.',
            'metode_pembayaran_id.required' => 'Metode pembayaran wajib dipilih.',
            'metode_pembayaran_id.exists' => 'Metode pembayaran tidak valid.',
        ]);

        DB::beginTransaction();
        try {
            $totalHarga = 0;
            $processedItems = [];

            foreach ($request->items as $item) {
                $barang = Barang::find($item['barang_id']);

                if (!$barang) {
                    DB::rollBack();
                    return redirect()->back()->with('error', 'Barang tidak ditemukan.');
                }
                if ($barang->stok < $item['jumlah']) {
                    DB::rollBack();
                    return redirect()->back()->with('error', 'Stok ' . $barang->nama_barang . ' tidak mencukupi. Stok tersedia: ' . $barang->stok);
                }

                $subtotal = $barang->harga * $item['jumlah'];
                $totalHarga += $subtotal;

                $barang->stok -= $item['jumlah'];
                $barang->save();

                $processedItems[] = [
                    'barang_id' => $barang->id,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $barang->harga,
                    'subtotal' => $subtotal,
                ];
            }

            $penjualan = Penjualan::create([
                'nama_pelanggan' => $request->nama_pelanggan,
                'tanggal_penjualan' => now(),
                'total_harga' => $totalHarga,
                'user_id' => Auth::id(),
                'metode_pembayaran_id' => $request->metode_pembayaran_id,
            ]);

            foreach ($processedItems as $item) {
                $penjualan->details()->create($item);
            }

            DB::commit();
            return redirect()->route('transaksi.baru')->with('success', 'Transaksi berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan transaksi: ' . $e->getMessage());
        }
    }
}