/**
 * Entries Service
 * Gerencia lançamentos (despesas, receitas, transferências) com efeitos cascata automáticos
 *
 * Características:
 * - CRUD completo de lançamentos
 * - Atualização automática de saldos de contas
 * - Incremento automático de limites de gasto
 * - Reversão de efeitos ao editar/deletar
 * - Rate limiting para prevenir abuso
 */
import { supabase } from './supabaseClient'
import { incrementLimitSpent } from './limitsService'
import { checkRateLimit, RateLimitError, RATE_LIMITS } from '../utils/rateLimit'

/**
 * Converte entrada do cliente para formato de banco de dados
 * @param {Object} entry - Entrada com nomes em camelCase
 * @returns {Object} Payload com nomes em snake_case para DB
 */
function toDbEntry(entry) {
  const payload = {}
  if (entry.date) payload.date = entry.date
  if (entry.description) payload.description = entry.description
  if (entry.value !== undefined) payload.value = entry.value
  if (entry.type) payload.type = entry.type
  if (entry.category) payload.category = entry.category
  if (entry.account) payload.account = entry.account
  if (entry.originAccount) payload.origin_account = entry.originAccount
  if (entry.destinationAccount) payload.destination_account = entry.destinationAccount
  if (entry.repeat !== undefined) payload.repeat = entry.repeat
  if (entry.user_id) payload.user_id = entry.user_id
  // Campos de recorrência
  if (entry.repeatType) payload.repeat_type = entry.repeatType
  if (entry.repeatEndDate !== undefined) payload.repeat_end_date = entry.repeatEndDate
  if (entry.parentEntryId !== undefined) payload.parent_entry_id = entry.parentEntryId
  return payload
}

/**
 * Converte linha do banco para formato do cliente
 * @param {Object} row - Linha do banco com nomes em snake_case
 * @returns {Object} Entrada com nomes em camelCase
 */
function toClientEntry(row) {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    value: Number(row.value ?? 0),
    type: row.type,
    category: row.category,
    account: row.account,
    originAccount: row.origin_account,
    destinationAccount: row.destination_account,
    repeat: row.repeat,
    user_id: row.user_id,
    inserted_at: row.inserted_at,
    // Campos de recorrência
    repeatType: row.repeat_type || 'none',
    repeatEndDate: row.repeat_end_date,
    parentEntryId: row.parent_entry_id,
    isRecurring: row.repeat_type && row.repeat_type !== 'none'
  }
}

/**
 * Aplica efeitos de um lançamento na conta e limites
 * - Despesa: decrementa saldo da conta, incrementa limite gasto
 * - Receita: incrementa saldo da conta
 * - Transferência: decrementa origem, incrementa destino
 * @param {Object} entry - Lançamento com tipo, value, account(s), category, date
 */
async function applyEntryEffects(entry) {
  if (entry.type === 'expense' && entry.account) {
    // Decrement account balance
    const { data: accRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.account).single()
    const current = Number(accRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: current - Number(entry.value) }).eq('id', entry.account)
    // Increment limit spent (pass entry date for period validation)
    if (entry.category) {
      await incrementLimitSpent(entry.category, Number(entry.value), entry.date)
    }
  } else if (entry.type === 'income' && entry.account) {
    // Increment account balance
    const { data: accRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.account).single()
    const current = Number(accRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: current + Number(entry.value) }).eq('id', entry.account)
  } else if (entry.type === 'transfer' && entry.originAccount && entry.destinationAccount) {
    // Decrement origin, increment destination
    const { data: originRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.originAccount).single()
    const originCurrent = Number(originRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: originCurrent - Number(entry.value) }).eq('id', entry.originAccount)

    const { data: destRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.destinationAccount).single()
    const destCurrent = Number(destRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: destCurrent + Number(entry.value) }).eq('id', entry.destinationAccount)
  }
}

/**
 * Reverte efeitos de um lançamento (undo)
 * Usado ao editar ou deletar lançamentos para manter consistência
 * @param {Object} entry - Lançamento a reverter
 */
