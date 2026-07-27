"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ExternalLink, Send, ChevronRight, CheckCircle2,
  Circle, List, HelpCircle, RefreshCw, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Props {
  courseId: string
  courseName: string
  /** Supplied automatically if you embed this component server-side via session */
  prefillStudentName?: string
}

interface SessionState {
  currentTaskId: string
  currentIndex: number
  totalTasks: number
  completedCount: number
  completedTaskIds: string[]
  currentTask?: {
    task_id: string
    course_name: string
    portal_name: string
    portal_url: string
    module: string
    duration: number
  }
  portalUrl?: string
  portalName?: string
  taskChanged?: boolean
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const QUICK_ACTIONS = [
  { label: "I need a hint", icon: HelpCircle },
  { label: "I completed the task", icon: CheckCircle2 },
  { label: "Show task list", icon: List },
  { label: "Next task", icon: ChevronRight },
  { label: "Show progress", icon: RefreshCw },
]

export default function AssessmentPage({ courseId, courseName, prefillStudentName }: Props) {
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [session, setSession] = useState<SessionState | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Format assistant markdown (minimal) ──────────────────────────────────────
  function renderMarkdown(text: string) {
    // Bold
    let html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted rounded px-1 text-xs font-mono">$1</code>')
    // Links
    html = html.replace(
      /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:no-underline">$1 ↗</a>'
    )
    // Tables (basic)
    if (html.includes("|")) {
      html = html.replace(/^\|(.+)\|$/gm, (row) => {
        if (/^[\s|:-]+$/.test(row)) return "" // separator row
        const cells = row.split("|").filter((c) => c.trim())
        return "<tr>" + cells.map((c) => `<td class="border border-border px-2 py-1 text-xs">${c.trim()}</td>`).join("") + "</tr>"
      })
      if (html.includes("<tr>")) {
        html = `<table class="w-full border-collapse my-2">${html}</table>`
      }
    }
    // Headings
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-4 mb-1">$1</h2>')
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/40 pl-3 text-muted-foreground text-xs italic my-1">$1</blockquote>')
    // Line breaks
    html = html.replace(/\n/g, "<br/>")
    return html
  }

  // ── Start session ─────────────────────────────────────────────────────────────
  async function startSimulation() {
    setLoading(true)
    try {
      const res = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to start")

      setMessages([{ role: "assistant", content: data.reply }])
      setSession(data.session)
      setStarted(true)

      // Open portal in new tab
      if (data.session?.portalUrl) {
        window.open(data.session.portalUrl, "_blank", "noopener,noreferrer")
      }
    } catch (err: any) {
      toast({ title: "Failed to start simulation", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // ── Send a message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setMessages((prev) => [...prev, { role: "user", content: trimmed }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/assessment/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, message: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to send")

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
      setSession(data.session)

      // Auto-open portal when task changes
      if (data.session?.taskChanged && data.session?.portalUrl) {
        window.open(data.session.portalUrl, "_blank", "noopener,noreferrer")
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [courseId, loading])

  // ── Landing screen ────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white shadow-lg p-8 dark:border-neutral-800 dark:bg-neutral-950 space-y-6 text-center">
          <div className="text-5xl">📋</div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{courseName}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              5 practical tasks · Real government portals · Login credentials provided
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
            Clicking <strong>Start</strong> will open the government portal in a new tab with your login credentials.
            Complete the filing there, then return here to continue.
          </div>
          <Button
            onClick={startSimulation}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 py-5 text-base rounded-2xl"
          >
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</>
              : "🚀 Start Simulation"
            }
          </Button>
        </div>
      </div>
    )
  }

  // ── Chat screen ───────────────────────────────────────────────────────────────
  const progress = session ? (session.completedCount / session.totalTasks) * 100 : 0

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto rounded-3xl border border-neutral-200 overflow-hidden dark:border-neutral-800">
      {/* Header */}
      <div className="bg-primary px-5 py-3 text-white flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h1 className="font-bold text-sm truncate">{courseName}</h1>
          {session?.currentTask && (
            <p className="text-xs text-white/70 truncate">{session.currentTask.module}</p>
          )}
        </div>
        {session && (
          <div className="text-right text-xs shrink-0">
            <div className="font-semibold">Task {session.currentIndex + 1} / {session.totalTasks}</div>
            <div className="text-white/70">{session.completedCount} completed</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-primary/20 shrink-0">
        <div
          className="h-1 bg-green-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Portal banner */}
      {session?.currentTask?.portal_url && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center justify-between text-xs shrink-0 dark:bg-amber-950/20 dark:border-amber-900/40">
          <span className="text-amber-700 dark:text-amber-400">
            🌐 Portal: <span className="font-medium">{session.currentTask.portal_name}</span>
          </span>
          <a
            href={session.currentTask.portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-amber-600 font-semibold hover:underline dark:text-amber-400"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-1 mr-2">
                AI
              </div>
            )}
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-slate-100 text-foreground rounded-bl-none dark:bg-neutral-900"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  className="prose-sm"
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-muted-foreground flex items-center gap-2 dark:bg-neutral-900">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="px-5 py-2 flex gap-2 flex-wrap border-t border-neutral-100 dark:border-neutral-800 shrink-0">
        {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => sendMessage(label)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-primary/10 hover:text-primary disabled:opacity-40 text-muted-foreground px-3 py-1.5 rounded-full transition border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700"
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-neutral-200 flex gap-3 shrink-0 dark:border-neutral-800">
        <input
          ref={inputRef}
          className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-slate-100"
          placeholder="Ask for help, paste your ARN / Reference number, or type 'next'…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
          disabled={loading}
          autoFocus
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-xl px-5"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
