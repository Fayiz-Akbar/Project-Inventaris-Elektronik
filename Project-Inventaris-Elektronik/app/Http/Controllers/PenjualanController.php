<?php

namespace App\Http\Controllers;

// Pengelompokan 'use' statements agar rapi
use App\Models\Barang;
use App\Models\MetodePembayaran;
use App\Models\Penjualan;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response; // Ini untuk PDF
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse; // Ini untuk halaman React
use Barryvdh\DomPDF\Facade\Pdf;

class PenjualanController extends Controller
{
    // Method untuk menampilkan form transaksi
    public function create(): InertiaResponse
    {
        return Inertia::render('Transaksi/Create', [
            'barangs' => Barang::where('stok', '>', 0)->select('id', 'nama_barang', 'harga', 'stok')->get(),
            'metodePembayarans' => MetodePembayaran::select('id', 'nama_metode')->get(),
        ]);
    }

    // Method untuk menyimpan transaksi
    public function store(Request $request): RedirectResponse
    {
        Validator::make($request->all(), [
            'metode_pembayaran_id' => 'required|exists:metode_pembayarans,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:barangs,id',
            'items.*.jumlah' => 'required|integer|min:1',
        ])->validate();

        $penjualan = null;

        DB::beginTransaction();
        try {
            $total_harga = 0;
            $validatedItems = [];
            foreach ($request->items as $item) {
                $barang = Barang::find($item['id']);
                if ($barang->stok < $item['jumlah']) {
                    throw ValidationException::withMessages([
                        'stok' => 'Stok untuk barang "' . $barang->nama_barang . '" tidak mencukupi. Sisa stok: ' . $barang->stok,
                    ]);
                }
                $subtotal = $barang->harga * $item['jumlah'];
                $total_harga += $subtotal;
                $validatedItems[] = ['barang' => $barang, 'jumlah' => $item['jumlah'], 'subtotal' => $subtotal];
            }
            $penjualan = Penjualan::create(['user_id' => Auth::id(), 'metode_pembayaran_id' => $request->metode_pembayaran_id, 'nama_pelanggan' => $request->nama_pelanggan, 'total_harga' => $total_harga, 'tanggal_penjualan' => now()]);
            foreach ($validatedItems as $item) {
                $penjualan->details()->create(['barang_id' => $item['barang']->id, 'jumlah' => $item['jumlah'], 'harga_satuan' => $item['barang']->harga, 'subtotal' => $item['subtotal']]);
                $item['barang']->decrement('stok', $item['jumlah']);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            if ($e instanceof ValidationException) { throw $e; }
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
        return redirect()->route('transaksi.struk', ['penjualan' => $penjualan->id])->with('message', 'Transaksi berhasil!');
    }

    // Method untuk menampilkan halaman struk (React)
    public function showStruk(Penjualan $penjualan): InertiaResponse
    {
        $penjualan->load(['details.barang', 'metodePembayaran', 'user']);
        return Inertia::render('Struk', ['penjualan' => $penjualan]);
    }

    // Method untuk membuat dan mengirim PDF
    public function cetakPdf(Penjualan $penjualan): Response
    {
        try {
            $penjualan->load(['details.barang', 'metodePembayaran', 'user']);
            
            $paperWidth = 80 * 2.83;

            $paperHeight = 841.89;
            $customPaper = array(0, 0, $paperWidth, $paperHeight);

            $pdf = Pdf::loadView('transaksi.struk_pdf', ['penjualan' => $penjualan])
                       ->setPaper($customPaper, 'portrait');

            $fileName = 'struk-' . $penjualan->id . '-' . now()->format('Ymd') . '.pdf';

            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="' . $fileName . '"');

        } catch (\Exception $e) {
            return new Response('<h1>Gagal membuat PDF</h1><p>Error: ' . $e->getMessage() . '</p>', 500);
        }
    }
}
