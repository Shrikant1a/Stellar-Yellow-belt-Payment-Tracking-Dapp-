'use client'

import { useState } from 'react'
import TxStatus from './TxStatus'

export default function ContractActions({ address }: any) {
  const [status, setStatus] = useState('')

  const callContract = async () => {
    try {
      setStatus('pending')

      // 👉 Replace with real contract invocation
      await new Promise(res => setTimeout(res, 1500))

      setStatus('success')
    } catch (e: any) {
      if (e.message?.includes('rejected')) {
        alert('Transaction rejected by user')
      } else if (e.message?.includes('balance')) {
        alert('Insufficient balance')
      } else {
        alert('Transaction failed')
      }

      setStatus('error')
    }
  }

  return (
    <div>
      <button disabled={!address} onClick={callContract}>
        Call Contract
      </button>

      <TxStatus status={status} />
    </div>
  )
}
