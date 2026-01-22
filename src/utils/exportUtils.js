import Papa from 'papaparse'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Formata valor monetário para padrão brasileiro
 * @param {number} value - Valor numérico
 * @returns {string} - Valor formatado (R$ 1.234,56)
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

/**
 * Formata data para padrão brasileiro
 * @param {string} dateStr - Data em formato ISO ou YYYY-MM-DD
 * @returns {string} - Data formatada (dd/mm/yyyy)
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Exporta dados para CSV e inicia download
 * @param {Array<Object>} data - Array de objetos para exportar
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Object} options - Opções de configuração
 * @param {Object} options.headers - Mapeamento de campos para headers em português
 * @param {Object} options.formatters - Funções de formatação por campo
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function exportToCSV(data, filename, options = {}) {
  try {
    if (!data || data.length === 0) {
      return { success: false, error: 'Nenhum dado para exportar' }
    }

    const {
      headers = {},
      formatters = {}
    } = options

    // Aplica formatadores e renomeia campos
    const formattedData = data.map(item => {
      const newItem = {}
      Object.keys(item).forEach(key => {
        const headerName = headers[key] || key
        const formatter = formatters[key]
        newItem[headerName] = formatter ? formatter(item[key], item) : item[key]
      })
      return newItem
    })

    // Gera CSV com papaparse
    const csv = Papa.unparse(formattedData, {
      delimiter: ';', // Melhor compatibilidade com Excel BR
      quotes: true
    })

    // Adiciona BOM para UTF-8 (corrige caracteres especiais no Excel)
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })

    // Cria link e inicia download
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('Erro ao exportar CSV:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Captura elemento HTML e exporta como PDF
 * @param {string} elementId - ID do elemento a capturar
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Object} options - Opções de configuração
 * @param {string} options.title - Título do PDF
 * @param {string} options.orientation - 'portrait' ou 'landscape'
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function exportToPDF(elementId, filename, options = {}) {
  try {
    const element = document.getElementById(elementId)

    if (!element) {
      return { success: false, error: 'Elemento não encontrado' }
    }

    const {
      title = 'Relatório Financeiro',
      orientation = 'portrait'
    } = options

    // Captura elemento como canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Melhor qualidade
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Configura PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10

    // Calcula dimensões proporcionais
    const availableWidth = pageWidth - (margin * 2)
    const ratio = availableWidth / imgWidth
    const scaledHeight = imgHeight * ratio

    // Adiciona título
    pdf.setFontSize(16)
    pdf.setTextColor(16, 185, 129) // Emerald-500
    pdf.text(title, margin, margin + 5)

    // Adiciona data de geração
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, margin + 12)

    // Posição inicial da imagem
    let yPosition = margin + 18
    let remainingHeight = scaledHeight

    // Adiciona imagem (pode precisar de múltiplas páginas)
    while (remainingHeight > 0) {
      const availablePageHeight = pageHeight - yPosition - margin

      if (remainingHeight <= availablePageHeight) {
        // Cabe na página atual
        pdf.addImage(imgData, 'PNG', margin, yPosition, availableWidth, scaledHeight)
        remainingHeight = 0
      } else {
        // Precisa dividir em páginas
        const visibleHeight = availablePageHeight
        pdf.addImage(imgData, 'PNG', margin, yPosition, availableWidth, scaledHeight)
        pdf.addPage()
        yPosition = margin
        remainingHeight -= visibleHeight
      }
    }

    // Salva PDF
    pdf.save(`${filename}.pdf`)

    return { success: true }
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Prepara dados de lançamentos para exportação CSV
 * @param {Array} entries - Array de lançamentos
 * @param {Array} accounts - Array de contas (para lookup de nomes)
 * @returns {Array} - Dados formatados para CSV
 */
export function prepareEntriesForExport(entries, accounts = []) {
  const accountMap = new Map(accounts.map(a => [a.id, a.name]))

  return entries.map(entry => ({
    data: formatDate(entry.date),
    descricao: entry.description || '',
    tipo: entry.type === 'income' ? 'Receita' : entry.type === 'expense' ? 'Despesa' : 'Transferência',
    categoria: entry.category || '',
    valor: formatCurrency(entry.value),
    conta: accountMap.get(entry.account) || accountMap.get(entry.account_id) || ''
  }))
}

/**
 * Headers em português para exportação de lançamentos
 */
export const entryExportHeaders = {
  data: 'Data',
  descricao: 'Descrição',
  tipo: 'Tipo',
  categoria: 'Categoria',
  valor: 'Valor',
  conta: 'Conta'
}
