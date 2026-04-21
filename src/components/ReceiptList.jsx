import { useLiveQuery } from 'dexie-react-hooks'
import { db, getCategoryMeta } from '../db.js'
import { useState } from 'react'
import ReceiptDetail from './ReceiptDetail.jsx'

export default function ReceiptList({ filters, onEdit }) {
  const [selected, setSelected] = useState(null)

  const receipts = useLiveQuery(async () => {
    const all = await db.receipts.orderBy('date').reverse().toArray()
    return all.filter(r => applyFilters(r, filters))
  }, [filters])

  if (!receipts) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center gap-3 text-gray-400">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No receipts yet. Tap Add to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {receipts.map(receipt => (
          <ReceiptCard
            key={receipt.id}
            receipt={receipt}
            onClick={() => setSelected(receipt)}
          />
        ))}
      </div>

      {selected && (
        <ReceiptDetail
          receipt={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setSelected(null); onEdit(selected) }}
        />
      )}
    </>
  )
}

function ReceiptCard({ receipt, onClick }) {
  const cat = getCategoryMeta(receipt.category)
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition-all text-left"
    >
      {receipt.imageData ? (
        <img
          src={receipt.imageData}
          alt="receipt"
          className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-100"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-gray-900 truncate text-sm">
            {receipt.merchant || receipt.description || 'Untitled'}
          </p>
          <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
            ${parseFloat(receipt.amount || 0).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
            {cat.label}
          </span>
          <span className="text-xs text-gray-400">{formatDate(receipt.date)}</span>
        </div>
        {receipt.description && receipt.merchant && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{receipt.description}</p>
        )}
      </div>

      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
