import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-server'
import websiteData from '@/website-data.json'
import { appendFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.question !== 'string' || !body.question.trim()) {
    return NextResponse.json({ error: 'Question is required.' }, { status: 400 })
  }

  const question = body.question.trim()
  const history = Array.isArray(body.history) ? body.history : []
  const result = generateAnswer(question, history, websiteData)

  if (!result.answer) {
    logUnansweredQuestion(question, history)
    return NextResponse.json({
      answer:
        "I couldn't find specific information about that on our website. Please contact our support team for further assistance.",
      source: result.source || 'website content',
    })
  }

  return NextResponse.json({ answer: result.answer, source: result.source })
}

function generateAnswer(question: string, history: Array<{ role: string; text: string }>, knowledge: any) {
  const text = [question, ...history.slice(-2).map((message) => message.text)].join(' ').toLowerCase()
  const terms = Array.from(new Set(text.match(/\w+/g) || [])).filter((term) => term.length > 1)

  const contactKeywords = ['contact', 'email', 'phone', 'address', 'reach', 'support']
  const pricingKeywords = ['pricing', 'price', 'cost', 'plan', 'package', 'quote']
  const serviceKeywords = ['service', 'services', 'offer', 'module', 'modules', 'feature', 'features']

  if (pricingKeywords.some((key) => terms.includes(key))) {
    return { answer: summarizePricing(knowledge), source: 'Home pricing section' }
  }

  if (contactKeywords.some((key) => terms.includes(key))) {
    return { answer: summarizeContact(knowledge.contact), source: 'Contact section' }
  }

  if (serviceKeywords.some((key) => terms.includes(key))) {
    return { answer: summarizeModules(knowledge), source: 'Platform overview' }
  }

  const faqMatch = findFaqMatch(text, knowledge.faqs)
  if (faqMatch) {
    return { answer: `${faqMatch.question} ${faqMatch.answer}`, source: 'FAQ section' }
  }

  const pageMatch = findPageMatch(text, terms, knowledge.pages)
  if (pageMatch) {
    return pageMatch
  }

  const moduleMatch = findModuleMatch(text, knowledge)
  if (moduleMatch) {
    return moduleMatch
  }

  const contact = knowledge.contact
  if (text.includes('company') || text.includes('about') || text.includes('what is accountin')) {
    return {
      answer: `AccountIn is ${knowledge.pages[0]?.sections?.find((section: any) => section.type === 'hero')?.description || 'an institution-focused simulation platform.'}`,
      source: 'Home hero section',
    }
  }

  return { answer: '', source: 'Unknown' }
}

function summarizePricing(knowledge: any) {
  const pricingSection = knowledge.pages
    .find((page: any) => page.page === 'Home')
    ?.sections?.find((section: any) => section.type === 'pricing')

  if (!pricingSection?.plans?.length) {
    return 'Pricing information is available on the website, but I could not load it right now.'
  }

  const lines = pricingSection.plans.map(
    (plan: any) => `- ${plan.name}: ${plan.description} (${plan.price}). Includes ${plan.features.join(', ')}.`
  )

  return `AccountIn offers flexible plans based on institution size and modules. ${pricingSection.description}
${lines.join('\n')}
Contact the team to request a quote or ask for a custom package.`
}

function summarizeContact(contact: any) {
  if (!contact) {
    return 'Contact information is not available at the moment.'
  }

  return `You can contact AccountIn at ${contact.email} or ${contact.phone}. The office address is ${contact.address}. ${contact.description}`
}

function summarizeModules(knowledge: any) {
  const modules = knowledge.pages
    .find((page: any) => page.page === 'Home')
    ?.sections?.find((section: any) => section.type === 'platformOverview')?.modules

  if (!modules?.length) {
    return 'AccountIn offers a set of practical GST, TDS, Income Tax, Payroll, EPFO, Accounting, Corporate Tax, and UAE VAT simulations.'
  }

  const names = modules.map((module: any) => module.title)
  return `AccountIn provides the following simulation modules: ${names.join(', ')}. Each module includes realistic workflows, compliance steps, and portal-like interactions. For example, GST Simulation covers registration, invoicing, return filing, and reconciliation.`
}

function findFaqMatch(text: string, faqs: Array<{ question: string; answer: string }>) {
  if (!faqs?.length) return null
  const exactMatch = faqs.find(
    (faq) => faq.question.toLowerCase().includes(text) || faq.answer.toLowerCase().includes(text)
  )
  if (exactMatch) return exactMatch

  const terms = Array.from(new Set(text.match(/\w+/g) || [])).filter((term) => term.length > 1)
  return faqs.find((faq) => terms.some((term) => faq.question.toLowerCase().includes(term)))
}

function findPageMatch(text: string, terms: string[], pages: any[]) {
  if (!pages?.length) return null

  const candidates: Array<{ answer: string; score: number; source: string }> = []

  pages.forEach((page) => {
    const pageText = JSON.stringify(page).toLowerCase()
    const score = terms.reduce((sum, term) => sum + (pageText.includes(term) ? 1 : 0), 0)
    if (score > 0) {
      const interestingSections = (page.sections || [])
        .filter((section: any) => section.heading || section.type)
        .slice(0, 2)
        .map((section: any) => `${section.heading || section.type}: ${section.description || ''}`)
        .join('\n')
      const answer = `I found relevant information on the ${page.page} page. ${interestingSections}`
      candidates.push({ answer, score, source: `${page.page} page` })
    }
  })

  const best = candidates.sort((a, b) => b.score - a.score)[0]
  return best || null
}

function findModuleMatch(text: string, knowledge: any) {
  const modules = knowledge.pages
    .find((page: any) => page.page === 'Home')
    ?.sections?.find((section: any) => section.type === 'platformOverview')?.modules

  if (!modules?.length) return null

  const matched = modules.find((mod: any) => text.includes(mod.title.toLowerCase()))
  if (matched) {
    return {
      answer: `${matched.title} includes ${matched.benefits.join(', ')} and helps institutions practice ${matched.description.toLowerCase()}.`,
      source: matched.title,
    }
  }

  const terms = Array.from(new Set(text.match(/\w+/g) || [])).filter((term) => term.length > 1)
  const candidate = modules
    .map((mod: any) => ({
      module: mod,
      score: terms.reduce((sum, term) => sum + ((mod.title.toLowerCase().includes(term) || mod.description.toLowerCase().includes(term)) ? 1 : 0), 0),
    }))
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)[0]

  if (candidate?.score > 0) {
    return {
      answer: `${candidate.module.title} is described as ${candidate.module.description}. Main benefits are ${candidate.module.benefits.join(', ')}.`,
      source: candidate.module.title,
    }
  }

  return null
}

function logUnansweredQuestion(question: string, history: Array<{ role: string; text: string }>) {
  try {
    const logDir = path.join(process.cwd(), 'chatbot-logs')
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true })
    }
    const logFile = path.join(logDir, 'unanswered-questions.log')
    const entry = {
      timestamp: new Date().toISOString(),
      question,
      recentHistory: history.slice(-3),
    }
    appendFileSync(logFile, `${JSON.stringify(entry)}\n`)
  } catch {
    // Logging is best-effort only
  }
}
