'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import WalletConnect from './components/WalletConnect'
import TransactionHistory from './components/TransactionHistory'
import PaymentForm from './components/PaymentForm'
import PaymentStatus from './components/PaymentStatus'
import BalanceModal from './components/BalanceModal'
import QRCodeModal from './components/QRCodeModal'
import InvoiceGenerator from './components/InvoiceGenerator'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import type { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'

export default function Page() {
  const [address, setAddress] = useState<string | null>(null)
  const [kit, setKit] = useState<StellarWalletsKit | undefined>(undefined)
  const [walletName, setWalletName] = useState<string | null>(null)
  const [showWalletName, setShowWalletName] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedMode)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  // Fetch balance when address changes
  const updateBalance = async () => {
    if (address) {
      const res = await import('./lib/contract').then(m => m.checkBalance(address))
      if (res.success) {
        setBalance(res.balance || '0')
      }
    }
  }

  if (address) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading Dashboard...</div>}>
        <DashboardContent
          address={address}
          setAddress={setAddress}
          kit={kit}
          setKit={setKit}
          walletName={walletName}
          showWalletName={showWalletName}
          setShowWalletName={setShowWalletName}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          balance={balance}
          updateBalance={updateBalance}
        />
      </Suspense>
    )
  }

  return (
    <main className={`min-h-screen w-full relative flex items-center justify-center overflow-hidden font-sans selection:bg-pink-200 transition-colors duration-500 ${darkMode ? 'dark bg-[#0F172A]' : 'bg-[#8FB3E6]'}`}>
      <BackgroundDecoration darkMode={darkMode} />

      {/* Dark Mode Toggle for Landing */}
      <div className="absolute top-6 right-6 z-50">
        <button onClick={toggleDarkMode} className={`p-3 rounded-2xl border transition-all duration-300 shadow-lg ${darkMode ? 'bg-indigo-500/20 border-white/20 text-yellow-300 hover:bg-indigo-500/40' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}>
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className={`relative z-10 w-[340px] border rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col items-center text-white overflow-hidden transition-all duration-500 backdrop-blur-xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/40'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center w-full">
          <div className="bg-white/25 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/20">
            <WalletIcon className="w-8 h-8 text-white drop-shadow-sm" />
          </div>
          <h2 className="text-xl font-bold tracking-widest uppercase mb-1 drop-shadow-sm">DIGITAL</h2>
          <h2 className="text-xl font-bold tracking-widest uppercase mb-6 drop-shadow-sm">WALLET</h2>
          <div className="w-16 h-[2px] bg-white/50 mb-6 rounded-full" />
          <p className="text-center text-sm text-white/90 mb-10 leading-relaxed font-medium drop-shadow-sm px-2">
            Securely connect to your Stellar wallet to manage payments and track transactions with ease.
          </p>
          <WalletConnect setAddress={setAddress} setKit={setKit} setWalletName={setWalletName} className="w-full py-3.5 bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white font-bold rounded-2xl transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group">
            <span>Connect Wallet</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </WalletConnect>
        </div>
      </div>
      <div className="absolute bottom-6 w-full flex justify-center">
        <Footer darkMode={darkMode} />
      </div>
    </main>
  )
}

