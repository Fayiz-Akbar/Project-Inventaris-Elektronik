// resources/js/Pages/Barang/Index.jsx
import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, useForm, Link } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput"; // Pastikan komponen ini ada dan diimpor
import SecondaryButton from "@/Components/SecondaryButton"; // Pastikan komponen ini ada dan diimpor
import { pickBy } from "lodash"; // Pastikan lodash terinstal: npm install lodash

import { ToastContainer, toast } from "react-toastify"; // Pastikan react-toastify terinstal: npm install react-toastify
import "react-toastify/dist/ReactToastify.css";

export default function Index({ auth, barangs, kategoris, filters }) {
    const { flash } = usePage().props;

    const [showingModal, setShowingModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form state untuk menambah/mengedit barang
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        id: null,
        kategori_id: "",
        nama_barang: "",
        deskripsi: "",
        harga: "",
        stok: "",
    });

    // State untuk filter dan pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedCategory, setSelectedCategory] = useState(
        filters.kategori || "all"
    );
    const [selectedStokFilter, setSelectedStokFilter] = useState(
        filters.stok || "all"
    );

    // Mengelola pesan sukses/error dari flash dan menampilkan toast
    useEffect(() => {
        if (flash && flash.success) {
            toast.success(flash.success);
        }
        if (flash && flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Fungsi untuk membuka modal tambah barang
    const openAddModal = () => {
        setIsEditMode(false);
        reset(); // Reset form untuk data baru
        setShowingModal(true);
    };

    // Fungsi untuk membuka modal edit barang
    const openEditModal = (barang) => {
        setIsEditMode(true);
        setData({
            id: barang.id,
            kategori_id: barang.kategori_id || "", // Pastikan ini string jika kategori_id bisa null
            nama_barang: barang.nama_barang,
            deskripsi: barang.deskripsi || "",
            harga: barang.harga,
            stok: barang.stok,
        });
        setShowingModal(true);
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        setShowingModal(false);
        reset(); // Reset form saat modal ditutup
    };

    // Fungsi untuk submit form (tambah/edit)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route("barang.update", data.id), {
                onSuccess: () => {
                    closeModal();
                    // Toast message akan muncul dari useEffect flash
                },
                onError: (err) => {
                    console.error("Update Error:", err);
                    // Error toast message akan muncul dari useEffect flash
                },
            });
        } else {
            post(route("barang.store"), {
                onSuccess: () => {
                    closeModal();
                    // Toast message akan muncul dari useEffect flash
                },
                onError: (err) => {
                    console.error("Store Error:", err);
                    // Error toast message akan muncul dari useEffect flash
                },
            });
        }
    };

    // Fungsi untuk menghapus barang
    const handleDelete = (barangId) => {
        if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
            destroy(route("barang.destroy", barangId), {
                onSuccess: () => {
                    // Toast message akan muncul dari useEffect flash
                },
                onError: (err) => {
                    console.error("Delete Error:", err);
                    // Error toast message akan muncul dari useEffect flash
                },
            });
        }
    };

    // Fungsi untuk handle pencarian dan filter (dengan debounce)
    const handleFilterChange = () => {
        const queryParams = pickBy({
            search: searchTerm,
            kategori: selectedCategory === "all" ? "" : selectedCategory,
            stok: selectedStokFilter === "all" ? "" : selectedStokFilter,
        });

        // Inertia.js reload dengan query params baru
        Link.get(
            route("barang.Index", queryParams),
            {},
            { preserveState: true }
        );
    };

    // Effect untuk debounce pencarian dan filter
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleFilterChange();
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategory, selectedStokFilter]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Barang
                </h2>
            }
        >
            <Head title="Manajemen Barang" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                Daftar Barang
                            </h3>
                            <PrimaryButton onClick={openAddModal}>
                                Tambah Barang Baru
                            </PrimaryButton>
                        </div>

                        {/* Filter dan Pencarian */}
                        <div className="mb-4 flex flex-wrap gap-4 items-end">
                            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                                <InputLabel
                                    htmlFor="search"
                                    value="Cari Barang"
                                    className="sr-only"
                                />
                                <TextInput
                                    id="search"
                                    type="text"
                                    name="search"
                                    value={searchTerm}
                                    className="mt-1 block w-full"
                                    placeholder="Cari nama atau deskripsi..."
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5">
                                <InputLabel
                                    htmlFor="kategori_filter"
                                    value="Filter Kategori"
                                />
                                <SelectInput
                                    id="kategori_filter"
                                    name="kategori_filter"
                                    value={selectedCategory}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                >
                                    <option value="all">Semua Kategori</option>
                                    {kategoris.map((kategori) => (
                                        <option
                                            key={kategori.id}
                                            value={kategori.id}
                                        >
                                            {kategori.nama_kategori}
                                        </option>
                                    ))}
                                </SelectInput>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5">
                                <InputLabel
                                    htmlFor="stok_filter"
                                    value="Filter Stok"
                                />
                                <SelectInput
                                    id="stok_filter"
                                    name="stok_filter"
                                    value={selectedStokFilter}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setSelectedStokFilter(e.target.value)
                                    }
                                >
                                    <option value="all">Semua Stok</option>
                                    <option value="ready">Stok Tersedia</option>
                                    <option value="low">Stok Rendah</option>
                                    <option value="empty">Stok Habis</option>
                                </SelectInput>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Nama Barang
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Kategori
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Harga
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Stok
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {barangs.data.length > 0 ? (
                                        barangs.data.map((barang) => (
                                            <tr key={barang.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {barang.nama_barang}
                                                    {barang.stok === 0 && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Stok Habis!
                                                        </span>
                                                    )}
                                                    {barang.stok > 0 &&
                                                        barang.stok <= 5 && ( // Contoh batas stok rendah adalah 5
                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Stok Rendah (
                                                                {barang.stok})
                                                            </span>
                                                        )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {barang.kategori
                                                        ? barang.kategori
                                                              .nama_kategori
                                                        : "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    Rp.{" "}
                                                    {parseFloat(
                                                        barang.harga
                                                    ).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {barang.stok}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <PrimaryButton
                                                        onClick={() =>
                                                            openEditModal(
                                                                barang
                                                            )
                                                        }
                                                        className="mr-2"
                                                    >
                                                        Edit
                                                    </PrimaryButton>
                                                    <DangerButton
                                                        onClick={() =>
                                                            handleDelete(
                                                                barang.id
                                                            )
                                                        }
                                                    >
                                                        Hapus
                                                    </DangerButton>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                            >
                                                Tidak ada data barang.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                                Menampilkan {barangs.from} sampai {barangs.to}{" "}
                                dari {barangs.total} hasil
                            </span>
                            <div className="flex">
                                {barangs.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`ml-2 px-3 py-1 rounded-md text-sm ${
                                            link.active
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        } ${
                                            !link.url
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        preserveState={true}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tambah/Edit Barang */}
            <Modal show={showingModal} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditMode ? "Edit Barang" : "Tambah Barang Baru"}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="kategori_id" value="Kategori" />
                        <SelectInput
                            id="kategori_id"
                            name="kategori_id"
                            value={data.kategori_id}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                setData("kategori_id", e.target.value)
                            }
                        >
                            <option value="">Pilih Kategori</option>
                            {kategoris.map((kategori) => (
                                <option key={kategori.id} value={kategori.id}>
                                    {kategori.nama_kategori}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError
                            message={errors.kategori_id}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="nama_barang" value="Nama Barang" />
                        <TextInput
                            id="nama_barang"
                            type="text"
                            name="nama_barang"
                            value={data.nama_barang}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) =>
                                setData("nama_barang", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.nama_barang}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="deskripsi" value="Deskripsi" />
                        <textarea
                            id="deskripsi"
                            name="deskripsi"
                            value={data.deskripsi}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            onChange={(e) =>
                                setData("deskripsi", e.target.value)
                            }
                        ></textarea>
                        <InputError
                            message={errors.deskripsi}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="harga" value="Harga" />
                        <TextInput
                            id="harga"
                            type="number"
                            name="harga"
                            value={data.harga}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("harga", e.target.value)}
                            step="0.01"
                            min="0"
                        />
                        <InputError message={errors.harga} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="stok" value="Stok" />
                        <TextInput
                            id="stok"
                            type="number"
                            name="stok"
                            value={data.stok}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("stok", e.target.value)}
                            min="0"
                        />
                        <InputError message={errors.stok} className="mt-2" />
                    </div>

                    <div className="flex justify-end items-center">
                        <SecondaryButton onClick={closeModal} className="mr-2">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditMode ? "Simpan Perubahan" : "Tambah Barang"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
            <ToastContainer />
        </AuthenticatedLayout>
    );
}
