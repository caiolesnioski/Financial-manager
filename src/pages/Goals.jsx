import { useState, useEffect, useCallback } from 'react'
import { Plus, Target, Trash2, ChevronDown, ChevronUp, Calendar, Trophy, X, TrendingUp } from 'lucide-react'
import { getAllGoals, createGoal, updateGoal, deleteGoal, getContributions, addContribution } from '../services/goalsService'
import { useCurrency } from '../contexts/CurrencyContext'
import { useToast } from '../context/ToastContext'

const CURRENT_YEAR = new Date().getFullYear()
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

function calcMonthlyNeeded(target, saved, deadlineMonth, deadlineYear) {
  const now = new Date()
  const deadline = new Date(deadlineYear, deadlineMonth - 1, 1)
  const diff = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth())
  const months = Math.max(diff, 1)
  return Math.ceil((target - saved) / months)
}

function Confetti() {
  return (
    <div className="flex justify-center gap-1 text-2xl animate-bounce">
      {'🎉🏆🎊✨🎉'.split('').map((c, i) => <span key={i}>{c}</span>)}
    </div>
  )
}

function ProgressBar({ pct, color = '#10b981' }) {
  return (
    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

function GoalCard({ goal, onDelete, onContribute, onExtra, onViewHistory, formatMoney }) {
  const saved = Number(goal.saved_amount ?? 0)
  const target = Number(goal.target_amount)
  const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0
  const completed = goal.completed || saved >= target

  const color = pct >= 100 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 30 ? '#f59e0b' : '#6366f1'

  const monthly = goal.deadline_month && goal.deadline_year
    ? calcMonthlyNeeded(target, saved, goal.deadline_month, goal.deadline_year)
    : null

  const deadlineLabel = goal.deadline_month && goal.deadline_year
    ? `${MONTHS[goal.deadline_month - 1]}/${goal.deadline_year}`
    : null

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${completed ? 'border-emerald-300 dark:border-emerald-600' : 'border-gray-100 dark:border-gray-700'} overflow-hidden transition-all`}>
      {completed && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 border-b border-emerald-100 dark:border-emerald-800/30">
          <Confetti />
          <p className="text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-1">Meta Conquistada! ✅</p>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{goal.emoji || '🎯'}</span>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-base">{goal.name}</h3>
              {deadlineLabel && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <Calendar size={11} />
                  Prazo: {deadlineLabel}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(goal.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600 dark:text-gray-400">
              {formatMoney(saved)} guardados
            </span>
            <span className="font-semibold" style={{ color }}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <ProgressBar pct={pct} color={color} />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>R$ 0</span>
            <span>Meta: {formatMoney(target)}</span>
          </div>
        </div>

        {!completed && monthly !== null && monthly > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl px-4 py-2.5 mb-4 border border-blue-100 dark:border-blue-800/30">
            <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <TrendingUp size={13} />
              Guardar <strong>{formatMoney(monthly)}/mês</strong> para atingir até {deadlineLabel}
            </p>
          </div>
        )}

        {!completed && (
          <div className="flex gap-2">
            <button
              onClick={() => onContribute(goal)}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              💰 Guardar agora
            </button>
            <button
              onClick={() => onExtra(goal)}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              ➕ Aporte extra
            </button>
          </div>
        )}

        <button
          onClick={() => onViewHistory(goal)}
          className="w-full mt-2 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-1"
        >
          Ver histórico
        </button>
      </div>
    </div>
  )
}

function ContributeModal({ goal, type, onClose, onConfirm, formatMoney }) {
  const target = Number(goal.target_amount)
  const saved = Number(goal.saved_amount ?? 0)
  const monthly = goal.deadline_month && goal.deadline_year
    ? calcMonthlyNeeded(target, saved, goal.deadline_month, goal.deadline_year)
    : Math.ceil((target - saved) / 12)
  const suggested = type === 'monthly' ? monthly : ''

  const [amount, setAmount] = useState(suggested > 0 ? String(suggested) : '')
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {type === 'monthly' ? '💰 Guardar agora' : '➕ Aporte extra'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Meta: <strong className="text-gray-800 dark:text-white">{goal.emoji} {goal.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {type === 'monthly' && monthly > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sugestão: {formatMoney(monthly)}/mês</p>
            )}
          </div>
          {type === 'extra' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Bônus de dezembro"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t dark:border-gray-700 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium">
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(Number(amount), note, type)}
              disabled={!amount || Number(amount) <= 0}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryModal({ goal, contributions, onClose, formatMoney }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {goal.emoji} Histórico — {goal.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {contributions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <TrendingUp size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum aporte registrado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      {c.type === 'monthly' ? '💰 Aporte mensal' : '➕ Aporte extra'}
                    </p>
                    {c.note && <p className="text-xs text-gray-500 dark:text-gray-400">{c.note}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(c.contributed_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(c.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t dark:border-gray-700 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button onClick={onClose} className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [contributeModal, setContributeModal] = useState(null) // { goal, type }
  const [historyModal, setHistoryModal] = useState(null) // { goal, contributions }
  const [contributions, setContributions] = useState({})

  const [formName, setFormName] = useState('')
  const [formEmoji, setFormEmoji] = useState('🎯')
  const [formTarget, setFormTarget] = useState('')
  const [formDeadlineMonth, setFormDeadlineMonth] = useState(String(new Date().getMonth() + 1))
  const [formDeadlineYear, setFormDeadlineYear] = useState(String(new Date().getFullYear() + 1))
  const [saving, setSaving] = useState(false)

  const { formatMoney } = useCurrency()
  const { addToast } = useToast()

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getAllGoals()
    if (!error) setGoals(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const handleCreateGoal = async () => {
    if (!formName.trim() || !formTarget || Number(formTarget) <= 0) {
      addToast('Preencha nome e valor da meta', 'warning')
      return
    }
    setSaving(true)
    const { error } = await createGoal({
      name: formName.trim(),
      emoji: formEmoji,
      target_amount: Number(formTarget),
      deadline_month: Number(formDeadlineMonth),
      deadline_year: Number(formDeadlineYear),
      saved_amount: 0,
      completed: false
    })
    setSaving(false)
    if (error) {
      addToast('Erro ao criar meta: ' + error.message, 'error')
    } else {
      addToast('Meta criada!', 'success')
      setShowNewGoal(false)
      setFormName('')
      setFormEmoji('🎯')
      setFormTarget('')
      fetchGoals()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta meta?')) return
    const { error } = await deleteGoal(id)
    if (error) {
      addToast('Erro ao excluir meta', 'error')
    } else {
      addToast('Meta excluída', 'success')
      fetchGoals()
    }
  }

  const handleContribute = async (amount, note, type) => {
    const goal = contributeModal.goal
    const { error } = await addContribution({
      goal_id: goal.id,
      amount,
      type,
      note: note || null,
    })
    if (error) {
      addToast('Erro ao registrar aporte: ' + error.message, 'error')
      return
    }
    const newSaved = Number(goal.saved_amount ?? 0) + amount
    const completed = newSaved >= Number(goal.target_amount)
    await updateGoal(goal.id, { saved_amount: newSaved, completed })
    addToast('Aporte registrado!', 'success')
    setContributeModal(null)
    fetchGoals()
  }

  const handleViewHistory = async (goal) => {
    const { data } = await getContributions(goal.id)
    setHistoryModal({ goal, contributions: data || [] })
  }

  const EMOJI_OPTIONS = ['🎯','🚗','🏠','✈️','💻','📱','🎓','💍','🌴','⛵','🏋️','🎸','📚','🐶','👶','🛋️','🎮','💰']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-6 pt-8 pb-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-16 -left-8 w-32 h-32 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Target size={28} />
            <h1 className="text-2xl font-bold">Minhas Metas</h1>
          </div>
          <p className="text-white/70 text-sm">Defina e acompanhe seus objetivos financeiros</p>
        </div>
      </div>

      <div className="px-6 py-6 -mt-2 space-y-4">
        {/* Botão nova meta */}
        <button
          onClick={() => setShowNewGoal(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-500 hover:bg-violet-600 text-white rounded-2xl font-semibold shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.01]"
        >
          <Plus size={20} />
          Nova meta
        </button>

        {/* Lista de metas */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-3" />
            Carregando metas...
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <Target size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-1">Nenhuma meta ainda</p>
            <p className="text-sm">Crie sua primeira meta financeira</p>
          </div>
        ) : (
          goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleDelete}
              onContribute={(g) => setContributeModal({ goal: g, type: 'monthly' })}
              onExtra={(g) => setContributeModal({ goal: g, type: 'extra' })}
              onViewHistory={handleViewHistory}
              formatMoney={formatMoney}
            />
          ))
        )}
      </div>

      {/* Modal nova meta */}
      {showNewGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 shrink-0">
              <h2 className="font-semibold text-gray-800 dark:text-white text-lg">Nova meta</h2>
              <button onClick={() => setShowNewGoal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => setFormEmoji(e)}
                      className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formEmoji === e ? 'ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-900/30 scale-110' : 'hover:scale-105'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome da meta</label>
                <input
                  type="text"
                  placeholder="Ex: Comprar um carro"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor necessário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formTarget}
                  onChange={e => setFormTarget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Prazo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prazo</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={formDeadlineMonth}
                    onChange={e => setFormDeadlineMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={formDeadlineYear}
                    onChange={e => setFormDeadlineYear(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t dark:border-gray-700 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewGoal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGoal}
                  disabled={saving}
                  className="flex-1 py-3 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
                >
                  {saving ? 'Salvando...' : 'Criar meta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de aporte */}
      {contributeModal && (
        <ContributeModal
          goal={contributeModal.goal}
          type={contributeModal.type}
          onClose={() => setContributeModal(null)}
          onConfirm={handleContribute}
          formatMoney={formatMoney}
        />
      )}

      {/* Modal de histórico */}
      {historyModal && (
        <HistoryModal
          goal={historyModal.goal}
          contributions={historyModal.contributions}
          onClose={() => setHistoryModal(null)}
          formatMoney={formatMoney}
        />
      )}
    </div>
  )
}
