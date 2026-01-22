import { useState } from 'react'
import { Wallet, Building2, CreditCard, PiggyBank, Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import { useCurrency } from '../contexts/CurrencyContext'
import { useToast } from '../context/ToastContext'
import CurrencySelector from '../components/CurrencySelector'

export default function Accounts() {
  const { accounts, loading, create, update, remove, load } = useAccounts()
  const { formatMoney } = useCurrency()
  const { addToast } = useToast()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [contaEditando, setContaEditando] = useState(null)
  const [formNome, setFormNome] = useState('')
  const [formTipo, setFormTipo] = useState('Conta Corrente')
  const [formSaldo, setFormSaldo] = useState('0')
  const [formCor, setFormCor] = useState('bg-blue-500')

  const calcularSaldoTotal = () => {
    return (accounts || []).reduce((total, conta) => total + (conta.currentBalance ?? 0), 0)
  }

  const getIcone = (tipo) => {
    if (tipo?.includes('Corrente') || tipo === 'bank') return <Building2 size={24} />
    if (tipo?.includes('Poupanca') || tipo?.includes('Poupança') || tipo === 'piggy') return <PiggyBank size={24} />
    if (tipo?.includes('Cartao') || tipo?.includes('Cartão') || tipo === 'card') return <CreditCard size={24} />
    if (tipo?.includes('Investimento')) return <TrendingUp size={24} />
    return <Wallet size={24} />
  }

  const tiposConta = [
    { valor: 'Conta Corrente', label: 'Conta Corrente' },
    { valor: 'Poupanca', label: 'Poupanca' },
    { valor: 'Cartao de Credito', label: 'Cartao de Credito' },
    { valor: 'Dinheiro', label: 'Dinheiro' },
    { valor: 'Investimento', label: 'Investimento' }
  ]

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
    if (error) addToast('Erro ao excluir: ' + (error.message || error), 'error')
    else await load()
  }

  const editarConta = (conta) => {
    setContaEditando(conta)
    setFormNome(conta.name || '')
    setFormTipo(conta.type || 'Conta Corrente')
    setFormSaldo(String(conta.currentBalance ?? 0))
    setFormCor(conta.cor || 'bg-blue-500')
    setMostrarFormulario(true)
  }

  const abrirNovoFormulario = () => {
    setContaEditando(null)
    setFormNome('')
    setFormTipo('Conta Corrente')
    setFormSaldo('0')
    setFormCor('bg-blue-500')
    setMostrarFormulario(true)
  }

  const salvarConta = async () => {
    if (!formNome.trim()) {
      addToast('Por favor, digite o nome da conta', 'warning')
      return
    }

    const payload = {
      name: formNome,
      type: formTipo,
      initialBalance: Number(formSaldo) || 0,
      currentBalance: Number(formSaldo) || 0
    }

    if (contaEditando) {
      const { error } = await update(contaEditando.id, payload)
      if (error) addToast('Erro ao atualizar: ' + (error.message || error), 'error')
      else await load()
    } else {
      const { error } = await create(payload)
      if (error) addToast('Erro ao criar: ' + (error.message || error), 'error')
      else await load()
    }

    setMostrarFormulario(false)
  }

  const saldoTotal = calcularSaldoTotal()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Minhas contas</h1>
          <CurrencySelector compact />
        </div>
      </div>

      {/* Saldo Total */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white px-6 py-8">
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
      <div className="px-6 py-6 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : (
          <>
            {(accounts || []).map((conta, idx) => (
              <div key={conta.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 overflow-hidden transition-colors">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${conta.cor || cores[idx % cores.length].class} rounded-xl flex items-center justify-center text-white`}>
                      {getIcone(conta.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{conta.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{conta.type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${(conta.currentBalance ?? 0) >= 0 ? 'text-gray-800 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                        {formatMoney(conta.currentBalance ?? 0)}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {(conta.currentBalance ?? 0) >= (conta.initialBalance ?? 0) ? (
                          <TrendingUp size={14} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={14} className="text-red-500" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Inicial: {formatMoney(conta.initialBalance ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acoes */}
                <div className="flex border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => editarConta(conta)}
                    className="flex-1 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <div className="w-px bg-gray-100 dark:bg-gray-700" />
                  <button
                    onClick={() => excluirConta(conta.id)}
                    className="flex-1 py-3 px-4 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}

            {/* Botao Adicionar Conta */}
            <button
              onClick={abrirNovoFormulario}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Nova conta
            </button>
          </>
        )}
      </div>

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {contaEditando ? 'Editar conta' : 'Nova conta'}
              </h2>
              <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome da conta</label>
                <input
                  type="text"
                  placeholder="Ex: Banco Itau"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de conta</label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {tiposConta.map(tipo => (
                    <option key={tipo.valor} value={tipo.valor}>{tipo.label}</option>
                  ))}
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
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

              <button
                onClick={salvarConta}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors mt-6"
              >
                {contaEditando ? 'Salvar alteracoes' : 'Criar conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