function DashboardContent({ address, setAddress, kit, darkMode, toggleDarkMode, balance, updateBalance, walletName, showWalletName, setShowWalletName }: any) {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [showQRCodeModal, setShowQRCodeModal] = useState(false)
  const [analyticsHistory, setAnalyticsHistory] = useState<any[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  const initialTo = searchParams.get('destination') || ''
  const initialAmount = searchParams.get('amount') || ''
  const initialMemo = searchParams.get('memo') || ''

  const fetchAnalytics = async () => {
    if (!address) return
    setLoadingAnalytics(true)
    const res = await import('./lib/contract').then(m => m.getAnalyticsHistory(address))
    if (res.success && res.records) {
      setAnalyticsHistory(res.records)
    }
    setLoadingAnalytics(false)
  }

  useEffect(() => {
    updateBalance()
    fetchAnalytics()
    if (status === 'success') {
      const timerBase = setTimeout(updateBalance, 4000)
      const timerAnalytics = setTimeout(fetchAnalytics, 4000)
      return () => {
        clearTimeout(timerBase)
        clearTimeout(timerAnalytics)
      }
    }
  }, [address, status])

  return (
    <main className={`min-h-screen w-full relative font-sans selection:bg-pink-200 overflow-y-auto transition-colors duration-500 ${darkMode ? 'dark bg-[#0F172A] text-gray-100' : 'bg-[#8FB3E6] text-gray-900'}`}>
      <BackgroundDecoration darkMode={darkMode} />

      <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-lg"><span className="text-2xl">💸</span></div>
          <h1 className="text-xl font-bold text-white tracking-wide drop-shadow-sm">Payment Tracker</h1>
        </div>
        <div className="flex items-center gap-3">
          {balance !== null && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg border border-white/30 text-white text-xs font-semibold">
              <span>💰</span><span>{Number(balance).toFixed(2)} XLM</span>
            </div>
          )}
          <div className={`${darkMode ? 'bg-white/10' : 'bg-white/20'} px-4 py-1.5 rounded-full border ${darkMode ? 'border-white/10' : 'border-white/30'} backdrop-blur-sm shadow-sm flex items-center gap-2`}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-mono text-white font-medium max-w-[100px] truncate">{address}</span>
          </div>
          <button onClick={toggleDarkMode} className={`p-2 rounded-lg border transition-all duration-300 ${darkMode ? 'bg-indigo-500/20 border-white/20 text-yellow-300 hover:bg-indigo-500/40' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}>
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="relative z-10 w-full min-h-screen flex flex-col xl:flex-row xl:flex-wrap items-center xl:items-start justify-center pt-32 pb-20 px-4 gap-8">

        {/* Card 1: Send Payment */}
        <div className={`w-full max-w-lg h-[650px] backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl flex flex-col transition-all duration-500 ${darkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/80 border-white/50'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-black flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Send XLM <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md ${darkMode ? 'text-indigo-400 bg-indigo-500/10' : 'text-blue-500 bg-blue-100'}`}>Network</span>
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setShowQRCodeModal(true)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${darkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`} title="My QR Code">
                <QRLinkIcon />
              </button>
              <div onClick={() => { setShowWalletName(true); setTimeout(() => setShowWalletName(false), 2000) }} className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all relative ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-50 text-blue-500'}`}>
                <WalletIcon className="w-5 h-5" />
                {showWalletName && walletName && <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-bounce">{walletName}</div>}
              </div>
            </div>
          </div>

          <PaymentForm
            address={address}
            setStatus={setStatus}
            setError={setError}
            onCheckBalance={() => setShowBalanceModal(true)}
            kit={kit}
            darkMode={darkMode}
            initialTo={initialTo}
            initialAmount={initialAmount}
            initialMemo={initialMemo}
          />
          <div className="mt-6"><PaymentStatus status={status} darkMode={darkMode} /></div>
          {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold animate-pulse flex items-center gap-2"><span>⚠️</span> {error}</div>}
          <button onClick={() => setAddress(null)} className="mt-auto py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors border-t border-white/5 pt-6">Disconnect Wallet</button>
        </div>

        {/* Card 2: Request Payment (Invoice Generator) */}
        <div className={`w-full max-w-lg h-[650px] backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl flex flex-col transition-all duration-500 ${darkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/80 border-white/50'}`}>
          <InvoiceGenerator address={address} darkMode={darkMode} />
        </div>

        {/* Card 3: Transaction History */}
        <div className={`w-full max-w-lg h-[650px] backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl flex flex-col transition-all duration-500 xl:order-3 ${darkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/80 border-white/50'}`}>
          <TransactionHistory address={address} refreshTrigger={status} darkMode={darkMode} />
        </div>

        {/* Card 4: Analytics 📊 */}
        <div className={`w-full max-w-lg h-[650px] backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl flex flex-col transition-all duration-500 xl:order-4 ${darkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/80 border-white/50'}`}>
          {loadingAnalytics ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-indigo-500' : 'border-blue-600'}`}></div>
              <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Analyzing your activity...</p>
            </div>
          ) : (
            <AnalyticsDashboard address={address} history={analyticsHistory} darkMode={darkMode} />
          )}
        </div>

      </div>

      <Footer darkMode={darkMode} />

      {showBalanceModal && <BalanceModal address={address} balance={balance} onClose={() => setShowBalanceModal(false)} darkMode={darkMode} />}
      {showQRCodeModal && <QRCodeModal address={address} darkMode={darkMode} onClose={() => setShowQRCodeModal(false)} />}
    </main>
  )
}

// Sub-components & Icons
function BackgroundDecoration({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full border-[12px] border-white/30 border-t-transparent border-r-transparent transform -rotate-45" />
      <div className={`absolute bottom-[20%] left-[15%] w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[60px] blur-sm opacity-60 transform -rotate-12 transition-colors ${darkMode ? 'border-b-indigo-500' : 'border-b-blue-400'}`} />
      <div className={`absolute top-[45%] right-[25%] w-40 h-40 rounded-full blur-3xl opacity-50 z-0 transition-colors ${darkMode ? 'bg-indigo-900' : 'bg-[#F2F4C3]'}`} />
      <ZigZagShape className={`absolute bottom-[10%] right-[10%] w-20 h-20 opacity-90 z-0 transition-colors ${darkMode ? 'text-indigo-400' : 'text-pink-300'}`} />
    </div>
  )
}

function Footer({ darkMode }: { darkMode: boolean }) {
  return (
    <footer className={`w-full py-6 z-40 text-sm font-medium tracking-wide flex flex-col items-center justify-center gap-3 bg-transparent transition-colors duration-500 ${darkMode ? 'text-gray-400' : 'text-white'}`}>
      <div className="flex items-center gap-1"><span>Built by Shrii with</span><span className="text-yellow-300 drop-shadow-md font-bold">Stellar</span><span>🚀</span></div>
      <div className="flex items-center gap-2">
        <FooterLink href="https://stellar.org/learn/intro-to-stellar" label="About Stellar ↗" darkMode={darkMode} />
        <FooterLink href="https://stellar.expert/explorer/testnet" label="Stellar Expert Testnet ↗" darkMode={darkMode} />
      </div>
    </footer>
  )
}

function FooterLink({ href, label, darkMode }: any) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`text-[10px] px-3 py-1 rounded-full border transition-all hover:scale-105 ${darkMode ? 'border-white/10 hover:bg-white/5 text-gray-400' : 'border-white/30 hover:bg-white/10 text-white'}`}>
      {label}
    </a>
  )
}

// Icons
function WalletIcon({ className }: any) { return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z" /><circle cx="16" cy="12" r="1.5" /></svg> }
function ArrowRightIcon({ className }: any) { return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg> }
function ZigZagShape({ className }: any) { return <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="20"><path d="M20 80 L50 50 L20 20" strokeLinecap="round" strokeLinejoin="round" /></svg> }
function SunIcon() { return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg> }
function MoonIcon() { return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg> }
function QRLinkIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg> }
