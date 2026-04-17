import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

export const currencies = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', locale: 'pt-BR' },
  { code: 'USD', symbol: '$', name: 'Dolar Americano', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' }
]

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('preferredCurrency')
    return saved || 'BRL'
  })

  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency)
  }, [currency])

  const formatMoney = (value, currencyCode) => {
    const code = currencyCode || currency
    const currencyInfo = currencies.find(c => c.code === code) || currencies[0]
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: code
    }).format(value || 0)
  }

  const getCurrencyInfo = (currencyCode) => {
    return currencies.find(c => c.code === (currencyCode || currency)) || currencies[0]
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatMoney, getCurrencyInfo, currencies }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
