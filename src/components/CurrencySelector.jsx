import { useCurrency } from '../contexts/CurrencyContext'
import { DollarSign } from 'lucide-react'

export default function CurrencySelector({ compact = false }) {
  const { currency, setCurrency, currencies } = useCurrency()

  if (compact) {
    return (
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-transparent border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        {currencies.map(c => (
          <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
        ))}
      </select>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <DollarSign size={18} className="text-gray-500" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        {currencies.map(c => (
          <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
        ))}
      </select>
    </div>
  )
}
