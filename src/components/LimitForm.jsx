import React, { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'

export default function LimitForm({ initial = null, onSubmit, onCancel }) {
  const { addToast } = useToast()
  const [category, setCategory] = useState('')
  const [limitValue, setLimitValue] = useState('0')
  const [color, setColor] = useState('bg-emerald-500')

  useEffect(() => {
    if (initial) {
      setCategory(initial.category || '')
      setLimitValue(String(initial.limit ?? initial.limit_value ?? 0))
      setColor(initial.color || 'bg-emerald-500')
    }
  }, [initial])

  const cores = ['bg-emerald-500','bg-orange-500','bg-blue-500','bg-pink-500','bg-red-500','bg-indigo-500']

  const submit = () => {
    if (!category.trim()) {
      addToast('Digite a categoria', 'warning')
      return
    }
    onSubmit({ category, limit: Number(limitValue) || 0, color })
  }

  return (
    <div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Categoria</label>
          <input value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Limite (R$)</label>
          <input type="number" value={limitValue} onChange={e => setLimitValue(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Cor</label>
          <div className="flex gap-2">
            {cores.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 ${c} rounded-full ${color === c ? 'ring-2 ring-gray-300' : ''}`}></button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={submit} className="flex-1 py-2 bg-emerald-500 text-white rounded">Salvar</button>
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
