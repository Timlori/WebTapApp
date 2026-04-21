import { CATEGORIES } from '../db.js'

const CATEGORY_VALUES = CATEGORIES.map(c => c.value).join(', ')
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-1.5-flash'

export async function extractReceiptData(imageDataUrl, apiKey) {
  const base64 = imageDataUrl.split(',')[1]
  const mimeType = imageDataUrl.split(';')[0].split(':')[1] || 'image/jpeg'

  const prompt = `Analyze this receipt image and extract data. Return a JSON object with exactly these keys:
- merchant: string (store/business name, or "" if not visible)
- amount: number (final total, 0 if not found)
- date: string (YYYY-MM-DD format, or "" if not visible)
- category: string (pick one from: ${CATEGORY_VALUES})
- description: string (short summary of items, or "" if not visible)`

  const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error?.message || `HTTP ${res.status}`)
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')

  const data = JSON.parse(text)

  if (!CATEGORIES.find(c => c.value === data.category)) {
    data.category = 'other'
  }

  return data
}
