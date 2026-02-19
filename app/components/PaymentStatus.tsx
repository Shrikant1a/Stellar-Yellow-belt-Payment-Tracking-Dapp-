'use client'

interface PaymentStatusProps {
  status: string | null
  darkMode?: boolean
}

export default function PaymentStatus({ status, darkMode }: PaymentStatusProps) {
  if (!status) return null

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${darkMode
      ? 'bg-gray-800/40 border-white/5'
      : 'bg-gray-50 border-gray-100'}`}>

      {status === 'pending' && (
        <div className={`flex flex-col items-center gap-3 ${darkMode ? 'text-indigo-400' : 'text-blue-600'}`}>
          <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${darkMode ? 'border-indigo-500' : 'border-blue-600'}`}></div>
          <p className="font-bold text-sm tracking-wide">Processing Transaction...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-bounce shadow-lg ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-600'}`}>
            ✅
          </div>
          <div className="text-center">
            <p className={`font-black uppercase tracking-widest text-sm ${darkMode ? 'text-emerald-400' : 'text-green-700'}`}>Payment Sent!</p>
            <p className={`text-[10px] mt-1 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Confirmed on Stellar Testnet</p>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
            ❌
          </div>
          <p className={`font-black uppercase tracking-widest text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Transaction Failed</p>
        </div>
      )}
    </div>
  )
}
