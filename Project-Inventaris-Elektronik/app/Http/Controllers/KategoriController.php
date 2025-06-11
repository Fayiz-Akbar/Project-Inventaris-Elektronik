<?php
namespace App\Http\Controllers;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class KategoriController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $kategoris = Kategori::when($search, function ($query) use ($search) {
                        $query->where('nama_kategori', 'like', '%' . $search . '%');
                    })
                    ->orderBy('nama_kategori')
                    ->paginate(10)
                    ->withQueryString();

        return Inertia::render('Kategori/Index', [
            'kategoris' => $kategoris,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255', Rule::unique('kategoris')],
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori ini sudah ada.',
        ]);

        Kategori::create($request->all());
        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function update(Request $request, Kategori $kategori)
    {
        $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255', Rule::unique('kategoris')->ignore($kategori->id)],
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori ini sudah ada.',
        ]);

        $kategori->update($request->all());
        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(Kategori $kategori)
    {
        $kategori->delete();
        return redirect()->route('kategori.index')->with('success', 'Kategori berhasil dihapus!');
    }
}