// resources/js/Pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Import komponen CircularProgressWidget
import CircularProgressWidget from '@/Components/CircularProgressWidget'; // Pastikan file ini ada di resources/js/Components/

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Fungsi Helper untuk format Rupiah yang Ringkas dan JELAS (Revisi agar lebih singkat)
const formatRupiahCompact = (amount) => {
    if (amount === null || amount === undefined) return '0';
    amount = Math.round(amount); // Pastikan bilangan bulat

    if (amount >= 1000000000) {
        // Contoh: 1.2 M
        return (amount / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M';
    } else if (amount >= 1000000) {
        // Contoh: 45.4 Jt
        return (amount / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
    } else if (amount >= 1000) {
        // Contoh: 5 Rb
        return (amount / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' Rb';
    }
    return amount.toLocaleString('id-ID'); // Untuk nilai kecil, misal 500
};


export default function Dashboard({
    auth,
    // Props lama (digunakan di widget ringkasan lama dan tabel)
    totalPenjualanHariIni, // Digunakan di laporan atau detail lain
    barangTersediaCount, // Digunakan di laporan atau detail lain
    produkTerlarisBulanIni, // Digunakan di laporan atau detail lain
    chartData,
    chartPeriod,
    latestSoldItems,
    latestAddedItems,
    // Props untuk widget rekapitulasi (dari DashboardController)
    targetPenjualanBulanIni,
    totalPenjualanBulanIniActual,
    persentasePenjualanTerpenuhi,
    barangStokRendahCount,
    totalBarangDiSistem,
    persentaseStokRendah,
    barangStokHabisCount,
    persentaseStokHabis,
    jumlahTransaksiHariIni,
    targetTransaksiHarian,
    persentaseTransaksiHarianTerpenuhi,
}) {
    const { url } = usePage();
    const [activeChartPeriod, setActiveChartPeriod] = useState(chartPeriod);

    // Options untuk Chart.js (untuk grafik nilai Rupiah dan skala otomatis)
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Total Nilai Barang Masuk vs Total Nilai Barang Terjual",
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(200, 200, 200, 0.2)",
                },
                ticks: {
                    stepSize: 25000000, // Menetapkan langkah setiap 25 juta
                    callback: function (value, index, ticks) {
                        // Format nilai sebagai Rupiah
                        if (value >= 1000000000) {
                            return 'Rp ' + (value / 1000000000).toLocaleString('id-ID') + ' Miliar';
                        } else if (value >= 1000000) {
                            return 'Rp ' + (value / 1000000).toLocaleString('id-ID') + ' Juta';
                        } else if (value >= 1000) {
                            return 'Rp ' + (value / 1000).toLocaleString('id-ID') + ' Ribu';
                        }
                        return 'Rp ' + value.toLocaleString('id-ID');
                    }
                },
            },
        },
    };

    // Fungsi untuk mengubah filter periode grafik
    const handleChartPeriodChange = (period) => {
        setActiveChartPeriod(period);
        Link.get(
            route("dashboard", { chart_period: period }),
            {},
            { preserveScroll: true, preserveState: true }
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dasbor Admin
                </h2>
            }
        >
            <Head title="Dasbor Admin" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-xl font-semibold mb-6">
                                Selamat datang, {auth.user.name}!
                            </h3>

                            {/* Bagian Ringkasan Data LAMA */}
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Ringkasan Utama</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-blue-100 p-6 rounded-lg shadow-md flex flex-col justify-between">
                                    <h4 className="text-lg font-bold text-blue-800 mb-2">
                                        Total Penjualan Hari Ini
                                    </h4>
                                    <p className="text-4xl text-blue-900 font-extrabold">
                                        Rp{" "}
                                        {totalPenjualanHariIni
                                            ? parseFloat(totalPenjualanHariIni).toLocaleString("id-ID")
                                            : "0"}
                                    </p>
                                </div>

                                <div className="bg-green-100 p-6 rounded-lg shadow-md flex flex-col justify-between">
                                    <h4 className="text-lg font-bold text-green-800 mb-2">
                                        Barang yang Tersedia
                                    </h4>
                                    <p className="text-4xl text-green-900 font-extrabold">
                                        {barangTersediaCount !== undefined
                                            ? barangTersediaCount
                                            : "0"}
                                    </p>
                                </div>

                                <div className="bg-purple-100 p-6 rounded-lg shadow-md flex flex-col justify-between">
                                    <h4 className="text-lg font-bold text-purple-800 mb-2">
                                        Produk Terlaris Bulan Ini
                                    </h4>
                                    <p className="text-2xl text-purple-900 font-extrabold mt-auto">
                                        {produkTerlarisBulanIni ||
                                            "Belum ada data"}
                                    </p>
                                </div>
                            </div>


                            {/* Bagian Grafik Penjualan dan Stok */}
                            <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        Performa Barang & Penjualan (Nilai Rupiah)
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                handleChartPeriodChange("daily")
                                            }
                                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                                activeChartPeriod === "daily"
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                        >
                                            Harian
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleChartPeriodChange(
                                                    "weekly"
                                                )
                                            }
                                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                                activeChartPeriod === "weekly"
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                        >
                                            Mingguan
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleChartPeriodChange(
                                                    "monthly"
                                                )
                                            }
                                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                                activeChartPeriod === "monthly"
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                        >
                                            Bulanan
                                        </button>
                                    </div>
                                </div>
                                {chartData && chartData.labels.length > 0 ? (
                                    <Bar
                                        data={chartData}
                                        options={chartOptions}
                                    />
                                ) : (
                                    <p className="text-gray-600 text-center py-10">
                                        Data grafik belum tersedia.
                                    </p>
                                )}
                            </div>

                            {/* Bagian Rekapitulasi BARU (DIPINDAHKAN DI BAWAH GRAFIK) */}
                            <h3 className="text-xl font-semibold text-gray-1000 mb-6">Rekapitulasi Kinerja Inventaris</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-9">
                                {/* Widget 1: Pencapaian Target Penjualan Bulanan */}
                                <CircularProgressWidget
                                    title="Target Penjualan" // Contoh judul yang lebih singkat
                                    // Atau bisa juga: "Pencapaian Penjualan"
                                    summaryText={`Rp\u00A0${formatRupiahCompact(totalPenjualanBulanIniActual)} / Rp\u00A0${formatRupiahCompact(targetPenjualanBulanIni)}`}
                                    percentage={persentasePenjualanTerpenuhi}
                                    colorClass="bg-emerald-50"
                                    percentageColorClass="text-emerald-600"
                                    borderColorClass="border-emerald-300"
                                />

                                {/* Widget 2: Barang Stok Rendah */}
                                <CircularProgressWidget
                                    title="Barang Stok Rendah"
                                    summaryText={`${barangStokRendahCount} / ${totalBarangDiSistem} Item`}
                                    percentage={persentaseStokRendah}
                                    colorClass="bg-orange-50" // Oranye muda
                                    percentageColorClass="text-orange-600" // Oranye gelap
                                    borderColorClass="border-orange-300"
                                />

                                {/* Widget 3: Barang Stok Habis */}
                                <CircularProgressWidget
                                    title="Total Barang Stok Habis"
                                    summaryText={`${barangStokHabisCount} / ${totalBarangDiSistem} Item`}
                                    percentage={persentaseStokHabis}
                                    colorClass="bg-fuchsia-50" // Fuchsia muda
                                    percentageColorClass="text-fuchsia-600" // Fuchsia gelap
                                    borderColorClass="border-fuchsia-300"
                                />

                                {/* Widget 4: Transaksi Berhasil Hari Ini */}
                                <CircularProgressWidget
                                    title="Transaksi Berhasil Hari Ini"
                                    summaryText={`${jumlahTransaksiHariIni} / ${targetTransaksiHarian} Transaksi`}
                                    percentage={persentaseTransaksiHarianTerpenuhi}
                                    colorClass="bg-blue-50" // Biru muda
                                    percentageColorClass="text-blue-600" // Biru gelap
                                    borderColorClass="border-blue-300"
                                />
                            </div>


                            {/* Bagian Tabel Data Terbaru (TETAP DI SINI) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Barang Terakhir Terjual */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        5 Barang Terakhir Terjual
                                    </h3>
                                    {latestSoldItems &&
                                    latestSoldItems.length > 0 ? (
                                        <ul className="divide-y divide-gray-200">
                                            {latestSoldItems.map(
                                                (item, index) => (
                                                    <li
                                                        key={index}
                                                        className="py-3 flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <p className="text-gray-900 font-medium">
                                                                {
                                                                    item.nama_barang
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {item.jumlah}{" "}
                                                                pcs ke{" "}
                                                                {
                                                                    item.nama_pelanggan
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {
                                                                item.tanggal_transaksi
                                                            }
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    ) : (
                                    <p className="text-gray-600 text-center py-4">
                                        Belum ada barang terjual.
                                    </p>
                                )}
                            </div>

                            {/* Barang Terakhir Masuk */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    5 Barang Terakhir Masuk
                                </h3>
                                {latestAddedItems &&
                                latestAddedItems.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {latestAddedItems.map(
                                            (item, index) => (
                                                <li
                                                    key={index}
                                                    className="py-3 flex justify-between items-center"
                                                >
                                                    <div>
                                                        <p className="text-gray-900 font-medium">
                                                            {
                                                                item.nama_barang
                                                            }
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Stok:{" "}
                                                            {item.stok}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {item.tanggal_masuk}
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600 text-center py-4">
                                        Belum ada barang baru masuk.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </AuthenticatedLayout>
    );
}