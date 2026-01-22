import React from 'react'

// Simple dashboard cards showing placeholders. In a full implementation
// these values would be calculated from entries and accounts data.
export default function DashboardCards() {
  // placeholder values
  const total = 12345.67
  const inflows = 5000
  const outflows = 2000
  const balance = inflows - outflows

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card">
        <div className="text-sm text-gray-500">Total Geral</div>
        <div className="text-xl font-bold">R$ {total.toFixed(2)}</div>
      </div>
      <div className="card">
        <div className="text-sm text-gray-500">Entradas do mês</div>
        <div className="text-xl font-bold text-green-600">R$ {inflows.toFixed(2)}</div>
      </div>
      <div className="card">
        <div className="text-sm text-gray-500">Saídas do mês</div>
        <div className="text-xl font-bold text-red-500">R$ {outflows.toFixed(2)}</div>
      </div>
      <div className="card">
        <div className="text-sm text-gray-500">Saldo do mês</div>
        <div className="text-xl font-bold">R$ {balance.toFixed(2)}</div>
      </div>
    </div>
  )
}
