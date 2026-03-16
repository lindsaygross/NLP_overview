import { useState, useEffect } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { useProgress } from './hooks/useProgress'
import ConceptExplorer from './components/ConceptExplorer'
import PracticeQuestions from './components/PracticeQuestions'
import ConnectionsMap from './components/ConnectionsMap'
import QuickReference from './components/QuickReference'

const TABS = [
  { id: 'practice', label: 'Practice Questions', icon: '?' },
  { id: 'concepts', label: 'Concept Explorer', icon: '📖' },
  { id: 'connections', label: 'Connections Map', icon: '🔗' },
  { id: 'reference', label: 'Quick Reference', icon: '📋' },
]

export default function App() {
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash.slice(1)
    return TABS.find(t => t.id === hash)?.id || 'practice'
  })
  const [dark, setDark] = useDarkMode()
  const { progress, markVisited, getProgress } = useProgress()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    window.location.hash = tab
  }, [tab])

  const navigateToConcept = (conceptId) => {
    setTab('concepts')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-concept', { detail: conceptId }))
    }, 100)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'dark bg-slate-900 text-slate-200' : 'bg-gray-50 text-slate-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b ${dark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <h1 className="text-lg font-bold leading-tight">NLP Study App</h1>
                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>AIPI 540 — Deep Learning Applications</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? dark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-50 text-teal-700'
                      : dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1.5">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-gray-100 text-slate-600'}`}
                aria-label="Toggle dark mode"
              >
                {dark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-1">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setMobileMenuOpen(false) }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                    tab === t.id
                      ? dark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-50 text-teal-700'
                      : dark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <span className="mr-2">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'practice' && <PracticeQuestions dark={dark} progress={progress} markVisited={markVisited} getProgress={getProgress} />}
        {tab === 'concepts' && <ConceptExplorer dark={dark} markVisited={markVisited} getProgress={getProgress} />}
        {tab === 'connections' && <ConnectionsMap dark={dark} onNavigate={navigateToConcept} />}
        {tab === 'reference' && <QuickReference dark={dark} />}
      </main>
    </div>
  )
}
