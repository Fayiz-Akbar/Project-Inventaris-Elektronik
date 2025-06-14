// resources/js/Pages/Transaksi/Create.jsx (Setelah dipastikan nama dan lokasi file-nya)

import React, { useState, useEffect } from "react"; // Pastikan useState dan useEffect diimpor
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, useForm, Link } from "@inertiajs/react"; // Pastikan usePage dan Link diimpor

// Import komponen UI yang diperlukan (Pastikan file-file ini ada di resources/js/Components/)
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton"; // Digunakan untuk tombol Batal
import DangerButton from "@/Components/DangerButton"; // Digunakan untuk tombol Hapus Item
import TextInput from "@/Components/TextInput"; // Untuk input teks
import InputLabel from "@/Components/InputLabel"; // Untuk label input
import InputError from "@/Components/InputError"; // Untuk pesan error validasi
import SelectInput from "@/Components/SelectInput"; // Untuk dropdown

// Import untuk notifikasi Toast (Pastikan react-toastify sudah diinstal)
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Create({ auth, barangs, metodePembayarans, flash }) {
    const { flash: pageFlash } = usePage().props; // Ambil flash messages dari Inertia

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pelanggan: "", // Tambahkan nama_pelanggan
        metode_pembayaran_id: "",
        items: [{ barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 }], // Ubah 'id' menjadi 'barang_id', tambahkan harga_satuan, subtotal
    });

    // Effect untuk menampilkan toast messages dari flash
    useEffect(() => {
        if (pageFlash && pageFlash.success) {
            toast.success(pageFlash.success);
        }
        if (pageFlash && pageFlash.error) {
            toast.error(pageFlash.error);
        }
    }, [pageFlash]);

    // Fungsi untuk menambahkan item baru ke keranjang
    const addItem = () => {
        setData("items", [
            ...data.items,
            { barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 },
        ]);
    };

    // Fungsi untuk menghapus item dari keranjang
    const removeItem = (index) => {
        // Pastikan selalu ada minimal 1 item jika form tidak boleh kosong
        if (data.items.length === 1) {
            setData("items", [
                { barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 },
            ]);
        } else {
            const newItems = data.items.filter((_, i) => i !== index);
            setData("items", newItems);
        }
    };

    // Fungsi untuk menangani perubahan pada item
    const handleItemChange = (index, field, value) => {
        // Perbaiki parameter: (index, field, value)
        const newItems = [...data.items];

        if (field === "barang_id") {
            // Sesuaikan dengan nama field di state 'barang_id'
            const selectedBarang = barangs.find(
                (b) => b.id === parseInt(value)
            );
            if (selectedBarang) {
                newItems[index] = {
                    ...newItems[index],
                    barang_id: value, // Tetapkan barang_id
                    harga_satuan: selectedBarang.harga,
                    jumlah: 1, // Reset jumlah ke 1 saat barang dipilih
                    subtotal: selectedBarang.harga * 1,
                };
            } else {
                // Jika barang tidak ditemukan (misal: pilihan kosong)
                newItems[index] = {
                    ...newItems[index],
                    barang_id: value,
                    harga_satuan: 0,
                    jumlah: 0,
                    subtotal: 0,
                };
            }
        } else if (field === "jumlah") {
            const selectedBarang = barangs.find(
                (b) => b.id === parseInt(newItems[index].barang_id)
            ); // Cari barang berdasarkan barang_id yang sudah dipilih
            const parsedJumlah = parseInt(value) || 0; // Pastikan jumlah adalah angka
            const maxStok = selectedBarang ? selectedBarang.stok : 0;
            const finalJumlah = Math.min(parsedJumlah, maxStok); // Batasi jumlah agar tidak melebihi stok

            newItems[index] = {
                ...newItems[index],
                jumlah: finalJumlah,
                subtotal: selectedBarang
                    ? selectedBarang.harga * finalJumlah
                    : 0,
            };
        }
        setData("items", newItems);
    };

    // Hitung total harga keseluruhan transaksi
    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + (item.subtotal || 0), 0); // Pastikan subtotal ada
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("transaksi.simpan"), {
            // Pastikan rute ini benar
            onSuccess: () => {
                // Reset form setelah sukses
                reset("nama_pelanggan", "metode_pembayaran_id"); // Reset juga nama_pelanggan dan metode_pembayaran_id
                setData("items", [
                    { barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 },
                ]); // Reset item
            },
            onError: (validationErrors) => {
                console.error("Validation Errors:", validationErrors);
                // Toast message akan muncul dari useEffect flash
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Buat Transaksi Baru
                </h2>
            }
        >
            <Head title="Transaksi Baru" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">
                            Buat Transaksi Penjualan Baru
                        </h3>

                        <form onSubmit={handleSubmit}>
                            {/* Informasi Pelanggan */}
                            <div className="mb-6">
                                <InputLabel
                                    htmlFor="nama_pelanggan"
                                    value="Nama Pelanggan (Opsional)"
                                />
                                <TextInput
                                    id="nama_pelanggan"
                                    type="text"
                                    name="nama_pelanggan"
                                    value={data.nama_pelanggan}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData(
                                            "nama_pelanggan",
                                            e.target.value
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.nama_pelanggan}
                                    className="mt-2"
                                />
                            </div>

                            {/* Pilihan Metode Pembayaran */}
                            <div className="mb-6">
                                <InputLabel
                                    htmlFor="metode_pembayaran_id"
                                    value="Metode Pembayaran"
                                />
                                <SelectInput
                                    id="metode_pembayaran_id"
                                    name="metode_pembayaran_id"
                                    value={data.metode_pembayaran_id}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData(
                                            "metode_pembayaran_id",
                                            e.target.value
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        -- Pilih Metode Pembayaran --
                                    </option>
                                    {metodePembayarans.map((metode) => (
                                        <option
                                            key={metode.id}
                                            value={metode.id}
                                        >
                                            {metode.nama_metode}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError
                                    message={errors.metode_pembayaran_id}
                                    className="mt-2"
                                />
                            </div>

                            {/* Daftar Item Transaksi */}
                            <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                                <h4 className="font-semibold text-gray-800 mb-4">
                                    Daftar Barang
                                </h4>
                                {data.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-wrap items-center gap-4 mb-4 p-3 border-b border-gray-200 last:border-b-0"
                                    >
                                        <div className="flex-grow">
                                            {" "}
                                            {/* Gunakan flex-grow agar kolom barang lebih lebar */}
                                            <InputLabel
                                                htmlFor={`barang_id_${index}`}
                                                value="Barang"
                                            />
                                            <SelectInput
                                                id={`barang_id_${index}`}
                                                name={`barang_id`} // Nama yang sesuai dengan field di state
                                                value={item.barang_id} // Gunakan item.barang_id
                                                className="mt-1 block w-full"
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "barang_id",
                                                        e.target.value
                                                    )
                                                } // Kirim field 'barang_id'
                                                required
                                            >
                                                <option value="">
                                                    -- Pilih Barang --
                                                </option>
                                                {barangs.map((barang) => (
                                                    <option
                                                        key={barang.id}
                                                        value={barang.id}
                                                        disabled={
                                                            barang.stok === 0
                                                        }
                                                    >
                                                        {barang.nama_barang}{" "}
                                                        (Stok: {barang.stok}) -
                                                        Rp.{" "}
                                                        {parseFloat(
                                                            barang.harga
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                            {errors[
                                                `items.${index}.barang_id`
                                            ] && (
                                                <InputError
                                                    message={
                                                        errors[
                                                            `items.${index}.barang_id`
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            )}
                                        </div>
                                        <div className="w-auto">
                                            {" "}
                                            {/* Ubah w-full md:w-1/5 menjadi w-auto */}
                                            <InputLabel
                                                htmlFor={`jumlah_${index}`}
                                                value="Jumlah"
                                            />
                                            <TextInput
                                                id={`jumlah_${index}`}
                                                type="number"
                                                name="jumlah"
                                                min="1"
                                                // max={item.stok} // max di HTML input tidak seakurat validasi backend
                                                value={item.jumlah}
                                                className="mt-1 block w-24" // Lebar tetap 24 unit
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "jumlah",
                                                        e.target.value
                                                    )
                                                } // Kirim field 'jumlah'
                                                required
                                            />
                                            {errors[
                                                `items.${index}.jumlah`
                                            ] && (
                                                <InputError
                                                    message={
                                                        errors[
                                                            `items.${index}.jumlah`
                                                        ]
                                                    }
                                                    className="mt-2"
                                                />
                                            )}
                                        </div>
                                        <div className="w-auto">
                                            {" "}
                                            {/* Ubah w-48 pt-6 menjadi w-auto */}
                                            <InputLabel value="Harga Satuan" />
                                            <TextInput
                                                type="text"
                                                value={`Rp. ${parseFloat(
                                                    item.harga_satuan
                                                ).toLocaleString("id-ID")}`}
                                                className="mt-1 block w-48 bg-gray-100 cursor-not-allowed" // Lebar tetap 48 unit
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-auto flex justify-end">
                                            {" "}
                                            {/* pt-6 dihapus */}
                                            {data.items.length > 1 && (
                                                <DangerButton
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                >
                                                    Hapus
                                                </DangerButton>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <PrimaryButton
                                    type="button"
                                    onClick={addItem}
                                    className="mt-4"
                                >
                                    Tambah Barang Lain
                                </PrimaryButton>
                            </div>

                            {/* Ringkasan Total */}
                            <div className="text-right text-2xl font-bold text-gray-900 mb-6">
                                Total Harga: Rp.{" "}
                                {calculateTotal().toLocaleString("id-ID")}
                            </div>

                            {/* Tombol Submit */}
                            <div className="flex justify-end">
                                <PrimaryButton
                                    className="ms-4 py-3 px-6 text-lg"
                                    disabled={processing}
                                >
                                    Simpan Transaksi
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ToastContainer /> {/* Pastikan ToastContainer ada di sini */}
        </AuthenticatedLayout>
    );
}
