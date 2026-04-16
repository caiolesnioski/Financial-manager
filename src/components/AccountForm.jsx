import React, { useState, useEffect } from 'react'

// Reusable account form used for create/edit
export default function AccountForm({ onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState(initial?.type || 'bank')
  const [initialBalance, setInitialBalance] = useState(initial?.initialBalance ?? 0)

  useEffect(() => {
    setName(initial?.name || '')
    setType(initial?.type || 'bank')
    setInitialBalance(initial?.initialBalance ?? 0)
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    const account = {
      name,
      type,
      initialBalance: Number(initialBalance),
      currentBalance: Number(initialBalance)
    }
    onSubmit(account)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da conta" className="border rounded px-3 py-2" required />
      <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded px-3 py-2">
        <option value="bank">Banco</option>
        <option value="wallet">Carteira</option>
      </select>
      <input value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} type="number" step="0.01" className="border rounded px-3 py-2" />
      <div className="flex gap-2">
        <button type="submit" className="button-primary">Salvar</button>
      </div>
    </form>
  )
}
