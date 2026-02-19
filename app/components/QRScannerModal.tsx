'use client'

import React, { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface QRScannerModalProps {
    darkMode?: boolean
    onClose: () => void
    onScan: (data: string) => void
}

export default function QRScannerModal({ darkMode, onClose, onScan }: QRScannerModalProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        )

        scannerRef.current.render(onScanSuccess, onScanFailure)

        function onScanSuccess(decodedText: string) {
            if (scannerRef.current) {
                scannerRef.current.clear().then(() => {
                    onScan(decodedText)
                }).catch(err => {
                    console.error("Failed to clear scanner", err)
                    onScan(decodedText)
                })
            }
        }

        function onScanFailure(error: any) {
            // console.warn(`Code scan error = ${error}`);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Scanner clear cleanup error", err))
            }
        }
    }, [onScan])

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${darkMode ? 'bg-black/60' : 'bg-black/50'}`}>
            <div className={`backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl max-w-md w-full relative animate-scale-in transition-all duration-500 ${darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white/90 border-white/50'}`}>

                <button
                    onClick={onClose}
                    className={`absolute top-6 right-6 z-10 transition-colors ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner border transition-colors ${darkMode ? 'bg-indigo-500/10 border-white/10' : 'bg-blue-100 border-blue-200'}`}>
                        <span className="text-3xl">📷</span>
                    </div>

                    <h2 className={`text-2xl font-black mb-2 transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>Scan QR Code</h2>
                    <p className={`text-xs font-medium mb-8 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Center the QR code in the box to scan.</p>

                    <div id="reader" className="w-full overflow-hidden rounded-2xl border-4 border-indigo-500/10 bg-black/5"></div>

                    <p className={`mt-6 text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}> Supports Stellar Addresses & URIs </p>

                    <button
                        onClick={onClose}
                        className={`mt-8 w-full py-4 font-black rounded-2xl transition-all active:scale-95 ${darkMode
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
