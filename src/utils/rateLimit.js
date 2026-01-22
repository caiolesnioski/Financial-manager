/**
 * Rate Limiter Utility
 * Limita requisições para prevenir abuso/spam
 */

// Armazena timestamps de requisições por chave
const requestTimestamps = new Map()

/**
 * Erro customizado para rate limit excedido
 */
export class RateLimitError extends Error {
  constructor(message, retryAfterMs) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

/**
 * Verifica se a requisição está dentro do limite
 * @param {string} key - Identificador único (ex: 'createEntry:userId')
 * @param {number} maxRequests - Número máximo de requisições
 * @param {number} windowMs - Janela de tempo em milissegundos
 * @throws {RateLimitError} Se exceder o limite
 * @returns {boolean} true se permitido
 */
export function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now()
  const windowStart = now - windowMs

  // Obtém timestamps existentes ou cria novo array
  let timestamps = requestTimestamps.get(key) || []

  // Remove timestamps antigos (fora da janela)
  timestamps = timestamps.filter(ts => ts > windowStart)

  // Verifica se excedeu o limite
  if (timestamps.length >= maxRequests) {
    // Calcula quando poderá fazer nova requisição
    const oldestTimestamp = timestamps[0]
    const retryAfterMs = oldestTimestamp + windowMs - now

    throw new RateLimitError(
      `Limite de requisições excedido. Aguarde ${Math.ceil(retryAfterMs / 1000)} segundos.`,
      retryAfterMs
    )
  }

  // Adiciona timestamp atual
  timestamps.push(now)
  requestTimestamps.set(key, timestamps)

  return true
}

/**
 * Wrapper para funções com rate limiting
 * @param {Function} fn - Função a ser limitada
 * @param {string} keyPrefix - Prefixo da chave (ex: 'createEntry')
 * @param {number} maxRequests - Número máximo de requisições
 * @param {number} windowMs - Janela de tempo em milissegundos
 * @returns {Function} Função com rate limiting
 */
export function withRateLimit(fn, keyPrefix, maxRequests, windowMs) {
  return async function rateLimitedFn(...args) {
    // Usa o prefixo como chave (pode ser melhorado com userId)
    const key = keyPrefix
    checkRateLimit(key, maxRequests, windowMs)
    return fn.apply(this, args)
  }
}

/**
 * Limpa todos os timestamps de rate limit (útil para testes)
 */
export function clearRateLimits() {
  requestTimestamps.clear()
}

/**
 * Limpa timestamps de uma chave específica
 * @param {string} key - Chave a limpar
 */
export function clearRateLimitKey(key) {
  requestTimestamps.delete(key)
}

/**
 * Obtém contagem atual de requisições para uma chave
 * @param {string} key - Chave a verificar
 * @param {number} windowMs - Janela de tempo
 * @returns {number} Número de requisições na janela
 */
export function getRateLimitCount(key, windowMs) {
  const now = Date.now()
  const windowStart = now - windowMs
  const timestamps = requestTimestamps.get(key) || []
  return timestamps.filter(ts => ts > windowStart).length
}

/**
 * Configurações padrão de rate limit
 */
export const RATE_LIMITS = {
  CREATE_ENTRY: { max: 10, windowMs: 60 * 1000 },      // 10 por minuto
  CREATE_ACCOUNT: { max: 5, windowMs: 60 * 1000 },    // 5 por minuto
  UPDATE_LIMIT: { max: 10, windowMs: 60 * 1000 },     // 10 por minuto
  DELETE_ENTRY: { max: 10, windowMs: 60 * 1000 },     // 10 por minuto
  EXPORT_DATA: { max: 5, windowMs: 60 * 1000 },       // 5 por minuto
  LOGIN_ATTEMPT: { max: 5, windowMs: 5 * 60 * 1000 }, // 5 a cada 5 minutos
}
