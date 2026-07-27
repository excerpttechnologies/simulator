"use client"

import { motion } from "framer-motion"
import { Sparkles, MessageSquare, Target, TrendingUp, Lightbulb, Zap } from "lucide-react"

const aiFeatures = [
  {
    icon: MessageSquare,
    title: "Smart Doubt Resolution",
    description: "AI chatbot answers tax queries instantly with references to actual GST/TDS rules and circulars.",
  },
  {
    icon: Target,
    title: "Adaptive Learning Paths",
    description: "Personalized curriculum that adapts to each student's pace and identifies knowledge gaps.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "Forecast student performance and intervene early to prevent dropouts.",
  },
  {
    icon: Lightbulb,
    title: "Intelligent Hints",
    description: "Context-aware hints during simulations without giving away answers directly.",
  },
  {
    icon: Zap,
    title: "Auto Error Analysis",
    description: "Categorize and explain common mistakes to help students learn from errors.",
  },
]

export function AIFeatures() {
  return (
    <section id="ai-features" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Intelligence that enhances learning outcomes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Our AI doesn&apos;t just automate - it understands tax concepts deeply and helps 
              students grasp complex regulations through intelligent interactions.
            </p>

            <div className="mt-10 space-y-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: AI Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl opacity-50" />
            <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              {/* Chat Header */}
              <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Accountin AI</div>
                  <div className="text-xs text-muted-foreground">Always online</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 bg-background min-h-[320px]">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm">
                    What is the time limit for filing GSTR-1?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm bg-muted text-foreground text-sm space-y-2">
                    <p>GSTR-1 must be filed by the <strong>11th of the following month</strong> for monthly filers.</p>
                    <p className="text-muted-foreground text-xs">For quarterly filers under QRMP scheme, it&apos;s due by the 13th of the month following the quarter.</p>
                    <div className="pt-2 border-t border-border mt-2">
                      <span className="text-xs text-primary">Source: CGST Rule 59</span>
                    </div>
                  </div>
                </div>

                {/* User Follow-up */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm">
                    What happens if I miss this deadline?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm bg-muted text-foreground text-sm space-y-2">
                    <p>Late filing attracts a <strong>late fee of Rs. 50/day</strong> (Rs. 25 CGST + Rs. 25 SGST) up to a maximum of Rs. 10,000.</p>
                    <p className="text-muted-foreground text-xs">For nil returns, the late fee is Rs. 20/day (Rs. 10 + Rs. 10).</p>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
