<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
     protected $guarded = [];
    public function detailPenjualans() { return $this->hasMany(DetailPenjualan::class); }
    
    use HasFactory;
    protected $fillable = [
        'kategori_id',
        'nama_barang',
        'deskripsi',
        'harga',
        'stok',
    ];

    // Relasi ke Kategori (satu barang dimiliki oleh satu kategori)
    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }
}