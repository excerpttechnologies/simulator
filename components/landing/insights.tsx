'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock, ArrowRight, TrendingUp, BookOpen, Lightbulb } from 'lucide-react';

const ARTICLES = [
  {
    category: 'GST',
    categoryColor: '#CCFF00',
    title: 'GST Filing in 2025: What Every Indian Business Must Know',
    excerpt: 'New GSTN portal changes, revised late-fee structure, and how AI can cut your filing time from hours to minutes.',
    readTime: '6 min read',
    date: 'May 12, 2025',
    featured: true,
  },
  {
    category: 'AI & Automation',
    categoryColor: '#A8FF78',
    title: 'How AI is Replacing Manual Bookkeeping — And Why That\'s Good',
    excerpt: 'A deep dive into how machine learning models detect duplicate entries, flag anomalies, and auto-reconcile bank statements.',
    readTime: '8 min read',
    date: 'Apr 28, 2025',
    featured: false,
  },
  {
    category: 'TDS',
    categoryColor: '#78FFDC',
    title: 'TDS Compliance Checklist for FY 2025-26',
    excerpt: 'Rates, deadlines, and common mistakes — everything you need to stay compliant and avoid penalties.',
    readTime: '5 min read',
    date: 'Apr 15, 2025',
    featured: false,
  },
  {
    category: 'Cash Flow',
    categoryColor: '#FFE878',
    title: 'Cash Flow Forecasting for Startups: A Practical Guide',
    excerpt: 'Learn how to build a 13-week rolling cash flow model and use Accountin to automate the process.',
    readTime: '10 min read',
    date: 'Mar 30, 2025',
    featured: false,
  },
  {
    category: 'Product',
    categoryColor: '#FF9F78',
    title: 'Introducing Real-Time Collaboration in Accountin',
    excerpt: 'Your entire finance team can now work on the same ledger simultaneously — with live cursors, comments, and version history.',
    readTime: '3 min read',
    date: 'Mar 18, 2025',
    featured: false,
  },
  {
    category: 'Compliance',
    categoryColor: '#C878FF',
    title: 'New Income Tax Regime vs Old: Which Should Your Business Choose?',
    excerpt: 'A side-by-side comparison with real numbers to help you make the right call for FY 2025-26.',
    readTime: '7 min read',
    date: 'Mar 5, 2025',
    featured: false,
  },
];

const TOPICS = ['All', 'GST', 'TDS', 'AI & Automation', 'Cash Flow', 'Compliance', 'Product'];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function Insights() {
  const [activeTopic, setActiveTopic] = useState('All');
  const heading = useInView(0.2);
  const grid    = useInView(0.05);

  const filtered = activeTopic === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeTopic);

  const [featured, ...rest] = filtered;

  return (
    <section id="insights" className="scroll-mt-20" style={{ background: '#141414' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ padding: '96px 40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div ref={heading.ref} className="text-center mb-12">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-5 px-3 py-1 rounded-full"
            style={{ background: '#222', color: '#CCFF00', border: '1px solid #333' }}
          >
            Insights
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            style={{
              opacity: heading.visible ? 1 : 0,
              transform: heading.visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            Stay ahead of the curve.
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto leading-relaxed"
            style={{
              color: '#888',
              opacity: heading.visible ? 1 : 0,
              transition: 'opacity 0.6s ease 0.15s',
            }}
          >
            Guides, product updates, and compliance news — written by our team of
            chartered accountants and engineers.
          </p>
        </div>

        {/* Topic filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className="text-xs font-semibold rounded-full px-4 py-1.5 transition-all"
              style={
                activeTopic === topic
                  ? { background: '#CCFF00', color: '#000' }
                  : { background: '#222', color: '#888', border: '1px solid #333' }
              }
            >
              {topic}
            </button>
          ))}
        </div>

        {/* ── Featured article ─────────────────────────────────── */}
        {featured && (
          <div
            className="rounded-2xl overflow-hidden mb-8 cursor-pointer group"
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#CCFF00')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
          >
            <div className="grid lg:grid-cols-2">
              {/* Decorative visual */}
              <div
                className="flex items-center justify-center min-h-[200px] lg:min-h-[280px]"
                style={{ background: 'linear-gradient(135deg, #1E1E1E 0%, #111 100%)', position: 'relative', overflow: 'hidden' }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(circle at 40% 50%, rgba(204,255,0,0.12) 0%, transparent 65%)' }}
                />
                <TrendingUp size={64} color="#CCFF00" strokeWidth={1} className="relative z-10 opacity-60" />
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(204,255,0,0.12)', color: '#CCFF00' }}
                    >
                      {featured.category}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: '#555' }}>
                      <Clock size={11} /> {featured.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-snug mb-3 group-hover:text-[#CCFF00] transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#777' }}>{featured.excerpt}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#555' }}>{featured.date}</span>
                  <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#CCFF00' }}>
                    Read article <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Article grid ─────────────────────────────────────── */}
        <div ref={grid.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(filtered.length > 1 ? rest : []).map((article, i) => (
            <div
              key={article.title}
              className="flex flex-col gap-4 rounded-2xl cursor-pointer group"
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                padding: '24px',
                transition: 'border-color 0.2s, transform 0.2s',
                opacity: grid.visible ? 1 : 0,
                transform: grid.visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 0.07}s`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#CCFF00'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(204,255,0,0.1)', color: article.categoryColor }}
                >
                  {article.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#CCFF00] transition-colors">
                {article.title}
              </h3>
              <p className="text-xs leading-relaxed flex-1" style={{ color: '#666' }}>{article.excerpt}</p>
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #2A2A2A' }}>
                <span className="text-xs flex items-center gap-1" style={{ color: '#555' }}>
                  <Clock size={10} /> {article.readTime}
                </span>
                <span className="text-xs" style={{ color: '#555' }}>{article.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div
          className="mt-14 rounded-2xl text-center"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', padding: '48px 32px' }}
        >
          <BookOpen size={32} color="#CCFF00" strokeWidth={1.5} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Get insights in your inbox</h3>
          <p className="text-sm mb-6" style={{ color: '#888' }}>
            Weekly digest of compliance updates, product news, and accounting tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: '#222', border: '1px solid #333' }}
            />
            <button
              className="rounded-xl px-6 py-3 text-sm font-semibold whitespace-nowrap hover:opacity-90 transition-opacity"
              style={{ background: '#CCFF00', color: '#000' }}
            >
              Subscribe →
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
