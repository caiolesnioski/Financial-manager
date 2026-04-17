import { useState } from 'react'
import { Wallet, Building2, CreditCard, PiggyBank, Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import { useCurrency } from '../contexts/CurrencyContext'
import { useToast } from '../context/ToastContext'
import { ACCOUNT_TYPE_OPTIONS, ACCOUNT_TYPE_LABELS } from '../constants/accountTypes'
import { validateAccountName, validateBalance, getErrorMessage } from '../utils/validators'

function hashStr(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const ACCOUNT_PALETTES = [
  { from: 'from-blue-500', to: 'to-indigo-600', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
  { from: 'from-emerald-500', to: 'to-teal-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  { from: 'from-purple-500', to: 'to-violet-600', light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300' },
  { from: 'from-orange-500', to: 'to-red-500', light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300' },
  { from: 'from-pink-500', to: 'to-rose-500', light: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-300' },
  { from: 'from-cyan-500', to: 'to-sky-600', light: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300' },
  { from: 'from-yellow-500', to: 'to-amber-600', light: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300' },
  { from: 'from-slate-500', to: 'to-gray-600', light: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-700 dark:text-slate-300' },
]

function getPaletteForAccount(name) {
  const idx = hashStr(name || '') % ACCOUNT_PALETTES.length
  return ACCOUNT_PALETTES[idx]
}

const CURRENCY_BADGE = {
  BRL: { label: 'R$', bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  USD: { label: 'US$', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  EUR: { label: '€', bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
}

export default function Accounts() {
  const { accounts, loading, create, update, remove, load } = useAccounts()
  const { formatMoney } = useCurrency()
  const { addToast } = useToast()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [contaEditando, setContaEditando] = useState(null)
  const [formNome, setFormNome] = useState('')
  const [formTipo, setFormTipo] = useState('bank')
  const [formSaldo, setFormSaldo] = useState('0')
  const [formCor, setFormCor] = useState('bg-blue-500')
  const [formMoeda, setFormMoeda] = useState('BRL')
  const [formErros, setFormErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  const calcularSaldoTotal = () => {
    return (accounts || []).reduce((total, conta) => total + (conta.currentBalance ?? 0), 0)
  }

  const getIcone = (tipo) => {
    switch(tipo) {
      case 'bank': return <Building2 size={22} />
      case 'piggy': return <PiggyBank size={22} />
      case 'card': return <CreditCard size={22} />
      case 'investment': return <TrendingUp size={22} />
      case 'wallet': return <Wallet size={22} />
      default: return <Wallet size={22} />
    }
  }

  const tiposConta = ACCOUNT_TYPE_OPTIONS

  const cores = [
    { class: 'bg-blue-500', hex: '#3b82f6' },
    { class: 'bg-emerald-500', hex: '#10b981' },
    { class: 'bg-purple-500', hex: '#8b5cf6' },
    { class: 'bg-orange-500', hex: '#f97316' },
    { class: 'bg-pink-500', hex: '#ec4899' },
    { class: 'bg-red-500', hex: '#ef4444' },
    { class: 'bg-yellow-500', hex: '#eab308' },
    { class: 'bg-indigo-500', hex: '#6366f1' }
  ]

  const excluirConta = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return
    const { error } = await remove(id)
    if (error) {
      const mensagem = getErrorMessage(error, 'excluir a conta')
      addToast(mensagem, 'error')
    } else {
      addToast('Conta excluída com sucesso!', 'success')
      await load()
    }
  }

  const editarConta = (conta) => {
    setContaEditando(conta)
    setFormNome(conta.name || '')
    setFormTipo(conta.type || 'bank')
    setFormSaldo(String(conta.currentBalance ?? 0))
    setFormCor(conta.cor || 'bg-blue-500')
    setFormMoeda(conta.currency || 'BRL')
    setFormErros({})
    setMostrarFormulario(true)
  }

  const abrirNovoFormulario = () => {
    setContaEditando(null)
    setFormNome('')
    setFormTipo('bank')
    setFormSaldo('0')
    setFormCor('bg-blue-500')
    setFormMoeda('BRL')
    setFormErros({})
    setMostrarFormulario(true)
  }

  const salvarConta = async () => {
    const novoErros = {}
    const nomeErro = validateAccountName(formNome)
    if (nomeErro) novoErros.nome = nomeErro

    const saldoErro = validateBalance(formSaldo, { allowNegative: true })
    if (saldoErro) novoErros.saldo = saldoErro

    if (Object.keys(novoErros).length > 0) {
      setFormErros(novoErros)
      return
    }

    setSalvando(true)
    setFormErros({})

    const payload = {
      name: formNome,
      type: formTipo,
      initialBalance: Number(formSaldo) || 0,
      currentBalance: Number(formSaldo) || 0,
      currency: formMoeda
    }

    try {
      if (contaEditando) {
        const { error } = await update(contaEditando.id, payload)
        if (error) {
          addToast(getErrorMessage(error, 'atualizar conta'), 'error')
        } else {
          addToast('Conta atualizada com sucesso!', 'success')
          await load()
          setMostrarFormulario(false)
        }
      } else {
        const { error } = await create(payload)
        if (error) {
          addToast(getErrorMessage(error, 'criar conta'), 'error')
        } else {
          addToast('Conta criada com sucesso!', 'success')
          await load()
          setMostrarFormulario(false)
        }
      }
    } finally {
      setSalvando(false)
    }
  }

  const saldoTotal = calcularSaldoTotal()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Minhas contas</h1>
        </div>
      </div>

      {/* Saldo Total */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-6 py-8">
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Saldo total</p>
          <h2 className={`text-4xl font-bold ${saldoTotal < 0 ? 'text-red-200' : ''}`}>
            {formatMoney(saldoTotal)}
          </h2>
          <p className="text-xs opacity-75 mt-2">
            {(accounts || []).length} conta{(accounts || []).length !== 1 ? 's' : ''} cadastrada{(accounts || []).length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="px-6 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : (
          <>
            {(accounts || []).map((conta, idx) => {
              const palette = getPaletteForAccount(conta.name || '')
              const saldo = conta.currentBalance ?? 0
              const saldoPositivo = saldo >= 0
              const currency = conta.currency || 'BRL'
              const badge = CURRENCY_BADGE[currency] || CURRENCY_BADGE.BRL

              return (
                <div
                  key={conta.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md dark:shadow-gray-700/20 overflow-hidden transition-all duration-200 border border-gray-100 dark:border-gray-700"
                >
                  {/* Barra colorida no topo */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${palette.from} ${palette.to}`} />

                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Ícone com gradiente */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${palette.from} ${palette.to} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
                        {getIcone(conta.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-gray-800 dark:text-white text-base truncate">{conta.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className={`text-xs px-2 py-0.5 rounded-full inline-block font-medium ${palette.light} ${palette.text}`}>
                          {conta.type}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-xl font-bold ${saldoPositivo ? 'text-gray-800 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                          {formatMoney(saldo, conta.currency)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {saldo >= (conta.initialBalance ?? 0) ? (
                            <TrendingUp size={12} className="text-emerald-500" />
                          ) : (
                            <TrendingDown size={12} className="text-red-500" />
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Inicial: {formatMoney(conta.initialBalance ?? 0, conta.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => editarConta(conta)}
                      className="flex-1 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit2 size={15} />
                      Editar
                    </button>
                    <div className="w-px bg-gray-100 dark:bg-gray-700" />
                    <button
                      onClick={() => excluirConta(conta.id)}
                      className="flex-1 py-3 px-4 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 size={15} />
                      Excluir
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              onClick={abrirNovoFormulario}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-gray-500 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Nova conta
            </button>
          </>
        )}
      </div>

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {contaEditando ? 'Editar conta' : 'Nova conta'}
              </h2>
              <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl w-10 h-10 flex items-center justify-center">
                &times;
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome da conta</label>
                  <input
                    type="text"
                    placeholder="Ex: Banco Itau"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      formErros.nome
                        ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                    }`}
                  />
                  {formErros.nome && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErros.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de conta</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {tiposConta.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Moeda</label>
                  <select
                    value={formMoeda}
                    onChange={(e) => setFormMoeda(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="BRL">R$ — Real Brasileiro</option>
                    <option value="EUR">€ — Euro</option>
                    <option value="USD">$ — Dólar Americano</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saldo inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formSaldo}
                    onChange={(e) => setFormSaldo(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      formErros.saldo
                        ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                    }`}
                  />
                  {formErros.saldo && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErros.saldo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {cores.map(cor => (
                      <button
                        key={cor.class}
                        type="button"
                        onClick={() => setFormCor(cor.class)}
                        className={`w-10 h-10 ${cor.class} rounded-full hover:scale-110 transition-transform ${formCor === cor.class ? 'ring-4 ring-gray-400 dark:ring-gray-500 scale-110' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t dark:border-gray-700 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={salvarConta}
                disabled={salvando}
                className={`w-full py-3 text-white font-semibold rounded-xl transition-colors ${
                  salvando ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {salvando ? 'Salvando...' : (contaEditando ? 'Salvar alterações' : 'Criar conta')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
