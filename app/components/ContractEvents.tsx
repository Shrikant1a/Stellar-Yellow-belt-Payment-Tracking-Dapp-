'use client'

import { useState, useEffect } from 'react'
import { getEvents } from '../lib/contract'

export default function ContractEvents({ darkMode }: { darkMode?: boolean }) {
    const [events, setEvents] = useState<any[]>([])

    useEffect(() => {
        const fetchEvents = async () => {
            const data = await getEvents()
            setEvents(data)
        }

        fetchEvents()
        const interval = setInterval(fetchEvents, 10000) // Poll every 10 seconds
        return () => clearInterval(interval)
    }, [])

    if (events.length === 0) return null

    return (
        <div className={`mt-6 p-4 rounded-2xl border transition-all ${darkMode ? 'bg-gray-800/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Live Blockchain Events
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {events.map((ev, i) => (
                    <div key={i} className={`text-[10px] p-2 rounded-lg border ${darkMode ? 'bg-gray-900/50 border-white/5 text-gray-300' : 'bg-white border-gray-100 text-gray-600'}`}>
                        <span className="font-bold text-indigo-500">NEW PAYMENT:</span> {JSON.stringify(ev.decodedData)}
                    </div>
                ))}
            </div>
        </div>
    )
}
