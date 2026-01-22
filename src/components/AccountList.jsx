import React, { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import AccountForm from '../pages/AccountForm'

export default function AccountList() {
  const { accounts, loading, error, create, update, remove } = useAccounts()
  const [editing, setEditing] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const handleCreate = async (account) => {
    await create(account)
    setShowNew(false)
  }

  const handleUpdate = async (updates) => {
    await update(editing.id, updates)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-medium">Minhas contas</h2>
        <button onClick={() => setShowNew((s) => !s)} className="button-primary">Nova conta</button>
      </div>

      {showNew && (
        <div className="card">
          <AccountForm onSubmit={handleCreate} />
        </div>
      )}

      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600">Erro: {error.message}</div>}

      <div className="grid gap-3">
        {accounts?.map((a) => (
          <div key={a.id} className="card flex items-center justify-between">
            <div>
              <div className="font-semibold">{a.name}</div>
              <div className="text-sm text-gray-500">{a.type} • Saldo: R$ {Number(a.currentBalance || 0).toFixed(2)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(a)} className="px-3 py-1 bg-gray-100 rounded">Editar</button>
              <button onClick={() => remove(a.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="card mt-4">
          <h3 className="font-semibold mb-2">Editar conta</h3>
          <AccountForm initial={editing} onSubmit={handleUpdate} />
          <div className="mt-2">
            <button onClick={() => setEditing(null)} className="px-3 py-1">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
