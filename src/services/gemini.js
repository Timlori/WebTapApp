import { GoogleGenerativeAI } from '@google/generative-ai'
import { CATEGORIES } from '../db.js'

const CATEGORY_VALUES = CATEGORIES.map(c => c.value).join(', ')

export async function extractReceiptData(imageDataUrl, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const base64 = imageDataUrl.split(',')[1]
  const mimeType = imageDataUrl.split(';')[0].split(':')[1] || 'image/jpeg'

  const prompt = `Analyze this receipt image and extract data. Return a JSON object with exactly these keys:
- merchant: string (store/business name, or "" if not visible)
- amount: number (final total, 0 if not found)
- date: string (YYYY-MM-DD format, or "" if not visible)
- category: string (pick one from: ${CATEGORY_VALUES})
- description: string (short summary of items, or "" if not visible)`

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { data: base64, mimeType } },
  ])

  const text = result.response.text().trim()
  const data = JSON.parse(text)

  if (!CATEGORIES.find(c => c.value === data.category)) {
    data.category = 'other'
  }

  return data
}
