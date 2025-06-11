import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Pastikan path ini benar

export default function Transaksi({ auth, barangs, metodePembayarans, flash }) {

    const { data, setData, post, processing, errors, reset } = useForm({
        metode_pembayaran_id: '',
        items: [{ id: '', jumlah: 1 }]
    });

    const [detailedItems, setDetailedItems] = React.useState([{ id: '', jumlah: 1, harga: 0, stok: 0 }]);

    const totalHarga = detailedItems.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
    
    const handleAddItem = () => {
        setData('items', [...data.items, { id: '', jumlah: 1 }]);
        setDetailedItems([...detailedItems, { id: '', jumlah: 1, harga: 0, stok: 0 }]);
    };

    const handleRemoveItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
        setDetailedItems(detailedItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, event) => {
        const { name, value } = event.target;
        
        const newItems = [...data.items];
        newItems[index][name] = value;
        setData('items', newItems);

        const newDetailedItems = [...detailedItems];
        if (name === 'id') {
            const selectedBarang = barangs.find(b => b.id === parseInt(value));
            newDetailedItems[index] = {
                id: value,
                jumlah: 1,
                harga: selectedBarang ? selectedBarang.harga : 0,
                stok: selectedBarang ? selectedBarang.stok : 0,
            };
            newItems[index]['jumlah'] = 1;
            setData('items', newItems);
        } else {
            newDetailedItems[index].jumlah = parseInt(value) || 1;
        }
        setDetailedItems(newDetailedItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('transaksi.simpan'), {
            onSuccess: () => {
                reset(); 
                setDetailedItems([{ id: '', jumlah: 1, harga: 0, stok: 0 }]);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Buat Transaksi Baru</h2>}
        >
            <Head title="Transaksi Baru" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            
                            {/* ======================================================= */}
                            {/* INI BAGIAN YANG DIPERBAIKI */}
                            {/* ======================================================= */}
                            {flash && flash.message && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                                    <p className="font-bold">Sukses</p>
                                    <p>{flash.message}</p>
                                </div>
                            )}
                            {/* ======================================================= */}

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    {detailedItems.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 border-b pb-4">
                                            <div className="flex-grow">
                                                <label className="block text-sm font-medium text-gray-700">Barang</label>
                                                <select 
                                                    name="id" 
                                                    value={data.items[index].id} 
                                                    onChange={(e) => handleItemChange(index, e)} 
                                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                    required
                                                >
                                                    <option value="">-- Pilih Barang --</option>
                                                    {barangs.map(barang => (
                                                        <option key={barang.id} value={barang.id}>
                                                            {barang.nama_barang} (Stok: {barang.stok})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`items.${index}.id`] && <div className="text-red-600 text-sm mt-1">{errors[`items.${index}.id`]}</div>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                                                <input
                                                    type="number"
                                                    name="jumlah"
                                                    min="1"
                                                    max={item.stok}
                                                    value={data.items[index].jumlah}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                    className="mt-1 block w-24 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                    required
                                                />
                                            </div>
                                            <div className="w-48 pt-6">
                                                <span>Subtotal: Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="pt-6">
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-800 font-medium">
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button type="button" onClick={handleAddItem} className="mt-4 text-sm text-indigo-600 hover:text-indigo-900 font-semibold">
                                    + Tambah Barang
                                </button>
                                
                                <div className="border-t mt-6 pt-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <label htmlFor="metode_pembayaran_id" className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                                            <select 
                                                id="metode_pembayaran_id"
                                                value={data.metode_pembayaran_id} 
                                                onChange={(e) => setData('metode_pembayaran_id', e.target.value)} 
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                required
                                            >
                                                <option value="">-- Pilih Metode --</option>
                                                {metodePembayarans.map(metode => (
                                                    <option key={metode.id} value={metode.id}>{metode.nama_metode}</option>
                                                ))}
                                            </select>
                                            {errors.metode_pembayaran_id && <div className="text-red-600 text-sm mt-1">{errors.metode_pembayaran_id}</div>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Keseluruhan</p>
                                            <p className="text-2xl font-bold">Rp {totalHarga.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button type="submit" disabled={processing} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                                        {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}