<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // <-- Pastikan ini di-import

class MetodePembayaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus data lama untuk menghindari duplikat jika seeder dijalankan lagi
        DB::table('metode_pembayarans')->delete();

        // Masukkan data baru
        DB::table('metode_pembayarans')->insert([
            ['nama_metode' => 'Tunai', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'OVO', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'Gopay', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'Dana', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'ShopeePay', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'Kartu Debit', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'Kartu Kredit', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'Transfer Bank - BCA', 'created_at' => now(), 'updated_at' => now()],
            ['nama_metode' => 'Transfer Bank - Mandiri', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
