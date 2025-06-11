// resources/js/Pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { Bar } from "react-chartjs-2"; // Import komponen Bar dari react-chartjs-2
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"; // Import elemen Chart.js

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard({
    auth,
    totalPenjualanHariIni,
    barangTersediaCount,
    produkTerlarisBulanIni,
    chartData,
    chartPeriod,
    latestSoldItems,
    latestAddedItems,
}) {
    const { url } = usePage();
    const [activeChartPeriod, setActiveChartPeriod] = useState(chartPeriod);

    // Options untuk Chart.js
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Barang Masuk vs Barang Terjual",
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // Menghilangkan garis grid vertikal
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(200, 200, 200, 0.2)", // Warna garis grid horizontal
                },
                ticks: {
                    stepSize: 1, // Agar y-axis menunjukkan angka bulat
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

                            {/* Bagian Ringkasan Data (Widgets) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-blue-100 p-6 rounded-lg shadow-md flex flex-col justify-between">
                                    <h4 className="text-lg font-bold text-blue-800 mb-2">
                                        Total Penjualan Hari Ini
                                    </h4>
                                    <p className="text-4xl text-blue-900 font-extrabold">
                                        Rp{" "}
                                        {totalPenjualanHariIni
                                            ? parseFloat(
                                                  totalPenjualanHariIni
                                              ).toLocaleString("id-ID")
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
                                        Performa Barang & Penjualan
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

                            {/* Bagian Tabel Data Terbaru */}
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

                            {/* Bagian Aksi Cepat (Sudah ada di versi sebelumnya) */}
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Aksi Cepat
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={route("barang.index")}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out"
                                    >
                                        Manajemen Barang
                                    </Link>
                                    <Link
                                        href={route("transaksi.create")}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out"
                                    >
                                        Transaksi Baru
                                    </Link>
                                    <Link
                                        href={route("laporan.penjualan")}
                                        className="px-6 py-3 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition duration-150 ease-in-out"
                                    >
                                        Laporan Penjualan
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
