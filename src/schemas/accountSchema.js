import { z } from 'zod'

export const accountSchema = z.object({
  name: z
    .string({
      required_error: 'Informe o nome da conta'
    })
    .min(1, 'O nome da conta é obrigatório')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),

  type: z.enum(['checking', 'savings', 'credit', 'investment', 'cash', 'other'], {
    required_error: 'Selecione o tipo de conta',
    invalid_type_error: 'Tipo de conta inválido'
  }),

  initial_balance: z
    .number({
      invalid_type_error: 'Saldo deve ser um número'
    })
    .default(0),

  color: z
    .string()
    .optional(),

  icon: z
    .string()
    .optional(),

  is_active: z
    .boolean()
    .default(true)
})

// Schema para formulário (aceita string para saldo)
export const accountFormSchema = accountSchema.extend({
  initial_balance: z
    .string()
    .transform((val) => {
      if (!val || val === '') return 0
      return parseFloat(val.replace(',', '.'))
    })
    .refine((val) => !isNaN(val), 'Saldo inválido')
})

// Labels para tipos de conta em português
export const accountTypeLabels = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit: 'Cartão de Crédito',
  investment: 'Investimento',
  cash: 'Dinheiro',
  other: 'Outro'
}
