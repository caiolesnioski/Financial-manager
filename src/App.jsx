import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Cashflow from './pages/Cashflow'
import NewEntry from './pages/NewEntry'
import Reports from './pages/Reports'
import Limits from './pages/Limits'
import Settings from './pages/Settings'
import Navbar from './pages/Navbar'
import ToastContainer from './components/ToastContainer'
import { useAuth } from './hooks/useAuth'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { CurrencyProvider } from './contexts/CurrencyContext'

// Simple private route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-4">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />
            <main className="p-6">
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <PrivateRoute>
                  <Accounts />
                </PrivateRoute>
              }
            />
            <Route
              path="/cashflow"
              element={
                <PrivateRoute>
                  <Cashflow />
                </PrivateRoute>
              }
            />
            <Route
              path="/new-entry"
              element={
                <PrivateRoute>
                  <NewEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/limits"
              element={
                <PrivateRoute>
                  <Limits />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            </Routes>
          </main>
            <ToastContainer />
          </div>
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  )
}
