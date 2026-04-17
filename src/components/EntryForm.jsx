import { useState, useEffect } from 'react'
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Calendar, Repeat, DollarSign, FileText, Wallet } from 'lucide-react'
import CategorySelector from './CategorySelector.jsx'

export default function EntryForm({ onSubmit, initial, accounts = [] }) {
  const [type, setType] = useState(initial?.type || 'expense')
  const [description, setDescription] = useState(initial?.description || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [account, setAccount] = useState(initial?.account || '')
  const [originAccount, setOriginAccount] = useState(initial?.originAccount || '')
  const [destinationAccount, setDestinationAccount] = useState(initial?.destinationAccount || '')
  const [value, setValue] = useState(initial?.value ?? '')
  const [date, setDate] = useState(initial?.date?.slice(0,10) || new Date().toISOString().slice(0,10))
  const [repeat, setRepeat] = useState(initial?.repeat || false)

  useEffect(() => {
    if (!account && accounts.length > 0) setAccount(accounts[0].id)
    if (!originAccount && accounts.length > 0) setOriginAccount(accounts[0].id)
    if (!destinationAccount && accounts.length > 0) setDestinationAccount(accounts[0].id)
  }, [accounts])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      type,
      description,
      category,
      account,
      originAccount: type === 'transfer' ? originAccount : null,
      destinationAccount: type === 'transfer' ? destinationAccount : null,
      value: Number(value),
      date: new Date(date).toISOString(),
      repeat: Boolean(repeat)
    }
    onSubmit(payload)
  }

  const typeOptions = [
    { value: 'expense', label: 'Despesa', icon: ArrowDownCircle, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-500' },
    { value: 'income', label: 'Receita', icon: ArrowUpCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500' },
    { value: 'transfer', label: 'Transferencia', icon: ArrowLeftRight, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Tipo de Lancamento */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Lancamento
        </label>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {typeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = type === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`
                  flex flex-col items-center justify-center p-2 md:p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? `${option.borderColor} ${option.bgColor} shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`w-8 h-8 mb-2 ${isSelected ? option.color : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? option.color : 'text-gray-600'}`}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Valor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Valor
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Descricao */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Descricao
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Almoco no restaurante"
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Categoria - apenas para despesas e receitas */}
      {type !== 'transfer' && (
        <CategorySelector
          type={type}
          value={category}
          onChange={setCategory}
        />
      )}

      {/* Conta - para despesas e receitas */}
      {type !== 'transfer' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Conta
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Wallet className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Contas de Transferencia */}
      {type === 'transfer' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Conta de Origem
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ArrowUpCircle className="h-5 w-5 text-red-400" />
              </div>
              <select
                value={originAccount}
                onChange={(e) => setOriginAccount(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowLeftRight className="w-6 h-6 text-gray-400 rotate-90" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Conta de Destino
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ArrowDownCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <select
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Data */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Data
        </label>
        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="block w-full max-w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            style={{ boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Repetir */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <div className={`p-2 rounded-lg ${repeat ? 'bg-emerald-100' : 'bg-gray-200'}`}>
          <Repeat className={`w-5 h-5 ${repeat ? 'text-emerald-600' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">
            Lancamento recorrente
          </label>
          <p className="text-xs text-gray-500">
            Repetir este lancamento mensalmente
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {/* Botao Salvar */}
      <button
        type="submit"
        className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
      >
        <DollarSign className="w-5 h-5" />
        Salvar Lancamento
      </button>
    </form>
  )
}
