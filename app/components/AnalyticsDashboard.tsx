'use client'

import React, { useMemo } from 'react'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area
} from 'recharts'

interface AnalyticsDashboardProps {
    address: string
    history: any[]
    darkMode?: boolean
}

export default function AnalyticsDashboard({ address, history, darkMode }: AnalyticsDashboardProps) {
    const stats = useMemo(() => {
        let sent = 0
        let received = 0
        const dailyMap: Record<string, { date: string, Sent: number, Received: number }> = {}
        const txsByAmount = [...history]
            .filter(tx => tx.type === 'payment' || tx.type === 'create_account')
            .sort((a, b) => Number(b.amount || b.starting_balance) - Number(a.amount || a.starting_balance))
            .slice(0, 5)

        history.forEach(tx => {
            if (tx.type !== 'payment' && tx.type !== 'create_account') return
            if (tx.transaction_successful === false) return

            const amt = Number(tx.amount || tx.starting_balance || 0)
            const date = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            const isReceived = tx.to === address || tx.account === address

            if (!dailyMap[date]) dailyMap[date] = { date, Sent: 0, Received: 0 }

            if (isReceived) {
                received += amt
                dailyMap[date].Received += amt
            } else {
                sent += amt
                dailyMap[date].Sent += amt
            }
        })

        const chartData = Object.values(dailyMap).reverse()
        const pieData = [
            { name: 'Sent', value: sent },
            { name: 'Received', value: received }
        ]

        return { sent, received, chartData, pieData, txsByAmount }
    }, [address, history])

    const COLORS = darkMode ? ['#818CF8', '#34D399'] : ['#4F46E5', '#10B981']

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <span className="text-4xl mb-4">📊</span>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    No transaction data available for analysis.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col space-y-8 overflow-y-auto pr-1 custom-scrollbar">
            <div className="flex justify-between items-center">
                <h3 className={`text-lg font-extrabold transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>Insights & Analytics</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-indigo-500/10 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Real-time</span>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-blue-50 border-blue-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-indigo-400' : 'text-blue-600'}`}>Total Sent</p>
                    <p className={`text-xl font-black font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.sent.toFixed(2)} XLM</p>
                </div>
                <div className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-green-50 border-green-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-emerald-400' : 'text-green-600'}`}>Total Received</p>
                    <p className={`text-xl font-black font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.received.toFixed(2)} XLM</p>
                </div>
            </div>

            {/* Pie Chart: Sent vs Received */}
            <div className="flex flex-col gap-4">
                <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Distribution (Sent vs Received)</p>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                                    borderColor: darkMode ? '#334155' : '#E2E8F0',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart: Daily Activity */}
            <div className="flex flex-col gap-4">
                <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Daily Activity</p>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#E2E8F0'} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: darkMode ? '#64748B' : '#94A3B8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: darkMode ? '#64748B' : '#94A3B8' }}
                            />
                            <Tooltip
                                cursor={{ fill: darkMode ? '#334155' : '#F1F5F9', opacity: 0.4 }}
                                contentStyle={{
                                    backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                                    borderColor: darkMode ? '#334155' : '#E2E8F0',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar dataKey="Sent" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Received" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Transactions List */}
            <div className="flex flex-col gap-4">
                <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Largest Transactions</p>
                <div className="space-y-3">
                    {stats.txsByAmount.map((tx, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center ${darkMode ? 'bg-gray-800/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <span className="text-sm">⚡</span>
                                <div className="max-w-[120px]">
                                    <p className={`text-[10px] font-black truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {tx.to === address || tx.account === address ? 'Received from ' + (tx.from || tx.funder).slice(0, 4) + '...' : 'Sent to ' + (tx.to || tx.account).slice(0, 4) + '...'}
                                    </p>
                                    <p className="text-[8px] font-medium text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-black font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {Number(tx.amount || tx.starting_balance).toFixed(2)} XLM
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
