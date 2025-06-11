<?php
namespace Database\Seeders;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminUserSeeder::class);
        // Anda bisa menambahkan seeder kategori atau barang dummy di sini nanti
        // $this->call(KategoriDummySeeder::class);
        // $this->call(BarangDummySeeder::class);
    }
}