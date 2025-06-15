import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, useForm } from "@inertiajs/react";
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

// =================================================================
// HELPER KOMPONEN UNTUK MENAMPILKAN INFO PEMBAYARAN
// =================================================================

const QrisPaymentInfo = ({ methodName }) => (
    <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Pembayaran via {methodName}</h3>
        <p className="text-gray-600 mb-4">Silakan pindai kode QRIS di bawah ini.</p>
        <img src="/images/qris_inventaris.png" alt="QRIS Inventaris Elektronik" className="mx-auto w-48 h-48 mb-4 border-2 border-gray-400 p-1 rounded-lg"/>
    </div>
);

// --- AWAL PERUBAHAN ---
const CardPaymentInfo = ({ methodName }) => (
    <div className="text-center">
         <h3 className="text-xl font-bold text-gray-800 mb-4">Pembayaran via {methodName}</h3>
        <img
            src="/images/credit_card.png" // Path ke gambar credit_card.png Anda
            alt="Ikon Kartu"
            className="mx-auto w-24 h-auto mb-4"
        />
        <p className="text-gray-700">Silakan serahkan kartu Anda kepada kasir untuk diproses melalui mesin EDC.</p>
    </div>
);

const BankTransferInfo = ({ bankName, accountNumber, accountName }) => (
    <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Pembayaran via Transfer {bankName}</h3>
        <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p className="text-sm text-gray-600">Silakan lakukan transfer ke rekening berikut:</p>
            <p className="mt-2"><span className="font-semibold">Bank:</span> {bankName}</p>
            <p><span className="font-semibold">Nomor Rekening:</span> {accountNumber}</p>
            <p><span className="font-semibold">Atas Nama:</span> {accountName}</p>
        </div>
    </div>
);

const CashPaymentInfo = () => (
    <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Pembayaran Tunai</h3>
        <img
            src="/images/tunai.png" // Path ke gambar tunai.png Anda
            alt="Ikon Uang Tunai"
            className="mx-auto w-24 h-auto mb-4"
        />
        <p className="text-gray-700">Silakan lakukan pembayaran dengan uang tunai langsung kepada kasir.</p>
    </div>
);
// --- AKHIR PERUBAHAN ---

// =================================================================
// KOMPONEN UTAMA HALAMAN TRANSAKSI (Tidak ada perubahan di sini)
// =================================================================

