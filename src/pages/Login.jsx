import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, register, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = isRegister ? await register(email, password) : await login(email, password)
      if (res?.error) setError(res.error.message || 'Erro de autenticação')
      else navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 card">
      <h2 className="text-xl font-semibold mb-4">{isRegister ? 'Criar conta' : 'Entrar'}</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className="border rounded px-3 py-2" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className="border rounded px-3 py-2" required />
        <button type="submit" className="button-primary">{isRegister ? 'Registrar' : 'Entrar'}</button>
      </form>
      <div className="mt-3 text-sm text-gray-600">
        <button onClick={() => setIsRegister((s) => !s)} className="underline">
          {isRegister ? 'Já tenho conta' : 'Criar uma conta'}
        </button>
      </div>
    </div>
  )
}
