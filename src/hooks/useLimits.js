import { useState, useEffect, useCallback } from 'react'
import * as limitsService from '../services/limitsService'

export function useLimits() {
  const [limits, setLimits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const normalize = (row) => {
    if (!row) return null
    return {
      id: row.id,
      category: row.category,
      limit: Number(row.limit_value ?? 0),
      spent: Number(row.used_value ?? 0),
      color: row.color || '#10b981',
      inserted_at: row.inserted_at
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await limitsService.getAllLimits()
    if (error) setError(error)
    else setLimits((data || []).map(normalize))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = async (limit) => {
    setLoading(true)
    const { data, error } = await limitsService.createLimit(limit)
    if (error) setError(error)
    else {
      const added = Array.isArray(data) ? data[0] : data
      if (added) setLimits((prev) => [...prev, normalize(added)])
    }
    setLoading(false)
    return { data, error }
  }

  const update = async (id, updates) => {
    setLoading(true)
    const { data, error } = await limitsService.editLimit(id, updates)
    if (error) setError(error)
    else {
      const updated = Array.isArray(data) ? data[0] : data
      if (updated) setLimits((prev) => prev.map(l => (l.id === id ? normalize(updated) : l)))
    }
    setLoading(false)
    return { data, error }
  }

  const remove = async (id) => {
    setLoading(true)
    const { data, error } = await limitsService.deleteLimit(id)
    if (error) setError(error)
    else setLimits((prev) => prev.filter(l => l.id !== id))
    setLoading(false)
    return { data, error }
  }

  return { limits, loading, error, load, create, update, remove }
}
