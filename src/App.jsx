import { useState } from 'react'
import ReceiptList from './components/ReceiptList.jsx'
import AddReceiptModal from './components/AddReceiptModal.jsx'
import FilterBar from './components/FilterBar.jsx'
import ExportButton from './components/ExportButton.jsx'
import Stats from './components/Stats.jsx'

export default function App() {
  const [showAdd, setShowAdd] = useState(false)
  const [filters, setFilters] = useState({ category: '', dateFrom: '', dateTo: '', search: '' })
  const [editReceipt, setEditReceipt] = useState(null)

  function handleEdit(receipt) {
    setEditReceipt(receipt)
    setShowAdd(true)
  }

  function handleClose() {
    setShowAdd(false)
    setEditReceipt(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-lg font-semibold text-gray-900">Tax Receipts</h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton filters={filters} />
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Stats filters={filters} />
        <FilterBar filters={filters} onChange={setFilters} />
        <ReceiptList filters={filters} onEdit={handleEdit} />
      </main>

      {showAdd && (
        <AddReceiptModal
          onClose={handleClose}
          editReceipt={editReceipt}
        />
      )}
    </div>
  )
}