export default function Create({ auth, barangs, metodePembayarans }) {
    const { flash: pageFlash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pelanggan: "",
        metode_pembayaran_id: "",
        items: [{ barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 }],
    });

    const [showingPaymentModal, setShowingPaymentModal] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);

    useEffect(() => {
        if (pageFlash?.success) {
            toast.success(pageFlash.success);
            reset();
        }
        if (pageFlash?.error) {
            toast.error(pageFlash.error);
        }
    }, [pageFlash]);

    const addItem = () => setData("items", [...data.items, { barang_id: "", jumlah: 1, harga_satuan: 0, subtotal: 0 }]);
    const removeItem = (index) => data.items.length > 1 && setData("items", data.items.filter((_, i) => i !== index));

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        let currentItem = { ...newItems[index] };

        if (field === "barang_id") {
            const selectedBarang = barangs.find((b) => b.id === parseInt(value));
            currentItem = { ...currentItem, barang_id: value, harga_satuan: selectedBarang?.harga || 0, jumlah: 1 };
        } else if (field === "jumlah") {
            const selectedBarang = barangs.find((b) => b.id === parseInt(currentItem.barang_id));
            const maxStok = selectedBarang?.stok || 0;
            currentItem.jumlah = Math.max(1, Math.min(parseInt(value) || 0, maxStok));
        }
        currentItem.subtotal = currentItem.harga_satuan * currentItem.jumlah;
        newItems[index] = currentItem;
        setData("items", newItems);
    };

    const calculateTotal = () => data.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedMethod = metodePembayarans.find(m => m.id == data.metode_pembayaran_id);
        setTransactionDetails({ total: calculateTotal(), metode: selectedMethod?.nama_metode || "Tidak Dipilih" });
        setShowingPaymentModal(true);
    };

    const handlePaymentConfirmation = () => {
        setShowingPaymentModal(false);
        post(route("transaksi.simpan"), {
            onSuccess: () => {},
            onError: () => toast.error("Gagal memproses. Periksa kembali input Anda."),
        });
    };

    const renderPaymentDetails = () => {
        if (!transactionDetails) return null;
        const { metode } = transactionDetails;

        switch (metode) {
            case 'Dana':
            case 'Gopay':
            case 'OVO':
            case 'ShopeePay':
                return <QrisPaymentInfo methodName={metode} />;
            case 'Kartu Debit':
            case 'Kartu Kredit':
                return <CardPaymentInfo methodName={metode} />;
            case 'Transfer Bank - BCA':
                return <BankTransferInfo bankName="BCA" accountNumber="123-456-7890" accountName="PT. Inventaris Elektronik" />;
            case 'Transfer Bank - Mandiri':
                return <BankTransferInfo bankName="Mandiri" accountNumber="098-765-4321" accountName="PT. Inventaris Elektronik" />;
            case 'Tunai':
                return <CashPaymentInfo />;
            default:
                return <p className="text-center text-red-500">Metode pembayaran tidak valid.</p>;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Buat Transaksi Baru</h2>}>
            <Head title="Transaksi Baru" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Form Transaksi Penjualan</h3>
                        <form onSubmit={handleSubmit}>
                            {/* Form fields */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <InputLabel htmlFor="nama_pelanggan" value="Nama Pelanggan (Opsional)" />
                                    <TextInput id="nama_pelanggan" value={data.nama_pelanggan} className="mt-1 block w-full" onChange={(e) => setData("nama_pelanggan", e.target.value)} />
                                    <InputError message={errors.nama_pelanggan} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="metode_pembayaran_id" value="Metode Pembayaran" />
                                    <SelectInput id="metode_pembayaran_id" value={data.metode_pembayaran_id} className="mt-1 block w-full" onChange={(e) => setData("metode_pembayaran_id", e.target.value)} required>
                                        <option value="">-- Pilih Metode --</option>
                                        {metodePembayarans.map((metode) => <option key={metode.id} value={metode.id}>{metode.nama_metode}</option>)}
                                    </SelectInput>
                                    <InputError message={errors.metode_pembayaran_id} className="mt-2" />
                                </div>
                            </div>
                            {/* Item list */}
                            <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                                <h4 className="font-semibold text-gray-800 mb-4">Daftar Barang</h4>
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4 p-3 border-b last:border-b-0">
                                        <div className="md:col-span-5">
                                            <InputLabel htmlFor={`barang_id_${index}`} value="Barang" />
                                            <SelectInput id={`barang_id_${index}`} value={item.barang_id} className="mt-1 block w-full" onChange={(e) => handleItemChange(index, "barang_id", e.target.value)} required>
                                                <option value="">-- Pilih Barang --</option>
                                                {barangs.map((barang) => <option key={barang.id} value={barang.id} disabled={barang.stok === 0}>{barang.nama_barang} (Stok: {barang.stok}) - Rp {parseFloat(barang.harga).toLocaleString("id-ID")}</option>)}
                                            </SelectInput>
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputLabel htmlFor={`jumlah_${index}`} value="Jumlah" />
                                            <TextInput id={`jumlah_${index}`} type="number" min="1" value={item.jumlah} className="mt-1 block w-full" onChange={(e) => handleItemChange(index, "jumlah", e.target.value)} required />
                                        </div>
                                        <div className="md:col-span-4">
                                            <InputLabel value="Subtotal" />
                                            <TextInput type="text" value={`Rp ${parseFloat(item.subtotal).toLocaleString("id-ID")}`} className="mt-1 block w-full bg-gray-200" readOnly />
                                        </div>
                                        <div className="md:col-span-1 flex justify-end">
                                            {data.items.length > 1 && <DangerButton type="button" onClick={() => removeItem(index)}>X</DangerButton>}
                                        </div>
                                    </div>
                                ))}
                                <PrimaryButton type="button" onClick={addItem} className="mt-4">Tambah Barang</PrimaryButton>
                            </div>
                            {/* Total and Submit button */}
                            <div className="flex justify-between items-center mt-6">
                                <span className="text-2xl font-bold text-gray-900">Total: Rp {calculateTotal().toLocaleString("id-ID")}</span>
                                <PrimaryButton className="py-3 px-6 text-lg" disabled={processing}>Proses Pembayaran</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal show={showingPaymentModal} onClose={() => setShowingPaymentModal(false)}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Konfirmasi Pembayaran</h2>
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        {transactionDetails && renderPaymentDetails()}
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mb-6 text-center">
                        Total Tagihan: Rp {transactionDetails?.total.toLocaleString("id-ID")}
                    </p>
                    <div className="flex justify-center gap-4">
                        <SecondaryButton onClick={() => setShowingPaymentModal(false)} disabled={processing}>Batal</SecondaryButton>
                        <PrimaryButton onClick={handlePaymentConfirmation} disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Konfirmasi & Simpan Transaksi'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
            
            <ToastContainer position="bottom-right" theme="colored" autoClose={5000} />
        </AuthenticatedLayout>
    );
}