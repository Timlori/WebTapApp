import Dexie from 'dexie'

export const db = new Dexie('TaxReceiptTracker')

db.version(1).stores({
  receipts: '++id, date, category, amount, createdAt',
})

export const CATEGORIES = [
  { value: 'food', label: 'Food & Meals', color: 'bg-orange-100 text-orange-800' },
  { value: 'fuel', label: 'Fuel & Transport', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'supplies', label: 'Supplies', color: 'bg-green-100 text-green-800' },
  { value: 'office', label: 'Office', color: 'bg-blue-100 text-blue-800' },
  { value: 'travel', label: 'Travel', color: 'bg-purple-100 text-purple-800' },
  { value: 'medical', label: 'Medical', color: 'bg-red-100 text-red-800' },
  { value: 'software', label: 'Software & Subscriptions', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'equipment', label: 'Equipment', color: 'bg-teal-100 text-teal-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
]

export function getCategoryMeta(value) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1]
}
