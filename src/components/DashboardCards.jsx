import { useMemo } from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import { useEntries } from '../hooks/useEntries'
import { useCurrency } from '../contexts/CurrencyContext'

export default function DashboardCards() {
  const { accounts, loading: loadingAccounts } = useAccounts()
  const { entries, loading: loadingEntries } = useEntries()
  const { formatMoney } = useCurrency()

  // Calcula o total geral (soma de current_balance de todas as contas)
  const total = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + Number(acc.current_balance || 0), 0)
  }, [accounts])

  // Filtra entries do mês atual e calcula entradas/saídas
  const { inflows, outflows, balance } = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    })

    const inc = monthEntries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + Number(e.value || 0), 0)

    const exp = monthEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + Number(e.value || 0), 0)

    return {
      inflows: inc,
      outflows: exp,
      balance: inc - exp
    }
  }, [entries])

  const isLoading = loadingAccounts || loadingEntries

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Geral</div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">{formatMoney(total)}</div>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Entradas do mes</div>
            <div className="text-xl font-bold text-green-600">{formatMoney(inflows)}</div>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Saidas do mes</div>
            <div className="text-xl font-bold text-red-500">{formatMoney(outflows)}</div>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
            <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Saldo do mes</div>
            <div className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {formatMoney(balance)}
            </div>
          </div>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
            <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
