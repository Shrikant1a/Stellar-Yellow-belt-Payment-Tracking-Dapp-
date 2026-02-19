'use client'

import React from 'react'

interface BalanceModalProps {
    address: string
    balance: string | null
    onClose: () => void
    darkMode?: boolean
}

export default function BalanceModal({ address, balance, onClose, darkMode }: BalanceModalProps) {
    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in ${darkMode ? 'bg-black/60' : 'bg-black/50'}`}>
            <div className={`backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl max-w-sm w-full relative animate-scale-in transition-all duration-500 ${darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white/90 border-white/50'}`}>

                <button
                    onClick={onClose}
                    className={`absolute top-6 right-6 transition-colors ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner border transition-colors ${darkMode ? 'bg-indigo-500/10 border-white/10' : 'bg-blue-100 border-blue-200'}`}>
                        <span className="text-4xl">💰</span>
                    </div>

                    <h2 className={`text-2xl font-black mb-4 transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Balance</h2>

                    <div className={`rounded-2xl p-4 w-full mb-6 border transition-colors ${darkMode ? 'bg-gray-800/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-[10px] uppercase tracking-widest font-black mb-2 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Account Address</p>
                        <p className={`text-[10px] font-mono break-all px-3 py-2 rounded-xl border transition-colors ${darkMode ? 'bg-black/20 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}>
                            {address}
                        </p>
                    </div>

                    <div className={`rounded-3xl p-8 w-full shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-indigo-600 to-violet-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform -translate-x-8 translate-y-8"></div>

                        <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-2">Available Balance</p>
                        <h3 className="text-4xl font-black text-white tracking-tight flex items-baseline justify-center gap-2">
                            {balance ? Number(balance).toFixed(2) : '0.00'} <span className="text-lg font-medium opacity-60">XLM</span>
                        </h3>
                    </div>

                    <button
                        onClick={onClose}
                        className={`mt-8 w-full py-4 font-black rounded-2xl transition-all active:scale-95 ${darkMode
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
