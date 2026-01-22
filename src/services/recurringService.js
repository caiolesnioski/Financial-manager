/**
 * Recurring Service
 * Gerencia despesas e receitas recorrentes (mensais/anuais)
 */
import { supabase } from './supabaseClient'

/**
 * Adiciona meses a uma data
 * @param {Date} date - Data base
 * @param {number} months - Número de meses a adicionar
 * @returns {Date} Nova data
 */
function addMonths(date, months) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Adiciona anos a uma data
 * @param {Date} date - Data base
 * @param {number} years - Número de anos a adicionar
 * @returns {Date} Nova data
 */
function addYears(date, years) {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * Gera próximas ocorrências de uma entrada recorrente
 * @param {Object} entry - Entrada base (pai)
 * @param {string} parentId - ID da entrada pai
 * @param {number} count - Número de ocorrências a gerar (padrão: 12)
 * @returns {Array} Array de entradas a serem criadas
 */
export function generateNextOccurrences(entry, parentId, count = 12) {
  const occurrences = []
  const baseDate = new Date(entry.date)
  const endDate = entry.repeat_end_date ? new Date(entry.repeat_end_date) : null

  for (let i = 1; i <= count; i++) {
    let nextDate

    if (entry.repeat_type === 'monthly') {
      nextDate = addMonths(baseDate, i)
    } else if (entry.repeat_type === 'yearly') {
      nextDate = addYears(baseDate, i)
    } else {
      break // Não é recorrente
    }

    // Se tem data limite e passou, para de gerar
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
 * Cria uma entrada recorrente (pai + ocorrências futuras)
 * @param {Object} entry - Dados da entrada
 * @returns {Promise<{data, error}>}
 */
export async function createRecurringEntry(entry) {
  try {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    if (!userId) {
      return { data: null, error: { message: 'Usuário não autenticado' } }
    }

    // Prepara entrada pai
    const parentEntry = {
      user_id: userId,
      type: entry.type,
      description: entry.description,
      category: entry.category,
      account: entry.account,
      origin_account: entry.originAccount || null,
      destination_account: entry.destinationAccount || null,
      value: Number(entry.value),
      date: entry.date,
      repeat: true,
      repeat_type: entry.repeatType || 'monthly',
      repeat_end_date: entry.repeatEndDate || null,
      parent_entry_id: null // É o pai
    }

    // Insere entrada pai
    const { data: parentData, error: parentError } = await supabase
      .from('entries')
      .insert([parentEntry])
      .select()
      .single()

    if (parentError) {
      return { data: null, error: parentError }
    }

    // Gera ocorrências futuras
    const occurrences = generateNextOccurrences(
      { ...parentEntry, user_id: userId },
      parentData.id,
      12 // Gera 12 ocorrências por padrão
    )

    if (occurrences.length > 0) {
      const { error: occError } = await supabase
        .from('entries')
        .insert(occurrences)

      if (occError) {
        console.error('Erro ao criar ocorrências:', occError)
        // Não retorna erro, pois a entrada pai foi criada
      }
    }

    return {
      data: {
        parent: parentData,
        occurrencesCount: occurrences.length
      },
      error: null
    }
  } catch (error) {
    console.error('Erro ao criar entrada recorrente:', error)
    return { data: null, error }
  }
}

/**
 * Busca próximas despesas recorrentes (futuras)
 * @param {number} limit - Número máximo de resultados (padrão: 5)
 * @returns {Promise<{data, error}>}
 */
export async function getUpcomingRecurring(limit = 5) {
  try {
    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .gte('date', today)
      .neq('repeat_type', 'none')
      .order('date', { ascending: true })
      .limit(limit)

    if (error) {
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar recorrências:', error)
    return { data: null, error }
  }
}

/**
 * Busca todas as ocorrências de uma entrada recorrente (pai + filhas)
 * @param {string} parentId - ID da entrada pai
 * @returns {Promise<{data, error}>}
 */
export async function getRecurringOccurrences(parentId) {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .or(`id.eq.${parentId},parent_entry_id.eq.${parentId}`)
      .order('date', { ascending: true })

    if (error) {
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error)
    return { data: null, error }
  }
}

/**
 * Deleta uma entrada recorrente e todas suas ocorrências
 * @param {string} parentId - ID da entrada pai
 * @returns {Promise<{data, error}>}
 */
export async function deleteRecurringEntry(parentId) {
  try {
    // Primeiro deleta as filhas (cascade também faria isso)
    await supabase
      .from('entries')
      .delete()
      .eq('parent_entry_id', parentId)

    // Depois deleta o pai
    const { data, error } = await supabase
      .from('entries')
      .delete()
      .eq('id', parentId)
      .select()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Erro ao deletar entrada recorrente:', error)
    return { data: null, error }
  }
}

/**
 * Atualiza todas as ocorrências futuras de uma entrada recorrente
 * @param {string} parentId - ID da entrada pai
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<{data, error}>}
 */
export async function updateFutureOccurrences(parentId, updates) {
  try {
    const today = new Date().toISOString()

    // Atualiza pai
    await supabase
      .from('entries')
      .update(updates)
      .eq('id', parentId)

    // Atualiza ocorrências futuras
    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('parent_entry_id', parentId)
      .gte('date', today)
      .select()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Erro ao atualizar ocorrências:', error)
    return { data: null, error }
  }
}

/**
 * Labels para tipos de repetição
 */
export const repeatTypeLabels = {
  none: 'Não repetir',
  monthly: 'Mensal',
  yearly: 'Anual'
}

/**
 * Descrições para tipos de repetição
 */
export const repeatTypeDescriptions = {
  none: '',
  monthly: 'Despesa será criada automaticamente todo mês',
  yearly: 'Despesa será criada automaticamente todo ano'
}
