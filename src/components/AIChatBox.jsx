import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { sendChat, parseBlacklistIds, stripBlacklistLine } from '../services/openai'

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
  const [loading, setLoading] = useState(false  )
  const [error, setError] = useState('')
  const [pendingBlacklist, setPendingBlacklist] = useState([])
  const messagesEndRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'vendors'))
        if (cancelled) return
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((v) => !v.blacklisted)
        setVendors(list)
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading vendors:', err)
          setError('Could not load vendors')
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError('')
    const userMsg = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    const chatHistory = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }))
    try {
      const raw = await sendChat(vendors, chatHistory)
      const ids = parseBlacklistIds(raw)
      const displayContent = stripBlacklistLine(raw)
      setMessages((m) => [...m, { role: 'assistant', content: displayContent }])
      if (ids.length > 0) setPendingBlacklist(ids)
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I could not complete that. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const confirmBlacklist = async () => {
    for (const id of pendingBlacklist) {
      try {
        await setDoc(doc(db, 'vendors', id), { blacklisted: true }, { merge: true })
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
          {error && <div className="ai-chat-error">{error}</div>}
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
