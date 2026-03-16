import { useState, useMemo, useCallback, useEffect } from 'react'
import { questions } from '../data/questions'

const TOPIC_LABELS = {
  traditional: 'Traditional NLP',
  embeddings: 'Embeddings',
  sequence: 'Sequence Models',
  attention: 'Attention & Transformers',
  applications: 'Applications',
}

const TYPE_LABELS = {
  application: 'When would you use?',
  debugging: 'What went wrong?',
  mechanism: 'Explain the mechanism',
  comparison: 'Compare & contrast',
  design: 'Design a system',
}

const TOPIC_COLORS = {
  traditional: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    ring: 'ring-amber-300 dark:ring-amber-700',
    bar: 'bg-amber-500',
    weak: 'text-amber-600 dark:text-amber-400',
  },
  embeddings: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    ring: 'ring-blue-300 dark:ring-blue-700',
    bar: 'bg-blue-500',
    weak: 'text-blue-600 dark:text-blue-400',
  },
  sequence: {
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    ring: 'ring-purple-300 dark:ring-purple-700',
    bar: 'bg-purple-500',
    weak: 'text-purple-600 dark:text-purple-400',
  },
  attention: {
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    ring: 'ring-teal-300 dark:ring-teal-700',
    bar: 'bg-teal-500',
    weak: 'text-teal-600 dark:text-teal-400',
  },
  applications: {
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    ring: 'ring-orange-300 dark:ring-orange-700',
    bar: 'bg-orange-500',
    weak: 'text-orange-600 dark:text-orange-400',
  },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PracticeQuestions({ dark, progress, markVisited, getProgress }) {
  const [topicFilter, setTopicFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [scores, setScores] = useState({})
  const [answeredIds, setAnsweredIds] = useState(new Set())
  const [finished, setFinished] = useState(false)
  const [shuffleSeed, setShuffleSeed] = useState(0)

  const filtered = useMemo(() => {
    let qs = questions
    if (topicFilter !== 'all') qs = qs.filter(q => q.topic === topicFilter)
    if (typeFilter !== 'all') qs = qs.filter(q => q.type === typeFilter)
    return shuffle(qs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFilter, typeFilter, shuffleSeed])

  // Reset state when filters change
  useEffect(() => {
    setCurrentIdx(0)
    setSelected(null)
    setShowExplanation(false)
    setFinished(false)
  }, [topicFilter, typeFilter, shuffleSeed])

  const current = filtered[currentIdx]
  const totalQuestions = filtered.length
  const answeredCount = [...answeredIds].filter(id => filtered.some(q => q.id === id)).length

  const handleSelect = useCallback((optionIdx) => {
    if (selected !== null) return
    setSelected(optionIdx)
    setShowExplanation(true)

    const q = filtered[currentIdx]
    const isCorrect = optionIdx === q.correct

    setAnsweredIds(prev => new Set([...prev, q.id]))
    markVisited('questions', q.id)

    setScores(prev => {
      const topic = q.topic
      const existing = prev[topic] || { correct: 0, total: 0 }
      return {
        ...prev,
        [topic]: {
          correct: existing.correct + (isCorrect ? 1 : 0),
          total: existing.total + 1,
        },
      }
    })
  }, [selected, filtered, currentIdx, markVisited])

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= totalQuestions) {
      setFinished(true)
    } else {
      setCurrentIdx(prev => prev + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }, [currentIdx, totalQuestions])

  const handleRestart = useCallback(() => {
    setScores({})
    setAnsweredIds(new Set())
    setCurrentIdx(0)
    setSelected(null)
    setShowExplanation(false)
    setFinished(false)
    setShuffleSeed(s => s + 1)
  }, [])

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  // --- Results Summary ---
  if (finished) {
    const topicsInQuiz = [...new Set(filtered.map(q => q.topic))]
    const totalCorrect = Object.values(scores).reduce((s, v) => s + v.correct, 0)
    const totalAnswered = Object.values(scores).reduce((s, v) => s + v.total, 0)
    const overallPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        {/* Overall Score Card */}
        <div className={`rounded-2xl p-8 text-center transition-colors ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="text-5xl font-extrabold mb-1">
            {overallPct >= 80 ? '🎉' : overallPct >= 50 ? '💪' : '📚'}
          </div>
          <h2 className="text-2xl font-bold mt-2">Quiz Complete!</h2>
          <p className={`text-lg mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            You scored <span className="font-semibold">{totalCorrect}</span> out of <span className="font-semibold">{totalAnswered}</span> ({overallPct}%)
          </p>

          {/* Overall bar */}
          <div className={`mt-4 h-3 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ${overallPct >= 80 ? 'bg-emerald-500' : overallPct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Per-topic breakdown */}
        <div className={`rounded-2xl p-6 transition-colors ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className="text-lg font-semibold mb-4">Score by Topic</h3>
          <div className="space-y-4">
            {topicsInQuiz.map(topic => {
              const s = scores[topic] || { correct: 0, total: 0 }
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
              const isWeak = pct < 60
              const colors = TOPIC_COLORS[topic]

              return (
                <div key={topic}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                        {TOPIC_LABELS[topic]}
                      </span>
                      {isWeak && (
                        <span className={`text-xs font-medium flex items-center gap-1 ${colors.weak}`}>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          Needs review
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {s.correct}/{s.total} ({pct}%)
                    </span>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weak spots summary */}
        {topicsInQuiz.some(t => {
          const s = scores[t] || { correct: 0, total: 0 }
          return s.total > 0 && Math.round((s.correct / s.total) * 100) < 60
        }) && (
          <div className={`rounded-2xl p-6 border transition-colors ${dark ? 'bg-red-950/30 border-red-900/50' : 'bg-red-50 border-red-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-red-300' : 'text-red-800'}`}>
              Weak Spots
            </h3>
            <p className={`text-sm mb-3 ${dark ? 'text-red-400' : 'text-red-600'}`}>
              These topics scored below 60%. Consider reviewing the Concept Explorer for these areas.
            </p>
            <div className="flex flex-wrap gap-2">
              {topicsInQuiz.filter(t => {
                const s = scores[t] || { correct: 0, total: 0 }
                return s.total > 0 && Math.round((s.correct / s.total) * 100) < 60
              }).map(t => (
                <span key={t} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${TOPIC_COLORS[t].badge}`}>
                  {TOPIC_LABELS[t]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Restart */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleRestart}
            className="px-8 py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all duration-150 shadow-lg shadow-teal-600/20"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    )
  }

  // --- No questions for filter ---
  if (totalQuestions === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Filters
          dark={dark}
          topicFilter={topicFilter}
          setTopicFilter={setTopicFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
        <div className={`rounded-2xl p-12 text-center ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className={`text-lg ${dark ? 'text-slate-400' : 'text-slate-500'}`}>No questions match the selected filters.</p>
        </div>
      </div>
    )
  }

  // --- Main Quiz UI ---
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Filters */}
      <Filters
        dark={dark}
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Question {currentIdx + 1} of {totalQuestions}
          </span>
          <span className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {progressPercent}% complete
          </span>
        </div>
        <div className={`h-2.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-gray-200'}`}>
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className={`rounded-2xl overflow-hidden transition-colors ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
        {/* Topic & Type badges */}
        <div className="px-6 pt-5 pb-0 flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TOPIC_COLORS[current.topic]?.badge || ''}`}>
            {TOPIC_LABELS[current.topic]}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
            {TYPE_LABELS[current.type]}
          </span>
        </div>

        {/* Question text */}
        <div className="px-6 pt-4 pb-2">
          <h2 className="text-lg font-semibold leading-relaxed">{current.question}</h2>
        </div>

        {/* Options */}
        <div className="px-6 pb-4 space-y-2.5">
          {current.options.map((opt, idx) => {
            const isCorrect = idx === current.correct
            const isSelected = selected === idx
            let optionStyle = ''

            if (selected !== null) {
              if (isCorrect) {
                optionStyle = dark
                  ? 'bg-emerald-900/40 border-emerald-600 ring-1 ring-emerald-600'
                  : 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
              } else if (isSelected && !isCorrect) {
                optionStyle = dark
                  ? 'bg-red-900/40 border-red-600 ring-1 ring-red-600'
                  : 'bg-red-50 border-red-500 ring-1 ring-red-500'
              } else {
                optionStyle = dark
                  ? 'border-slate-700 opacity-50'
                  : 'border-gray-200 opacity-50'
              }
            } else {
              optionStyle = dark
                ? 'border-slate-700 hover:border-slate-500 hover:bg-slate-750 cursor-pointer'
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${optionStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    selected !== null && isCorrect
                      ? 'bg-emerald-500 text-white'
                      : selected !== null && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : dark
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed">{opt}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${showExplanation ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`mx-6 mb-5 p-4 rounded-xl border ${
            dark
              ? 'bg-slate-700/50 border-slate-600'
              : 'bg-blue-50/70 border-blue-200'
          }`}>
            <div className="flex items-start gap-2.5">
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${dark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className={`font-semibold text-sm mb-1 ${dark ? 'text-blue-300' : 'text-blue-800'}`}>Explanation</p>
                <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{current.explanation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next / Finish button */}
        {selected !== null && (
          <div className="px-6 pb-5">
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] transition-all duration-150"
            >
              {currentIdx + 1 >= totalQuestions ? 'View Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>

      {/* Score tracker chips */}
      {Object.keys(scores).length > 0 && (
        <div className={`rounded-2xl p-4 transition-colors ${dark ? 'bg-slate-800/60 border border-slate-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Running Score
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(scores).map(([topic, s]) => {
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
              const isWeak = pct < 60 && s.total >= 2
              const colors = TOPIC_COLORS[topic]
              return (
                <div
                  key={topic}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${colors.badge} ${isWeak ? `ring-2 ${colors.ring}` : ''}`}
                >
                  <span className="font-medium">{TOPIC_LABELS[topic]}</span>
                  <span className="font-bold">{s.correct}/{s.total}</span>
                  {isWeak && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Filter bar sub-component ---------- */
function Filters({ dark, topicFilter, setTopicFilter, typeFilter, setTypeFilter }) {
  const selectClasses = `px-3 py-2 rounded-lg text-sm font-medium border transition-colors appearance-none bg-no-repeat bg-right pr-8 cursor-pointer ${
    dark
      ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500'
      : 'bg-white border-gray-200 text-slate-700 focus:border-teal-500'
  } focus:outline-none focus:ring-2 focus:ring-teal-500/30`

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundSize: '1.25rem',
    backgroundPosition: 'right 0.5rem center',
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Filter:</label>
      <select
        value={topicFilter}
        onChange={e => setTopicFilter(e.target.value)}
        className={selectClasses}
        style={selectStyle}
      >
        <option value="all">All Topics</option>
        {Object.entries(TOPIC_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <select
        value={typeFilter}
        onChange={e => setTypeFilter(e.target.value)}
        className={selectClasses}
        style={selectStyle}
      >
        <option value="all">All Types</option>
        {Object.entries(TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  )
}
