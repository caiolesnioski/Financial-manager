import { useState, useEffect, useMemo, useCallback } from 'react'
import { getAllLimits, createLimit, editLimit, deleteLimit as deleteLimitDb } from '../services/limitsService'
import { Plus, Trash2, Edit2, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import { useCurrency } from '../contexts/CurrencyContext'
import { useToast } from '../context/ToastContext'
import CurrencySelector from '../components/CurrencySelector'
import CategorySelector from '../components/CategorySelector'

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

  // useCallback: função de formatação de data estável entre renders
  const formatarData = useCallback((dataStr) => {
    if (!dataStr) return 'Data invalida'
    const data = new Date(dataStr.includes('T') ? dataStr : (dataStr + 'T00:00:00'))
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [])

  // useCallback: função pura para cálculo de percentual
  const calcularPercentual = useCallback((gasto, limite) => {
    const g = Number(gasto ?? 0)
    const l = Number(limite ?? 0)
    if (l === 0) return 0
    return (g / l) * 100
  }, [])

  // useCallback: retorna informações de status baseado no percentual
  const getStatusInfo = useCallback((percentual) => {
    if (percentual >= 100) return { label: 'Excedido', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle }
    if (percentual >= 90) return { label: 'Critico', color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle }
    if (percentual >= 80) return { label: 'Atencao', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle }
    return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle }
  }, [])

  // useMemo: pré-computa percentuais e status para todos os limites
  // Evita recálculos durante re-renders quando limites não mudam
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
    if (categoryInfo?.emoji) setFormEmoji(categoryInfo.emoji)
    if (categoryInfo?.color) setFormCor(categoryInfo.color)
  }

  useEffect(() => {
    async function fetchLimits() {
      const { data, error } = await getAllLimits()
      if (!error && Array.isArray(data)) {
        setLimites(data.map(l => ({
          id: l.id,
          categoria: l.category,
          emoji: l.emoji || '📦',
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Limites de gastos</h1>
            <p className="text-sm text-gray-500">
              {limites.length > 0 ? `${limites.length} limite${limites.length > 1 ? 's' : ''} ativo${limites.length > 1 ? 's' : ''}` : 'Nenhum limite definido'}
            </p>
          </div>
          <CurrencySelector compact />
        </div>
      </div>

      <div className="px-6 py-6">
        <button
          onClick={abrirNovoFormulario}
          className="mb-6 px-5 py-3 bg-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-600 transition flex items-center gap-2"
        >
          <Plus size={20} /> Novo limite
        </button>

        {limitesComStatus.length > 0 ? (
          <div className="space-y-4">
            {/* Usa limitesComStatus com valores pré-computados via useMemo */}
            {limitesComStatus.map((limite) => {
              const { percentual, restante, status } = limite
              const StatusIcon = status.icon

              return (
                <div key={limite.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Header com status */}
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
                          <h3 className="font-semibold text-gray-800 text-lg">{limite.categoria}</h3>
                          <p className="text-sm text-gray-500">
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

                    {/* Barra de progresso */}
                    <div className="mb-4">
                      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(percentual, 100)}%`,
                            backgroundColor: percentual >= 100 ? '#ef4444' : percentual >= 90 ? '#f97316' : percentual >= 80 ? '#eab308' : limite.cor
                          }}
                        />
                      </div>
                    </div>

                    {/* Valores */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Gasto: </span>
                        <span className="font-semibold text-gray-800">{formatMoney(limite.gasto)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Limite: </span>
                        <span className="font-semibold text-gray-800">{formatMoney(limite.limite)}</span>
                      </div>
                    </div>

                    {/* Restante */}
                    <div className={`text-center py-2 rounded-lg ${restante >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <span className={`font-medium ${restante >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {restante >= 0 ? `Disponivel: ${formatMoney(restante)}` : `Excedido: ${formatMoney(Math.abs(restante))}`}
                      </span>
                    </div>

                    {/* Acoes */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => editarLimite(limite)}
                        className="flex-1 py-2 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                      <button
                        onClick={() => excluirLimite(limite.id)}
                        className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm font-medium"
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
          <div className="text-center py-16 text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="mb-2 text-lg">Nenhum limite definido</p>
            <p className="text-sm">Crie limites para controlar seus gastos por categoria</p>
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">{limiteEditando ? 'Editar limite' : 'Novo limite'}</h2>
              <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                <input
                  value={formEmoji}
                  onChange={e => setFormEmoji(e.target.value)}
                  placeholder="📦"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor do limite</label>
                <input
                  value={formLimite}
                  onChange={e => setFormLimite(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data inicio</label>
                  <input
                    value={formDataInicio}
                    onChange={e => setFormDataInicio(e.target.value)}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data fim</label>
                  <input
                    value={formDataFim}
                    onChange={e => setFormDataFim(e.target.value)}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {coresPredefinidas.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setFormCor(cor)}
                      className={`w-10 h-10 rounded-full transition-all ${formCor === cor ? 'ring-4 ring-gray-300 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarLimite}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium"
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
