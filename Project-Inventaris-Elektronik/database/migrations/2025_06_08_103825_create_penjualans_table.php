// database/migrations/xxxx_xx_xx_xxxxxx_create_penjualans_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('penjualans', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Relasi ke tabel users
        $table->foreignId('metode_pembayaran_id')->nullable()->constrained('metode_pembayarans')->onDelete('set null'); // Relasi ke metode pembayaran
        $table->string('nama_pelanggan')->nullable();
        $table->dateTime('tanggal_penjualan')->default(now());
        $table->decimal('total_harga', 15, 2);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penjualans');
    }
};