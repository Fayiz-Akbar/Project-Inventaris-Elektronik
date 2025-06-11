import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Props datang dari LaporanController di Laravel
export default function Laporan({ auth, laporan, filters, admins, metodePembayarans }) {
    
    // State untuk mengelola nilai input form filter, diinisialisasi dengan nilai filter sebelumnya
    const [filterValues, setFilterValues] = useState({
        tanggal: filters.tanggal || '',
        user_id: filters.user_id || '',
        metode_pembayaran_id: filters.metode_pembayaran_id || ''
    });

    const handleFilterChange = (e) => {
        setFilterValues(prevValues => ({
            ...prevValues,
            [e.target.name]: e.target.value
        }));
    };

    // Fungsi untuk mengirim request filter ke backend
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('laporan.penjualan'), filterValues, {
            preserveState: true,
            replace: true,
        });
    };

    // Fungsi untuk mereset filter
    const resetFilter = () => {
        const emptyFilters = { tanggal: '', user_id: '', metode_pembayaran_id: '' };
        setFilterValues(emptyFilters);
        router.get(route('laporan.penjualan'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Laporan Penjualan</h2>}
        >
            <Head title="Laporan Penjualan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Kartu untuk Form Filter */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Laporan</h3>
                            <form onSubmit={handleSearch}>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal</label>
                                        <input
                                            type="date"
                                            id="tanggal"
                                            name="tanggal"
                                            value={filterValues.tanggal}
                                            onChange={handleFilterChange}
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">Admin</label>
                                        <select name="user_id" id="user_id" value={filterValues.user_id} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                                            <option value="">Semua Admin</option>
                                            {admins.map(admin => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="metode_pembayaran_id" className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                                        <select name="metode_pembayaran_id" id="metode_pembayaran_id" value={filterValues.metode_pembayaran_id} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                                            <option value="">Semua Metode</option>
                                            {metodePembayarans.map(metode => <option key={metode.id} value={metode.id}>{metode.nama_metode}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-end space-x-2">
                                        <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">Cari</button>
                                        <button type="button" onClick={resetFilter} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">Reset</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Kartu untuk Tabel Laporan */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {laporan.data.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(row.tanggal_penjualan).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.user ? row.user.name : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.metode_pembayaran ? row.metode_pembayaran.nama_metode : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">Rp {Number(row.total_harga).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                    {laporan.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                Tidak ada data yang ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Links */}
                        {laporan.data.length > 0 && (
                            <div className="p-6 flex justify-between items-center border-t">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{laporan.from}</span> to <span className="font-medium">{laporan.to}</span> of <span className="font-medium">{laporan.total}</span> results
                                </div>
                                <div className="flex-wrap flex items-center">
                                    {laporan.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${link.active ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveState
                                            replace
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}