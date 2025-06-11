<?php
namespace App\Http\Controllers;
use App\Models\Barang;
use App\Models\Kategori; // Penting: Pastikan ini diimpor untuk dropdown kategori
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class BarangController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $kategoriFilter = $request->input('kategori');
        $stokFilter = $request->input('stok');

        $barangs = Barang::with('kategori') // Memuat relasi kategori untuk ditampilkan
            ->when($search, function ($query, $search) {
                $query->where('nama_barang', 'like', '%' . $search . '%')
                      ->orWhere('deskripsi', 'like', '%' . $search . '%');
            })
            ->when($kategoriFilter && $kategoriFilter !== 'all', function ($query, $kategoriFilter) {
                $query->where('kategori_id', $kategoriFilter);
            })
            ->when($stokFilter && $stokFilter !== 'all', function ($query, $stokFilter) {
                if ($stokFilter === 'empty') {
                    $query->where('stok', 0);
                } elseif ($stokFilter === 'low') {
                    $query->where('stok', '>', 0)->where('stok', '<=', 5); // Batas stok rendah: 5
                } elseif ($stokFilter === 'ready') {
                    $query->where('stok', '>', 5); // Stok siap: di atas 5
                }
            })
            ->orderBy('nama_barang')
            ->paginate(10) // Pagination
            ->withQueryString(); // Mempertahankan filter saat navigasi halaman

        $kategoris = Kategori::orderBy('nama_kategori')->get(['id', 'nama_kategori']); // Ambil semua kategori untuk dropdown filter dan form

        return Inertia::render('Barang/Index', [
            'barangs' => $barangs,
            'kategoris' => $kategoris, // Kirim daftar kategori ke frontend
            'filters' => [
                'search' => $search,
                'kategori' => $kategoriFilter,
                'stok' => $stokFilter,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kategori_id' => ['nullable', Rule::exists('kategoris', 'id')],
            'nama_barang' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'stok' => 'required|integer|min:0',
        ], [
            'nama_barang.required' => 'Nama barang wajib diisi.',
            'harga.required' => 'Harga wajib diisi.',
            'harga.numeric' => 'Harga harus berupa angka.',
            'harga.min' => 'Harga tidak boleh kurang dari 0.',
            'stok.required' => 'Stok wajib diisi.',
            'stok.integer' => 'Stok harus berupa bilangan bulat.',
            'stok.min' => 'Stok tidak boleh kurang dari 0.',
            'kategori_id.exists' => 'Kategori tidak valid.',
        ]);

        Barang::create($request->all());
        return redirect()->route('barang.index')->with('success', 'Barang berhasil ditambahkan!');
    }

    public function update(Request $request, Barang $barang)
    {
        $request->validate([
            'kategori_id' => ['nullable', Rule::exists('kategoris', 'id')],
            'nama_barang' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'stok' => 'required|integer|min:0',
        ], [
            'nama_barang.required' => 'Nama barang wajib diisi.',
            'harga.required' => 'Harga wajib diisi.',
            'harga.numeric' => 'Harga harus berupa angka.',
            'harga.min' => 'Harga tidak boleh kurang dari 0.',
            'stok.required' => 'Stok wajib diisi.',
            'stok.integer' => 'Stok harus berupa bilangan bulat.',
            'stok.min' => 'Stok tidak boleh kurang dari 0.',
            'kategori_id.exists' => 'Kategori tidak valid.',
        ]);

        $barang->update($request->all());
        return redirect()->route('barang.index')->with('success', 'Barang berhasil diperbarui!');
    }

    public function destroy(Barang $barang)
    {
        $barang->delete();
        return redirect()->route('barang.index')->with('success', 'Barang berhasil dihapus!');
    }
}