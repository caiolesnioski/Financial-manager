/**
 * Limits Service
 * Gerencia limites de gasto com validação de período e cálculo de alertas
 *
 * Características:
 * - CRUD de limites por categoria
 * - Validação de período (start_date/end_date)
 * - Cálculo automático de percentual de uso
 * - Sistema de alertas (80%, 90%, 100%+)
 * - Rate limiting para prevenir abuso
 */
import { supabase } from './supabaseClient'
import { checkRateLimit, RateLimitError, RATE_LIMITS } from '../utils/rateLimit'

/**
 * Incrementa o valor gasto de um limite
 * Valida se a data do lançamento está dentro do período do limite
 * @param {string} category - Categoria do limite
 * @param {number} value - Valor a incrementar
 * @param {string} entryDate - Data ISO do lançamento (para validação de período)
 * @returns {Promise<{data, error, alertLevel}>}
 */
export async function incrementLimitSpent(category, value, entryDate = null) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { error: { message: 'Usuário não autenticado' } };
  const { data: limits, error } = await supabase
    .from('limits')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('inserted_at', { ascending: false });
  if (error || !limits || limits.length === 0) return { error: error || { message: 'Limite não encontrado' } };
  
  // Encontra o limite ativo para a data do lançamento (se fornecida)
  let activeLimit = null
  for (const limit of limits) {
    const startDate = limit.start_date ? new Date(limit.start_date).getTime() : 0
    const endDate = limit.end_date ? new Date(limit.end_date).getTime() : Number.MAX_VALUE
    const checkDate = entryDate ? new Date(entryDate).getTime() : Date.now()
    if (checkDate >= startDate && checkDate <= endDate) {
      activeLimit = limit
      break
    }
  }
  
  if (!activeLimit) {
    return { error: { message: 'Nenhum limite ativo para a data informada' } }
  }
  
  const currentUsed = Number(activeLimit.used_value ?? 0)
  const newUsed = currentUsed + Number(value)
  const limitValue = Number(activeLimit.limit_value ?? 0)
  const newPercent = limitValue ? Math.round((newUsed / limitValue) * 100) : 0
  
  const { data: updated, error: updateError } = await supabase
    .from('limits')
    .update({ used_value: newUsed, percentage: newPercent })
    .eq('id', activeLimit.id)
    .select()
  
  if (!updateError) {
    return { data: updated, error: null, alertLevel: getAlertLevel(newPercent) }
  }
  return { data: updated, error: updateError }
}

/**
 * Calcula o nível de alerta baseado na porcentagem
 * - safe: < 80%
 * - warning: 80-89%
 * - critical: 90-99%
 * - exceeded: >= 100%
 * @param {number} percentage - Percentual de uso do limite
 * @returns {string} Nível de alerta
 */
function getAlertLevel(percentage) {
  if (percentage >= 100) return 'exceeded' // Limite excedido
  if (percentage >= 90) return 'critical'  // Crítico (90%+)
  if (percentage >= 80) return 'warning'   // Aviso (80%+)
  return 'safe'                             // Seguro
}

export { getAlertLevel }

/**
 * Converte limite de cliente para formato do banco
 * Mapeia camelCase/português para snake_case
 * @param {Object} limit - Limite com nomes de campos variados
 * @returns {Object} Payload para DB
 */
function toDbPayload(limit) {
  const payload = {}
  if (limit.category !== undefined) payload.category = limit.category
  if (limit.limit !== undefined) payload.limit_value = limit.limit
  else if (limit.limit_value !== undefined) payload.limit_value = limit.limit_value
  if (limit.used_value !== undefined) payload.used_value = limit.used_value
  else if (limit.usedValue !== undefined) payload.used_value = limit.usedValue
  if (limit.percentage !== undefined) payload.percentage = limit.percentage
  if (limit.cor !== undefined) payload.color = limit.cor
  if (limit.color !== undefined) payload.color = limit.color
  if (limit.emoji !== undefined) payload.emoji = limit.emoji
  if (limit.dataInicio !== undefined) payload.start_date = limit.dataInicio
  if (limit.dataFim !== undefined) payload.end_date = limit.dataFim
  return payload
}

/**
 * Cria um novo limite de gasto
 * @param {Object} limit - Limite com campos: category, limit_value, color, emoji, start_date, end_date
 * @returns {Promise<{data, error}>}
 */
export async function createLimit(limit) {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  const payload = toDbPayload(limit)
  if (userId) payload.user_id = userId
  const { data, error } = await supabase.from('limits').insert([payload]).select()
  return { data, error }
}

/**
 * Edita um limite existente
 * @param {string} id - ID do limite
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<{data, error}>}
 * @throws {RateLimitError} Se exceder limite de requisições
 */
export async function editLimit(id, updates) {
  // Rate limiting: max 10 atualizações por minuto
  try {
    checkRateLimit('updateLimit', RATE_LIMITS.UPDATE_LIMIT.max, RATE_LIMITS.UPDATE_LIMIT.windowMs)
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { data: null, error: { message: err.message, isRateLimited: true } }
    }
    throw err
  }

  const payload = toDbPayload(updates)
  const { data, error } = await supabase.from('limits').update(payload).eq('id', id).select()
  return { data, error }
}

/**
 * Deleta um limite
 * @param {string} id - ID do limite a deletar
 * @returns {Promise<{data, error}>}
 */
export async function deleteLimit(id) {
  const { data, error } = await supabase.from('limits').delete().eq('id', id).select()
  return { data, error }
}

/**
 * Retorna todos os limites do usuário
 * @returns {Promise<{data, error}>}
 */
export async function getAllLimits() {
  const { data, error } = await supabase.from('limits').select('*')
  return { data, error }
}
