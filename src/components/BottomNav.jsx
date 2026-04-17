import { Link, useLocation } from 'react-router-dom'
import { Home, Wallet, List, AlertCircle, BarChart2, FileText, Repeat } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/accounts', icon: Wallet, label: 'Contas' },
  { to: '/entries', icon: List, label: 'Lançamentos' },
  { to: '/limits', icon: AlertCircle, label: 'Limites' },
  { to: '/cashflow', icon: BarChart2, label: 'Fluxo' },
  { to: '/reports', icon: FileText, label: 'Relatório' },
  { to: '/recurrents', icon: Repeat, label: 'Fixos' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${
                active
                  ? 'text-emerald-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] mt-0.5 font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
