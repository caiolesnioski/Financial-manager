import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Plus, AlertCircle, Repeat, Calendar } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts'
import { useLimits } from '../hooks/useLimits'
import { getUpcomingRecurring } from '../services/entriesService'

export default function Dashboard() {
  // Dados reais: contas vindas do hook useAccounts (Supabase)
  const { accounts = [], loading: accountsLoading } = useAccounts()

  // entradas/saidas ainda não ligados ao backend — mantemos placeholders por enquanto
  const entradas = 0
  const saidas = 0

  const { limits = [], loading: limitsLoading } = useLimits()
  const limites = limits

  // Próximos lançamentos recorrentes
  const [upcomingRecurring, setUpcomingRecurring] = useState([])
  const [loadingRecurring, setLoadingRecurring] = useState(true)

  useEffect(() => {
    async function fetchUpcoming() {
      setLoadingRecurring(true)
      const { data } = await getUpcomingRecurring(5)
      setUpcomingRecurring(data || [])
      setLoadingRecurring(false)
    }
    fetchUpcoming()
  }, [])

  // useCallback: evita recriação da função a cada render
  // Útil se for passada como prop para componentes filhos
  const formatarMoeda = useCallback((valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  // useCallback: função pura que não depende de estado externo
  const calcularPercentual = useCallback((gasto, limite) => {
    if (!limite || limite === 0) return 0
    return Math.min((gasto / limite) * 100, 100);
  }, []);

  // useCallback: função pura para determinar cor da barra de progresso
  const getCorBarra = useCallback((percentual) => {
    if (percentual >= 90) return 'bg-red-500';
    if (percentual >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }, []);

  // useMemo: evita recálculo do saldo a cada render
  // Só recalcula quando 'accounts' mudar
  const saldoGeral = useMemo(() => {
    return (accounts || []).reduce((s, c) => s + (Number(c.currentBalance ?? 0)), 0)
  }, [accounts])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white px-6 py-8">
        <h1 className="text-lg font-medium mb-6">Gerenciador Financeiro</h1>
        
        {/* Saldo Geral */}
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Saldo geral</p>
          <h2 className="text-4xl font-bold mb-6">{formatarMoeda(saldoGeral)}</h2>
          
          {/* Entradas e Saídas do mês */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              <div className="text-left">
                <p className="opacity-80">Entradas do mês</p>
                <p className="font-semibold">{formatarMoeda(entradas)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown size={18} />
              <div className="text-left">
                <p className="opacity-80">Saídas do mês</p>
                <p className="font-semibold">{formatarMoeda(saidas)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Meus Limites de Gastos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Meus limites de gastos</h3>
            <Link to="/limits" className="text-emerald-600 hover:text-emerald-700">
              <Plus size={24} />
            </Link>
          </div>

          {limites.length > 0 ? (
            <div className="space-y-4">
              {limites.map((limite) => {
                // use normalized fields from useLimits: category, limit, spent, color
                const spent = Number(limite.spent ?? 0)
                const limitVal = Number(limite.limit ?? 0)
                const percentual = calcularPercentual(spent, limitVal);
                return (
                  <div key={limite.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{limite.category}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatarMoeda(spent)} de {formatarMoeda(limitVal)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all ${getCorBarra(percentual)}`}
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">Nenhum limite definido</p>
              <Link to="/limits" className="mt-3 inline-block text-emerald-600 text-sm font-medium">
                Definir primeiro limite
              </Link>
            </div>
          )}
        </div>

        {/* Próximos Lançamentos Recorrentes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Repeat size={20} className="text-emerald-500" />
              Próximos Lançamentos
            </h3>
          </div>

          {loadingRecurring ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <p className="text-sm">Carregando...</p>
            </div>
          ) : upcomingRecurring.length > 0 ? (
            <div className="space-y-3">
              {upcomingRecurring.map((entry) => {
                const entryDate = new Date(entry.date)
                const isExpense = entry.type === 'expense'
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isExpense ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                      }`}>
                        {isExpense ? (
                          <TrendingDown size={18} className="text-red-600 dark:text-red-400" />
                        ) : (
                          <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">{entry.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar size={12} />
                          <span>{entryDate.toLocaleDateString('pt-BR')}</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">
                            Recorrente
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className={`font-semibold ${isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {isExpense ? '-' : '+'} {formatarMoeda(entry.value)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Repeat className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">Nenhum lançamento recorrente</p>
              <Link to="/new-entry" className="mt-2 inline-block text-emerald-600 text-sm font-medium">
                Criar despesa recorrente
              </Link>
            </div>
          )}
        </div>

        {/* Minhas Contas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Minhas contas</h3>
            <Link to="/accounts" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              Gerenciar
            </Link>
          </div>

          <div className="space-y-3">
            {accounts.map((conta, i) => (
              <div
                key={conta.id || i}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${conta.cor || 'bg-gray-300'} rounded-full flex items-center justify-center text-white`}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{conta.name || conta.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{conta.type || conta.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">{formatarMoeda(Number(conta.currentBalance ?? conta.saldo ?? 0))}</p>
                </div>
              </div>
            ))}
          </div>

          <Link to="/accounts" className="block w-full mt-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-colors font-medium text-center">
            + Nova conta
          </Link>
        </div>

      </div>

      {/* Botão Flutuante */}
      <Link 
        to="/new-entry"
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}