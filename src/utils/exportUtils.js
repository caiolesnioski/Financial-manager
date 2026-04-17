import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Exporta dados para CSV com cabeçalho informativo e encoding UTF-8 BOM
 */
export async function exportToCSV(data, filename, options = {}) {
  try {
    if (!data || data.length === 0) {
      return { success: false, error: 'Nenhum dado para exportar' }
    }

    const { headers = {}, formatters = {}, period = '', appName = 'Gerenciador Financeiro' } = options

    const formattedData = data.map(item => {
      const newItem = {}
      Object.keys(item).forEach(key => {
        const headerName = headers[key] || key
        const formatter = formatters[key]
        newItem[headerName] = formatter ? formatter(item[key], item) : item[key]
      })
      return newItem
    })

    const csv = Papa.unparse(formattedData, {
      delimiter: ';',
      quotes: true
    })

    const now = new Date().toLocaleDateString('pt-BR')
    const headerLines = [
      `"${appName}"`,
      period ? `"Período: ${period}"` : '',
      `"Gerado em: ${now}"`,
      `"Total de registros: ${data.length}"`,
      ''
    ].filter(Boolean).join('\r\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + headerLines + '\r\n' + csv], { type: 'text/csv;charset=utf-8;' })

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
 * Gera PDF profissional usando jspdf-autotable
 */
export async function exportToPDF(entries, filename, options = {}) {
  try {
    const {
      title = 'Relatório Financeiro',
      period = '',
      totalIncome = 0,
      totalExpenses = 0,
      balance = 0,
    } = options

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 15

    // Cabeçalho com fundo verde
    pdf.setFillColor(16, 185, 129) // emerald-500
    pdf.rect(0, 0, pageWidth, 38, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont(undefined, 'bold')
    pdf.text('Gerenciador Financeiro', margin, 14)

    pdf.setFontSize(11)
    pdf.setFont(undefined, 'normal')
    pdf.text(title, margin, 22)
    if (period) pdf.text(`Período: ${period}`, margin, 29)

    pdf.setFontSize(9)
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, 35)

    // Resumo executivo
    const summaryY = 46
    pdf.setTextColor(55, 65, 81)
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'bold')
    pdf.text('Resumo', margin, summaryY)

    const boxW = (pageWidth - margin * 2 - 8) / 3
    const summaryItems = [
      { label: 'Total Receitas', value: formatCurrency(totalIncome), color: [16, 185, 129] },
      { label: 'Total Despesas', value: formatCurrency(totalExpenses), color: [239, 68, 68] },
      { label: 'Saldo', value: formatCurrency(balance), color: balance >= 0 ? [16, 185, 129] : [239, 68, 68] },
    ]

    summaryItems.forEach((item, i) => {
      const x = margin + i * (boxW + 4)
      const y = summaryY + 4
      pdf.setFillColor(248, 250, 252)
      pdf.roundedRect(x, y, boxW, 18, 2, 2, 'F')
      pdf.setFontSize(8)
      pdf.setFont(undefined, 'normal')
      pdf.setTextColor(107, 114, 128)
      pdf.text(item.label, x + 4, y + 6)
      pdf.setFontSize(11)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(...item.color)
      pdf.text(item.value, x + 4, y + 14)
    })

    // Tabela de lançamentos
    const tableY = summaryY + 28
    pdf.setTextColor(55, 65, 81)
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'bold')
    pdf.text(`Lançamentos (${entries.length})`, margin, tableY)

    const rows = entries.map(e => [
      e.data || '',
      e.tipo || '',
      e.categoria || '',
      e.descricao || '',
      e.conta || '',
      e.valor || ''
    ])

    autoTable(pdf, {
      startY: tableY + 4,
      head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Conta', 'Valor']],
      body: rows,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: { fontSize: 8.5, textColor: [55, 65, 81] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 22 },
        2: { cellWidth: 28 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 28 },
        5: { cellWidth: 26, halign: 'right' },
      },
      didDrawPage: (data) => {
        // Rodapé em cada página
        const pageCount = pdf.internal.getNumberOfPages()
        pdf.setFontSize(8)
        pdf.setTextColor(156, 163, 175)
        pdf.setFont(undefined, 'normal')
        const pageH = pdf.internal.pageSize.getHeight()
        pdf.text(
          `Gerenciador Financeiro — ${new Date().toLocaleDateString('pt-BR')} — Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          pageH - 8,
          { align: 'center' }
        )
      }
    })

    pdf.save(`${filename}.pdf`)
    return { success: true }
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    return { success: false, error: error.message }
  }
}

export function prepareEntriesForExport(entries, accounts = []) {
  const accountMap = new Map(accounts.map(a => [a.id, a.name]))

  return entries.map(entry => ({
    data: formatDate(entry.date),
    descricao: entry.description || '',
    tipo: entry.type === 'income' ? 'Receita' : entry.type === 'expense' ? 'Despesa' : 'Transferência',
    categoria: entry.category || '',
    conta: accountMap.get(entry.account) || accountMap.get(entry.account_id) || '',
    moeda: entry.currency || 'BRL',
    valor: entry.value != null ? Number(entry.value) : 0,
  }))
}

export const entryExportHeaders = {
  data: 'Data',
  descricao: 'Descrição',
  tipo: 'Tipo',
  categoria: 'Categoria',
  conta: 'Conta',
  moeda: 'Moeda',
  valor: 'Valor',
}
