import { useState, useEffect, useCallback } from 'react'
import * as entriesService from '../services/entriesService'

export function useEntries() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await entriesService.getAllEntries()
    if (error) setError(error)
    else setEntries(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const create = async (entry) => {
    setLoading(true)
    const { data, error } = await entriesService.createEntry(entry)
    if (error) setError(error)
    else setEntries((prev) => [...prev, ...data])
    setLoading(false)
    return { data, error }
  }

  const remove = async (id) => {
    setLoading(true)
    const { data, error } = await entriesService.deleteEntry(id)
    if (error) setError(error)
    else setEntries((prev) => prev.filter((e) => e.id !== id))
    setLoading(false)
    return { data, error }
  }

  const update = async (id, updates) => {
    setLoading(true)
    const { data, error } = await entriesService.editEntry(id, updates)
    if (error) setError(error)
    else setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
    setLoading(false)
    return { data, error }
  }

  return { entries, loading, error, loadAll, create, update, remove }
}
