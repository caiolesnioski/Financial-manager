import { z } from 'zod'

export const entrySchema = z.object({
  type: z.enum(['income', 'expense', 'transfer'], {
    required_error: 'Selecione o tipo de lançamento',
    invalid_type_error: 'Tipo inválido'
  }),

  value: z
    .number({
      required_error: 'Informe o valor',
      invalid_type_error: 'Valor deve ser um número'
    })
    .positive('O valor deve ser maior que zero'),

  description: z
    .string({
      required_error: 'Informe a descrição'
    })
    .min(1, 'A descrição é obrigatória')
    .max(100, 'A descrição deve ter no máximo 100 caracteres'),

  category: z
    .string()
    .optional(),

  date: z
    .string({
      required_error: 'Informe a data'
    })
    .min(1, 'A data é obrigatória'),

  account: z
    .string()
    .optional(),

  // Para transferências
  originAccount: z
    .string()
    .optional(),

  destinationAccount: z
    .string()
    .optional()
}).refine(
  (data) => {
    // Se for transferência, origem e destino são obrigatórios
    if (data.type === 'transfer') {
      return data.originAccount && data.destinationAccount
    }
    return true
  },
  {
    message: 'Transferências requerem conta de origem e destino',
    path: ['originAccount']
  }
).refine(
  (data) => {
    // Se for receita ou despesa, conta é obrigatória
    if (data.type === 'income' || data.type === 'expense') {
      return data.account && data.account.length > 0
    }
    return true
  },
  {
    message: 'Selecione uma conta',
    path: ['account']
  }
).refine(
  (data) => {
    // Origem e destino não podem ser iguais em transferências
    if (data.type === 'transfer') {
      return data.originAccount !== data.destinationAccount
    }
    return true
  },
  {
    message: 'Conta de origem e destino devem ser diferentes',
    path: ['destinationAccount']
  }
)

// Schema para apenas valor (útil para validações parciais)
export const valueSchema = z
  .number()
  .positive('O valor deve ser maior que zero')

// Schema para transformar string em número
export const entryFormSchema = entrySchema.extend({
  value: z
    .string()
    .min(1, 'Informe o valor')
    .transform((val) => parseFloat(val.replace(',', '.')))
    .refine((val) => !isNaN(val) && val > 0, 'O valor deve ser maior que zero')
})
