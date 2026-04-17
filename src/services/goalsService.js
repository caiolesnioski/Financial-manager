import { supabase } from './supabaseClient'

export async function getAllGoals() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Não autenticado' } }

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('inserted_at', { ascending: false })

  return { data, error }
}

export async function createGoal(goal) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Não autenticado' } }

  const { data, error } = await supabase
    .from('goals')
    .insert([{ ...goal, user_id: user.id }])
    .select()

  return { data, error }
}

export async function updateGoal(id, updates) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()

  return { data, error }
}

export async function deleteGoal(id) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)

  return { error }
}

export async function getContributions(goalId) {
  const { data, error } = await supabase
    .from('goal_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('contributed_at', { ascending: false })

  return { data, error }
}

export async function addContribution(contribution) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Não autenticado' } }

  const { data, error } = await supabase
    .from('goal_contributions')
    .insert([{ ...contribution, user_id: user.id }])
    .select()

  return { data, error }
}

export async function deleteContribution(id) {
  const { error } = await supabase
    .from('goal_contributions')
    .delete()
    .eq('id', id)

  return { error }
}
