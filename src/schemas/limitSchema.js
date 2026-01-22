import { z } from 'zod'

export const limitSchema = z.object({
  category: z
    .string({
      required_error: 'Selecione uma categoria'
    })
    .min(1, 'A categoria é obrigatória'),

  limit_value: z
    .number({
      required_error: 'Informe o valor do limite',
      invalid_type_error: 'Valor deve ser um número'
    })
    .positive('O limite deve ser maior que zero'),

  period: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    required_error: 'Selecione o período',
    invalid_type_error: 'Período inválido'
  }).default('monthly'),

  start_date: z
    .string()
    .optional(),

  end_date: z
    .string()
    .optional(),

  is_active: z
    .boolean()
    .default(true),

  alert_threshold: z
    .number()
    .min(0, 'O percentual deve ser no mínimo 0')
    .max(100, 'O percentual deve ser no máximo 100')
    .default(80)
})

// Schema para formulário (aceita string para valor)
export const limitFormSchema = limitSchema.extend({
  limit_value: z
    .string()
    .min(1, 'Informe o valor do limite')
    .transform((val) => parseFloat(val.replace(',', '.')))
    .refine((val) => !isNaN(val) && val > 0, 'O limite deve ser maior que zero'),

  alert_threshold: z
    .string()
    .transform((val) => {
      if (!val || val === '') return 80
      return parseInt(val, 10)
    })
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, 'Percentual deve estar entre 0 e 100')
})

// Labels para períodos em português
export const periodLabels = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual'
}
