const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * Build system prompt with current vendor list for smart filtering and manipulation detection.
 * @param {Array<{id: string, businessName?: string, category?: string, description?: string, address?: string, ratingAverage?: number}>} vendors
 */
function buildSystemPrompt(vendors) {
  const list = vendors.length
    ? JSON.stringify(
        vendors.map((v) => ({
          id: v.id,
          businessName: v.businessName || '',
          category: v.category || '',
          description: (v.description || '').slice(0, 200),
          address: v.address || '',
          ratingAverage: v.ratingAverage,
        }))
      )
    : 'No vendors available yet.'
  return `You are the ArtisanConnect AI assistant. You help users find suitable service providers (vendors) from our platform.

Current vendors (never recommend blacklisted; they are already excluded from this list):
${list}

Rules:
1. Suggest vendors that match the user's need (category, location, service description).
2. If you notice signs of rating manipulation (e.g. perfect 5.0 with no variance, or unrealistic patterns), say so and add that vendor's id to BLACKLIST_IDS so we can review.
3. At the end of your reply, if you recommend blacklisting any vendor for manipulation, add exactly one line: BLACKLIST_IDS: id1,id2 (comma-separated, no spaces after commas). If no blacklist, do not add this line.
4. Keep replies concise and helpful.`
}

/**
 * Parse BLACKLIST_IDS line from assistant content. Returns array of vendor ids.
 * @param {string} content
 * @returns {string[]}
 */
export function parseBlacklistIds(content) {
  if (!content || typeof content !== 'string') return []
  const match = content.match(/BLACKLIST_IDS:\s*([^\n]+)/i)
  if (!match) return []
  return match[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Strip BLACKLIST_IDS line from content for display.
 * @param {string} content
 * @returns {string}
 */
export function stripBlacklistLine(content) {
  if (!content || typeof content !== 'string') return content
  return content.replace(/\n*BLACKLIST_IDS:\s*[^\n]+\s*/gi, '').trim()
}

/**
 * Send chat to OpenAI with vendor context. Returns assistant message content or throws.
 * @param {object[]} vendors - list of vendor objects (non-blacklisted)
 * @param {object[]} messages - [{ role: 'user'|'assistant'|'system', content: string }]
 * @returns {Promise<string>}
 */
export async function sendChat(vendors, messages) {
  if (!API_KEY) throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to .env')
  const systemPrompt = buildSystemPrompt(vendors)
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      max_tokens: 500,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || res.statusText || 'OpenAI request failed')
  }
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (content == null) throw new Error('No response from OpenAI')
  return content
}
