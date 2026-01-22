import { useState, useCallback } from 'react'

/**
 * Hook reutilizável para validação de formulários com Zod
 * @param {import('zod').ZodSchema} schema - Schema Zod para validação
 * @returns {Object} - Objeto com funções e estados de validação
 */
export function useFormValidation(schema) {
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(true)

  /**
   * Valida todos os dados do formulário
   * @param {Object} data - Dados do formulário
   * @returns {{ success: boolean, data?: Object, errors?: Object }}
   */
  const validate = useCallback((data) => {
    const result = schema.safeParse(data)

    if (result.success) {
      setErrors({})
      setIsValid(true)
      return { success: true, data: result.data }
    }

    // Mapeia erros por campo
    const fieldErrors = {}
    result.error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!fieldErrors[path]) {
        fieldErrors[path] = err.message
      }
    })

    setErrors(fieldErrors)
    setIsValid(false)
    return { success: false, errors: fieldErrors }
  }, [schema])

  /**
   * Valida um único campo
   * @param {string} field - Nome do campo
   * @param {any} value - Valor do campo
   * @param {Object} allData - Todos os dados do formulário (para validações dependentes)
   * @returns {string|null} - Mensagem de erro ou null
   */
  const validateField = useCallback((field, value, allData = {}) => {
    // Cria objeto com o campo a validar
    const dataToValidate = { ...allData, [field]: value }
    const result = schema.safeParse(dataToValidate)

    if (result.success) {
      // Remove erro do campo se existir
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
      return null
    }

    // Procura erro específico do campo
    const fieldError = result.error.errors.find(
      (err) => err.path.join('.') === field
    )

    if (fieldError) {
      setErrors((prev) => ({ ...prev, [field]: fieldError.message }))
      return fieldError.message
    }

    // Remove erro se o campo não tem erro específico
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    return null
  }, [schema])

  /**
   * Obtém erro de um campo específico
   * @param {string} field - Nome do campo
   * @returns {string|undefined}
   */
  const getError = useCallback((field) => {
    return errors[field]
  }, [errors])

  /**
   * Verifica se um campo tem erro
   * @param {string} field - Nome do campo
   * @returns {boolean}
   */
  const hasError = useCallback((field) => {
    return !!errors[field]
  }, [errors])

  /**
   * Limpa todos os erros
   */
  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(true)
  }, [])

  /**
   * Limpa erro de um campo específico
   * @param {string} field - Nome do campo
   */
  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  /**
   * Define erro manualmente para um campo
   * @param {string} field - Nome do campo
   * @param {string} message - Mensagem de erro
   */
  const setFieldError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }))
    setIsValid(false)
  }, [])

  return {
    errors,
    isValid,
    validate,
    validateField,
    getError,
    hasError,
    clearErrors,
    clearFieldError,
    setFieldError
  }
}

/**
 * Componente helper para exibir erro de campo
 */
export function FieldError({ error, className = '' }) {
  if (!error) return null

  return (
    <p className={`text-sm text-red-500 mt-1 ${className}`}>
      {error}
    </p>
  )
}
