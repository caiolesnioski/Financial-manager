import { supabase } from './supabaseClient'

async function getUserId() {
  const { data } = await supabase.auth.getUser()
  return data?.user?.id
}

export async function getAllRecurringItems() {
  const { data, error } = await supabase
    .from('recurring_items')
    .select('*')
    .order('day_of_month', { ascending: true })
  if (error) return { data: null, error }
  return { data: data || [], error: null }
}

export async function createRecurringItem(item) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('recurring_items')
    .insert([{ ...item, user_id: userId }])
    .select()
  if (error) return { data: null, error }
  return { data: data || [], error: null }
}

export async function updateRecurringItem(id, updates) {
  const { data, error } = await supabase
    .from('recurring_items')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) return { data: null, error }
  return { data: data || [], error: null }
}

export async function deleteRecurringItem(id) {
  const { error } = await supabase
    .from('recurring_items')
    .delete()
    .eq('id', id)
  if (error) return { error }
  return { error: null }
}

export async function getPaymentsForMonth(month, year) {
  const { data, error } = await supabase
    .from('recurring_payments')
    .select('*')
    .eq('month', month)
    .eq('year', year)
  if (error) return { data: null, error }
  return { data: data || [], error: null }
}

export async function upsertPayment(recurringItemId, month, year, paid) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('recurring_payments')
    .upsert(
      [{
        recurring_item_id: recurringItemId,
        user_id: userId,
        month,
        year,
        paid,
        paid_at: paid ? new Date().toISOString() : null
      }],
      { onConflict: 'recurring_item_id,month,year' }
    )
    .select()
  if (error) return { data: null, error }
  return { data: data || [], error: null }
}
