// resources/js/Pages/Kategori/Index.jsx
import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, useForm, Link } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { pickBy } from "lodash";
import SecondaryButton from "@/Components/SecondaryButton";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Index({ auth, kategoris, filters }) {
    const { flash } = usePage().props;

    const [showingModal, setShowingModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

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
        nama_kategori: "",
    });

    const [searchTerm, setSearchTerm] = useState(filters.search || "");

    useEffect(() => {
        if (flash && flash.success) {
            toast.success(flash.success);
        }
        if (flash && flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const openAddModal = () => {
        setIsEditMode(false);
        reset();
        setShowingModal(true);
    };

    const openEditModal = (kategori) => {
        setIsEditMode(true);
        setData({
            id: kategori.id,
            nama_kategori: kategori.nama_kategori,
        });
        setShowingModal(true);
    };

    const closeModal = () => {
        setShowingModal(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route("kategori.update", data.id), {
                onSuccess: () => {
                    closeModal();
                },
                onError: (err) => {
                    console.error("Update Error:", err);
                },
            });
        } else {
            post(route("kategori.store"), {
                onSuccess: () => {
                    closeModal();
                },
                onError: (err) => {
                    console.error("Store Error:", err);
                },
            });
        }
    };

    const handleDelete = (kategoriId) => {
        if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
            destroy(route("kategori.destroy", kategoriId), {
                onSuccess: () => {
                    // Toast handled by useEffect for flash
                },
                onError: (err) => {
                    console.error("Delete Error:", err);
                },
            });
        }
    };

    const handleSearch = () => {
        const queryParams = pickBy({
            search: searchTerm,
        });
        Link.get(
            route("kategori.index", queryParams),
            {},
            { preserveState: true }
        );
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Kategori
                </h2>
            }
        >
            <Head title="Manajemen Kategori" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                Daftar Kategori
                            </h3>
                            <PrimaryButton onClick={openAddModal}>
                                Tambah Kategori Baru
                            </PrimaryButton>
                        </div>

                        <div className="mb-4">
                            <TextInput
                                id="search"
                                type="text"
                                name="search"
                                value={searchTerm}
                                className="mt-1 block w-full"
                                placeholder="Cari kategori..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Nama Kategori
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
                                    {kategoris.data.length > 0 ? (
                                        kategoris.data.map((kategori) => (
                                            <tr key={kategori.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {kategori.nama_kategori}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <PrimaryButton
                                                        onClick={() =>
                                                            openEditModal(
                                                                kategori
                                                            )
                                                        }
                                                        className="mr-2"
                                                    >
                                                        Edit
                                                    </PrimaryButton>
                                                    <DangerButton
                                                        onClick={() =>
                                                            handleDelete(
                                                                kategori.id
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
                                                colSpan="2"
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                            >
                                                Tidak ada data kategori.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                                Menampilkan {kategoris.from} sampai{" "}
                                {kategoris.to} dari {kategoris.total} hasil
                            </span>
                            <div className="flex">
                                {kategoris.links.map((link, index) => (
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

            {/* Modal Tambah/Edit Kategori */}
            <Modal show={showingModal} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
                    </h2>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="nama_kategori"
                            value="Nama Kategori"
                        />
                        <TextInput
                            id="nama_kategori"
                            type="text"
                            name="nama_kategori"
                            value={data.nama_kategori}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) =>
                                setData("nama_kategori", e.target.value)
                            }
                        />
                        <InputError
                            message={errors.nama_kategori}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex justify-end items-center mt-6">
                        <SecondaryButton onClick={closeModal} className="mr-2">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditMode
                                ? "Simpan Perubahan"
                                : "Tambah Kategori"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ToastContainer />
        </AuthenticatedLayout>
    );
}
