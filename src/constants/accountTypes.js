export const ACCOUNT_TYPES = {
  CHECKING: 'bank',
  SAVINGS: 'piggy',
  CREDIT_CARD: 'card',
  INVESTMENT: 'investment',
  CASH: 'wallet'
}

export const ACCOUNT_TYPE_LABELS = {
  bank: 'Conta Corrente',
  piggy: 'Poupança',
  card: 'Cartão de Crédito',
  investment: 'Investimento',
  wallet: 'Carteira/Dinheiro'
}

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'bank', label: 'Conta Corrente' },
  { value: 'piggy', label: 'Poupança' },
  { value: 'card', label: 'Cartão de Crédito' },
  { value: 'investment', label: 'Investimento' },
  { value: 'wallet', label: 'Carteira/Dinheiro' }
]

/**
 * Obtém o ícone correto baseado no tipo de conta
 * @param {string} type - Tipo da conta (bank, piggy, card, investment, wallet)
 * @returns {JSX.Element} Ícone correspondente
 */
export function getAccountIcon(type) {
  const icons = {
    bank: 'Building2',
    piggy: 'PiggyBank',
    card: 'CreditCard',
    investment: 'TrendingUp',
    wallet: 'Wallet'
  }
  return icons[type] || 'Wallet'
}

/**
 * Obtém o label em português para um tipo de conta
 * @param {string} type - Tipo da conta
 * @returns {string} Label em português
 */
export function getAccountLabel(type) {
  return ACCOUNT_TYPE_LABELS[type] || 'Conta'
}
