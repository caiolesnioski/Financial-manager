import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EntryForm from '../components/EntryForm'
import { useEntries } from '../hooks/useEntries'
import { useAccounts } from '../hooks/useAccounts'
import { useToast } from '../context/ToastContext'
import { AlertCircle } from 'lucide-react'

export default function NewEntry() {
  const { create, loading } = useEntries()
  const { accounts } = useAccounts()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (data) => {
    setError(null)
    try {
      const { error: saveError } = await create(data)
      if (saveError) {
        setError(saveError.message || 'Erro ao salvar lançamento. Tente novamente.')
      } else {
        addToast('Lançamento salvo com sucesso ✓', 'success')
        setFormKey(prev => prev + 1)
        navigate('/cashflow')
      }
    } catch (err) {
      setError(err.message || 'Erro desconhecido ao salvar lançamento.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Novo Lançamento</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Registre uma despesa, receita ou transferência</p>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <EntryForm key={formKey} onSubmit={handleSubmit} accounts={accounts} loading={loading} />
      </div>
    </div>
  )
}
