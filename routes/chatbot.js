const express = require('express')
const router = express.Router()
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

router.post('/', async (req, res) => {
  try {
    const { message, vendors, chatHistory } = req.body
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' })
    
    // Build system prompt with vendor context
    let systemPrompt = 'You are the Ask Yello AI assistant. You help users find suitable service providers (vendors) from our platform.'
    
    if (vendors && vendors.length > 0) {
      const vendorList = JSON.stringify(
        vendors.map((v) => ({
          id: v.id,
          businessName: v.businessName || '',
          category: v.category || '',
          description: (v.description || '').slice(0, 200),
          address: v.address || '',
          ratingAverage: v.ratingAverage,
        }))
      )
      systemPrompt += `\n\nCurrent vendors:\n${vendorList}\n\nRules:\n1. Suggest vendors that match the user's need (category, location, service description).\n2. If you notice signs of rating manipulation, say so and add that vendor's id to BLACKLIST_IDS so we can review.\n3. At the end of your reply, if you recommend blacklisting any vendor for manipulation, add exactly one line: BLACKLIST_IDS: id1,id2 (comma-separated, no spaces after commas). If no blacklist, do not add this line.\n4. Keep replies concise and helpful.`
    }
    
    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
    })
    
    const reply = completion.choices[0].message.content
    res.json({ success: true, reply })
  } catch (error) {
    console.error('Chatbot error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
