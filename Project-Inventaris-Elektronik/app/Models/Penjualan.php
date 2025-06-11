<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penjualan extends Model
{
    use HasFactory; // Trait sebaiknya diletakkan di atas

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',                // <-- TAMBAHKAN INI
        'metode_pembayaran_id',   // <-- TAMBAHKAN INI
        'nama_pelanggan',
        'tanggal_penjualan',
        'total_harga',
    ];

    // --- Relasi-relasi Anda ---
    public function user() { return $this->belongsTo(User::class); }
    public function metodePembayaran() { return $this->belongsTo(MetodePembayaran::class); }
    public function details() { return $this->hasMany(DetailPenjualan::class); }
}