import { useState, useEffect } from 'react'
import { expenseCategories, incomeCategories } from '../constants/categories'
import { Check, Plus } from 'lucide-react'
import CreateCategoryModal from './CreateCategoryModal'

export default function CategorySelector({ type, value, onChange }) {
  const [showModal, setShowModal] = useState(false)
  const [customCategories, setCustomCategories] = useState([])

  // Carrega categorias customizadas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customCategories')
    if (saved) {
      setCustomCategories(JSON.parse(saved))
    }
  }, [])

  const baseCategories = type === 'income' ? incomeCategories : expenseCategories
  const filteredCustom = customCategories.filter(c => c.type === type)
  const allCategories = [...baseCategories, ...filteredCustom]

  const handleSelect = (category) => {
    onChange(category.name, category)
  }

  const handleSaveCustomCategory = (newCategory) => {
    const updated = [...customCategories, newCategory]
    setCustomCategories(updated)
    localStorage.setItem('customCategories', JSON.stringify(updated))
    onChange(newCategory.name, newCategory)
  }

  const isSelected = (categoryName) => {
    return value && value.toLowerCase() === categoryName.toLowerCase()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Categoria
      </label>

      <div className="grid grid-cols-4 gap-2">
        {allCategories.map((category) => {
          const Icon = category.icon
          const selected = isSelected(category.name)
          const isCustom = category.isCustom

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(category)}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-xl
                transition-all duration-200 border-2
                ${selected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {selected && (
                <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {isCustom ? (
                  <span className="text-xl">{category.emoji}</span>
                ) : Icon ? (
                  <Icon className="w-5 h-5" style={{ color: category.color }} />
                ) : (
                  <span className="text-xl">{category.emoji || '📦'}</span>
                )}
              </div>
              <span className="text-xs text-gray-700 text-center font-medium truncate w-full">
                {category.name}
              </span>
            </button>
          )
        })}

        {/* Botao Nova Categoria */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-gray-100">
            <Plus className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 text-center font-medium">
            Nova
          </span>
        </button>
      </div>

      <CreateCategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCustomCategory}
        type={type}
      />
    </div>
  )
}
