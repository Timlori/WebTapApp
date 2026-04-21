import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db.js'

export default function Stats({ filters }) {
  const receipts = useLiveQuery(async () => {
    let query = db.receipts.orderBy('date')
    const all = await query.toArray()
    return all.filter(r => applyFilters(r, filters))
  }, [filters])

  if (!receipts) return null

  const total = receipts.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const count = receipts.length

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">${total.toFixed(2)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Receipts</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
      </div>
    </div>
  )
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
