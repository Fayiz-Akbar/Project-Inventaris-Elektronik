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
        Schema::table('penjualans', function (Blueprint $table) {
            // Tambahkan kolom user_id setelah kolom 'id'
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('set null');
            
            // Tambahkan kolom metode_pembayaran_id setelah kolom 'user_id'
            $table->foreignId('metode_pembayaran_id')->nullable()->after('user_id')->constrained('metode_pembayarans')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penjualans', function (Blueprint $table) {
            // Hapus foreign key constraint terlebih dahulu
            $table->dropForeign(['user_id']);
            $table->dropForeign(['metode_pembayaran_id']);

            // Hapus kolomnya
            $table->dropColumn(['user_id', 'metode_pembayaran_id']);
        });
    }
};