async function revertEntryEffects(entry) {
  if (!entry) return
  if (entry.type === 'expense' && entry.account) {
    const { data: accRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.account).single()
    const current = Number(accRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: current + Number(entry.value) }).eq('id', entry.account)
    if (entry.category) {
      const { data: limits } = await supabase.from('limits').select('*').eq('user_id', entry.user_id).eq('category', entry.category).order('inserted_at', { ascending: false })
      const limit = (limits && limits[0]) || null
      if (limit) {
        const newUsed = Number(limit.used_value ?? limit.spent ?? 0) - Number(entry.value)
        const clamped = newUsed < 0 ? 0 : newUsed
        const newPercent = limit.limit_value ? Math.round((clamped / Number(limit.limit_value)) * 100) : 0
        await supabase.from('limits').update({ used_value: clamped, percentage: newPercent }).eq('id', limit.id)
      }
    }
  } else if (entry.type === 'income' && entry.account) {
    const { data: accRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.account).single()
    const current = Number(accRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: current - Number(entry.value) }).eq('id', entry.account)
  } else if (entry.type === 'transfer' && entry.originAccount && entry.destinationAccount) {
    const { data: originRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.originAccount).single()
    const originCurrent = Number(originRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: originCurrent + Number(entry.value) }).eq('id', entry.originAccount)

    const { data: destRes } = await supabase.from('accounts').select('current_balance').eq('id', entry.destinationAccount).single()
    const destCurrent = Number(destRes?.current_balance ?? 0)
    await supabase.from('accounts').update({ current_balance: destCurrent - Number(entry.value) }).eq('id', entry.destinationAccount)
  }
}

/**
 * Cria um novo lançamento no banco
 * Aplica efeitos automaticamente (saldos e limites)
 * Se for recorrente, gera as próximas ocorrências
 * @param {Object} entry - Lançamento a criar
 * @returns {Promise<{data, error}>}
 * @throws {RateLimitError} Se exceder limite de requisições
 */
export async function createEntry(entry) {
  // Rate limiting: max 10 criações por minuto
  try {
    checkRateLimit('createEntry', RATE_LIMITS.CREATE_ENTRY.max, RATE_LIMITS.CREATE_ENTRY.windowMs)
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { data: null, error: { message: err.message, isRateLimited: true } }
    }
    throw err
  }

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  const payload = toDbEntry({ ...entry, user_id: userId })
  const { data, error } = await supabase.from('entries').insert([payload]).select()
  if (error) return { data: null, error }

  const parentEntry = data[0]

  try {
    await applyEntryEffects({ ...entry, user_id: userId })
  } catch (err) {
    console.error('Erro ao aplicar efeitos do lançamento:', err)
  }

  // Se for recorrente, gera próximas ocorrências
  if (entry.repeatType && entry.repeatType !== 'none') {
    try {
      const occurrences = generateRecurringOccurrences(
        { ...payload, user_id: userId },
        parentEntry.id,
        12
      )

      if (occurrences.length > 0) {
        await supabase.from('entries').insert(occurrences)
      }
    } catch (err) {
      console.error('Erro ao criar ocorrências recorrentes:', err)
    }
  }

  return { data: data.map(toClientEntry), error: null }
}

/**
 * Gera ocorrências futuras para entrada recorrente
 * @param {Object} entry - Entrada base
 * @param {string} parentId - ID da entrada pai
 * @param {number} count - Número de ocorrências
 * @returns {Array} Array de entradas
 */
function generateRecurringOccurrences(entry, parentId, count = 12) {
  const occurrences = []
  const baseDate = new Date(entry.date)
  const endDate = entry.repeat_end_date ? new Date(entry.repeat_end_date) : null

  for (let i = 1; i <= count; i++) {
    let nextDate = new Date(baseDate)

    if (entry.repeat_type === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + i)
    } else if (entry.repeat_type === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + i)
    } else {
      break
    }

    // Se tem data limite e passou, para
    if (endDate && nextDate > endDate) {
      break
    }

    occurrences.push({
      user_id: entry.user_id,
      type: entry.type,
      description: entry.description,
      category: entry.category,
      account: entry.account,
      origin_account: entry.origin_account,
      destination_account: entry.destination_account,
      value: entry.value,
      date: nextDate.toISOString(),
      repeat: true,
      repeat_type: entry.repeat_type,
      repeat_end_date: entry.repeat_end_date,
      parent_entry_id: parentId
    })
  }

  return occurrences
}

