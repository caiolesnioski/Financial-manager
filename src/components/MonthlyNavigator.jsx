import React, { useState, useEffect } from 'react'

// MonthlyNavigator component: allows navigation between months and shows simple metrics
export default function MonthlyNavigator({ onChange }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  useEffect(() => {
    if (onChange) onChange({ year, month })
  }, [year, month])

  const prev = () => {
    if (month === 1) {
      setMonth(12)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }
  const next = () => {
    if (month === 12) {
      setMonth(1)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  // placeholder metrics — a real implementation would fetch and compute these values
  const metrics = {
    inflows: 5000,
    outflows: 2000,
    balance: 3000,
    expectedInflows: 5200,
    expectedOutflows: 2100,
    expectedBalance: 3100
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prev} className="px-3 py-1 bg-gray-100 rounded">◀</button>
          <div className="font-semibold">{String(month).padStart(2,'0')}/{year}</div>
          <button onClick={next} className="px-3 py-1 bg-gray-100 rounded">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">Entradas</div>
          <div className="text-xl font-bold text-green-600">R$ {metrics.inflows.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Saídas</div>
          <div className="text-xl font-bold text-red-500">R$ {metrics.outflows.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Saldo</div>
          <div className="text-xl font-bold">R$ {metrics.balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">Inflows esperados</div>
          <div className="text-lg">R$ {metrics.expectedInflows.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Outflows esperados</div>
          <div className="text-lg">R$ {metrics.expectedOutflows.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
