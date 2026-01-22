import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Plus, Edit2, Trash2, MoreVertical, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useCurrency } from '../contexts/CurrencyContext'
import { getCategoryByName } from '../constants/categories'
import CurrencySelector from '../components/CurrencySelector'
import CategorySelector from '../components/CategorySelector'

export default function Cashflow() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [mostrarPrevisto, setMostrarPrevisto] = useState(false)
  const [contaSelecionada, setContaSelecionada] = useState(null)
  const [editando, setEditando] = useState(null)
  const [menuAberto, setMenuAberto] = useState(null)
  const [customCategories, setCustomCategories] = useState([])

  const { entries, loading, update, remove } = useEntries()
  const { formatMoney } = useCurrency()

  useEffect(() => {
    const saved = localStorage.getItem('customCategories')
    if (saved) setCustomCategories(JSON.parse(saved))
  }, [])

  const getCategoryEmoji = (categoryName) => {
    const custom = customCategories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase())
    if (custom) return custom.emoji
    const predefined = getCategoryByName(categoryName)
    return predefined ? null : '📦'
  }

  const getCategoryColor = (categoryName) => {
    const custom = customCategories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase())
    if (custom) return custom.color
    const predefined = getCategoryByName(categoryName)
    return predefined?.color || '#6b7280'
  }

  const anoSelecionado = mesAtual.getFullYear()
  const mesSelecionado = mesAtual.getMonth() + 1
  const transacoes = (entries || [])
    .filter(e => {
      const data = new Date(e.date)
      return data.getFullYear() === anoSelecionado && (data.getMonth() + 1) === mesSelecionado
    })
    .map(e => {
      let tipoPt = e.type
      if (e.type === 'expense') tipoPt = 'despesa'
      if (e.type === 'income') tipoPt = 'receita'
      if (e.type === 'transfer') tipoPt = 'transferencia'
      let valor = Number(e.value)
      if (tipoPt === 'despesa') valor = -Math.abs(valor)
      if (tipoPt === 'receita') valor = Math.abs(valor)
      return {
        id: e.id,
        data: e.date,
        descricao: e.description,
        conta: e.account,
        valor,
        tipo: tipoPt,
        categoria: e.category
      }
    })

  const resumo = {
    entradas: transacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + Math.abs(t.valor), 0),
    saidas: transacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + Math.abs(t.valor), 0),
    saldo: transacoes.reduce((s, t) => s + t.valor, 0)
  }

  const formatarData = (dataStr) => {
    const data = new Date(dataStr + 'T00:00:00')
    const hojeDate = new Date()
    hojeDate.setHours(0, 0, 0, 0)
    if (data.getTime() === hojeDate.getTime()) return 'Hoje'
    const ontem = new Date(hojeDate)
    ontem.setDate(ontem.getDate() - 1)
    if (data.getTime() === ontem.getTime()) return 'Ontem'
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
  }

  const agruparPorData = (transacoes) => {
    const grupos = {}
    transacoes.forEach(t => {
      if (!grupos[t.data]) grupos[t.data] = []
      grupos[t.data].push(t)
    })
    return grupos
  }

  const transacoesAgrupadas = agruparPorData(
    contaSelecionada ? transacoes.filter(t => t.conta === contaSelecionada) : transacoes
  )

  const mudarMes = (direcao) => {
    const novaData = new Date(mesAtual)
    novaData.setMonth(mesAtual.getMonth() + direcao)
    setMesAtual(novaData)
  }

  const mesAnterior = new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  const mesSeguinte = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1).toLocaleDateString('pt-BR', { month: 'long' })

  const handleDelete = async (id) => {
    if (confirm('Deseja excluir este lancamento?')) {
      await remove(id)
      setMenuAberto(null)
    }
  }

  const getTypeIcon = (tipo) => {
    switch(tipo) {
      case 'receita': return <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
      case 'despesa': return <ArrowDownCircle className="w-5 h-5 text-red-500" />
      case 'transferencia': return <ArrowLeftRight className="w-5 h-5 text-blue-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Fluxo de caixa</h1>
            <CurrencySelector compact />
          </div>
          {/* Navegacao de Meses */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => mudarMes(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm capitalize">{mesAnterior}</span>
              <div className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium capitalize">
                {mesAtual.toLocaleDateString('pt-BR', { month: 'long' })}
              </div>
              <span className="text-gray-400 text-sm capitalize">{mesSeguinte}</span>
            </div>
            <button onClick={() => mudarMes(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {contaSelecionada && (
          <div className="px-6 py-3 bg-emerald-50 border-t border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium">Filtrando por {contaSelecionada}</span>
              <button onClick={() => setContaSelecionada(null)} className="text-emerald-600 hover:text-emerald-700">
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Transacoes */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : Object.keys(transacoesAgrupadas).length > 0 ? (
          Object.entries(transacoesAgrupadas)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([data, transacoesData]) => (
              <div key={data} className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3 capitalize">
                  {formatarData(data)}
                </h3>
                <div className="space-y-2">
                  {transacoesData.map(transacao => {
                    const categoryInfo = getCategoryByName(transacao.categoria)
                    const CategoryIcon = categoryInfo?.icon
                    const emoji = getCategoryEmoji(transacao.categoria)
                    const color = getCategoryColor(transacao.categoria)

                    return (
                      <div key={transacao.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          {/* Icone da categoria */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            {emoji ? (
                              <span className="text-2xl">{emoji}</span>
                            ) : CategoryIcon ? (
                              <CategoryIcon className="w-6 h-6" style={{ color }} />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-800">{transacao.descricao || 'Sem descricao'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ backgroundColor: `${color}20`, color }}
                                  >
                                    {emoji && <span className="mr-1">{emoji}</span>}
                                    {transacao.categoria || 'Sem categoria'}
                                  </span>
                                </div>
                              </div>

                              {/* Menu 3 pontinhos */}
                              <div className="relative">
                                <button
                                  onClick={() => setMenuAberto(menuAberto === transacao.id ? null : transacao.id)}
                                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  <MoreVertical size={18} className="text-gray-500" />
                                </button>

                                {menuAberto === transacao.id && (
                                  <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border z-20 overflow-hidden min-w-[140px]">
                                    <button
                                      onClick={() => { setEditando(transacao); setMenuAberto(null) }}
                                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit2 size={16} className="text-gray-500" />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDelete(transacao.id)}
                                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    >
                                      <Trash2 size={16} />
                                      Excluir
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Valor e tipo */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1.5">
                                {getTypeIcon(transacao.tipo)}
                                <span className="text-xs text-gray-500 capitalize">{transacao.tipo}</span>
                              </div>
                              <p className={`text-lg font-bold ${
                                transacao.tipo === 'receita' ? 'text-emerald-600' :
                                transacao.tipo === 'despesa' ? 'text-red-600' : 'text-blue-600'
                              }`}>
                                {transacao.tipo === 'receita' ? '+' : transacao.tipo === 'despesa' ? '-' : ''}
                                {formatMoney(Math.abs(transacao.valor))}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Nenhuma transacao neste periodo</p>
            <Link to="/new-entry" className="text-emerald-600 font-medium">
              Adicionar primeira transacao
            </Link>
          </div>
        )}
      </div>

      {/* Resumo Fixo no Rodape */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <button onClick={() => setMostrarPrevisto(!mostrarPrevisto)} className="w-full py-2 flex justify-center hover:bg-gray-50">
          {mostrarPrevisto ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
        <div className="px-6 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">entradas</p>
            <p className="text-lg font-semibold text-emerald-600">{formatMoney(resumo.entradas)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">saidas</p>
            <p className="text-lg font-semibold text-red-600">{formatMoney(resumo.saidas)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">saldo</p>
            <p className={`text-lg font-semibold ${resumo.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatMoney(resumo.saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Botao Flutuante */}
      <Link
        to="/new-entry"
        className="fixed bottom-32 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
      >
        <Plus size={28} />
      </Link>

      {/* Modal de edicao */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Editar lancamento</h3>
              <button onClick={() => setEditando(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descricao</label>
                <input
                  value={editando.descricao}
                  onChange={e => setEditando({ ...editando, descricao: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Descricao do lancamento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                <input
                  type="number"
                  value={Math.abs(editando.valor)}
                  onChange={e => setEditando({ ...editando, valor: Number(e.target.value) * (editando.tipo === 'despesa' ? -1 : 1) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <CategorySelector
                type={editando.tipo === 'receita' ? 'income' : 'expense'}
                value={editando.categoria}
                onChange={(name) => setEditando({ ...editando, categoria: name })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={editando.tipo}
                  onChange={e => setEditando({ ...editando, tipo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditando(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    let tipoBackend = editando.tipo
                    if (editando.tipo === 'receita') tipoBackend = 'income'
                    if (editando.tipo === 'despesa') tipoBackend = 'expense'
                    if (editando.tipo === 'transferencia') tipoBackend = 'transfer'
                    await update(editando.id, {
                      description: editando.descricao,
                      value: Math.abs(editando.valor),
                      category: editando.categoria,
                      type: tipoBackend
                    })
                    setEditando(null)
                  }}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fechar menu ao clicar fora */}
      {menuAberto && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(null)} />
      )}
    </div>
  )
}
