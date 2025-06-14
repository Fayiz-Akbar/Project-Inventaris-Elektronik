// resources/js/Pages/Transaksi/Create.jsx
import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, useForm, Link, router } from "@inertiajs/react"; // Pastikan router diimpor
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import Modal from "@/Components/Modal"; // Pastikan Modal diimpor

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Create({ auth, barangs, metodePembayarans, flash }) {
    const { flash: pageFlash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pelanggan: "",
        metode_pembayaran_id: "",
        items: [{ barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 }],
    });

    const [showingPaymentModal, setShowingPaymentModal] = useState(false); // State untuk modal pembayaran
    const [transactionDetailsForPayment, setTransactionDetailsForPayment] =
        useState(null); // Detail transaksi untuk ditampilkan di modal

    useEffect(() => {
        if (pageFlash && pageFlash.success) {
            toast.success(pageFlash.success);
            // Auto-redirect ke halaman laporan setelah transaksi sukses
            router.visit(route("laporan.penjualan")); // Redirect ke halaman laporan
        }
        if (pageFlash && pageFlash.error) {
            toast.error(pageFlash.error);
        }
    }, [pageFlash]);

    const addItem = () => {
        setData("items", [
            ...data.items,
            { barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 },
        ]);
    };

    const removeItem = (index) => {
        if (data.items.length === 1) {
            setData("items", [
                { barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 },
            ]);
        } else {
            setData(
                "items",
                data.items.filter((_, i) => i !== index)
            );
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];

        if (field === "barang_id") {
            const selectedBarang = barangs.find(
                (b) => b.id === parseInt(value)
            );
            if (selectedBarang) {
                newItems[index] = {
                    ...newItems[index],
                    barang_id: value,
                    harga_satuan: selectedBarang.harga,
                    jumlah: 1,
                    subtotal: selectedBarang.harga * 1,
                };
            } else {
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
            );
            const parsedJumlah = parseInt(value) || 0;
            const maxStok = selectedBarang ? selectedBarang.stok : 0;
            const finalJumlah = Math.min(parsedJumlah, maxStok);

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

    const calculateTotal = () => {
        return data.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    };

    // Fungsi yang dipanggil saat form utama disubmit (sebelum pembayaran)
    const handleSubmit = (e) => {
        e.preventDefault();
        // Simpan detail transaksi sementara untuk modal pembayaran
        setTransactionDetailsForPayment({
            total: calculateTotal(),
            metode:
                metodePembayarans.find((m) => m.id == data.metode_pembayaran_id)
                    ?.nama_metode || "Tidak Dipilih",
            nama_pelanggan: data.nama_pelanggan || "Umum",
        });
        setShowingPaymentModal(true); // Tampilkan modal pembayaran
    };

    // Fungsi yang dipanggil saat konfirmasi pembayaran di modal
    const handlePaymentConfirmation = () => {
        setShowingPaymentModal(false); // Tutup modal pembayaran
        // Kirim data transaksi ke backend
        post(route("transaksi.simpan"), {
            onSuccess: () => {
                // Flash message dan redirect akan ditangani oleh useEffect di atas
                reset("nama_pelanggan", "metode_pembayaran_id");
                setData("items", [
                    { barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 },
                ]);
            },
            onError: (validationErrors) => {
                console.error("Validation Errors:", validationErrors);
                toast.error("Gagal memproses transaksi. Periksa input Anda."); // Tambahkan pesan error umum
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
                            {" "}
                            {/* Submit form ini akan memicu modal pembayaran */}
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
                                            <InputLabel
                                                htmlFor={`barang_id_${index}`}
                                                value="Barang"
                                            />
                                            <SelectInput
                                                id={`barang_id_${index}`}
                                                name={`barang_id`}
                                                value={item.barang_id}
                                                className="mt-1 block w-full"
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "barang_id",
                                                        e.target.value
                                                    )
                                                }
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
                                            <InputLabel
                                                htmlFor={`jumlah_${index}`}
                                                value="Jumlah"
                                            />
                                            <TextInput
                                                id={`jumlah_${index}`}
                                                type="number"
                                                name="jumlah"
                                                min="1"
                                                value={item.jumlah}
                                                className="mt-1 block w-24"
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "jumlah",
                                                        e.target.value
                                                    )
                                                }
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
                                            <InputLabel value="Harga Satuan" />
                                            <TextInput
                                                type="text"
                                                value={`Rp. ${parseFloat(
                                                    item.harga_satuan
                                                ).toLocaleString("id-ID")}`}
                                                className="mt-1 block w-48 bg-gray-100 cursor-not-allowed"
                                                readOnly
                                            />
                                        </div>
                                        <div className="w-auto flex justify-end">
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
                                    Proses Pembayaran
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal untuk Pembayaran QRIS Simulasi */}
            <Modal
                show={showingPaymentModal}
                onClose={() => setShowingPaymentModal(false)}
            >
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Pembayaran QRIS
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Pindai QRIS ini untuk menyelesaikan pembayaran:
                    </p>
                    <img
                        src="/images/qris_placeholder.png"
                        alt="QRIS Placeholder"
                        className="mx-auto w-48 h-48 mb-4 border border-gray-300 p-2"
                    />{" "}
                    {/* Ganti dengan path QRIS Anda */}
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                        Total: Rp.{" "}
                        {transactionDetailsForPayment?.total.toLocaleString(
                            "id-ID"
                        )}
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                        Metode: {transactionDetailsForPayment?.metode}
                    </p>
                    <p className="text-sm text-red-500 mb-6">
                        Ini adalah simulasi pembayaran. Untuk integrasi
                        pembayaran sesungguhnya, diperlukan penyedia payment
                        gateway (Midtrans, Xendit, Doku, dll.) dan penanganan
                        webhook.
                    </p>
                    <div className="flex justify-center gap-4">
                        <SecondaryButton
                            onClick={() => setShowingPaymentModal(false)}
                        >
                            Batal Pembayaran
                        </SecondaryButton>
                        <PrimaryButton onClick={handlePaymentConfirmation}>
                            Konfirmasi Pembayaran Manual
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
            <ToastContainer />
        </AuthenticatedLayout>
    );
}
