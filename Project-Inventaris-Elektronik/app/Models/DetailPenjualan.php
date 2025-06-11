<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPenjualan extends Model
{
    use HasFactory;

    // Kolom yang dapat diisi secara massal
    protected $fillable = [
        'penjualan_id',
        'barang_id',
        'jumlah',
        'harga_satuan',
        'subtotal',
    ];

    // Relasi One-to-Many (Inverse) ke Penjualan
    public function penjualan()
    {
        return $this->belongsTo(Penjualan::class);
    }

    // Relasi One-to-Many (Inverse) ke Barang
    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }
}