'use client'

export default function TxStatus({ status }: { status: string }) {
  if (!status) return null

  return (
    <div>
      {status === 'pending' && <p>⏳ Transaction Pending...</p>}
      {status === 'success' && <p>✅ Transaction Success</p>}
      {status === 'error' && <p style={{ color: 'red' }}>❌ Transaction Failed</p>}
    </div>
  )
}
