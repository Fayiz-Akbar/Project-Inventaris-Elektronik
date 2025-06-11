<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Barang;
use App\Models\MetodePembayaran;
use App\Models\Penjualan; // <-- Pastikan ini sudah di-import
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;


class TransaksiController extends Controller
{
    /**
     * Menampilkan halaman form transaksi.
     */
    public function create()
    {
        return Inertia::render('Transaksi', [
            'barangs' => Barang::where('stok', '>', 0)->select('id', 'nama_barang', 'harga', 'stok')->get(),
            'metodePembayarans' => MetodePembayaran::select('id', 'nama_metode')->get(),
        ]);
    }

    /**
     * Menyimpan data transaksi baru dari form.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validasi input dasar dari frontend
        Validator::make($request->all(), [
            'metode_pembayaran_id' => 'required|exists:metode_pembayarans,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ])->validate();

        // 2. Gunakan DB Transaction untuk keamanan data
        try {
            DB::beginTransaction();

            $total_harga = 0;
            $validatedItems = [];

            // 3. Loop pertama: Validasi stok dan hitung total harga
            foreach ($request->items as $item) {
                $barang = Barang::find($item['id']);
                
                // Jika stok tidak mencukupi, batalkan transaksi dan beri pesan error
                if ($barang->stok < $item['jumlah']) {
                    DB::rollBack();
                    return back()->with('error', 'Stok untuk barang "' . $barang->nama_barang . '" tidak mencukupi. Stok tersisa: ' . $barang->stok);
                }
                
                $subtotal = $barang->harga * $item['jumlah'];
                $total_harga += $subtotal;
                
                // Simpan item yang sudah divalidasi untuk loop kedua
                $validatedItems[] = [
                    'barang' => $barang,
                    'jumlah' => $item['jumlah'],
                    'subtotal' => $subtotal
                ];
            }
            
            // 4. Buat record utama di tabel 'penjualans'
            $penjualan = Penjualan::create([
                'user_id' => Auth::id(),
                'metode_pembayaran_id' => $request->metode_pembayaran_id,
                'nama_pelanggan' => $request->nama_pelanggan ?? 'Pelanggan', // Opsional, jika Anda menambahkan field nama pelanggan
                'total_harga' => $total_harga,
                'tanggal_penjualan' => now(),
            ]);

            // 5. Loop kedua: Simpan setiap item ke 'detail_penjualans' dan kurangi stok
            foreach ($validatedItems as $item) {
                $penjualan->details()->create([
                    'barang_id' => $item['barang']->id,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $item['barang']->harga,
                    'subtotal' => $item['subtotal'],
                ]);
                
                // Kurangi stok barang terkait
                $item['barang']->decrement('stok', $item['jumlah']);
            }

            // Jika semua berhasil, konfirmasi perubahan ke database
            DB::commit();

        } catch (\Exception $e) {
            // Jika ada error di tengah jalan, batalkan semua query yang sudah dijalankan
            DB::rollBack();
            // Kembali dengan pesan error umum
            return back()->with('error', 'Terjadi kesalahan saat memproses transaksi: ' . $e->getMessage());
        }

        // Jika berhasil, kembali ke halaman form transaksi dengan pesan sukses
        return redirect()->route('transaksi.create')->with('message', 'Transaksi berhasil disimpan!');
    }
}