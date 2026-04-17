import { useState, useEffect, useMemo, useCallback } from 'react'
import { getAllLimits, createLimit, editLimit, deleteLimit as deleteLimitDb } from '../services/limitsService'
import { Plus, Trash2, Edit2, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { useCurrency } from '../contexts/CurrencyContext'
import { useToast } from '../context/ToastContext'
import CategorySelector from '../components/CategorySelector'

const CATEGORY_EMOJIS = {
  'alimentacao': '🍔',
  'mercado': '🛒',
  'transporte': '🚗',
  'moradia': '🏠',
  'energia/agua': '⚡',
  'telefone/internet': '📱',
  'saude': '💊',
  'educacao': '📚',
  'viagem': '✈️',
  'compras': '🛍️',
  'lazer': '🎮',
  'esporte': '🏋️',
  'beleza': '✂️',
  'presentes': '🎁',
  'cartao de credito': '💳',
  'salario': '💰',
  'investimentos': '📈',
  'freelance': '💼',
  'vendas': '🏷️',
  'aluguel': '🏠',
  'bonus': '🎉',
  'reembolso': '💵',
  'poupanca': '🐷',
  'outros': '📦',
}

function getEmojiForCategory(name) {
  if (!name) return '📦'
  return CATEGORY_EMOJIS[name.toLowerCase()] || '📦'
}

export default function Limits() {
  const [limites, setLimites] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [limiteEditando, setLimiteEditando] = useState(null)
  const [formCategoria, setFormCategoria] = useState('')
  const [formEmoji, setFormEmoji] = useState('📦')
  const [formLimite, setFormLimite] = useState('')
  const [formCor, setFormCor] = useState('#10b981')
  const [formDataInicio, setFormDataInicio] = useState('')
  const [formDataFim, setFormDataFim] = useState('')

  const { formatMoney } = useCurrency()
  const { addToast } = useToast()

  const coresPredefinidas = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  const formatarData = useCallback((dataStr) => {
    if (!dataStr) return 'Data invalida'
    const data = new Date(dataStr.includes('T') ? dataStr : (dataStr + 'T00:00:00'))
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [])

  const calcularPercentual = useCallback((gasto, limite) => {
    const g = Number(gasto ?? 0)
    const l = Number(limite ?? 0)
    if (l === 0) return 0
    return (g / l) * 100
  }, [])

  const getStatusInfo = useCallback((percentual) => {
    if (percentual >= 100) return { label: 'Excedido', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertCircle }
    if (percentual >= 90) return { label: 'Critico', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: AlertTriangle }
    if (percentual >= 80) return { label: 'Atencao', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: AlertTriangle }
    return { label: 'Normal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle }
  }, [])

  const limitesComStatus = useMemo(() => {
    return limites.map(limite => {
      const percentual = calcularPercentual(limite.gasto, limite.limite)
      const restante = (limite.limite ?? 0) - (limite.gasto ?? 0)
      const status = getStatusInfo(percentual)
      return { ...limite, percentual, restante, status }
    })
  }, [limites, calcularPercentual, getStatusInfo])

  const excluirLimite = async (id) => {
    if (confirm('Tem certeza que deseja excluir este limite?')) {
      const { error } = await deleteLimitDb(id)
      if (!error) {
        setLimites(limites.filter(l => l.id !== id))
      } else {
        addToast('Erro ao excluir limite: ' + error.message, 'error')
      }
    }
  }

  const editarLimite = (limite) => {
    setLimiteEditando(limite)
    setFormCategoria(limite.categoria)
    setFormEmoji(limite.emoji)
    setFormLimite((limite.limite ?? 0).toString())
    setFormCor(limite.cor || '#10b981')
    setFormDataInicio(limite.dataInicio || '')
    setFormDataFim(limite.dataFim || '')
    setMostrarFormulario(true)
  }

  const abrirNovoFormulario = () => {
    setLimiteEditando(null)
    setFormCategoria('')
    setFormEmoji('📦')
    setFormLimite('')
    setFormCor('#10b981')
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().slice(0, 10)
    setFormDataInicio(inicioMes)
    setFormDataFim(fimMes)
    setMostrarFormulario(true)
  }

  const salvarLimite = async () => {
    if (!formCategoria || !formCategoria.trim() || !formLimite || !formDataInicio || !formDataFim) {
      addToast('Por favor, preencha todos os campos obrigatorios', 'warning')
      return
    }

    const novoLimite = {
      category: formCategoria,
      emoji: formEmoji || '📦',
      limit_value: parseFloat(formLimite),
      color: formCor,
      start_date: formDataInicio,
      end_date: formDataFim,
      used_value: limiteEditando ? limiteEditando.gasto : 0,
      percentage: 0
    }

    if (limiteEditando) {
      const { data, error } = await editLimit(limiteEditando.id, novoLimite)
      if (!error) {
        const db = data[0]
        setLimites(limites.map(l => l.id === limiteEditando.id ? {
          ...l,
          categoria: db.category || l.categoria,
          emoji: db.emoji || novoLimite.emoji,
          cor: db.color || novoLimite.color || l.cor,
          dataInicio: db.start_date || novoLimite.start_date,
          dataFim: db.end_date || novoLimite.end_date,
          gasto: db.used_value ?? 0,
          limite: db.limit_value ?? 0
        } : l))
        setMostrarFormulario(false)
      } else {
        addToast('Erro ao editar limite: ' + error.message, 'error')
      }
    } else {
      const { data, error } = await createLimit(novoLimite)
      if (!error) {
        const db = data[0]
        setLimites([...limites, {
          id: db.id,
          categoria: db.category,
          emoji: db.emoji || novoLimite.emoji,
          cor: db.color || novoLimite.color,
          dataInicio: db.start_date || novoLimite.start_date,
          dataFim: db.end_date || novoLimite.end_date,
          gasto: db.used_value ?? 0,
          limite: db.limit_value ?? 0
        }])
        setMostrarFormulario(false)
      } else {
        addToast('Erro ao criar limite: ' + error.message, 'error')
      }
    }
  }

  const handleCategoryChange = (name, categoryInfo) => {
    setFormCategoria(name)
    const emoji = getEmojiForCategory(name)
    setFormEmoji(emoji)
    if (categoryInfo?.color) setFormCor(categoryInfo.color)
  }

  useEffect(() => {
    async function fetchLimits() {
      const { data, error } = await getAllLimits()
      if (!error && Array.isArray(data)) {
        setLimites(data.map(l => ({
          id: l.id,
          categoria: l.category,
          emoji: l.emoji || getEmojiForCategory(l.category),
          cor: l.color || '#10b981',
          dataInicio: l.start_date || '',
          dataFim: l.end_date || '',
          gasto: l.used_value ?? 0,
          limite: l.limit_value ?? 0
        })))
      }
    }
    fetchLimits()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Limites de gastos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {limites.length > 0 ? `${limites.length} limite${limites.length > 1 ? 's' : ''} ativo${limites.length > 1 ? 's' : ''}` : 'Nenhum limite definido'}
          </p>
        </div>
      </div>

      <div className="px-6 py-6">
        <button
          onClick={abrirNovoFormulario}
          className="mb-6 px-5 py-3 bg-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-600 transition flex items-center gap-2 min-h-[44px]"
        >
          <Plus size={20} /> Novo limite
        </button>

        {limitesComStatus.length > 0 ? (
          <div className="space-y-4">
            {limitesComStatus.map((limite) => {
              const { percentual, restante, status } = limite
              const StatusIcon = status.icon

              return (
                <div key={limite.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/20 overflow-hidden transition-colors">
                  {percentual >= 80 && (
                    <div className={`px-4 py-2 ${status.bg} flex items-center gap-2`}>
                      <StatusIcon size={16} className={status.color} />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {percentual >= 100 ? `Limite excedido em ${formatMoney(Math.abs(restante))}` : `${status.label}: ${percentual.toFixed(0)}% utilizado`}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                          style={{ backgroundColor: `${limite.cor}20` }}
                        >
                          {limite.emoji}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{limite.categoria}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatarData(limite.dataInicio)} - {formatarData(limite.dataFim)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold" style={{ color: limite.cor }}>
                          {Math.min(percentual, 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(percentual, 100)}%`,
                            backgroundColor: percentual >= 100 ? '#ef4444' : percentual >= 90 ? '#f97316' : percentual >= 80 ? '#eab308' : limite.cor
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Gasto: </span>
                        <span className="font-semibold text-gray-800 dark:text-white">{formatMoney(limite.gasto)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Limite: </span>
                        <span className="font-semibold text-gray-800 dark:text-white">{formatMoney(limite.limite)}</span>
                      </div>
                    </div>

                    <div className={`text-center py-2 rounded-lg ${restante >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <span className={`font-medium ${restante >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                        {restante >= 0 ? `Disponivel: ${formatMoney(restante)}` : `Excedido: ${formatMoney(Math.abs(restante))}`}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                      <button
                        onClick={() => editarLimite(limite)}
                        className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[44px]"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                      <button
                        onClick={() => excluirLimite(limite.id)}
                        className="flex-1 py-3 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition flex items-center justify-center gap-2 text-sm font-medium min-h-[44px]"
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="mb-2 text-lg">Nenhum limite definido</p>
            <p className="text-sm">Crie limites para controlar seus gastos por categoria</p>
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">{limiteEditando ? 'Editar limite' : 'Novo limite'}</h2>
              <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl w-11 h-11 flex items-center justify-center">
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ backgroundColor: `${formCor}20` }}
                >
                  {formEmoji}
                </div>
              </div>

              <CategorySelector
                type="expense"
                value={formCategoria}
                onChange={handleCategoryChange}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor do limite</label>
                <input
                  value={formLimite}
                  onChange={e => setFormLimite(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data inicio</label>
                  <input
                    value={formDataInicio}
                    onChange={e => setFormDataInicio(e.target.value)}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data fim</label>
                  <input
                    value={formDataFim}
                    onChange={e => setFormDataFim(e.target.value)}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {coresPredefinidas.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setFormCor(cor)}
                      className={`w-11 h-11 rounded-full transition-all ${formCor === cor ? 'ring-4 ring-gray-300 dark:ring-gray-500 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarLimite}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium min-h-[44px]"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
