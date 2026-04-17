import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Fingerprint, LogIn, UserPlus } from 'lucide-react'

const BIOMETRIC_KEY = 'biometric_cred_id'
const BIOMETRIC_EMAIL_KEY = 'biometric_email'
const BIOMETRIC_PASS_KEY = 'biometric_pass'

function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

function isWebAuthnAvailable() {
  return !!(window.PublicKeyCredential && navigator.credentials)
}

async function registerBiometric(email) {
  if (!isWebAuthnAvailable()) return false
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Gerenciador de Finanças', id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(email),
          name: email,
          displayName: email.split('@')[0]
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000
      }
    })
    const rawId = Array.from(new Uint8Array(credential.rawId))
    localStorage.setItem(BIOMETRIC_KEY, JSON.stringify(rawId))
    return true
  } catch {
    return false
  }
}

async function authenticateBiometric() {
  if (!isWebAuthnAvailable()) return false
  const stored = localStorage.getItem(BIOMETRIC_KEY)
  if (!stored) return false
  try {
    const rawId = new Uint8Array(JSON.parse(stored))
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ type: 'public-key', id: rawId }],
        userVerification: 'required',
        timeout: 60000
      }
    })
    return !!credential
  } catch {
    return false
  }
}

export default function Login() {
  const { login, register, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState(null)
  const [hasBiometric, setHasBiometric] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const credId = localStorage.getItem(BIOMETRIC_KEY)
    const savedEmail = localStorage.getItem(BIOMETRIC_EMAIL_KEY)
    setHasBiometric(!!(credId && savedEmail && isWebAuthnAvailable()))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = isRegister ? await register(email, password) : await login(email, password)
      if (res?.error) {
        setError(res.error.message || 'Erro de autenticação')
      } else {
        if (!isRegister && isWebAuthnAvailable() && isPWA() && !localStorage.getItem(BIOMETRIC_KEY)) {
          setShowBiometricSetup(true)
          localStorage.setItem(BIOMETRIC_EMAIL_KEY, email)
          localStorage.setItem(BIOMETRIC_PASS_KEY, btoa(unescape(encodeURIComponent(password))))
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleBiometricLogin = async () => {
    setBiometricLoading(true)
    setError(null)
    try {
      const ok = await authenticateBiometric()
      if (ok) {
        const savedEmail = localStorage.getItem(BIOMETRIC_EMAIL_KEY)
        const savedPass = decodeURIComponent(escape(atob(localStorage.getItem(BIOMETRIC_PASS_KEY) || '')))
        const res = await login(savedEmail, savedPass)
        if (res?.error) {
          setError('Falha na autenticação biométrica. Faça login manualmente.')
        } else {
          navigate('/')
        }
      } else {
        setError('Autenticação biométrica cancelada.')
      }
    } catch {
      setError('Erro na autenticação biométrica.')
    } finally {
      setBiometricLoading(false)
    }
  }

  const handleSetupBiometric = async () => {
    const savedEmail = localStorage.getItem(BIOMETRIC_EMAIL_KEY)
    const ok = await registerBiometric(savedEmail)
    if (ok) {
      setHasBiometric(true)
    }
    setShowBiometricSetup(false)
    navigate('/')
  }

  const handleSkipBiometric = () => {
    setShowBiometricSetup(false)
    navigate('/')
  }

  if (showBiometricSetup) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <Fingerprint size={56} className="mx-auto mb-4 text-emerald-500" />
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Ativar Face ID / Touch ID</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Use biometria para entrar rapidamente no app sem digitar senha.
        </p>
        <button
          onClick={handleSetupBiometric}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl mb-3 transition-colors"
        >
          Ativar biometria
        </button>
        <button
          onClick={handleSkipBiometric}
          className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
        >
          Agora não
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">💰</span>
        </div>
        <h2 className="text-2xl font-bold dark:text-white">{isRegister ? 'Criar conta' : 'Entrar'}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerenciador de Finanças</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="email@exemplo.com"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[44px]"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {isRegister ? 'Registrar' : 'Entrar'}
        </button>
      </form>

      {hasBiometric && !isRegister && (
        <button
          onClick={handleBiometricLogin}
          disabled={biometricLoading}
          className="w-full mt-4 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Fingerprint size={20} />
          {biometricLoading ? 'Verificando...' : 'Entrar com Face ID / Touch ID'}
        </button>
      )}

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <button
          onClick={() => setIsRegister((s) => !s)}
          className="underline hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[44px] inline-flex items-center"
        >
          {isRegister ? 'Já tenho conta' : 'Criar uma conta'}
        </button>
      </div>
    </div>
  )
}
