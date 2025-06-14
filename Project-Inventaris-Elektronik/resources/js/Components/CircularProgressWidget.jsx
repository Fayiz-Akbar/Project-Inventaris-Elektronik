// resources/js/Components/CircularProgressWidget.jsx
import React from "react";

export default function CircularProgressWidget({
    title,
    summaryText,
    percentage,
    colorClass = "bg-blue-100",
    percentageColorClass = "text-blue-800",
    // strokeColorClass tidak digunakan langsung di sini
}) {
    const radius = 40; // Radius lingkaran SVG
    const strokeWidth = 8; // Ketebalan garis lingkaran
    const circumference = 2 * Math.PI * radius; // Keliling lingkaran

    const clampedPercentage = Math.max(0, Math.min(100, percentage || 0));
    const strokeDashoffset =
        circumference - (clampedPercentage / 100) * circumference;

    return (
        // Tetapkan tinggi agar konsisten, sesuaikan jika perlu
        <div
            className={`${colorClass} p-6 rounded-lg shadow-md border border-gray-200 flex flex-col h-48`}
        >
            {/* Judul Widget (Teks di tengah, tidak terpotong) */}
            <h4 className="text-lg font-bold text-gray-800 mb-2 text-center">
                {title}
            </h4>

            {/* Kontainer untuk Teks Ringkasan & Lingkaran Progres (Disusun Vertikal, ada padding horizontal) */}
            <div className="flex flex-col flex-grow items-center justify-start pt-2 px-2">
                {" "}
                {/* UBAH: Tambahkan px-2 di sini */}
                {/* Bagian Teks Ringkasan (di atas lingkaran) */}
                <div className="text-center mb-2 w-full">
                    {" "}
                    {/* Hapus px-1 dari sini */}
                    <p className="text-sm text-gray-700 font-semibold leading-tight">
                        {summaryText}
                    </p>
                </div>
                {/* Bagian Lingkaran Progres (di bawah teks) */}
                <div className="relative w-24 h-24 flex-shrink-0 mt-auto">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            className="text-white"
                            strokeWidth={strokeWidth}
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="50%"
                            cy="50%"
                        />
                        <circle
                            className={`${percentageColorClass}`}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="50%"
                            cy="50%"
                        />
                    </svg>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-gray-800">
                        {clampedPercentage}%
                    </span>
                </div>
            </div>
        </div>
    );
}
