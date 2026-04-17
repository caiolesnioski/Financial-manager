import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from '../components/ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 transition-colors hidden md:block">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-lg text-fintech-green">Gerenciador</Link>
          <Link to="/accounts" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Contas</Link>
          <Link to="/entries" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Lançamentos</Link>
          <Link to="/limits" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Limites</Link>
          <Link to="/cashflow" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Fluxo</Link>
          <Link to="/reports" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Relatórios</Link>
          <Link to="/recurrents" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Fixos</Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
              <button onClick={handleLogout} className="button-primary">Sair</button>
            </>
          ) : (
            <Link to="/login" className="button-primary">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
