import { useState, useRef, useEffect } from 'react'
import { db, CATEGORIES } from '../db.js'
import CameraCapture from './CameraCapture.jsx'
import { extractReceiptData } from '../services/gemini.js'
import { getStoredApiKey } from './SettingsModal.jsx'

const today = () => new Date().toISOString().split('T')[0]

const EMPTY_FORM = {
  merchant: '',
  amount: '',
  date: today(),
  category: 'other',
  description: '',
  imageData: null,
}

export default function AddReceiptModal({ onClose, editReceipt }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [aiFields, setAiFields] = useState(new Set())
  const fileInputRef = useRef()

  useEffect(() => {
    if (editReceipt) {
      setForm({
        merchant: editReceipt.merchant || '',
        amount: editReceipt.amount || '',
        date: editReceipt.date || today(),
        category: editReceipt.category || 'other',
        description: editReceipt.description || '',
        imageData: editReceipt.imageData || null,
      })
    }
  }, [editReceipt])

  function set(key, value) {
    setAiFields(prev => { const s = new Set(prev); s.delete(key); return s })
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function applyImage(dataUrl) {
    setForm(prev => ({ ...prev, imageData: dataUrl }))
    setExtractError(null)

    const apiKey = getStoredApiKey()
    if (!apiKey) return

    setExtracting(true)
    try {
      const data = await extractReceiptData(dataUrl, apiKey)
      const filled = new Set()

      setForm(prev => {
        const next = { ...prev, imageData: dataUrl }
        if (data.merchant) { next.merchant = data.merchant; filled.add('merchant') }
        if (data.amount) { next.amount = String(data.amount); filled.add('amount') }
        if (data.date) { next.date = data.date; filled.add('date') }
        if (data.category) { next.category = data.category; filled.add('category') }
        if (data.description) { next.description = data.description; filled.add('description') }
        return next
      })
      setAiFields(filled)
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401')) {
        setExtractError('Invalid API key — check Settings.')
      } else if (msg.includes('quota') || msg.includes('429')) {
        setExtractError('Quota exceeded. Try again later.')
      } else if (msg.includes('404') || msg.includes('not found')) {
        setExtractError('Model not found. Check your API key has Gemini access.')
      } else {
        setExtractError(msg || 'Could not read receipt.')
      }
      console.error('[Gemini]', err)
    } finally {
      setExtracting(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => applyImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.amount || isNaN(parseFloat(form.amount))) return
    setSaving(true)
    try {
      const data = {
        merchant: form.merchant.trim(),
        amount: parseFloat(form.amount),
        date: form.date,
        category: form.category,
        description: form.description.trim(),
        imageData: form.imageData,
        createdAt: editReceipt ? editReceipt.createdAt : Date.now(),
        updatedAt: Date.now(),
      }
      if (editReceipt) {
        await db.receipts.update(editReceipt.id, data)
      } else {
        await db.receipts.add(data)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const hasApiKey = !!getStoredApiKey()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900">{editReceipt ? 'Edit Receipt' : 'Add Receipt'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Image section */}
          <div>
            {form.imageData ? (
              <div className="relative">
                <img
                  src={form.imageData}
                  alt="Receipt preview"
                  className="w-full max-h-48 object-contain rounded-xl border border-gray-200"
                />
                {extracting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-indigo-700 font-medium">Reading receipt with Gemini…</p>
                  </div>
                )}
                {!extracting && extractError && (
                  <div className="absolute bottom-2 left-2 right-2 bg-red-50 border border-red-200 rounded-lg px-2 py-1 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {extractError}
                  </div>
                )}
                {!extracting && !extractError && aiFields.size > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1 text-xs text-indigo-700 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Gemini filled in {aiFields.size} field{aiFields.size !== 1 ? 's' : ''}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setForm(prev => ({ ...prev, imageData: null })); setAiFields(new Set()); setExtractError(null) }}
                  className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow text-gray-600 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="flex-1 flex flex-col items-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium">Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex flex-col items-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">Gallery</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
                {!hasApiKey && (
                  <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg py-1.5 px-2">
                    Add a Gemini API key in Settings to auto-fill from photos
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Amount *
              {aiFields.has('amount') && <AiBadge />}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${aiFields.has('amount') ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Merchant / Store
              {aiFields.has('merchant') && <AiBadge />}
            </label>
            <input
              type="text"
              value={form.merchant}
              onChange={e => set('merchant', e.target.value)}
              placeholder="e.g. Costco, Shell, Home Depot"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${aiFields.has('merchant') ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Category
              {aiFields.has('category') && <AiBadge />}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set('category', c.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    form.category === c.value
                      ? aiFields.has('category')
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                        : 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Date
              {aiFields.has('date') && <AiBadge />}
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${aiFields.has('date') ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description / Notes
              {aiFields.has('description') && <AiBadge />}
            </label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional notes about this expense…"
              rows={2}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${aiFields.has('description') ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'}`}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.amount || extracting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : editReceipt ? 'Save Changes' : 'Save Receipt'}
          </button>
        </form>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={dataUrl => { applyImage(dataUrl); setShowCamera(false) }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}

function AiBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center gap-0.5 text-indigo-600 text-[10px] font-medium bg-indigo-50 px-1.5 py-0.5 rounded-full">
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      AI
    </span>
  )
}
