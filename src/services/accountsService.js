// Accounts service: CRUD for multi-accounts using Supabase
// Table structure expected in Supabase: 'accounts' with columns id (uuid), name, type, initialBalance, currentBalance, user_id
import { supabase } from './supabaseClient'
import { checkRateLimit, RateLimitError, RATE_LIMITS } from '../utils/rateLimit'

function toDbAccount(account) {
  // convert camelCase to snake_case for DB columns
  return {
    user_id: account.user_id,
    name: account.name,
    type: account.type,
    initial_balance: account.initialBalance ?? account.initial_balance ?? 0,
    current_balance: account.currentBalance ?? account.current_balance ?? (account.initialBalance ?? account.initial_balance ?? 0),
    currency: account.currency || 'BRL'
  }
}

function toClientAccount(row) {
  // convert DB row to client-friendly keys
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    initialBalance: Number(row.initial_balance ?? 0),
    currentBalance: Number(row.current_balance ?? 0),
    currency: row.currency || 'BRL',
    inserted_at: row.inserted_at
  }
}

export async function createAccount(account) {
  // Rate limiting: max 5 criações por minuto
  try {
    checkRateLimit('createAccount', RATE_LIMITS.CREATE_ACCOUNT.max, RATE_LIMITS.CREATE_ACCOUNT.windowMs)
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { data: null, error: { message: err.message, isRateLimited: true } }
    }
    throw err
  }

  // account: { name, type, initialBalance, currentBalance }
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  const payload = toDbAccount({ ...account, user_id: userId })
  const { data, error } = await supabase.from('accounts').insert([payload]).select()
  if (error) return { data: null, error }
  return { data: data.map(toClientAccount), error: null }
}

export async function editAccount(id, updates) {
  const payload = toDbAccount(updates)
  // remove undefined fields
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])
  const { data, error } = await supabase.from('accounts').update(payload).eq('id', id).select()
  if (error) return { data: null, error }
  return { data: data.map(toClientAccount), error: null }
}

export async function deleteAccount(id) {
  // Verifica se a conta tem lançamentos associados
  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('id', { count: 'exact' })
    .or(`account.eq.${id},origin_account.eq.${id},destination_account.eq.${id}`);
  
  if (entriesError) {
    return { data: null, error: entriesError };
  }

  if (entries && entries.length > 0) {
    return { 
      data: null, 
      error: new Error(`Não é possível deletar esta conta. Existem ${entries.length} lançamento(s) associado(s) a ela.`) 
    };
  }

  const { data, error } = await supabase.from('accounts').delete().eq('id', id).select()
  if (error) return { data: null, error }
  return { data: data.map(toClientAccount), error: null }
}

export async function getAllAccounts() {
  const { data, error } = await supabase.from('accounts').select('*')
  if (error) return { data: null, error }
  return { data: (data || []).map(toClientAccount), error: null }
}
