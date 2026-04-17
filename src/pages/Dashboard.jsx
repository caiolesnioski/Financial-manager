import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Plus, AlertCircle, Repeat, Calendar } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts'
import { useLimits } from '../hooks/useLimits'
import { useCurrency } from '../contexts/CurrencyContext'
import { getUpcomingRecurring } from '../services/entriesService'
import { getAllRecurringItems, getPaymentsForMonth } from '../services/recurrentsService'

export default function Dashboard() {
  const { accounts = [] } = useAccounts()
  const { limits = [] } = useLimits()
  const { formatMoney } = useCurrency()

  const entradas = 0
  const saidas = 0

  const [upcomingRecurring, setUpcomingRecurring] = useState([])
  const [upcomingFixed, setUpcomingFixed] = useState([])
  const [loadingRecurring, setLoadingRecurring] = useState(true)

  useEffect(() => {
    async function fetchUpcoming() {
      setLoadingRecurring(true)
      const hoje = new Date()
      const diaAtual = hoje.getDate()
      const mesAtual = hoje.getMonth() + 1
      const anoAtual = hoje.getFullYear()
      const diaLimite = diaAtual + 7

      const [{ data: entriesData }, { data: recurringItems }, { data: payments }] = await Promise.all([
        getUpcomingRecurring(5),
        getAllRecurringItems(),
        getPaymentsForMonth(mesAtual, anoAtual)
      ])

      setUpcomingRecurring(entriesData || [])

      const pending = (recurringItems || [])
        .filter(item => {
          const payment = (payments || []).find(p => p.recurring_item_id === item.id)
          const isPaid = payment?.paid || false
          return !isPaid && item.day_of_month >= diaAtual && item.day_of_month <= diaLimite
        })
        .sort((a, b) => a.day_of_month - b.day_of_month)

      setUpcomingFixed(pending)
      setLoadingRecurring(false)
    }
    fetchUpcoming()
  }, [])

  const calcularPercentual = useCallback((gasto, limite) => {
    if (!limite || limite === 0) return 0
    return Math.min((gasto / limite) * 100, 100);
  }, []);

  const getCorBarra = useCallback((percentual) => {
    if (percentual >= 90) return 'bg-red-500';
    if (percentual >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }, []);

  const saldoGeral = useMemo(() => {
    return (accounts || []).reduce((s, c) => s + (Number(c.currentBalance ?? 0)), 0)
  }, [accounts])

  const allUpcoming = [...upcomingFixed.map(i => ({ ...i, _isFixed: true })), ...upcomingRecurring]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white px-6 py-8">
        <h1 className="text-lg font-medium mb-6">Gerenciador Financeiro</h1>

        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Saldo geral</p>
          <h2 className="text-4xl font-bold mb-6">{formatMoney(saldoGeral)}</h2>

          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              <div className="text-left">
                <p className="opacity-80">Entradas do mês</p>
                <p className="font-semibold">{formatMoney(entradas)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown size={18} />
              <div className="text-left">
                <p className="opacity-80">Saídas do mês</p>
                <p className="font-semibold">{formatMoney(saidas)}</p>
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

          {limits.length > 0 ? (
            <div className="space-y-4">
              {limits.map((limite) => {
                const spent = Number(limite.spent ?? 0)
                const limitVal = Number(limite.limit ?? 0)
                const percentual = calcularPercentual(spent, limitVal);
                return (
                  <div key={limite.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{limite.category}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatMoney(spent)} de {formatMoney(limitVal)}
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

        {/* Próximos Lançamentos */}
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
          ) : allUpcoming.length > 0 ? (
            <div className="space-y-3">
              {/* Itens fixos pendentes nos próximos 7 dias */}
              {allUpcoming.map((item) => {
                if (item._isFixed) {
                  return (
                    <div
                      key={`fixed-${item.id}`}
                      className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg">
                          🔄
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={12} />
                            <span>Vence dia {item.day_of_month}</span>
                            <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
                              Fixo
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        - {formatMoney(item.amount, item.currency)}
                      </p>
                    </div>
                  )
                }

                const entryDate = new Date(item.date)
                const isExpense = item.type === 'expense'
                return (
                  <div
                    key={`entry-${item.id}`}
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
                        <p className="font-medium text-gray-800 dark:text-white text-sm">{item.description}</p>
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
                      {isExpense ? '-' : '+'} {formatMoney(item.value)}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Repeat className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">Nenhum lançamento nos próximos 7 dias</p>
              <Link to="/recurrents" className="mt-2 inline-block text-emerald-600 text-sm font-medium">
                Ver despesas fixas
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
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-white">
                    <Wallet size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{conta.name || conta.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{conta.type || conta.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">{formatMoney(Number(conta.currentBalance ?? conta.saldo ?? 0), conta.currency)}</p>
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
        className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 z-40"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
