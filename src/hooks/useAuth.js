import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { signIn, signOut, createAccount } from '../services/authService'

// Intervalo de refresh do JWT (30 minutos)
const JWT_REFRESH_INTERVAL = 30 * 60 * 1000

// Hook to expose auth state and actions
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState(null)
  const refreshIntervalRef = useRef(null)

  // Função para refresh da sessão
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.warn('Erro ao renovar sessão:', error.message)
        setSessionError(error)

        // Se falhar, limpa usuário e redireciona para login
        if (error.message?.includes('refresh_token') || error.message?.includes('expired')) {
          setUser(null)
          // O redirecionamento é feito pelo PrivateRoute no App.jsx
        }
        return { error }
      }

      if (data.session) {
        setUser(data.session.user)
        setSessionError(null)
      }

      return { data }
    } catch (err) {
      console.warn('Exceção ao renovar sessão:', err)
      return { error: err }
    }
  }, [])

  useEffect(() => {
    // check initial session
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user ?? null)
      } catch (err) {
        // if Supabase is misconfigured or network fails, avoid sticking on loading
      } finally {
        setLoading(false)
      }
    })()

    // subscribe to auth changes
    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        setUser(session?.user ?? null)

        // Se usuário logou, inicia o refresh automático
        if (session?.user) {
          startRefreshInterval()
        } else {
          stopRefreshInterval()
        }
      } finally {
        setLoading(false)
      }
    })

    return () => {
      // Limpa intervalo de refresh
      stopRefreshInterval()

      // supabase onAuthStateChange returns { data: { subscription } } in older SDKs
      try {
        if (subscription?.data?.subscription) subscription.data.subscription.unsubscribe()
        else if (subscription?.unsubscribe) subscription.unsubscribe()
      } catch (e) {
        // ignore cleanup errors
      }
    }
  }, [])

  // Inicia intervalo de refresh
  const startRefreshInterval = useCallback(() => {
    // Limpa intervalo anterior se existir
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Configura novo intervalo
    refreshIntervalRef.current = setInterval(() => {
      refreshSession()
    }, JWT_REFRESH_INTERVAL)
  }, [refreshSession])

  // Para intervalo de refresh
  const stopRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [])

  // Inicia refresh se usuário já estiver logado
  useEffect(() => {
    if (user) {
      startRefreshInterval()
    }
    return () => stopRefreshInterval()
  }, [user, startRefreshInterval, stopRefreshInterval])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setSessionError(null)
    const res = await signIn(email, password)
    setLoading(false)
    return res
  }, [])

  const register = useCallback(async (email, password) => {
    setLoading(true)
    setSessionError(null)
    const res = await createAccount(email, password)
    setLoading(false)
    return res
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    stopRefreshInterval()
    await signOut()
    setLoading(false)
    setUser(null)
    setSessionError(null)
  }, [stopRefreshInterval])

  return {
    user,
    loading,
    sessionError,
    login,
    register,
    logout,
    refreshSession
  }
}
