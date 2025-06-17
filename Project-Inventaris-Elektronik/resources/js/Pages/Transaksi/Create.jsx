import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import Modal from "@/Components/Modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper komponen untuk info pembayaran (TIDAK ADA PERUBAHAN)
const QrisPaymentInfo = ({ methodName }) => ( <div className="text-center"> <h3 className="text-xl font-bold text-gray-800 mb-2">Pembayaran via {methodName}</h3> <p className="text-gray-600 mb-4">Silakan pindai kode QRIS di bawah ini.</p> <img src="/images/qris_inventaris.png" alt="QRIS Inventaris Elektronik" className="mx-auto w-48 h-48 mb-4 border-2 border-gray-400 p-1 rounded-lg"/> </div> );
const CardPaymentInfo = ({ methodName }) => ( <div className="text-center"> <h3 className="text-xl font-bold text-gray-800 mb-4">Pembayaran via {methodName}</h3> <img src="/images/credit_card.png" alt="Ikon Kartu" className="mx-auto w-24 h-auto mb-4" /> <p className="text-gray-700">Silakan serahkan kartu Anda kepada kasir untuk diproses melalui mesin EDC.</p> </div> );
const BankTransferInfo = ({ bankName, accountNumber, accountName }) => ( <div className="text-center"> <h3 className="text-xl font-bold text-gray-800 mb-4">Pembayaran via Transfer {bankName}</h3> <div className="bg-gray-100 p-4 rounded-lg text-left"> <p className="text-sm text-gray-600">Silakan lakukan transfer ke rekening berikut:</p> <p className="mt-2"><span className="font-semibold">Bank:</span> {bankName}</p> <p><span className="font-semibold">Nomor Rekening:</span> {accountNumber}</p> <p><span className="font-semibold">Atas Nama:</span> {accountName}</p> </div> </div> );
const CashPaymentInfo = () => ( <div className="text-center"> <h3 className="text-xl font-bold text-gray-800 mb-4">Pembayaran Tunai</h3> <img src="/images/tunai.png" alt="Ikon Uang Tunai" className="mx-auto w-24 h-auto mb-4" /> <p className="text-gray-700">Silakan lakukan pembayaran dengan uang tunai langsung kepada kasir.</p> </div> );


// =================================================================
// KOMPONEN UTAMA HALAMAN TRANSAKSI (VERSI BARU YANG DIPERBAIKI)
// =================================================================

