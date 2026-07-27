"use client"

import Link from "next/link"
import { MessageSquare } from "lucide-react"

export function ChatbotFloating() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/chatbot"
        aria-label="Open chatbot"
        className="group inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-xl hover:scale-105 transform-gpu transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
      >
        <MessageSquare className="h-6 w-6 text-primary-foreground" />
        <span className="sr-only">Open Chatbot</span>
      </Link>
    </div>
  )
}
