import { useState, useEffect, useRef } from 'react'
import { chatbotAPI } from '../services/apiService'

export function AIChatBox() {
  const [open, setOpen] = useState(false)
  const [vendors, setVendors] = useState([])
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I can help you find a suitable service provider."
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingBlacklist, setPendingBlacklist] = useState([])
  const messagesEndRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      try {
        // For now, we'll skip loading vendors from backend since chatbotAPI will handle this
        // In a full implementation, you might want to fetch vendors separately
        setVendors([])
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading vendors:', err)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (userMessage) => {
    try {
      const data = await chatbotAPI.sendMessage({ 
        message: userMessage,
        vendors: vendors,
        chatHistory: messages
      })
      return data
    } catch (error) {
      console.error('Chatbot error:', error)
      throw error
    }
  }

  const parseBlacklistIds = (content) => {
    if (!content || typeof content !== 'string') return []
    const match = content.match(/BLACKLIST_IDS:\s*([^\n]+)/i)
    if (!match) return []
    return match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const stripBlacklistLine = (content) => {
    if (!content || typeof content !== 'string') return content
    return content.replace(/\n*BLACKLIST_IDS:\s*[^\n]+\s*/gi, '').trim()
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    
    try {
      const data = await sendMessage(text)
      const ids = parseBlacklistIds(data.reply || data.message)
      const displayContent = stripBlacklistLine(data.reply || data.message)
      setMessages((m) => [...m, { role: 'assistant', content: displayContent }])
      if (ids.length > 0) setPendingBlacklist(ids)
    } catch (err) {
      console.error('Chatbot error:', err)
      // Show friendly message instead of raw error
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Our assistant is temporarily unavailable. Please try again in a few minutes.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const confirmBlacklist = async () => {
    for (const id of pendingBlacklist) {
      try {
        // For now, we'll just log the blacklist action
        // In a full implementation, this would call an API endpoint
        console.log('Blacklisting vendor:', id)
      } catch (e) {
        console.error('Blacklist failed for', id, e)
      }
    }
    setPendingBlacklist([])
    setVendors((v) => v.filter((x) => !pendingBlacklist.includes(x.id)))
  }

  return (
    <>
      <button
        type="button"
        className="ai-chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="ai-chat-panel" ref={panelRef}>
          <div className="ai-chat-panel-header">
            <span className="ai-chat-panel-title">Ask Yello</span>
            <span className="ai-chat-panel-subtitle">What Can I Help With? </span>
          </div>
          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-chat-bubble ai-chat-bubble-${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="ai-chat-bubble ai-chat-bubble-assistant ai-chat-typing">
                <p>Thinking…</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {pendingBlacklist.length > 0 && (
            <div className="ai-chat-blacklist-bar">
              <p>AI suggests blacklisting {pendingBlacklist.length} vendor(s) for rating manipulation.</p>
              <div className="ai-chat-blacklist-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPendingBlacklist([])}>
                  Dismiss
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={confirmBlacklist}>
                  Blacklist
                </button>
              </div>
            </div>
          )}
          <form
            className="ai-chat-input-wrap"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <input
              type="text"
              className="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I need a caterer in Lagos"
              disabled={loading}
              aria-label="Message"
            />
            <button type="submit" className="ai-chat-send" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
