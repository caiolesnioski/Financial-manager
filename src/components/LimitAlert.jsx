import React from 'react'
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react'

// Component para exibir alertas de limite baseado na porcentagem
export default function LimitAlert({ percentage, category }) {
  if (percentage < 80) return null // Sem alerta se < 80%

  let alertType = 'warning'
  let icon = AlertTriangle
  let bgColor = 'bg-yellow-50'
  let borderColor = 'border-yellow-200'
  let textColor = 'text-yellow-800'
  let message = `${category} está chegando ao limite (${percentage.toFixed(0)}%)`

  if (percentage >= 100) {
    alertType = 'exceeded'
    icon = XCircle
    bgColor = 'bg-red-50'
    borderColor = 'border-red-200'
    textColor = 'text-red-800'
    message = `⚠️ LIMITE EXCEDIDO! ${category} ultrapassou o limite em ${(percentage - 100).toFixed(0)}%`
  } else if (percentage >= 90) {
    alertType = 'critical'
    icon = AlertCircle
    bgColor = 'bg-orange-50'
    borderColor = 'border-orange-200'
    textColor = 'text-orange-800'
    message = `⚠️ CRÍTICO! ${category} está em ${percentage.toFixed(0)}% do limite`
  }

  const Icon = icon
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3 mb-4 flex items-start gap-3`}>
      <Icon size={20} className={`${textColor} flex-shrink-0 mt-0.5`} />
      <p className={`${textColor} text-sm font-medium`}>{message}</p>
    </div>
  )
}
