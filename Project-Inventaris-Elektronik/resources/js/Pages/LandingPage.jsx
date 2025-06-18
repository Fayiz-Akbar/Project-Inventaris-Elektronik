
import React from "react";
import { Link, Head } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo"; // Pastikan ini ada

export default function LandingPage() {
    return (
        <>
            <Head title="Selamat Datang" />

            {/* Header Navbar */}
            <nav className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    {/* Logo/Nama Aplikasi di Kiri */}
                    <Link href="/" className="flex items-center space-x-2">
                        {/* Ganti dengan logo Anda atau teks nama aplikasi */}
                        {/* <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" /> */}
                        <span className="text-2xl font-bold text-indigo-600">
                            Inventaris Elektronik
                        </span>
                    </Link>

                    {/* Tombol Login di Kanan Atas */}
                    <div className="flex items-center">
                        <Link
                            href={route("login")}
                            className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition duration-150"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-600 to-blue-800 text-white py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                            Solusi Lengkap <br /> Inventaris Elektronik Anda
                        </h1>
                        <p className="text-lg md:text-xl mb-8 opacity-90">
                            Kelola stok, lacak penjualan, dan dapatkan laporan
                            akurat dengan mudah dari mana saja.
                        </p>
                        <Link
                            href={route("login")}
                            className="inline-block px-8 py-4 bg-yellow-400 text-indigo-900 rounded-lg font-bold text-lg shadow-lg hover:bg-yellow-300 transition duration-150"
                        >
                            Mulai Sekarang
                        </Link>
                    </div>
                    
                </div>
            </section>

            {/* Bagian Fitur */}
            <section className="bg-gray-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12">
                        Fitur Unggulan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300">
                            <div className="text-indigo-600 text-5xl mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-16 h-16"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6h7.5A2.25 2.25 0 0 0 21 18V9a2.25 2.25 0 0 0-2.25-2.25H15M12 9.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Manajemen Stok Efisien
                            </h3>
                            <p className="text-gray-600">
                                Kontrol penuh atas inventaris, otomatis kurangi
                                stok saat penjualan.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300">
                            <div className="text-indigo-600 text-5xl mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-16 h-16"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5-10.5H4.5m9 3H12m8.25-3H15M12 18.75h.008v.008H12v-.008ZM12 21.75h.008v.008H12v-.008ZM3.75 18.75h.008v.008H3.75v-.008ZM3.75 21.75h.008v.008H3.75v-.008ZM18.75 18.75h.008v.008H18.75v-.008ZM18.75 21.75h.008v.008H18.75v-.008ZM7.5 18.75h.008v.008H7.5v-.008ZM7.5 21.75h.008v.008H7.5v-.008ZM12 12.75h.008v.008H12v-.008ZM12 15.75h.008v.008H12v-.008ZM12 9.75h.008v.008H12v-.008Z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Laporan Penjualan Akurat
                            </h3>
                            <p className="text-gray-600">
                                Dapatkan insight mendalam tentang kinerja bisnis
                                Anda dengan laporan interaktif.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300">
                            <div className="text-indigo-600 text-5xl mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-16 h-16"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 18.75a60.075 60.075 0 0 1 4.9-2.525C7.79 15.75 10 15.75 12 15.75s4.21.0 5.42.475a60.075 60.075 0 0 1 4.9 2.525M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Mudah Digunakan
                            </h3>
                            <p className="text-gray-600">
                                Antarmuka intuitif dan ramah pengguna, siapa pun
                                bisa langsung menggunakannya.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bagian Cara Order/CTA */}
            <section className="bg-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12">
                        Siap Kelola Inventaris Anda?
                    </h2>
                    <Link
                        href={route("login")}
                        className="inline-block px-10 py-5 bg-indigo-600 text-white rounded-lg font-bold text-lg shadow-lg hover:bg-indigo-700 transition duration-150"
                    >
                        Mulai Sekarang Juga
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p>
                        &copy; {new Date().getFullYear()} .
                        Hak Cipta Dilindungi.E-Vault
                    </p>
                </div>
            </footer>
        </>
    );
}
