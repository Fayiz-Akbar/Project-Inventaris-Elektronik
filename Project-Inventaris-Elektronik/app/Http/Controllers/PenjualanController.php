<?php

namespace App\Http\Controllers;

use App\Models\Penjualan;
use App\Models\Barang;
use App\Models\MetodePembayaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class PenjualanController extends Controller
{
    /**
     * Menampilkan halaman form untuk membuat transaksi baru.
     */
    public function create()
    {
        // Mengambil data barang yang stoknya masih ada dan semua metode pembayaran
        $barangs = Barang::select('id', 'nama_barang', 'harga', 'stok')->orderBy('nama_barang')->get();
        $metodePembayarans = MetodePembayaran::select('id', 'nama_metode')->orderBy('nama_metode')->get();

        return Inertia::render('Transaksi/Create', [
            'barangs' => $barangs,
            'metodePembayarans' => $metodePembayarans,
        ]);
    }

    /**
     * Menyimpan transaksi baru ke database setelah dikonfirmasi di frontend.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validasi data yang masuk dari form
        $request->validate([
            'nama_pelanggan' => 'nullable|string|max:255',
            'metode_pembayaran_id' => 'required|exists:metode_pembayarans,id',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ], [
            // Pesan error kustom untuk kejelasan
            'metode_pembayaran_id.required' => 'Metode pembayaran wajib dipilih.',
            'items.required' => 'Minimal harus ada satu barang dalam transaksi.',
            'items.*.barang_id.required' => 'Barang pada daftar tidak boleh kosong.',
            'items.*.jumlah.min' => 'Jumlah barang minimal 1.',
        ]);

        // 2. Gunakan DB Transaction untuk memastikan semua query berhasil atau tidak sama sekali
        DB::beginTransaction();
        try {
            $totalHarga = 0;

            // 3. Loop untuk validasi stok dan menghitung total harga
            foreach ($request->items as $item) {
                // Kunci barang untuk mencegah race condition (opsional tapi praktik yang baik)
                $barang = Barang::lockForUpdate()->find($item['barang_id']);

                if ($barang->stok < $item['jumlah']) {
                    // Jika stok tidak cukup, batalkan semua proses dan kirim pesan error
                    DB::rollBack();
                    return redirect()->back()->with('error', 'Stok ' . $barang->nama_barang . ' tidak mencukupi. Stok tersedia: ' . $barang->stok);
                }

                $totalHarga += $barang->harga * $item['jumlah'];
            }

            // 4. Buat record utama di tabel 'penjualans'
            $penjualan = Penjualan::create([
                'user_id' => Auth::id(),
                'metode_pembayaran_id' => $request->metode_pembayaran_id,
                'nama_pelanggan' => $request->nama_pelanggan,
                'tanggal_penjualan' => now(),
                'total_harga' => $totalHarga,
            ]);

            // 5. Simpan setiap item ke 'detail_penjualans' dan kurangi stok
            foreach ($request->items as $item) {
                $barang = Barang::find($item['barang_id']); // Ambil ulang barang (tanpa lock)
                $penjualan->details()->create([
                    'barang_id' => $barang->id,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $barang->harga,
                    'subtotal' => $barang->harga * $item['jumlah'],
                ]);

                // Kurangi stok barang terkait
                $barang->decrement('stok', $item['jumlah']);
            }

            // Jika semua proses berhasil, simpan permanen ke database
            DB::commit();

            // Kembalikan ke halaman transaksi dengan pesan sukses
            return redirect()->route('transaksi.baru')->with('success', 'Transaksi berhasil disimpan!');
        } catch (\Exception $e) {
            // Jika terjadi error di tengah jalan, batalkan semua perubahan
            DB::rollBack();
            // Kembalikan dengan pesan error umum
            return redirect()->back()->with('error', 'Gagal menyimpan transaksi: ' . $e->getMessage());
        }
    }
}
