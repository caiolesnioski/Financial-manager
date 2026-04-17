import React, { useState, useEffect } from 'react'

export default function AccountForm({ onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState(initial?.type || 'bank')
  const [initialBalance, setInitialBalance] = useState(initial?.initialBalance ?? 0)
  const [currency, setCurrency] = useState(initial?.currency || 'BRL')

  useEffect(() => {
    setName(initial?.name || '')
    setType(initial?.type || 'bank')
    setInitialBalance(initial?.initialBalance ?? 0)
    setCurrency(initial?.currency || 'BRL')
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name,
      type,
      currency,
      initialBalance: Number(initialBalance),
      currentBalance: Number(initialBalance)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da conta" className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
      <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <option value="bank">Banco</option>
        <option value="wallet">Carteira</option>
      </select>
      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <option value="BRL">R$ — Real Brasileiro</option>
        <option value="EUR">€ — Euro</option>
        <option value="USD">$ — Dólar Americano</option>
      </select>
      <input value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} type="number" step="0.01" placeholder="Saldo inicial" className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      <div className="flex gap-2">
        <button type="submit" className="button-primary">Salvar</button>
      </div>
    </form>
  )
}
