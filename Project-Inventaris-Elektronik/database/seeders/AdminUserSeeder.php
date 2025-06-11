<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Import Facade DB
use Illuminate\Support\Facades\Hash; // Import Facade Hash

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'name' => 'Fayiz Akbar',
            'email' => 'fayiz@gmail.com', // Email admin yang akan Anda gunakan untuk login
            'password' => Hash::make('password123'), // Password admin, ganti "password123" dengan password yang lebih kuat jika ini untuk produksi
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Anda juga bisa menambahkan user lain jika diperlukan
        // DB::table('users')->insert([
        //     'name' => 'User Biasa',
        //     'email' => 'user@example.com',
        //     'password' => Hash::make('password'),
        //     'created_at' => now(),
        //     'updated_at' => now(),
        // ]);
    }
}