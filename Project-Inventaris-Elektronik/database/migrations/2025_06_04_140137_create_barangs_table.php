// database/migrations/xxxx_xx_xx_xxxxxx_create_barangs_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barangs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')
                  ->nullable() // Bisa null jika barang tidak punya kategori
                  ->constrained('kategoris') // Foreign key ke tabel kategoris
                  ->onDelete('set null'); // Jika kategori dihapus, kategori_id di barang menjadi null

            $table->string('nama_barang');
            $table->text('deskripsi')->nullable();
            $table->decimal('harga', 10, 2); // Harga dengan 10 digit total, 2 di belakang koma
            $table->integer('stok')->default(0); // Stok default 0
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('barangs');
    }
};