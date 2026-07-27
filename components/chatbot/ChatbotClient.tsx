'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

export function ChatbotClient() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hi! I can answer questions about the AccountIn website and platform. Ask me about pricing, simulations, partnership, features, or contact details.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: messages }),
      });

      if (response.status === 401) {
        setError('Please log in to use the chatbot.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      const answer = data?.answer || 'I could not generate a response right now. Please try again later.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      setError('Unable to get a response from the chatbot. Please try again.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const messageList = useMemo(
    () => messages.map((message, index) => ({ ...message, id: index })),
    [messages]
  );

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
      <div className="rounded-[2rem] border border-[var(--glass-border)] bg-[var(--bg-base)] p-6 shadow-xl shadow-black/10">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-cyan)] mb-2">Chatbot</p>
          <h1 className="text-3xl font-bold text-white">Ask about AccountIn</h1>
          <p className="mt-3 text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
            Ask questions about the website, platform features, pricing plans, partnership models, simulations, or contact details.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {messageList.map((message) => (
            <div
              key={message.id}
              className={
                message.role === 'user'
                  ? 'rounded-3xl border border-slate-700 bg-white/5 p-4 text-sm text-white self-end'
                  : 'rounded-3xl border border-slate-700 bg-slate-950/80 p-4 text-sm text-[var(--text-muted)]'
              }
            >
              <div className="font-semibold mb-2 text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">
                {message.role === 'user' ? 'You' : 'AccountIn Info'}
              </div>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about AccountIn..."
            className="min-h-[3rem] flex-1 rounded-3xl border border-[var(--glass-border)] bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent-cyan)] focus:ring-2 focus:ring-[var(--accent-cyan)]/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-3xl bg-[var(--accent-cyan)] px-5 py-3 text-sm font-semibold text-[#05060B] transition hover:bg-[var(--accent-blue)]"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function generateAnswer(question: string, knowledge: any) {
  const query = question.toLowerCase();
  const terms = query.split(/\W+/).filter(Boolean);

  if (query.includes('pricing') || query.includes('plan') || query.includes('cost')) {
    return summarizePricing(knowledge);
  }

  if (query.includes('contact') || query.includes('email') || query.includes('phone') || query.includes('address')) {
    return summarizeContact(knowledge.contact);
  }

  const moduleMatch = findModuleMatch(query, knowledge);
  if (moduleMatch) {
    return moduleMatch;
  }

  const faqMatch = findFaqMatch(query, knowledge.faqs);
  if (faqMatch) {
    return faqMatch;
  }

  const pageMatch = findPageMatch(query, knowledge.pages, terms);
  if (pageMatch) {
    return pageMatch;
  }

  return 'I found this information on the site:\n' + fallbackAnswer(knowledge);
}

function summarizePricing(knowledge: any) {
  const plans = knowledge.pages
    .find((page: any) => page.page === 'Home')
    ?.sections?.find((section: any) => section.type === 'pricing')?.plans;

  if (!plans) {
    return 'Pricing information is available on the website, but I could not load it right now.';
  }

  return [
    'AccountIn offers custom pricing per institution:',
    ...plans.map((plan: any) => `- ${plan.name}: ${plan.description}. Includes ${plan.features.join(', ')}.`),
    'Contact the team to request a quote or contact sales.',
  ].join('\n');
}

function summarizeContact(contact: any) {
  if (!contact) return 'Contact information is not available at the moment.';
  return [
    `Company: ${contact.company}`,
    contact.description,
    `Address: ${contact.address}`,
    `Phone: ${contact.phone}`,
    `Email: ${contact.email}`,
    `Social: ${contact.social.join(', ')}`,
  ].join('\n');
}

function findModuleMatch(query: string, knowledge: any) {
  const modules = knowledge.pages
    .find((page: any) => page.page === 'Home')
    ?.sections?.find((section: any) => section.type === 'platformOverview')?.modules;
  if (!modules) return null;

  const match = modules.find((mod: any) => query.includes(mod.title.toLowerCase()) || mod.title.toLowerCase().includes(query));
  if (match) {
    return `${match.title}: ${match.description} Key benefits include ${match.benefits.join(', ')}.`;
  }

  const found = modules.filter((mod: any) => mod.title.toLowerCase().split(' ').some((word: string) => query.includes(word)));
  if (found.length === 1) {
    const mod = found[0];
    return `${mod.title}: ${mod.description} Key benefits include ${mod.benefits.join(', ')}.`;
  }

  return null;
}

function findFaqMatch(query: string, faqs: any[]) {
  const match = faqs.find((faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query));
  if (match) return `${match.question} ${match.answer}`;

  const termMatch = faqs.find((faq) => query.split(' ').some((word) => faq.question.toLowerCase().includes(word)));
  if (termMatch) return `${termMatch.question} ${termMatch.answer}`;

  return null;
}

function findPageMatch(query: string, pages: any[], terms: string[]) {
  const pageScores = pages.map((page) => {
    const score = terms.reduce((acc, term) => {
      const pageText = JSON.stringify(page).toLowerCase();
      return acc + (pageText.includes(term) ? 1 : 0);
    }, 0);
    return { page, score };
  });

  const best = pageScores.sort((a, b) => b.score - a.score)[0];
  if (best?.score > 2) {
    const sectionSummary = best.page.sections
      .slice(0, 2)
      .map((section: any) => `${section.heading || section.type}: ${section.description || ''}`)
      .join('\n');
    return `Top match: ${best.page.page} page. ${sectionSummary}`;
  }

  return null;
}

function fallbackAnswer(knowledge: any) {
  const homepage = knowledge.pages.find((page: any) => page.page === 'Home');
  if (!homepage) return 'Try asking about pricing, simulations, partnerships, or contact details.';
  return `Home page summary: ${homepage.sections
    .filter((section: any) => section.heading)
    .slice(0, 3)
    .map((section: any) => section.heading)
    .join('; ')}.`;
}
