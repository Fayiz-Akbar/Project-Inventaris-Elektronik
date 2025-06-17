import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Helper function untuk format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

export default function Struk({ auth, penjualan }) {
    
    const handlePrint = () => { window.print(); };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Struk Transaksi</h2>}
        >
            <Head title={`Struk - ${penjualan.id}`} />

            <div className="py-12">
                <div className="max-w-md mx-auto sm:px-6 lg:px-8">
                    {/* ... (Tombol Aksi tidak berubah) ... */}
                    <div className="mb-6 flex justify-center space-x-4 print:hidden">
                        <Link href={route('transaksi.baru')} className="inline-block px-6 py-2 border border-gray-300 text-gray-700 font-medium text-sm leading-tight uppercase rounded shadow-md hover:bg-gray-100 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">Kembali</Link>
                        <button onClick={handlePrint} className="inline-block px-6 py-2 bg-blue-600 text-white font-medium text-sm leading-tight uppercase rounded shadow-md hover:bg-blue-700 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">Cetak</button>
                        <a href={route('transaksi.cetak_pdf', { penjualan: penjualan.id })} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2 bg-green-600 text-white font-medium text-sm leading-tight uppercase rounded shadow-md hover:bg-green-700 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">Simpan PDF</a>
                    </div>

                    <div id="receipt-area" className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 font-mono text-sm text-black">
                            {/* ... (Header & Detail tidak berubah) ... */}
                            <div className="text-center mb-3">
                                <h3 className="text-lg font-bold">Toko Inventaris Elektronik</h3>
                                <p className="text-xs">Jl. Kesuksesan No. 123, Kedaton, Bandar Lampung</p>
                                <p className="text-xs">0812-3456-7890</p>
                            </div>
                            <div className="border-t border-b border-dashed border-black py-2">
                                <div className="flex justify-between"><span>No. Transaksi</span><span>{penjualan.id}</span></div>
                                <div className="flex justify-between"><span>Kasir</span><span>{penjualan.user.name}</span></div>
                                <div className="flex justify-between"><span>Tanggal</span><span>{new Date(penjualan.tanggal_penjualan).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date(penjualan.tanggal_penjualan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
                            </div>
                            
                            {/* Daftar Item */}
                            <div className="border-b border-dashed border-black">
                                {/* Header untuk Daftar Item */}
                                <div className="flex justify-between items-start font-bold py-1 border-b border-black">
                                    <div className="flex-grow pr-2">
                                        <span>Nama Barang</span>
                                    </div>
                                    <div className="w-8 text-center">
                                        <span>Jml</span>
                                    </div>
                                    <div className="w-24 text-right">
                                        <span>Subtotal</span>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                    {penjualan.details.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start mb-1">
                                            <div className="flex-grow pr-2">
                                                <span>{item.barang.nama_barang}</span>
                                            </div>
                                            <div className="w-8 text-center">
                                                <span>{item.jumlah}</span>
                                            </div>
                                            <div className="w-24 text-right">
                                                <span>{formatRupiah(item.subtotal)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            <div className="border-b border-dashed border-black"></div>

                            {/* ... (Total & Footer tidak berubah) ... */}
                             <div className="py-2">
                                <div className="flex justify-between"><span>Total</span><span className="font-bold">{formatRupiah(penjualan.total_harga)}</span></div>
                                <div className="flex justify-between"><span>Metode Bayar</span><span>{penjualan.metode_pembayaran.nama_metode}</span></div>
                                <div className="flex justify-between"><span>Uang Bayar</span><span>{formatRupiah(penjualan.total_harga)}</span></div>
                                <div className="flex justify-between"><span>Kembalian</span><span>{formatRupiah(0)}</span></div>
                            </div>
                            <div className="border-t border-dashed border-black pt-3 text-center">
                                <p className="font-bold">Terima Kasih telah Berbelanja!</p>
                                <p className="text-xs mt-1">Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ... (CSS untuk print tidak berubah) ... */}
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        #receipt-area, #receipt-area * { visibility: visible; }
                        #receipt-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
                    }
                `}
            </style>
        </AuthenticatedLayout>
    );
}