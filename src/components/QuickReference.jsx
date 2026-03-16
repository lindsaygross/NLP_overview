import { useState } from 'react'
import { quickRefCards } from '../data/quickref'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'embeddings', label: 'Embeddings' },
  { id: 'sequence', label: 'Sequence' },
  { id: 'attention', label: 'Attention' },
  { id: 'applications', label: 'Applications' },
]

const categoryColors = {
  traditional: {
    bg: 'bg-amber-50',
    bgDark: 'bg-amber-950/30',
    border: 'border-amber-300',
    borderDark: 'border-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    badgeDark: 'bg-amber-900/50 text-amber-300',
    accent: 'text-amber-700',
    accentDark: 'text-amber-400',
    toggle: 'bg-amber-100 text-amber-800 ring-amber-300',
    toggleDark: 'bg-amber-900/40 text-amber-300 ring-amber-700',
  },
  embeddings: {
    bg: 'bg-blue-50',
    bgDark: 'bg-blue-950/30',
    border: 'border-blue-300',
    borderDark: 'border-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    badgeDark: 'bg-blue-900/50 text-blue-300',
    accent: 'text-blue-700',
    accentDark: 'text-blue-400',
    toggle: 'bg-blue-100 text-blue-800 ring-blue-300',
    toggleDark: 'bg-blue-900/40 text-blue-300 ring-blue-700',
  },
  sequence: {
    bg: 'bg-purple-50',
    bgDark: 'bg-purple-950/30',
    border: 'border-purple-300',
    borderDark: 'border-purple-700',
    badge: 'bg-purple-100 text-purple-800',
    badgeDark: 'bg-purple-900/50 text-purple-300',
    accent: 'text-purple-700',
    accentDark: 'text-purple-400',
    toggle: 'bg-purple-100 text-purple-800 ring-purple-300',
    toggleDark: 'bg-purple-900/40 text-purple-300 ring-purple-700',
  },
  attention: {
    bg: 'bg-teal-50',
    bgDark: 'bg-teal-950/30',
    border: 'border-teal-300',
    borderDark: 'border-teal-700',
    badge: 'bg-teal-100 text-teal-800',
    badgeDark: 'bg-teal-900/50 text-teal-300',
    accent: 'text-teal-700',
    accentDark: 'text-teal-400',
    toggle: 'bg-teal-100 text-teal-800 ring-teal-300',
    toggleDark: 'bg-teal-900/40 text-teal-300 ring-teal-700',
  },
  applications: {
    bg: 'bg-orange-50',
    bgDark: 'bg-orange-950/30',
    border: 'border-orange-300',
    borderDark: 'border-orange-700',
    badge: 'bg-orange-100 text-orange-800',
    badgeDark: 'bg-orange-900/50 text-orange-300',
    accent: 'text-orange-700',
    accentDark: 'text-orange-400',
    toggle: 'bg-orange-100 text-orange-800 ring-orange-300',
    toggleDark: 'bg-orange-900/40 text-orange-300 ring-orange-700',
  },
}

export default function QuickReference({ dark }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredCards =
    activeCategory === 'all'
      ? quickRefCards
      : quickRefCards.filter((c) => c.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .qr-print-area, .qr-print-area * { visibility: visible; }
          .qr-print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .qr-no-print { display: none !important; }
          .qr-card {
            break-inside: avoid;
            border: 1px solid #d1d5db !important;
            background: white !important;
            color: black !important;
            margin-bottom: 8px;
          }
          .qr-card * { color: black !important; }
          .qr-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="qr-no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id
            const colors = cat.id !== 'all' ? categoryColors[cat.id] : null
            let btnClass
            if (isActive && colors) {
              btnClass = dark ? colors.toggleDark + ' ring-1' : colors.toggle + ' ring-1'
            } else if (isActive && !colors) {
              btnClass = dark
                ? 'bg-slate-700 text-slate-200 ring-1 ring-slate-500'
                : 'bg-slate-200 text-slate-800 ring-1 ring-slate-400'
            } else {
              btnClass = dark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'
            }
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${btnClass}`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => window.print()}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            dark
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Cheat Sheet
        </button>
      </div>

      {/* Card count */}
      <p className={`qr-no-print text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
        Showing {filteredCards.length} of {quickRefCards.length} cards
      </p>

      {/* Card Grid */}
      <div className="qr-print-area">
        <div className="qr-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const c = categoryColors[card.category]
            return (
              <div
                key={card.id}
                className={`qr-card rounded-lg border p-4 space-y-2.5 text-sm leading-snug ${
                  dark
                    ? `${c.bgDark} ${c.borderDark}`
                    : `${c.bg} ${c.border}`
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-bold text-base leading-tight ${dark ? c.accentDark : c.accent}`}>
                    {card.title}
                  </h3>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                      dark ? c.badgeDark : c.badge
                    }`}
                  >
                    {card.category}
                  </span>
                </div>

                {/* Definition */}
                <p className={`${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {card.definition}
                </p>

                {/* Formula */}
                <div
                  className={`rounded px-2.5 py-1.5 font-mono text-xs ${
                    dark ? 'bg-slate-800/70 text-slate-200' : 'bg-white/70 text-slate-800'
                  }`}
                >
                  {card.formula}
                </div>

                {/* When to Use */}
                <div>
                  <span className={`font-semibold text-xs uppercase tracking-wide ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    When to use:{' '}
                  </span>
                  <span className={dark ? 'text-slate-300' : 'text-slate-600'}>
                    {card.whenToUse}
                  </span>
                </div>

                {/* Pitfalls */}
                <div>
                  <span className={`font-semibold text-xs uppercase tracking-wide ${dark ? 'text-red-400/80' : 'text-red-600/80'}`}>
                    Pitfalls:{' '}
                  </span>
                  <span className={dark ? 'text-slate-300' : 'text-slate-600'}>
                    {card.pitfalls}
                  </span>
                </div>

                {/* Related tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {card.related.map((tag) => (
                    <span
                      key={tag}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        dark
                          ? 'bg-slate-700/60 text-slate-400'
                          : 'bg-white/80 text-slate-500 ring-1 ring-slate-200'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
