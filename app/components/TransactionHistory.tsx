'use client'

import { useEffect, useState } from 'react'
import { getTransactionHistory, getTransactionDetails } from '../lib/contract'

interface TransactionHistoryProps {
    address: string
    refreshTrigger?: any // Optional trigger for refreshing
    darkMode?: boolean
}

export default function TransactionHistory({ address, refreshTrigger, darkMode }: TransactionHistoryProps) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTx, setSelectedTx] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    async function fetchHistory() {
        setLoading(true)
        const res = await getTransactionHistory(address)
        if (res.success && res.records) {
            setHistory(res.records)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (address) {
            if (refreshTrigger) {
                const timer = setTimeout(fetchHistory, 4000);
                return () => clearTimeout(timer);
            } else {
                fetchHistory()
            }
        }
    }, [address, refreshTrigger])

    async function handleRowClick(tx: any) {
        setLoadingDetails(true)
        setSelectedTx(tx)

        const hash = tx.transaction_hash || tx.hash;
        if (hash) {
            const res = await getTransactionDetails(hash)
            if (res.success) {
                setSelectedTx((prev: any) => ({
                    ...prev,
                    ...res.transaction,
                    operation_amount: tx.amount,
                    operation_to: tx.to,
                    operation_from: tx.from,
                    operation_account: tx.account,
                    operation_starting_balance: tx.starting_balance
                }))
            }
        }
        setLoadingDetails(false)
    }

    const filteredHistory = history.filter(tx => {
        if (!startDate && !endDate) return true
        const txDate = new Date(tx.created_at).getTime()
        const start = startDate ? new Date(startDate).getTime() : 0
        const end = endDate ? new Date(endDate).getTime() + 86400000 : Infinity // +1 day to include the end date
        return txDate >= start && txDate <= end
    })

    const exportToCSV = () => {
        if (filteredHistory.length === 0) return

        const headers = ["Date", "Type", "Amount", "Status", "From", "To", "Hash"]
        const csvContent = [
            headers.join(","),
            ...filteredHistory.map(tx => {
                const isReceived = tx.to === address || tx.account === address
                const type = tx.transaction_successful === false ? "FAILED" : (tx.type === 'payment' ? (isReceived ? "RECEIVED" : "SENT") : tx.type)
                const amount = tx.amount || tx.starting_balance || "0"
                return [
                    new Date(tx.created_at).toLocaleString(),
                    type,
                    amount,
                    tx.transaction_successful === false ? "Failed" : "Success",
                    tx.from || tx.funder || "",
                    tx.to || tx.account || "",
                    tx.transaction_hash || tx.hash
                ].map(val => `"${val}"`).join(",")
            })
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `stellar_transactions_${address.slice(0, 8)}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="w-full h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-extrabold transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Transactions</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-all px-2 py-1 rounded-lg border flex items-center gap-1.5 ${showFilters
                            ? (darkMode ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-blue-50 border-blue-200 text-blue-600')
                            : (darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100')}`}
                    >
                        <span>Filter</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                    <button
                        onClick={exportToCSV}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-all px-2 py-1 rounded-lg border flex items-center gap-1.5 ${darkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'}`}
                    >
                        <span>Export CSV</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                    <button
                        onClick={fetchHistory}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-all px-2 py-1 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}
                    >
                        ↻
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className={`mb-6 p-4 rounded-2xl border transition-all animate-fade-in ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-[9px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>From Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className={`text-[10px] p-2 rounded-xl border outline-none transition-all ${darkMode ? 'bg-gray-800 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-[9px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>To Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className={`text-[10px] p-2 rounded-xl border outline-none transition-all ${darkMode ? 'bg-gray-800 border-white/10 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                            />
                        </div>
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate('') }}
                            className="mt-3 text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1"
                        >
                            ✕ Clear Filters
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className={`w-8 h-8 border-3 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-indigo-500' : 'border-blue-600'}`}></div>
                </div>
            ) : (
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
                    {filteredHistory.length === 0 ? (
                        <p className={`text-sm text-center py-10 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No transactions found.</p>
                    ) : (
                        filteredHistory.map((tx: any) => {
                            const isPayment = tx.type === 'payment' || tx.type === 'create_account';
                            const isFailed = tx.transaction_successful === false;
                            const isReceived = tx.to === address || tx.account === address;

                            return (
                                <div
                                    key={tx.id}
                                    onClick={() => handleRowClick(tx)}
                                    className={`p-4 rounded-2xl border flex justify-between items-center transition-all duration-300 cursor-pointer group ${isFailed
                                        ? (darkMode ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 border-red-100 hover:bg-red-100')
                                        : (darkMode ? 'bg-gray-800/40 border-white/5 hover:bg-gray-800/60 hover:border-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md')}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all group-hover:scale-110 ${isFailed
                                            ? 'bg-red-100 text-red-600'
                                            : isPayment
                                                ? (isReceived ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-100 text-blue-600'))
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {isFailed ? '✕' : (isPayment ? (isReceived ? '↓' : '↑') : '•')}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold transition-colors ${isFailed ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-gray-200' : 'text-gray-700')}`}>
                                                {isFailed ? 'Failed' : (isPayment ? (isReceived ? 'Received' : 'Sent') : tx.type)}
                                            </p>
                                            <p className={`text-[10px] font-medium transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {new Date(tx.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {(isPayment && (tx.asset_type === 'native' || tx.type === 'create_account')) && (
                                        <span className={`text-sm font-black font-mono transition-colors ${isFailed
                                            ? 'text-red-400/50 line-through'
                                            : (isReceived ? (darkMode ? 'text-emerald-400' : 'text-green-600') : (darkMode ? 'text-gray-100' : 'text-gray-900'))
                                            }`}>
                                            {isReceived ? '+' : '-'}{Number(tx.amount || tx.starting_balance).toFixed(2)} XLM
                                        </span>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* Transaction Details Modal */}
            {selectedTx && (
                <div className={`absolute inset-0 z-50 flex items-center justify-center p-2 backdrop-blur-md rounded-3xl animate-fade-in ${darkMode ? 'bg-black/40' : 'bg-white/60'}`} onClick={() => setSelectedTx(null)}>
                    <div className={`border shadow-2xl rounded-3xl p-8 w-full max-w-sm relative animate-scale-in transition-all duration-500 ${darkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-gray-100'}`} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedTx(null)}
                            className={`absolute top-6 right-6 transition-colors ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            ✕
                        </button>

                        <h3 className={`text-xl font-black mb-8 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            <span className="p-2 bg-indigo-500/10 rounded-lg">🧾</span> Details
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Amount</p>
                                <p className={`text-3xl font-mono font-black ${selectedTx.transaction_successful === false ? 'text-red-500 line-through' : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                                    {selectedTx.operation_amount || selectedTx.amount || selectedTx.operation_starting_balance || selectedTx.starting_balance || '0'} XLM
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${selectedTx.transaction_successful === false ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {selectedTx.transaction_successful === false ? 'Failed ✕' : 'Success ✓'}
                                </span>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date & Time</p>
                                <p className="text-sm text-gray-600 font-medium">
                                    {new Date(selectedTx.created_at).toLocaleString()}
                                </p>
                            </div>

                            {loadingDetails ? (
                                <div className="py-4 flex justify-center text-blue-500">
                                    <span className="animate-pulse text-sm font-medium">Loading details...</span>
                                </div>
                            ) : (
                                <>
                                    {selectedTx.memo && (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-1">Memo</p>
                                            <p className="text-sm text-blue-800 font-medium break-words">
                                                {selectedTx.memo}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">To Address</p>
                                        <p className="text-xs font-mono text-gray-500 break-all bg-gray-50 p-2 rounded border border-gray-100">
                                            {selectedTx.operation_to || selectedTx.to || selectedTx.operation_account || selectedTx.account}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Transaction Hash</p>
                                        <a
                                            href={`https://stellar.expert/explorer/testnet/tx/${selectedTx.transaction_hash || selectedTx.hash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-mono text-blue-500 hover:underline break-all block"
                                        >
                                            {selectedTx.transaction_hash || selectedTx.hash}
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
