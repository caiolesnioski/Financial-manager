import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Edit2, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import {
  getAllRecurringItems,
  createRecurringItem,
  updateRecurringItem,
  deleteRecurringItem,
  getPaymentsForMonth,
  upsertPayment
} from '../services/recurrentsService'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../contexts/CurrencyContext'
import CategorySelector from '../components/CategorySelector'

const CATEGORY_EMOJIS = {
  'alimentacao': '🍔', 'mercado': '🛒', 'transporte': '🚗', 'moradia': '🏠',
  'energia/agua': '⚡', 'telefone/internet': '📱', 'saude': '💊', 'educacao': '📚',
  'viagem': '✈️', 'compras': '🛍️', 'lazer': '🎮', 'esporte': '🏋️',
  'beleza': '✂️', 'presentes': '🎁', 'cartao de credito': '💳', 'outros': '📦',
}

function getEmoji(name) {
  return CATEGORY_EMOJIS[name?.toLowerCase()] || '📦'
}

export default function Recurrents() {
  const hoje = new Date()
  const [items, setItems] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const [formCurrency, setFormCurrency] = useState('BRL')
  const [formCategory, setFormCategory] = useState('')
  const [formDay, setFormDay] = useState('1')
  const [saving, setSaving] = useState(false)
  const [mesAtual] = useState({ month: hoje.getMonth() + 1, year: hoje.getFullYear() })

  const { addToast } = useToast()
  const { formatMoney } = useCurrency()

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: itemsData }, { data: paymentsData }] = await Promise.all([
      getAllRecurringItems(),
      getPaymentsForMonth(mesAtual.month, mesAtual.year)
    ])
    setItems(itemsData || [])
    setPayments(paymentsData || [])
    setLoading(false)
  }

  const itemsWithStatus = useMemo(() => {
    return items.map(item => {
      const payment = payments.find(p => p.recurring_item_id === item.id)
      return { ...item, paid: payment?.paid || false, paymentId: payment?.id }
    })
  }, [items, payments])

  const totals = useMemo(() => {
    const currency = items[0]?.currency || 'BRL'
    const sameItems = items.filter(i => (i.currency || 'BRL') === currency)
    const total = sameItems.reduce((s, i) => s + Number(i.amount), 0)
    const paid = itemsWithStatus.filter(i => i.paid && (i.currency || 'BRL') === currency).reduce((s, i) => s + Number(i.amount), 0)
    const pending = total - paid
    return { total, paid, pending, currency }
  }, [items, itemsWithStatus])

  const handleTogglePaid = async (item) => {
    const newPaid = !item.paid
    const { error } = await upsertPayment(item.id, mesAtual.month, mesAtual.year, newPaid)
    if (error) {
      addToast('Erro ao atualizar pagamento: ' + error.message, 'error')
    } else {
      setPayments(prev => {
        const existing = prev.find(p => p.recurring_item_id === item.id)
        if (existing) {
          return prev.map(p => p.recurring_item_id === item.id ? { ...p, paid: newPaid } : p)
        }
        return [...prev, { recurring_item_id: item.id, paid: newPaid, month: mesAtual.month, year: mesAtual.year }]
      })
    }
  }

  const openNew = () => {
    setEditingItem(null)
    setFormName('')
    setFormAmount('')
    setFormCurrency('BRL')
    setFormCategory('')
    setFormDay('1')
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormAmount(String(item.amount))
    setFormCurrency(item.currency || 'BRL')
    setFormCategory(item.category || '')
    setFormDay(String(item.day_of_month || 1))
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formName.trim() || !formAmount || !formDay) {
      addToast('Preencha nome, valor e dia do vencimento', 'warning')
      return
    }
    setSaving(true)
    const payload = {
      name: formName.trim(),
      amount: parseFloat(formAmount),
      currency: formCurrency,
      category: formCategory,
      day_of_month: parseInt(formDay)
    }
    const { error } = editingItem
      ? await updateRecurringItem(editingItem.id, payload)
      : await createRecurringItem(payload)

    if (error) {
      addToast('Erro ao salvar: ' + error.message, 'error')
    } else {
      addToast(editingItem ? 'Item atualizado!' : 'Item criado!', 'success')
      setShowForm(false)
      loadAll()
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir este item recorrente?')) return
    const { error } = await deleteRecurringItem(id)
    if (error) {
      addToast('Erro ao excluir: ' + error.message, 'error')
    } else {
      setItems(prev => prev.filter(i => i.id !== id))
      addToast('Item excluído!', 'success')
    }
  }

  const mesNome = new Date(mesAtual.year, mesAtual.month - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Despesas Recorrentes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{mesNome}</p>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Totalizadores */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-gray-700/20 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
            <p className="text-base font-bold text-gray-800 dark:text-white">{formatMoney(totals.total, totals.currency)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-gray-700/20 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pagos</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(totals.paid, totals.currency)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-gray-700/20 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pendentes</p>
            <p className="text-base font-bold text-orange-500 dark:text-orange-400">{formatMoney(totals.pending, totals.currency)}</p>
          </div>
        </div>

        <button
          onClick={openNew}
          className="mb-6 px-5 py-3 bg-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-600 transition flex items-center gap-2 min-h-[44px]"
        >
          <Plus size={20} /> Nova despesa fixa
        </button>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : itemsWithStatus.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg mb-1">Nenhuma despesa recorrente</p>
            <p className="text-sm">Adicione suas despesas fixas mensais</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itemsWithStatus
              .sort((a, b) => a.day_of_month - b.day_of_month)
              .map(item => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 transition-colors ${item.paid ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePaid(item)}
                      className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {item.paid
                        ? <CheckCircle2 size={28} className="text-emerald-500" />
                        : <Circle size={28} className="text-gray-300 dark:text-gray-600" />
                      }
                    </button>

                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: '#10b98115' }}
                    >
                      {getEmoji(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-800 dark:text-white ${item.paid ? 'line-through' : ''}`}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.category && <span>{item.category}</span>}
                        <span>• dia {item.day_of_month}</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full font-medium">{item.currency || 'BRL'}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold ${item.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatMoney(item.amount, item.currency)}
                      </p>
                      {item.paid && <span className="text-xs text-emerald-500">Pago</span>}
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Edit2 size={16} className="text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">{editingItem ? 'Editar item' : 'Nova despesa fixa'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl w-11 h-11 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Aluguel, Netflix, Plano de saúde"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor</label>
                  <input
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moeda</label>
                  <select
                    value={formCurrency}
                    onChange={e => setFormCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="BRL">R$ BRL</option>
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dia do vencimento</label>
                <input
                  value={formDay}
                  onChange={e => setFormDay(e.target.value)}
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <CategorySelector
                type="expense"
                value={formCategory}
                onChange={(name) => setFormCategory(name)}
              />

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium min-h-[44px] disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
