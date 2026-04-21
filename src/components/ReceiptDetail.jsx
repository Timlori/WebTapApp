import { db, getCategoryMeta } from '../db.js'
import { useState } from 'react'

export default function ReceiptDetail({ receipt, onClose, onEdit }) {
  const [deleting, setDeleting] = useState(false)
  const cat = getCategoryMeta(receipt.category)

  async function handleDelete() {
    if (!confirm('Delete this receipt?')) return
    setDeleting(true)
    await db.receipts.delete(receipt.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Receipt Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {receipt.imageData && (
            <img
              src={receipt.imageData}
              alt="Receipt"
              className="w-full rounded-xl object-contain max-h-64 border border-gray-100"
            />
          )}

          <div className="space-y-3">
            <Row label="Amount" value={`$${parseFloat(receipt.amount || 0).toFixed(2)}`} bold />
            {receipt.merchant && <Row label="Merchant" value={receipt.merchant} />}
            <Row label="Category" value={
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
                {cat.label}
              </span>
            } />
            <Row label="Date" value={formatDate(receipt.date)} />
            {receipt.description && <Row label="Description" value={receipt.description} />}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onEdit}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm text-right ${bold ? 'font-semibold text-gray-900 text-base' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
