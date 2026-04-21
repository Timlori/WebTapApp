import { GoogleGenerativeAI } from '@google/generative-ai'
import { CATEGORIES } from '../db.js'

const CATEGORY_VALUES = CATEGORIES.map(c => c.value).join(', ')

export async function extractReceiptData(imageDataUrl, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const base64 = imageDataUrl.split(',')[1]
  const mimeType = imageDataUrl.split(';')[0].split(':')[1] || 'image/jpeg'

  const prompt = `Analyze this receipt image and extract information. Return ONLY valid JSON with these exact keys, no markdown, no code fences:
{
  "merchant": "the store or business name, empty string if not visible",
  "amount": 0.00,
  "date": "YYYY-MM-DD or empty string if not visible",
  "category": "best match from: ${CATEGORY_VALUES}",
  "description": "brief summary of items purchased, empty string if not visible"
}
Rules:
- amount: the final total as a number (no $ sign), 0 if not found
- date: YYYY-MM-DD format only
- Pick the single most appropriate category value from the allowed list`

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType } },
  ])

  const text = result.response.text().trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Gemini returned no JSON')
  const data = JSON.parse(jsonMatch[0])

  // Validate category is one of ours
  if (!CATEGORIES.find(c => c.value === data.category)) {
    data.category = 'other'
  }

  return data
}
