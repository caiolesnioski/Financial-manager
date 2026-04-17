import { useState, useEffect, useMemo, useCallback } from 'react'
import { Calendar, TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Target, Filter, Loader2, FileDown, Download } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { getEntriesByMonth, getAllEntries } from '../services/entriesService'
import { getAllLimits } from '../services/limitsService'
import { getCategoryByName } from '../constants/categories'
import { useCurrency } from '../contexts/CurrencyContext'
import CurrencySelector from '../components/CurrencySelector'
import { useToast } from '../context/ToastContext'
import { exportToCSV, exportToPDF, prepareEntriesForExport, entryExportHeaders } from '../utils/exportUtils'

export default function Reports() {
  const [entries, setEntries] = useState([])
  const [allEntries, setAllEntries] = useState([]) // Para gráfico de 6 meses
  const [limits, setLimits] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMonth, setIsLoadingMonth] = useState(false)
  const [viewMode, setViewMode] = useState('month') // 'month', 'year', 'all'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  const { formatMoney } = useCurrency()
  const { addToast } = useToast()

  // Função para exportar CSV
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const dataToExport = prepareEntriesForExport(filteredEntries, [])
      const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      const [year, month] = selectedMonth.split('-')
      const filename = `financas-${month}-${year}`

      const result = await exportToCSV(dataToExport, filename, {
        headers: entryExportHeaders,
        period: monthLabel,
      })

      if (result.success) {
        addToast('CSV exportado com sucesso!', 'success')
      } else {
        addToast(result.error || 'Erro ao exportar CSV', 'error')
      }
    } catch (error) {
      addToast('Erro ao exportar CSV', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // Função para exportar PDF
  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      const [year, month] = selectedMonth.split('-')
      const filename = `financas-${month}-${year}`
      const prepared = prepareEntriesForExport(filteredEntries, [])

      const result = await exportToPDF(prepared, filename, {
        title: `Relatório Financeiro - ${monthLabel}`,
        period: monthLabel,
        totalIncome: income,
        totalExpenses: expenses,
        balance: balance,
      })

      if (result.success) {
        addToast('PDF exportado com sucesso!', 'success')
      } else {
        addToast(result.error || 'Erro ao exportar PDF', 'error')
      }
    } catch (error) {
      addToast('Erro ao exportar PDF', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

  // Carrega dados iniciais (limites e todos os entries para gráfico de 6 meses)
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true)
      const [allEntriesRes, limitsRes] = await Promise.all([
        getAllEntries(),
        getAllLimits()
      ])
      setAllEntries(allEntriesRes.data || [])
      setLimits(limitsRes.data || [])
      setIsLoading(false)
    }
    fetchInitialData()
  }, [])

  // Carrega entries do mês selecionado quando muda
  useEffect(() => {
    async function fetchMonthData() {
      if (viewMode !== 'month') {
        // Se não for modo mês, usa allEntries filtrado
        setEntries(allEntries)
        return
      }

      setIsLoadingMonth(true)
      const [year, month] = selectedMonth.split('-').map(Number)
      const { data, error } = await getEntriesByMonth(year, month)
      if (!error) {
        setEntries(data || [])
      }
      setIsLoadingMonth(false)
    }

    if (!isLoading) {
      fetchMonthData()
    }
  }, [selectedMonth, viewMode, isLoading, allEntries])

  // useMemo: filtra entradas baseado no modo de visualização
  // Otimizado: quando viewMode é 'month', entries já vem filtrado do backend
  const filteredEntries = useMemo(() => {
    if (viewMode === 'month') {
      // Entries já vem filtrado por mês do backend
      if (selectedCategory === 'all') return entries
      return entries.filter(e => e.category === selectedCategory)
    }

    // Para 'year' ou 'all', filtra do allEntries
    return allEntries.filter(entry => {
      const entryYear = entry.date.slice(0, 4)
      const selectedYear = selectedMonth.slice(0, 4)

      let dateMatch = true
      if (viewMode === 'year') {
        dateMatch = entryYear === selectedYear
      }

      const categoryMatch = selectedCategory === 'all' || entry.category === selectedCategory
      return dateMatch && categoryMatch
    })
  }, [entries, allEntries, viewMode, selectedMonth, selectedCategory])

  // useMemo: calcula métricas financeiras
  const { expenses, income, balance, savingsRate, incomeCount, expenseCount } = useMemo(() => {
    const exp = filteredEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Number(e.value || 0), 0)

    const inc = filteredEntries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + Number(e.value || 0), 0)

    const bal = inc - exp
    const savings = inc > 0 ? ((inc - exp) / inc * 100).toFixed(1) : 0

    return {
      expenses: exp,
      income: inc,
      balance: bal,
      savingsRate: savings,
      incomeCount: filteredEntries.filter(e => e.type === 'income').length,
      expenseCount: filteredEntries.filter(e => e.type === 'expense').length
    }
  }, [filteredEntries])

  // useMemo: agrupa despesas por categoria para o gráfico de pizza
  const expensesByCategory = useMemo(() => {
    return filteredEntries
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        const cat = e.category || 'Outros'
        const found = acc.find(x => x.name === cat)
        if (found) {
          found.value += Number(e.value || 0)
          found.count += 1
        } else {
          const categoryInfo = getCategoryByName(cat)
          acc.push({
            name: cat,
            value: Number(e.value || 0),
            count: 1,
            color: categoryInfo?.color || COLORS[acc.length % COLORS.length]
          })
        }
        return acc
      }, [])
      .sort((a, b) => b.value - a.value)
  }, [filteredEntries])

  // useMemo: dados para gráfico comparativo mensal (últimos 6 meses)
  // Usa allEntries para ter visão completa
  const monthlyData = useMemo(() => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStr = date.toISOString().slice(0, 7)
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

      const monthEntries = allEntries.filter(e => e.date.slice(0, 7) === monthStr)
      const monthIncome = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.value || 0), 0)
      const monthExpenses = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.value || 0), 0)

      data.push({
        month: monthLabel,
        receitas: monthIncome,
        despesas: monthExpenses,
        saldo: monthIncome - monthExpenses
      })
    }
    return data
  }, [allEntries])

  // useMemo: timeline diária do mês selecionado
  const dailyData = useMemo(() => {
    if (viewMode !== 'month') return []

    const [year, month] = selectedMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const data = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`
      const dayEntries = entries.filter(e => e.date.slice(0, 10) === dateStr)
      const dayIncome = dayEntries.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.value || 0), 0)
      const dayExpenses = dayEntries.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.value || 0), 0)

      data.push({
        day: String(day),
        receitas: dayIncome,
        despesas: dayExpenses
      })
    }
    return data
  }, [viewMode, selectedMonth, entries])

  // useMemo: top 5 maiores despesas do período
  const topExpenses = useMemo(() => {
    return filteredEntries
      .filter(e => e.type === 'expense')
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 5)
  }, [filteredEntries])

  // useMemo: categorias únicas para o dropdown de filtro
  const uniqueCategories = useMemo(() => {
    return [...new Set(allEntries.map(e => e.category).filter(Boolean))]
  }, [allEntries])

  const formatarMoeda = formatMoney

  // useCallback: tooltip customizado memoizado
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatarMoeda(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }, [formatarMoeda])

  // Componente Skeleton para loading
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-6 border-l-4 border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  )

  const SkeletonChart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
      <div className="h-[300px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-300 dark:text-gray-500 animate-spin" />
      </div>
    </div>
  )

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8 flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
          </div>

          {/* Filtros skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 mb-6 animate-pulse">
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
            </div>
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Cabecalho */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Relatorios Financeiros</h1>
            <p className="text-gray-600 dark:text-gray-400">Analise completa de receitas, despesas e limites</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              disabled={isExporting || filteredEntries.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileDown size={16} />
              )}
              Exportar CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Exportar PDF
            </button>
            <CurrencySelector />
          </div>
        </div>

        {/* Conteúdo para exportação PDF */}
        <div id="reports-content">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 mb-6 transition-colors">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
            </div>

            {/* Modo de visualizacao */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { value: 'month', label: 'Mes' },
                { value: 'year', label: 'Ano' },
                { value: 'all', label: 'Tudo' }
              ].map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    viewMode === mode.value
                      ? 'bg-white dark:bg-gray-600 shadow text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Seletor de mes/ano */}
            {viewMode !== 'all' && (
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
                <input
                  type={viewMode === 'month' ? 'month' : 'number'}
                  value={viewMode === 'month' ? selectedMonth : selectedMonth.slice(0, 4)}
                  onChange={e => {
                    if (viewMode === 'month') {
                      setSelectedMonth(e.target.value)
                    } else {
                      setSelectedMonth(`${e.target.value}-01`)
                    }
                  }}
                  min={viewMode === 'year' ? '2020' : undefined}
                  max={viewMode === 'year' ? '2030' : undefined}
                  className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {isLoadingMonth && (
                  <Loader2 size={18} className="text-emerald-500 animate-spin" />
                )}
              </div>
            )}

            {/* Filtro de categoria */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas categorias</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoadingMonth ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-6 border-l-4 border-emerald-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Receitas</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatarMoeda(income)}</p>
                    <div className="flex items-center mt-2 text-emerald-600">
                      <ArrowUpRight size={16} />
                      <span className="text-xs font-medium">{incomeCount} lancamentos</span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-6 border-l-4 border-red-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Despesas</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatarMoeda(expenses)}</p>
                    <div className="flex items-center mt-2 text-red-600">
                      <ArrowDownRight size={16} />
                      <span className="text-xs font-medium">{expenseCount} lancamentos</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-6 border-l-4 border-blue-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Saldo</p>
                    <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatarMoeda(balance)}
                    </p>
                    <div className="flex items-center mt-2 text-blue-600">
                      <Wallet size={16} />
                      <span className="text-xs font-medium ml-1">Diferenca do periodo</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Taxa de Poupanca</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{savingsRate}%</p>
                    <div className="flex items-center mt-2 text-purple-600">
                      <Target size={16} />
                      <span className="text-xs font-medium ml-1">do total recebido</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <PieChartIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Graficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolucao Mensal */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Evolucao dos Ultimos 6 Meses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorReceitas)" name="Receitas" />
                <Area type="monotone" dataKey="despesas" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesas)" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Despesas por Categoria */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Despesas por Categoria
              {isLoadingMonth && <Loader2 size={16} className="text-emerald-500 animate-spin" />}
            </h2>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => formatarMoeda(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Nenhuma despesa no periodo</p>
              </div>
            )}
            {/* Legenda */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {expensesByCategory.slice(0, 6).map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-xs text-gray-600 truncate">{cat.name}</span>
                  <span className="text-xs font-medium text-gray-800 ml-auto">{formatarMoeda(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grafico diario (apenas para modo mes) */}
        {viewMode === 'month' && dailyData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Movimentacao Diaria - {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              {isLoadingMonth && <Loader2 size={16} className="text-emerald-500 animate-spin" />}
            </h2>
            {isLoadingMonth ? (
              <div className="h-[250px] bg-gray-50 rounded-lg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => `R$${v}`} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Grid inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Despesas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              Maiores Despesas
              {isLoadingMonth && <Loader2 size={16} className="text-emerald-500 animate-spin" />}
            </h2>
            {isLoadingMonth ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : topExpenses.length > 0 ? (
              <div className="space-y-3">
                {topExpenses.map((expense, idx) => {
                  const categoryInfo = getCategoryByName(expense.category)
                  const Icon = categoryInfo?.icon
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                        {Icon ? (
                          <Icon className="w-5 h-5" style={{ color: categoryInfo?.color }} />
                        ) : (
                          <span className="text-lg font-bold text-gray-400">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{expense.description}</p>
                        <p className="text-xs text-gray-500">{expense.category || 'Sem categoria'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatarMoeda(expense.value)}</p>
                        <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma despesa no periodo</p>
            )}
          </div>

          {/* Uso de Limites */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Uso de Limites</h2>
            {limits.length > 0 ? (
              <div className="space-y-4">
                {limits.map((limit, idx) => {
                  const percentage = limit.limit_value ? Math.round((Number(limit.used_value || 0) / Number(limit.limit_value)) * 100) : 0
                  const categoryInfo = getCategoryByName(limit.category)
                  const Icon = categoryInfo?.icon

                  let barColor = 'bg-emerald-500'
                  let textColor = 'text-emerald-600'
                  if (percentage >= 100) {
                    barColor = 'bg-red-500'
                    textColor = 'text-red-600'
                  } else if (percentage >= 90) {
                    barColor = 'bg-orange-500'
                    textColor = 'text-orange-600'
                  } else if (percentage >= 80) {
                    barColor = 'bg-yellow-500'
                    textColor = 'text-yellow-600'
                  }

                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-4 h-4" style={{ color: categoryInfo?.color }} />}
                          <span className="text-sm font-medium text-gray-700">{limit.category}</span>
                        </div>
                        <span className={`text-sm font-bold ${textColor}`}>{percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-300`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatarMoeda(Number(limit.used_value || 0))} gastos</span>
                        <span>Limite: {formatarMoeda(Number(limit.limit_value || 0))}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum limite configurado</p>
            )}
          </div>
        </div>
        </div> {/* Fim reports-content */}
      </div>
    </div>
  )
}