/**
 * Edita um lançamento existente
 * Reverte efeitos da entrada antiga, aplica efeitos novos
 * @param {string} id - ID do lançamento
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<{data, error}>}
 */
export async function editEntry(id, updates) {
  const { data: existing, error: getErr } = await supabase.from('entries').select('*').eq('id', id).single()
  if (getErr) return { data: null, error: getErr }

  try {
    await revertEntryEffects({
      id: existing.id,
      type: existing.type,
      value: existing.value,
      account: existing.account,
      originAccount: existing.origin_account,
      destinationAccount: existing.destination_account,
      category: existing.category,
      user_id: existing.user_id
    })
  } catch (err) {
    console.error('Erro ao reverter efeitos do lançamento antigo:', err)
  }

  const payload = toDbEntry(updates)
  const { data, error } = await supabase.from('entries').update(payload).eq('id', id).select()
  if (error) return { data: null, error }

  try {
    await applyEntryEffects({ ...existing, ...updates, user_id: existing.user_id })
  } catch (err) {
    console.error('Erro ao aplicar efeitos do lançamento atualizado:', err)
  }

  return { data: data.map(toClientEntry), error: null }
}

/**
 * Deleta um lançamento
 * Reverte efeitos do saldo e limites
 * @param {string} id - ID do lançamento a deletar
 * @returns {Promise<{data, error}>}
 * @throws {RateLimitError} Se exceder limite de requisições
 */
export async function deleteEntry(id) {
  // Rate limiting: max 10 deleções por minuto
  try {
    checkRateLimit('deleteEntry', RATE_LIMITS.DELETE_ENTRY.max, RATE_LIMITS.DELETE_ENTRY.windowMs)
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { data: null, error: { message: err.message, isRateLimited: true } }
    }
    throw err
  }

  const { data: existing, error: getErr } = await supabase.from('entries').select('*').eq('id', id).single()
  if (getErr) return { data: null, error: getErr }

  const { data, error } = await supabase.from('entries').delete().eq('id', id).select()
  if (error) return { data: null, error }

  try {
    await revertEntryEffects({
      id: existing.id,
      type: existing.type,
      value: existing.value,
      account: existing.account,
      originAccount: existing.origin_account,
      destinationAccount: existing.destination_account,
      category: existing.category,
      user_id: existing.user_id
    })
  } catch (err) {
    console.error('Erro ao reverter efeitos do lançamento deletado:', err)
  }

  return { data: data.map(toClientEntry), error: null }
}

/**
 * Retorna lançamentos de um mês específico
 * @param {number} year - Ano (YYYY)
 * @param {number} month - Mês (1-12)
 * @returns {Promise<{data, error}>}
 */
export async function getEntriesByMonth(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = `${year}-${String(month).padStart(2, '0')}-31`
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })
  if (error) return { data: null, error }
  return { data: (data || []).map(toClientEntry), error: null }
}

/**
 * Retorna todos os lançamentos do usuário
 * @returns {Promise<{data, error}>}
 */
export async function getAllEntries() {
  const { data, error } = await supabase.from('entries').select('*')
  if (error) return { data: null, error }
  return { data: (data || []).map(toClientEntry), error: null }
}

/**
 * Retorna próximas despesas/receitas recorrentes (futuras)
 * @param {number} limit - Número máximo de resultados
 * @returns {Promise<{data, error}>}
 */
export async function getUpcomingRecurring(limit = 5) {
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .gte('date', today)
    .neq('repeat_type', 'none')
    .not('repeat_type', 'is', null)
    .order('date', { ascending: true })
    .limit(limit)

  if (error) return { data: null, error }
  return { data: (data || []).map(toClientEntry), error: null }
}
