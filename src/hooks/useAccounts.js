import { useState, useEffect, useCallback } from 'react'
import * as accountsService from '../services/accountsService'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await accountsService.getAllAccounts()
    if (error) setError(error)
    else setAccounts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = async (account) => {
    setLoading(true)
    const { data, error } = await accountsService.createAccount(account)
    if (error) setError(error)
    else {
      const added = Array.isArray(data) ? data[0] : data
      if (added) setAccounts((prev) => [...prev, added])
    }
    setLoading(false)
    return { data, error }
  }

  const update = async (id, updates) => {
    setLoading(true)
    const { data, error } = await accountsService.editAccount(id, updates)
    if (error) setError(error)
    else {
      const updated = Array.isArray(data) ? data[0] : data
      if (updated) setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)))
      else setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
    }
    setLoading(false)
    return { data, error }
  }

  const remove = async (id) => {
    setLoading(true)
    const { data, error } = await accountsService.deleteAccount(id)
    if (error) setError(error)
    else setAccounts((prev) => prev.filter((a) => a.id !== id))
    setLoading(false)
    return { data, error }
  }

  return { accounts, loading, error, load, create, update, remove }
}
