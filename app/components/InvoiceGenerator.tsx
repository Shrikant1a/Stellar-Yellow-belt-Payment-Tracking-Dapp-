'use client'

import React, { useState, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface InvoiceGeneratorProps {
    address: string
    darkMode?: boolean
}

export default function InvoiceGenerator({ address, darkMode }: InvoiceGeneratorProps) {
    const [amount, setAmount] = useState('')
    const [memo, setMemo] = useState('')
    const [copied, setCopied] = useState(false)

    const shareableLink = useMemo(() => {
        if (typeof window === 'undefined') return ''
        const baseUrl = window.location.origin
        const params = new URLSearchParams()
        params.set('destination', address)
        if (amount) params.set('amount', amount)
        if (memo) params.set('memo', memo)
        return `${baseUrl}?${params.toString()}`
    }, [address, amount, memo])

    const copyLink = () => {
        navigator.clipboard.writeText(shareableLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-extrabold transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>Request Payment</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-indigo-500/10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Invoice Generator</span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest pl-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Requested Amount</label>
                    <input
                        placeholder="0.00 XLM"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className={`border p-3 w-full rounded-xl text-sm transition-all outline-none focus:ring-2 ${darkMode
                            ? 'bg-gray-800/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-indigo-500/30 focus:border-indigo-500'
                            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase tracking-widest pl-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Memo for Payer</label>
                    <input
                        placeholder="e.g. For Pizza 🍕"
                        value={memo}
                        onChange={e => setMemo(e.target.value)}
                        className={`border p-3 w-full rounded-xl text-sm transition-all outline-none focus:ring-2 ${darkMode
                            ? 'bg-gray-800/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-indigo-500/30 focus:border-indigo-500'
                            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
                    />
                </div>

                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                        <QRCodeSVG
                            value={shareableLink}
                            size={160}
                            level="H"
                        />
                    </div>
                    <p className={`text-[10px] font-medium text-center max-w-[200px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Payer can scan this QR to open the pre-filled payment screen.
                    </p>
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-blue-50 border-blue-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-indigo-400' : 'text-blue-600'}`}>Shareable Invoice Link</p>
                    <div className="flex gap-2">
                        <div className={`flex-1 text-[10px] font-mono break-all line-clamp-2 p-2 rounded-lg border h-10 flex items-center ${darkMode ? 'bg-black/20 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                            {shareableLink}
                        </div>
                        <button
                            onClick={copyLink}
                            className={`px-4 rounded-xl font-bold text-xs transition-all active:scale-95 whitespace-nowrap ${darkMode
                                ? (copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500')
                                : (copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700')}`}
                        >
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
