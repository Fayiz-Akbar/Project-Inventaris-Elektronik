<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Struk Transaksi - {{ $penjualan->id }}</title>
    <style>
        /* ======================================================= */
        /* --- PERUBAHAN UTAMA ADA DI BAGIAN INI --- */
        /* ======================================================= */
        @page {
            margin: 3mm 5mm 3mm 5mm; 
        }

        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10pt;
            color: #000;
        }
        .receipt-container {
            width: 100%;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
        }
        .header p {
            margin: 0;
            font-size: 9pt;
        }
        .separator {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            padding: 2px 0;
        }
        .items-table th {
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            font-weight: bold;
        }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .footer {
            text-align: center;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            {{-- Ganti informasi toko Anda di sini --}}
            <h1>Toko Inventaris Elektronik</h1>
            <p>Jl. Kesuksesan No. 123, Kedaton, Bandar Lampung</p>
            <p>0812-3456-7890</p>
        </div>

        <div class="separator"></div>

        {{-- Layout berbasis tabel sudah benar --}}
        <table>
            <tr><td class="text-left">No. Transaksi</td><td class="text-right">{{ $penjualan->id }}</td></tr>
            <tr><td class="text-left">Kasir</td><td class="text-right">{{ $penjualan->user->name }}</td></tr>
            <tr><td class="text-left">Tanggal</td><td class="text-right">{{ \Carbon\Carbon::parse($penjualan->tanggal_penjualan)->isoFormat('D/MM/YY HH:mm') }}</td></tr>
        </table>

        <div class="separator"></div>
        <table class="items-table">
            <thead>
                <tr>
                    <th class="text-left" style="width: 50%;">Nama Barang</th>
                    <th class="text-center" style="width: 15%;">Jml</th>
                    <th class="text-right" style="width: 35%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($penjualan->details as $item)
                    <tr>
                        <td class="text-left">{{ $item->barang->nama_barang }}</td>
                        <td class="text-center">{{ $item->jumlah }}</td>
                        <td class="text-right">Rp{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="separator"></div>
        <table>
            <tr><td class="text-left">Total Harga</td><td class="text-right"><b>Rp{{ number_format($penjualan->total_harga, 0, ',', '.') }}</b></td></tr>
            <tr><td class="text-left">Metode Pembayaran</td><td class="text-right">{{ $penjualan->metodePembayaran->nama_metode }}</td></tr>
            <tr><td class="text-left">Uang Bayar</td><td class="text-right">Rp{{ number_format($penjualan->total_harga, 0, ',', '.') }}</td></tr>
            <tr><td class="text-left">Kembalian</td><td class="text-right">Rp{{ number_format(0, 0, ',', '.') }}</td></tr>
        </table>

        <div class="separator"></div>
        
        <div class="footer">
            <p><b>Terima Kasih telah Berbelanja!</b></p>
            <p style="font-size: 8pt; margin-top: 5px;">Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
        </div>
    </div>
</body>
</html>