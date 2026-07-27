'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const HIDDEN_ROUTES = ['/login', '/signup']

type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
  source?: string
}

export function ChatbotWidget() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! Ask questions about our website, features, pricing, services, or support.',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (HIDDEN_ROUTES.includes(pathname)) return
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false))
  }, [pathname])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  if (HIDDEN_ROUTES.includes(pathname) || isAuthenticated !== true) {
    return null
  }

  const handleOpen = () => {
    setOpen(true)
    setError(null)
  }

  const handleClose = () => {
    setOpen(false)
    setInput('')
    setError(null)
  }

  const handleLogin = () => {
    router.push('/login')
  }

  const handleSignup = () => {
    router.push('/signup')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const question = input.trim()
    if (!question) return

    if (isAuthenticated !== true) {
      setError('Please log in to use the AI assistant.')
      return
    }

    setError(null)
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')

    try {
      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: messages }),
      })

      if (response.status === 401) {
        setError('Please log in to use the AI assistant.')
        setLoading(false)
        return
      }

      const data = await response.json()
      const answer = data?.answer || "I couldn't find that information on our website. Please contact support for more details."
      setMessages((prev) => [...prev, { role: 'assistant', text: answer, source: data?.source }])
    } catch (err) {
      setError('Unable to get a response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open AI Assistant"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-[#7C3AED] to-[#22D3EE] text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute right-6 bottom-6 left-6 top-6 flex items-end justify-center md:items-center md:justify-end"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="relative w-full max-w-[400px] rounded-[32px] border border-white/10 bg-[#0b1120]/95 p-5 shadow-[0_48px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--text-muted)] transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22D3EE] text-white shadow-lg shadow-[#22d3ee]/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">Ask AI Assistant</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Ask questions about our website, services, pricing, features, and support.
                    </p>
                  </div>
                </div>

                <div className="mt-5 max-h-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
                  <div className="max-h-[340px] space-y-3 overflow-y-auto px-4 py-4 text-sm text-white">
                    {messages.map((message, index) => (
                      <div key={index} className={`rounded-3xl px-4 py-3 ${message.role === 'user' ? 'bg-white/10 self-end text-white' : 'bg-white/5 text-[var(--text-muted)]'}`}>
                        <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[var(--text-faint)]">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </div>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        {message.source ? (
                          <p className="mt-2 text-[10px] text-[var(--text-muted)]">Source: {message.source}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                  {error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {error}
                    </div>
                  ) : null}

                  {isAuthenticated !== true ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--text-muted)]">
                        Please log in to access the AI assistant and get answers from the website content.
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleLogin}
                          className="rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFC857] px-4 py-3 text-sm font-semibold text-[#05060B]"
                        >
                          Login
                        </button>
                        <button
                          type="button"
                          onClick={handleSignup}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                        >
                          Sign Up
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Type your question..."
                        className="min-h-[3rem] flex-1 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--text-muted)] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-3xl bg-[var(--accent-cyan)] px-4 py-3 text-sm font-semibold text-[#05060B] transition hover:bg-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
