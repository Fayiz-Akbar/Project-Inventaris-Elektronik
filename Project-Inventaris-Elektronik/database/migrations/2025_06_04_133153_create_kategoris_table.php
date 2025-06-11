// database/migrations/xxxx_xx_xx_xxxxxx_create_kategoris_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategoris', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kategori')->unique(); // Nama kategori harus unik
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('kategoris');
    }
};