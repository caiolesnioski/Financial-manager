import { useState } from 'react'
import { X, Plus, Palette, Smile } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const EMOJI_LIST = [
  '🍔', '🍕', '🍎', '🥗', '☕', '🍺',
  '🚗', '🚌', '✈️', '🚕', '⛽', '🚇',
  '🏠', '🏢', '🔑', '💡', '💧', '🔥',
  '🛒', '👕', '👟', '💄', '💎', '🎁',
  '📱', '💻', '🎮', '🎬', '📚', '🎵',
  '💊', '🏥', '🩺', '💪', '🧘', '🏃',
  '🎓', '📖', '✏️', '🎨', '🌐', '💼',
  '💰', '💳', '🏦', '📈', '💵', '🪙',
  '🐕', '🐈', '🌱', '🎂', '🎉', '❤️'
]

const COLOR_LIST = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#6b7280'
]

export default function CreateCategoryModal({ isOpen, onClose, onSave, type = 'expense' }) {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [color, setColor] = useState('#10b981')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleSave = () => {
    if (!name.trim()) {
      addToast('Digite um nome para a categoria', 'warning')
      return
    }

    onSave({
      id: `custom_${Date.now()}`,
      name: name.trim(),
      emoji,
      color,
      type,
      isCustom: true
    })

    setName('')
    setEmoji('📦')
    setColor('#10b981')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Nova Categoria</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              {emoji}
            </div>
          </div>

          {/* Nome da categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da categoria
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Academia, Netflix, Pet..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoFocus
            />
          </div>

          {/* Emoji Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha um emoji
            </label>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl flex items-center justify-between hover:border-emerald-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Smile size={20} className="text-gray-400" />
                <span className="text-gray-600">Emoji selecionado:</span>
              </span>
              <span className="text-2xl">{emoji}</span>
            </button>

            {showEmojiPicker && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl border max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_LIST.map((e, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setEmoji(e)
                        setShowEmojiPicker(false)
                      }}
                      className={`text-2xl p-2 rounded-lg hover:bg-white transition-colors ${
                        emoji === e ? 'bg-emerald-100 ring-2 ring-emerald-500' : ''
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha uma cor
            </label>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl flex items-center justify-between hover:border-emerald-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Palette size={20} className="text-gray-400" />
                <span className="text-gray-600">Cor selecionada:</span>
              </span>
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: color }}
              />
            </button>

            {showColorPicker && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl border">
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_LIST.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setColor(c)
                        setShowColorPicker(false)
                      }}
                      className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                        color === c ? 'ring-4 ring-gray-300 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botoes */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Criar categoria
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
