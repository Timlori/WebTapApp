import { db, getCategoryMeta } from '../db.js'
import { useState } from 'react'

export default function ExportButton({ filters }) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const all = await db.receipts.orderBy('date').toArray()
      const filtered = all.filter(r => applyFilters(r, filters))

      if (filtered.length === 0) {
        alert('No receipts to export with current filters.')
        return
      }

      const rows = [
        ['Date', 'Merchant', 'Category', 'Amount', 'Description'],
        ...filtered.map(r => [
          r.date || '',
          escapeCSV(r.merchant || ''),
          getCategoryMeta(r.category).label,
          parseFloat(r.amount || 0).toFixed(2),
          escapeCSV(r.description || ''),
        ]),
      ]

      // Add totals by category
      rows.push([])
      rows.push(['--- Summary by Category ---'])
      const byCategory = {}
      filtered.forEach(r => {
        const cat = getCategoryMeta(r.category).label
        byCategory[cat] = (byCategory[cat] || 0) + parseFloat(r.amount || 0)
      })
      Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, total]) => {
          rows.push([cat, '', '', total.toFixed(2)])
        })

      const total = filtered.reduce((s, r) => s + parseFloat(r.amount || 0), 0)
      rows.push([])
      rows.push(['TOTAL', '', '', total.toFixed(2)])

      const csv = rows.map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipts-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      title="Export CSV"
      className="flex items-center gap-1.5 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {exporting ? 'Exporting…' : 'CSV'}
    </button>
  )
}

function escapeCSV(str) {
  if (!str) return ''
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function applyFilters(r, filters) {
  if (filters.category && r.category !== filters.category) return false
  if (filters.dateFrom && r.date < filters.dateFrom) return false
  if (filters.dateTo && r.date > filters.dateTo) return false
  if (filters.search) {
    const q = filters.search.toLowerCase()
    if (!r.description?.toLowerCase().includes(q) && !r.merchant?.toLowerCase().includes(q)) return false
  }
  return true
}