export default function Create({ auth, barangs, metodePembayarans, errors: pageErrors }) {

    // 1. SETUP `useForm`
    // State ini HANYA berisi data yang akan dikirim ke backend.
    // Nama field 'id' dan 'jumlah' sudah sesuai dengan validasi di Controller.
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pelanggan: "",
        metode_pembayaran_id: "",
        items: [{ id: "", jumlah: 1 }],
    });

    // State untuk mengontrol modal pembayaran.
    const [showingPaymentModal, setShowingPaymentModal] = useState(false);

    // 2. FUNGSI UNTUK MENGELOLA ITEM
    const addItem = () => {
        setData("items", [...data.items, { id: "", jumlah: 1 }]);
    };

    const removeItem = (index) => {
        if (data.items.length > 1) {
            setData("items", data.items.filter((_, i) => i !== index));
        }
    };

    // Fungsi ini menangani perubahan pada pilihan barang atau jumlah.
    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        const currentItem = newItems[index];

        if (field === "id") {
            currentItem.id = value;
            // Setiap kali barang baru dipilih, reset jumlahnya menjadi 1.
            currentItem.jumlah = 1;
        } else if (field === "jumlah") {
            // Batasi jumlah agar tidak melebihi stok.
            const selectedBarang = barangs.find(b => b.id === parseInt(currentItem.id));
            const maxStok = selectedBarang?.stok || 0;
            currentItem.jumlah = Math.max(1, Math.min(parseInt(value) || 1, maxStok));
        }
        setData("items", newItems);
    };

    // 3. FUNGSI UNTUK KALKULASI & SUBMIT
    // Fungsi ini menghitung total harga secara dinamis dari data yang ada.
    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            // Cari harga barang dari 'props' berdasarkan 'id' yang dipilih.
            const barang = barangs.find(b => b.id === parseInt(item.id));
            const harga = barang ? barang.harga : 0;
            return total + (harga * item.jumlah);
        }, 0);
    };

    // Fungsi ini dipanggil saat tombol "Proses Pembayaran" diklik.
    const handleSubmit = (e) => {
        e.preventDefault();
        // Cek jika barang atau metode bayar masih kosong
        if (data.items.some(item => !item.id) || !data.metode_pembayaran_id) {
            toast.warn("Silakan pilih barang dan metode pembayaran terlebih dahulu.");
            return;
        }
        setShowingPaymentModal(true);
    };
    
    // Fungsi ini dipanggil saat tombol "Konfirmasi & Simpan" di modal diklik.
    const handlePaymentConfirmation = () => {
        post(route("transaksi.simpan"), {
            // Hapus 'onSuccess' agar Inertia otomatis redirect.
            onError: (error) => {
                setShowingPaymentModal(false);
                // Jika ada error dari backend, tampilkan di toast.
                const errorMessages = Object.values(error).join('\n');
                toast.error(errorMessages || "Gagal memproses. Periksa kembali input Anda.");
            },
        });
    };

    // 4. RENDER TAMPILAN
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Buat Transaksi Baru</h2>}>
            <Head title="Transaksi Baru" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Form Transaksi Penjualan</h3>
                        
                        <form onSubmit={handleSubmit}>
                            {/* Form Pelanggan & Metode Bayar */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div> <InputLabel htmlFor="nama_pelanggan" value="Nama Pelanggan (Opsional)" /> <TextInput id="nama_pelanggan" value={data.nama_pelanggan} className="mt-1 block w-full" onChange={(e) => setData("nama_pelanggan", e.target.value)} /> <InputError message={errors.nama_pelanggan} className="mt-2" /> </div>
                                <div> <InputLabel htmlFor="metode_pembayaran_id" value="Metode Pembayaran" /> <SelectInput id="metode_pembayaran_id" value={data.metode_pembayaran_id} className="mt-1 block w-full" onChange={(e) => setData("metode_pembayaran_id", e.target.value)} required> <option value="">-- Pilih Metode --</option> {metodePembayarans.map((metode) => <option key={metode.id} value={metode.id}>{metode.nama_metode}</option>)} </SelectInput> <InputError message={errors.metode_pembayaran_id} className="mt-2" /> </div>
                            </div>
                            
                            {/* Form Daftar Barang */}
                            <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                                <h4 className="font-semibold text-gray-800 mb-4">Daftar Barang</h4>
                                {data.items.map((item, index) => {
                                    // Hitung subtotal di sini untuk ditampilkan.
                                    const selectedBarang = barangs.find(b => b.id === parseInt(item.id));
                                    const hargaSatuan = selectedBarang?.harga || 0;
                                    const subtotal = hargaSatuan * item.jumlah;

                                    return (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4 p-3 border-b last:border-b-0">
                                            <div className="md:col-span-5"> <InputLabel htmlFor={`id_${index}`} value="Barang" /> <SelectInput id={`id_${index}`} value={item.id} className="mt-1 block w-full" onChange={(e) => handleItemChange(index, "id", e.target.value)} required> <option value="">-- Pilih Barang --</option> {barangs.map((barang) => <option key={barang.id} value={barang.id} disabled={barang.stok === 0}>{barang.nama_barang} (Stok: {barang.stok})</option>)} </SelectInput> </div>
                                            <div className="md:col-span-2"> <InputLabel htmlFor={`jumlah_${index}`} value="Jumlah" /> <TextInput id={`jumlah_${index}`} type="number" min="1" value={item.jumlah} className="mt-1 block w-full" onChange={(e) => handleItemChange(index, "jumlah", e.target.value)} required /> </div>
                                            <div className="md:col-span-4"> <InputLabel value="Subtotal" /> <TextInput type="text" value={`Rp ${subtotal.toLocaleString("id-ID")}`} className="mt-1 block w-full bg-gray-200" readOnly /> </div>
                                            <div className="md:col-span-1 flex justify-end"> {data.items.length > 1 && <DangerButton type="button" onClick={() => removeItem(index)}>X</DangerButton>} </div>
                                        </div>
                                    );
                                })}
                                <PrimaryButton type="button" onClick={addItem} className="mt-4">Tambah Barang</PrimaryButton>
                            </div>
                            
                            {/* Tombol Total & Submit */}
                            <div className="flex justify-between items-center mt-6">
                                <span className="text-2xl font-bold text-gray-900">Total: Rp {calculateTotal().toLocaleString("id-ID")}</span>
                                <PrimaryButton className="py-3 px-6 text-lg" disabled={processing}>Proses Pembayaran</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal Pembayaran */}
            <Modal show={showingPaymentModal} onClose={() => setShowingPaymentModal(false)}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Konfirmasi Pembayaran</h2>
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        { (() => {
                            const selectedMethod = metodePembayarans.find(m => m.id == data.metode_pembayaran_id);
                            if (!selectedMethod) return null;
                            const metode = selectedMethod.nama_metode;
                            switch (metode) {
                                case 'Dana': case 'Gopay': case 'OVO': case 'ShopeePay': return <QrisPaymentInfo methodName={metode} />;
                                case 'Kartu Debit': case 'Kartu Kredit': return <CardPaymentInfo methodName={metode} />;
                                case 'Transfer Bank - BCA': return <BankTransferInfo bankName="BCA" accountNumber="123-456-7890" accountName="PT. Inventaris Elektronik" />;
                                case 'Transfer Bank - Mandiri': return <BankTransferInfo bankName="Mandiri" accountNumber="098-765-4321" accountName="PT. Inventaris Elektronik" />;
                                case 'Tunai': return <CashPaymentInfo />;
                                default: return <p className="text-center text-red-500">Metode pembayaran tidak valid.</p>;
                            }
                        })() }
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mb-6 text-center">
                        Total Tagihan: Rp {calculateTotal().toLocaleString("id-ID")}
                    </p>
                    <div className="flex justify-center gap-4">
                        <SecondaryButton onClick={() => setShowingPaymentModal(false)} disabled={processing}>Batal</SecondaryButton>
                        <PrimaryButton onClick={handlePaymentConfirmation} disabled={processing}>{processing ? 'Menyimpan...' : 'Konfirmasi & Simpan Transaksi'}</PrimaryButton>
                    </div>
                </div>
            </Modal>
            
            <ToastContainer position="bottom-right" theme="colored" autoClose={5000} />
        </AuthenticatedLayout>
    );
}
