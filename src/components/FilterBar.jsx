import { CATEGORIES } from '../db.js'

export default function FilterBar({ filters, onChange }) {
  function set(key, value) {
    onChange(prev => ({ ...prev, [key]: value }))
  }

  function clearAll() {
    onChange({ category: '', dateFrom: '', dateTo: '', search: '' })
  }

  const hasFilters = filters.category || filters.dateFrom || filters.dateTo || filters.search

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
      <div className="relative">
        <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search description or merchant…"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={filters.category}
          onChange={e => set('category', e.target.value)}
          className="flex-1 min-w-[130px] text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => set('dateFrom', e.target.value)}
          className="flex-1 min-w-[130px] text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="From date"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={e => set('dateTo', e.target.value)}
          className="flex-1 min-w-[130px] text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="To date"
        />

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
