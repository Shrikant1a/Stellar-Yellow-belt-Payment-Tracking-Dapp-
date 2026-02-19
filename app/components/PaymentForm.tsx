'use client'

import { useState, useEffect } from 'react'
import { createPayment, checkBalance } from '../lib/contract'
import type { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import QRScannerModal from './QRScannerModal';

interface PaymentFormProps {
  address: string | null
  setStatus: (status: any) => void
  setError: (error: any) => void
  onCheckBalance?: () => void
  kit?: StellarWalletsKit
  darkMode?: boolean
  initialTo?: string
  initialAmount?: string
  initialMemo?: string
}

export default function PaymentForm({ address, setStatus, setError, onCheckBalance, kit, darkMode, initialTo = '', initialAmount = '', initialMemo = '' }: PaymentFormProps) {
  const [to, setTo] = useState(initialTo)
  const [amount, setAmount] = useState(initialAmount)
  const [memo, setMemo] = useState(initialMemo)
  const [showScanner, setShowScanner] = useState(false)

  // Pre-fill form if props change (e.g. from URL params)
  useEffect(() => {
    if (initialTo) setTo(initialTo)
    if (initialAmount) setAmount(initialAmount)
    if (initialMemo) setMemo(initialMemo)
  }, [initialTo, initialAmount, initialMemo])

  async function submit() {
    setError(null)

    try {
      if (!address) throw new Error("Wallet not connected")

      setStatus('pending')

      const res = await createPayment(address, to, Number(amount), memo, kit)

      if (res.success) {
        setStatus('success')
        setTo('')
        setAmount('')
        setMemo('')
      } else {
        throw new Error(res.error)
      }

    } catch (e: any) {
      setStatus('failed')

      if (e.message.includes("network"))
        setError("Network error – Horizon issue")
      else if (e.message.includes("contract"))
        setError("Contract execution failed")
      else
        setError(e.message)
    }
  }

  const handleScan = (data: string) => {
    setShowScanner(false)

    // Check if it's a Stellar URI (SEP-0007 style)
    if (data.includes('stellar:pay') || data.startsWith('web+stellar:')) {
      try {
        const url = new URL(data.replace('web+stellar:', 'https:').replace('stellar:', 'https:'))
        const destination = url.searchParams.get('destination')
        const amt = url.searchParams.get('amount')
        const mem = url.searchParams.get('memo')

        if (destination) setTo(destination)
        if (amt) setAmount(amt)
        if (mem) setMemo(mem)

        return
      } catch (err) {
        console.error("Failed to parse Stellar URI", err)
      }
    }

    // Otherwise assume it's just an address
    if (data.length >= 56 && (data.startsWith('G') || data.startsWith('C'))) {
      setTo(data)
    } else {
      setError("Invalid QR code – No Stellar address found")
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center pr-1">
          <label className={`text-[10px] font-bold uppercase tracking-widest pl-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Recipient Address</label>
          <button
            onClick={() => setShowScanner(true)}
            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all hover:scale-105 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-blue-500 hover:text-blue-600'}`}
          >
            <span>Scan QR</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        </div>
        <input
          placeholder="G..."
          value={to}
          onChange={e => setTo(e.target.value)}
          className={`border p-3 w-full rounded-xl text-sm transition-all outline-none focus:ring-2 ${darkMode
            ? 'bg-gray-800/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-indigo-500/30 focus:border-indigo-500'
            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-[10px] font-bold uppercase tracking-widest pl-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount (XLM)</label>
        <input
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className={`border p-3 w-full rounded-xl text-sm transition-all outline-none focus:ring-2 ${darkMode
            ? 'bg-gray-800/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-indigo-500/30 focus:border-indigo-500'
            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={`text-[10px] font-bold uppercase tracking-widest pl-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Memo (Optional)</label>
        <input
          placeholder="Payment for..."
          value={memo}
          onChange={e => setMemo(e.target.value)}
          className={`border p-3 w-full rounded-xl text-sm transition-all outline-none focus:ring-2 ${darkMode
            ? 'bg-gray-800/50 border-white/10 text-white placeholder:text-gray-600 focus:ring-indigo-500/30 focus:border-indigo-500'
            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500'}`}
        />
      </div>

      <button
        onClick={submit}
        className={`px-4 py-3 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl active:scale-95 w-full mt-2 ${darkMode
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
      >
        Send Payment
      </button>

      <div className={`pt-4 border-t mt-2 flex justify-center transition-colors ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
        <button
          onClick={onCheckBalance}
          className={`text-xs font-bold flex items-center gap-2 group transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-blue-500 hover:text-blue-700'}`}
        >
          <span className="group-hover:translate-y-[-2px] transition-transform">💰</span>
          <span className="underline decoration-2 underline-offset-4 decoration-current/30 group-hover:decoration-current transition-all">Check My Balance</span>
        </button>
      </div>

      {showScanner && (
        <QRScannerModal
          darkMode={darkMode}
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
        />
      )}
    </div>
  )
}
