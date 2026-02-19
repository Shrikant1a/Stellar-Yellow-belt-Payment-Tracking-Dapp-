'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeModalProps {
    address: string
    darkMode?: boolean
    onClose: () => void
}

export default function QRCodeModal({ address, darkMode, onClose }: QRCodeModalProps) {
    const [amount, setAmount] = React.useState('')
    const [memo, setMemo] = React.useState('')

    // Generate Stellar URI: web+stellar:pay?destination=...&amount=...&memo=...
    const qrValue = React.useMemo(() => {
        if (!amount && !memo) return address

        let uri = `web+stellar:pay?destination=${address}`
        if (amount) uri += `&amount=${amount}`
        if (memo) uri += `&memo=${encodeURIComponent(memo)}`
        return uri
    }, [address, amount, memo])

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${darkMode ? 'bg-black/60' : 'bg-black/50'}`}>
            <div className={`backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl max-w-sm w-full relative animate-scale-in transition-all duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar ${darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white/90 border-white/50'}`}>

                <button
                    onClick={onClose}
                    className={`absolute top-6 right-6 transition-colors ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner border transition-colors ${darkMode ? 'bg-indigo-500/10 border-white/10' : 'bg-blue-100 border-blue-200'}`}>
                        <span className="text-3xl">📱</span>
                    </div>

                    <h2 className={`text-xl font-black mb-1 transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>My QR Code</h2>
                    <p className={`text-[10px] font-medium mb-6 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Scan this to receive payments.</p>

                    <div className="bg-white p-4 rounded-3xl shadow-xl mb-6 border-4 border-indigo-500/20">
                        <QRCodeSVG
                            value={qrValue}
                            size={180}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    {/* Embedding Options */}
                    <div className="w-full space-y-3 mb-6">
                        <p className={`text-[10px] font-black uppercase tracking-widest text-left px-1 ${darkMode ? 'text-indigo-400' : 'text-blue-600'}`}>Embed Payment Info (Optional)</p>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className={`text-[10px] p-2 rounded-xl border outline-none transition-all ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                            />
                            <input
                                type="text"
                                placeholder="Memo"
                                value={memo}
                                onChange={e => setMemo(e.target.value)}
                                className={`text-[10px] p-2 rounded-xl border outline-none transition-all ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                            />
                        </div>
                    </div>

                    <div className={`rounded-2xl p-4 w-full border transition-colors ${darkMode ? 'bg-gray-800/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-[10px] uppercase tracking-widest font-black mb-2 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Account Address</p>
                        <p className={`text-[10px] font-mono break-all px-3 py-2 rounded-xl border transition-colors ${darkMode ? 'bg-black/20 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}>
                            {address}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(qrValue)
                            alert("QR Link copied to clipboard!")
                        }}
                        className={`mt-6 w-full py-3 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${darkMode
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'}`}
                    >
                        <span className="text-sm">Copy QR Link</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="mt-4 text-[10px] font-bold text-gray-500 hover:text-gray-700 underline underline-offset-4"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
