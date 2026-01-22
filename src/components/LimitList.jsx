import React, { useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { useLimits } from '../hooks/useLimits'
import { useToast } from '../context/ToastContext'
import LimitForm from './LimitForm'

export default function LimitList() {
  const { limits = [], loading, create, update, remove } = useLimits()
  const { addToast } = useToast()
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState(null)

  const abrirNovo = () => {
    setEditing(null)
    setShowNew(true)
  }

  const salvarNovo = async (payload) => {
    const { error } = await create(payload)
    if (error) addToast('Erro ao criar: ' + (error.message || error), 'error')
    setShowNew(false)
  }

  const salvarEdicao = async (id, updates) => {
    const { error } = await update(id, updates)
    if (error) addToast('Erro ao atualizar: ' + (error.message || error), 'error')
    setEditing(null)
  }

  const excluir = async (id) => {
    if (!confirm('Excluir limite?')) return
    const { error } = await remove(id)
    if (error) addToast('Erro ao excluir: ' + (error.message || error), 'error')
  }

  const progressColor = (p) => {
    if (p <= 50) return 'bg-green-400'
    if (p <= 80) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-medium">Limites</h2>
        <button onClick={abrirNovo} className="button-primary flex items-center gap-2"><Plus size={16}/> Novo limite</button>
      </div>

      {loading && <div>Carregando...</div>}

      {showNew && (
        <div className="card">
          <LimitForm onSubmit={salvarNovo} onCancel={() => setShowNew(false)} />
        </div>
      )}

      <div className="grid gap-3">
        {limits.map(l => {
          const used = Number(l.spent ?? 0)
          const limitVal = Number(l.limit ?? 0)
          const percentage = limitVal > 0 ? (used / limitVal) * 100 : 0
          return (
            <div key={l.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{l.category}</div>
                  <div className="text-sm text-gray-500">R$ {limitVal.toFixed(2)} • Usado: R$ {used.toFixed(2)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(l)} className="px-3 py-1 bg-gray-100 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => excluir(l.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-2 h-3 bg-gray-200 rounded overflow-hidden">
                <div className={`${progressColor(percentage)} h-full`} style={{ width: `${Math.min(100, percentage)}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <div className="card mt-4">
          <h3 className="font-semibold mb-2">Editar limite</h3>
          <LimitForm initial={editing} onSubmit={(updates) => salvarEdicao(editing.id, updates)} onCancel={() => setEditing(null)} />
        </div>
      )}
    </div>
  )
}
