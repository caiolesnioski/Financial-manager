import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useAccounts } from '../hooks/useAccounts'
import { useToast } from '../context/ToastContext'
import { Search, X, Filter, Calendar, FileDown, Loader2, Repeat, Plus } from 'lucide-react'
import { exportToCSV, prepareEntriesForExport, entryExportHeaders } from '../utils/exportUtils'

export default function EntryList() {
  const { entries, loading, remove } = useEntries()
  const { accounts = [] } = useAccounts()
  const { addToast } = useToast()

  // Estados para filtros e ordenação
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAccount, setFilterAccount] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [isExporting, setIsExporting] = useState(false)

  // useCallback: estabiliza o handler de exclusão
  const handleRemove = useCallback((id) => {
    remove(id)
  }, [remove])

  // useMemo: extrai categorias únicas dos lançamentos
  const uniqueCategories = useMemo(() => {
    return [...new Set(entries.map(e => e.category).filter(Boolean))].sort()
  }, [entries])

  // useMemo: filtra e ordena os lançamentos
  // Recalcula apenas quando entries ou algum filtro muda
  const filteredAndSorted = useMemo(() => {
    let result = [...entries]

    // Filtro por texto (busca em descrição e categoria)
    if (searchText.trim()) {
      const search = searchText.toLowerCase()
      result = result.filter(e =>
        (e.description?.toLowerCase().includes(search)) ||
        (e.category?.toLowerCase().includes(search))
      )
    }

    // Filtro por tipo (income/expense)
    if (filterType !== 'all') {
      result = result.filter(e => e.type === filterType)
    }

    // Filtro por conta
    if (filterAccount !== 'all') {
      result = result.filter(e => e.account_id === filterAccount)
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory)
    }

    // Filtro por data inicial
    if (startDate) {
      result = result.filter(e => e.date >= startDate)
    }

    // Filtro por data final
    if (endDate) {
      result = result.filter(e => e.date <= endDate)
    }

    // Ordenação
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date)
        case 'date-asc':
          return new Date(a.date) - new Date(b.date)
        case 'value-desc':
          return Number(b.value) - Number(a.value)
        case 'value-asc':
          return Number(a.value) - Number(b.value)
        case 'description-asc':
          return (a.description || '').localeCompare(b.description || '')
        case 'description-desc':
          return (b.description || '').localeCompare(a.description || '')
        default:
          return 0
      }
    })

    return result
  }, [entries, searchText, filterType, filterAccount, filterCategory, startDate, endDate, sortBy])

  // Função para limpar todos os filtros
  const clearFilters = useCallback(() => {
    setSearchText('')
    setFilterType('all')
    setFilterAccount('all')
    setFilterCategory('all')
    setStartDate('')
    setEndDate('')
    setSortBy('date-desc')
  }, [])

  // Função para exportar CSV
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const dataToExport = prepareEntriesForExport(filteredAndSorted, accounts)
      const today = new Date().toISOString().slice(0, 10)
      const filename = `lancamentos-${today}`

      const result = await exportToCSV(dataToExport, filename, {
        headers: entryExportHeaders
      })

      if (result.success) {
        addToast(`${filteredAndSorted.length} lançamentos exportados com sucesso!`, 'success')
      } else {
        addToast(result.error || 'Erro ao exportar CSV', 'error')
      }
    } catch (error) {
      addToast('Erro ao exportar CSV', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // Verifica se há algum filtro ativo
  const hasActiveFilters = searchText || filterType !== 'all' || filterAccount !== 'all' ||
    filterCategory !== 'all' || startDate || endDate || sortBy !== 'date-desc'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Lançamentos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAndSorted.length} de {entries.length} lançamentos
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || filteredAndSorted.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Card de Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 space-y-4 transition-colors">
          {/* Barra de busca */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:placeholder-gray-400"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Grid de filtros - 2 colunas mobile, 4 colunas desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
            </div>

            {/* Filtro por conta */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Conta</label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro por categoria */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="date-desc">Data (recente)</option>
                <option value="date-asc">Data (antigo)</option>
                <option value="value-desc">Valor (maior)</option>
                <option value="value-asc">Valor (menor)</option>
                <option value="description-asc">Descrição (A-Z)</option>
                <option value="description-desc">Descrição (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Filtros de data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                <Calendar size={12} className="inline mr-1" />
                Data inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                <Calendar size={12} className="inline mr-1" />
                Data final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botão limpar filtros e contador */}
          <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter size={16} />
              <span>
                <strong>{filteredAndSorted.length}</strong> de <strong>{entries.length}</strong> lançamentos
              </span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
              >
                <X size={14} />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Lista de lançamentos */}
        <div className="space-y-2">
          {loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              Carregando lançamentos...
            </div>
          )}

          {!loading && filteredAndSorted.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Filter size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              {entries.length === 0 ? (
                <>
                  <p className="text-lg font-medium">Nenhum lançamento</p>
                  <p className="text-sm">Adicione seu primeiro lançamento</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">Nenhum resultado encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                  >
                    Limpar filtros
                  </button>
                </>
              )}
            </div>
          )}

          {filteredAndSorted.map((e) => {

            const account = accounts.find(a => a.id === e.account_id)
            const isRecurring = e.isRecurring || (e.repeatType && e.repeatType !== 'none')
            return (
              <div key={e.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 dark:text-white truncate">{e.description}</span>
                      {isRecurring && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                          <Repeat size={10} />
                          Recorrente
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                        e.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                      }`}>
                        {e.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                      <span>{e.category}</span>
                      {account && <span className="ml-2">• {account.name}</span>}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(e.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${e.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {e.type === 'income' ? '+' : '-'} R$ {Number(e.value).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemove(e.id)}
                      className="mt-2 px-3 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botao flutuante para novo lancamento */}
      <Link
        to="/new-entry"
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 z-10"
      >
        <Plus size={28} />
      </Link>
    </div>
  )
}
