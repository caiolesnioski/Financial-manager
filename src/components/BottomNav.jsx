import { Link, useLocation } from 'react-router-dom'
import { Home, Wallet, List, AlertCircle, BarChart2, FileText, Repeat, Target } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/accounts', icon: Wallet, label: 'Contas' },
  { to: '/entries', icon: List, label: 'Lançamentos' },
  { to: '/limits', icon: AlertCircle, label: 'Limites' },
  { to: '/cashflow', icon: BarChart2, label: 'Fluxo' },
  { to: '/reports', icon: FileText, label: 'Relatório' },
  { to: '/recurrents', icon: Repeat, label: 'Fixos' },
  { to: '/goals', icon: Target, label: 'Metas' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <>
      {/* Mobile: pill flutuante */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <nav className="pointer-events-auto flex items-center gap-0.5 bg-gray-900/95 dark:bg-black/95 backdrop-blur-md rounded-full px-3 py-2.5 shadow-2xl shadow-black/50 border border-white/5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/10'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Desktop: sidebar vertical esquerda */}
      <nav className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] z-40 flex-col items-center py-6 gap-2 bg-gray-900/95 backdrop-blur-md border-r border-white/5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            </Link>
          )
        })}
      </nav>
    </>
  )
}
