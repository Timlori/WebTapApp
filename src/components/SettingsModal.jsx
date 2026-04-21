import { useState } from 'react'

export const GEMINI_KEY_STORAGE = 'gemini_api_key'

export function getStoredApiKey() {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || ''
}

export default function SettingsModal({ onClose }) {
  const [key, setKey] = useState(getStoredApiKey)
  const [saved, setSaved] = useState(false)
  const [show, setShow] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  function handleClear() {
    localStorage.removeItem(GEMINI_KEY_STORAGE)
    setKey('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-800 space-y-1">
            <p className="font-medium">Gemini AI — auto-fill receipts</p>
            <p className="text-indigo-600 text-xs">
              When an image is added, Gemini reads the receipt and fills in merchant, amount, date, and category for you.
              Your key is stored only in your browser.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="AIza…"
                className="w-full pr-10 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Get a free key at{' '}
              <span className="text-indigo-500 font-medium">aistudio.google.com</span>
            </p>
          </div>

          <div className="flex gap-2">
            {key && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              {saved ? '✓ Saved' : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
