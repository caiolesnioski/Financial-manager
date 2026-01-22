import {
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Zap,
  Smartphone,
  Heart,
  GraduationCap,
  Plane,
  ShoppingBag,
  Gamepad2,
  Dumbbell,
  Scissors,
  Gift,
  CreditCard,
  Wallet,
  TrendingUp,
  Briefcase,
  PiggyBank,
  DollarSign,
  Building2,
  Banknote,
  MoreHorizontal
} from 'lucide-react'

// Categorias de Despesas
export const expenseCategories = [
  { id: 'alimentacao', name: 'Alimentacao', icon: Utensils, color: '#ef4444' },
  { id: 'mercado', name: 'Mercado', icon: ShoppingCart, color: '#f97316' },
  { id: 'transporte', name: 'Transporte', icon: Car, color: '#eab308' },
  { id: 'moradia', name: 'Moradia', icon: Home, color: '#84cc16' },
  { id: 'energia', name: 'Energia/Agua', icon: Zap, color: '#22c55e' },
  { id: 'telefone', name: 'Telefone/Internet', icon: Smartphone, color: '#14b8a6' },
  { id: 'saude', name: 'Saude', icon: Heart, color: '#06b6d4' },
  { id: 'educacao', name: 'Educacao', icon: GraduationCap, color: '#0ea5e9' },
  { id: 'viagem', name: 'Viagem', icon: Plane, color: '#3b82f6' },
  { id: 'compras', name: 'Compras', icon: ShoppingBag, color: '#6366f1' },
  { id: 'lazer', name: 'Lazer', icon: Gamepad2, color: '#8b5cf6' },
  { id: 'esporte', name: 'Esporte', icon: Dumbbell, color: '#a855f7' },
  { id: 'beleza', name: 'Beleza', icon: Scissors, color: '#d946ef' },
  { id: 'presentes', name: 'Presentes', icon: Gift, color: '#ec4899' },
  { id: 'cartao', name: 'Cartao de Credito', icon: CreditCard, color: '#f43f5e' },
  { id: 'outros_despesa', name: 'Outros', icon: MoreHorizontal, color: '#6b7280' }
]

// Categorias de Receitas
export const incomeCategories = [
  { id: 'salario', name: 'Salario', icon: Wallet, color: '#10b981' },
  { id: 'investimentos', name: 'Investimentos', icon: TrendingUp, color: '#14b8a6' },
  { id: 'freelance', name: 'Freelance', icon: Briefcase, color: '#06b6d4' },
  { id: 'vendas', name: 'Vendas', icon: DollarSign, color: '#0ea5e9' },
  { id: 'aluguel', name: 'Aluguel', icon: Building2, color: '#3b82f6' },
  { id: 'bonus', name: 'Bonus', icon: Gift, color: '#6366f1' },
  { id: 'reembolso', name: 'Reembolso', icon: Banknote, color: '#8b5cf6' },
  { id: 'poupanca', name: 'Poupanca', icon: PiggyBank, color: '#a855f7' },
  { id: 'outros_receita', name: 'Outros', icon: MoreHorizontal, color: '#6b7280' }
]

// Funcao para obter todas as categorias
export const getAllCategories = () => [...expenseCategories, ...incomeCategories]

// Funcao para encontrar categoria por ID
export const getCategoryById = (id) => {
  return getAllCategories().find(cat => cat.id === id) || null
}

// Funcao para encontrar categoria por nome
export const getCategoryByName = (name) => {
  return getAllCategories().find(cat =>
    cat.name.toLowerCase() === name.toLowerCase()
  ) || null
}

// Funcao para obter categorias por tipo
export const getCategoriesByType = (type) => {
  if (type === 'expense' || type === 'despesa') return expenseCategories
  if (type === 'income' || type === 'receita') return incomeCategories
  return getAllCategories()
}
