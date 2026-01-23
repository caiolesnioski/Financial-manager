/**
 * Validadores para formulários de conta e entrada
 */

/**
 * Valida o nome de uma conta
 * @param {string} name - Nome da conta
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export function validateAccountName(name) {
  if (!name || !name.trim()) {
    return 'Nome da conta é obrigatório'
  }
  if (name.trim().length > 50) {
    return 'Nome deve ter no máximo 50 caracteres'
  }
  return null
}

/**
 * Valida um saldo/valor numérico
 * @param {string|number} balance - Valor a validar
 * @param {object} options - Opções de validação
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export function validateBalance(balance, options = {}) {
  const { allowNegative = false, min = 0, max = 999999999 } = options

  // Verificar se é número
  const num = Number(balance)
  if (isNaN(num)) {
    return 'Valor deve ser um número válido'
  }

  // Verificar range
  if (num < min) {
    return `Valor não pode ser menor que ${min}`
  }

  if (!allowNegative && num < 0) {
    return 'Saldo não pode ser negativo'
  }

  if (num > max) {
    return `Valor máximo permitido é ${max}`
  }

  return null
}

/**
 * Valida descrição de entrada
 * @param {string} description - Descrição
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export function validateDescription(description) {
  if (description && description.length > 255) {
    return 'Descrição deve ter no máximo 255 caracteres'
  }
  return null
}

/**
 * Valida um período de data (data início e fim)
 * @param {string} startDate - Data inicial
 * @param {string} endDate - Data final
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'Ambas as datas são obrigatórias'
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) {
    return 'Data inicial deve ser anterior à data final'
  }

  return null
}

/**
 * Valida formulário de conta completo
 * @param {object} account - Objeto conta
 * @returns {object} { isValid, errors } - Resultado validação
 */
export function validateAccount(account) {
  const errors = {}

  if (!account.name) {
    errors.name = validateAccountName(account.name)
  }

  if (!account.type) {
    errors.type = 'Tipo de conta é obrigatório'
  }

  const balanceError = validateBalance(account.initialBalance || 0, { allowNegative: true })
  if (balanceError) {
    errors.initialBalance = balanceError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Converte mensagem de erro do backend para UI
 * @param {Error|object} error - Erro recebido
 * @param {string} context - Contexto da operação (criar, editar, deletar)
 * @returns {string} Mensagem amigável
 */
export function getErrorMessage(error, context = 'operação') {
  if (!error) {
    return `Erro ao ${context}`
  }

  // String simples
  if (typeof error === 'string') {
    return error
  }

  // Rate limiting
  if (error.isRateLimited || error.code === 'RATE_LIMIT_EXCEEDED') {
    return `Muitas tentativas. Aguarde alguns momentos antes de ${context} novamente.`
  }

  // Constraint único
  if (error.message?.includes('unique')) {
    return `Este registro já existe. Escolha outro nome para ${context}.`
  }

  // RLS (Row Level Security)
  if (error.message?.includes('RLS') || error.message?.includes('policy')) {
    return 'Você não tem permissão para realizar esta ação'
  }

  // Foreign key (conta tem lançamentos)
  if (error.message?.includes('foreign key') || error.message?.includes('Não é possível deletar')) {
    return error.message
  }

  // Validação genérica
  if (error.message) {
    return `Erro ao ${context}: ${error.message}`
  }

  return `Erro desconhecido ao ${context}`
}
