import { useState, useEffect, useRef } from 'react'

const CATEGORIES = [
  'Logistics',
  'Photography',
  'Graphic design',
  'Creative arts',
  'Electrician',
  'Plumber',
  'Painter',
  'Carpenter',
  'Catering',
  'Cleaning Services',
  'Events',
  'Fashion designing',
  'Repairs',
  'Hairstylist',
  'Other',
]

const STEPS = [
  {
    id: 'businessName',
    bot: "Hi! I'll help you set up your vendor profile. What's your business name?",
    inputType: 'text',
    placeholder: 'e.g. Adeola Kitchens',
  },
  {
    id: 'category',
    bot: 'Which category best fits your business?',
    inputType: 'choice',
    options: CATEGORIES,
  },
  {
    id: 'description',
    bot: "In a few sentences, describe what you offer and who you typically work with.",
    inputType: 'text',
    placeholder: 'e.g. We provide office catering for 20–80 people...',
  },
  {
    id: 'phone',
    bot: "What's the best phone number for customers to reach you?",
    inputType: 'text',
    placeholder: '+234 800 000 0000',
  },
  {
    id: 'whatsapp',
    bot: 'Do you have a WhatsApp business link? You can paste it here or type "skip".',
    inputType: 'text',
    placeholder: 'https://wa.me/... or skip',
  },
  {
    id: 'address',
    bot: "Where are you based? (City and area is fine.)",
    inputType: 'text',
    placeholder: 'e.g. Lagos, Nigeria',
  },
  {
    id: 'location',
    bot: "Want to show your location on the map? Send latitude,longitude (e.g. 6.5244,3.3792) or type \"skip\".",
    inputType: 'text',
    placeholder: '6.5244, 3.3792 or skip',
  },
  {
    id: 'done',
    bot: "You're all set! I'll take you to your profile so you can review and save. You can edit anything there.",
    inputType: 'none',
  },
]

function parseLocationInput(value) {
  const v = (value || '').trim().toLowerCase()
  if (v === 'skip' || !v) return { latitude: '', longitude: '' }
  const parts = v.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const lat = Number(parts[0])
    const lng = Number(parts[1])
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { latitude: String(lat), longitude: String(lng) }
    }
  }
  return { latitude: '', longitude: '' }
}

export function OnboardingChatbot({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const completedRef = useRef(false)

  const step = STEPS[stepIndex]
  const isChoice = step?.inputType === 'choice'
  const isDone = step?.id === 'done'

  useEffect(() => {
    if (!step) return
    setMessages((prev) => [...prev, { role: 'bot', text: step.bot }])
  }, [stepIndex])  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isDone && !completedRef.current) {
      completedRef.current = true
      const prefilled = {
        businessName: answers.businessName ?? '',
        category: answers.category ?? '',
        description: answers.description ?? '',
        phone: answers.phone ?? '',
        whatsapp: answers.whatsapp === 'skip' || !answers.whatsapp ? '' : (answers.whatsapp ?? ''),
        address: answers.address ?? '',
        latitude: answers.latitude ?? '',
        longitude: answers.longitude ?? '',
      }
      onComplete(prefilled)
      return
    }
    if (!isDone) inputRef.current?.focus()
  }, [isDone, answers, onComplete])

  const sendReply = (value) => {
    if (step?.id === 'done') return
    const trimmed = typeof value === 'string' ? value.trim() : value
    if (step?.id === 'whatsapp' && (trimmed === '' || trimmed.toLowerCase() === 'skip')) {
      setAnswers((a) => ({ ...a, whatsapp: '' }))
      setMessages((m) => [...m, { role: 'user', text: 'Skip' }])
      setStepIndex((i) => i + 1)
      setInputValue('')
      return
    }
    if (step?.id === 'location') {
      const { latitude, longitude } = parseLocationInput(trimmed)
      setAnswers((a) => ({ ...a, latitude, longitude }))
      setMessages((m) => [...m, { role: 'user', text: trimmed.toLowerCase() === 'skip' ? 'Skip' : `${latitude}, ${longitude}` }])
      setStepIndex((i) => i + 1)
      setInputValue('')
      return
    }
    if (!trimmed && step?.inputType === 'text') return
    setAnswers((a) => ({ ...a, [step.id]: trimmed }))
    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    setStepIndex((i) => i + 1)
    setInputValue('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendReply(inputValue)
  }

  if (isDone) {
    return (
      <div className="onboarding-chat">
        <div className="onboarding-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble chat-bubble-${msg.role}`}>
              {msg.role === 'bot' && <div className="chat-bubble-avatar" aria-hidden>AC</div>}
              <div className="chat-bubble-content">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="onboarding-chat-status">Taking you to your profile…</div>
      </div>
    )
  }

  return (
    <div className="onboarding-chat">
      <div className="onboarding-chat-progress">
        <span className="onboarding-chat-progress-text">
          Step {stepIndex + 1} of {STEPS.length}
        </span>
        <div className="onboarding-chat-progress-bar">
          <div
            className="onboarding-chat-progress-fill"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="onboarding-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble chat-bubble-${msg.role}`}>
            {msg.role === 'bot' && <div className="chat-bubble-avatar" aria-hidden>AC</div>}
            <div className="chat-bubble-content">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="onboarding-chat-input-wrap" onSubmit={handleSubmit}>
        {isChoice ? (
          <div className="chat-choices">
            {step.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="chat-choice-btn"
                onClick={() => sendReply(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="onboarding-chat-input-inner">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={step.placeholder}
              autoComplete="off"
              aria-label="Your reply"
            />
            <button type="submit" className="chat-send-btn" aria-label="Send">
              Send
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
