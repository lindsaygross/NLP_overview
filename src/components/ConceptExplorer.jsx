import { useState, useEffect, useMemo } from 'react'
import { concepts, TOPIC_COLORS } from '../data/concepts'

const CATEGORIES = [
  { id: 'traditional', label: 'Traditional NLP' },
  { id: 'embeddings', label: 'Embeddings' },
  { id: 'sequence', label: 'Sequence Models' },
  { id: 'attention', label: 'Attention & Transformers' },
  { id: 'applications', label: 'Applications' },
]

const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','i','me','my','we','our','you','your','he','him','his','she','her','it','its','they','them','their','this','that','these','those','am','and','but','or','nor','not','so','very','just','about','up','no'])

function stemWord(word) {
  let w = word.toLowerCase()
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3)
  if (w.endsWith('tion') && w.length > 5) return w.slice(0, -4)
  if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2)
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2)
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2)
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) return w.slice(0, -1)
  if (w.endsWith('er') && w.length > 4) return w.slice(0, -2)
  return w
}

function lemmatize(word) {
  const lemmas = { running:'run', ran:'run', runs:'run', changing:'change', changed:'change', changes:'change', better:'good', best:'good', worse:'bad', worst:'bad', studies:'study', studying:'study', studied:'study', playing:'play', played:'play', going:'go', went:'go', gone:'go', having:'have', being:'be', doing:'do', making:'make', seeing:'see', getting:'get', saying:'say', coming:'come', thinking:'think', looking:'look', using:'use', finding:'find', giving:'give', telling:'tell', working:'work', calling:'call', trying:'try', asking:'ask', needing:'need', becoming:'become', leaving:'leave', putting:'put', meaning:'mean', keeping:'keep', letting:'let', beginning:'begin', showing:'show', hearing:'hear', writing:'write', sitting:'sit', standing:'stand', losing:'lose', paying:'pay', meeting:'meet', driving:'drive', breaking:'break', growing:'grow' }
  const w = word.toLowerCase()
  if (lemmas[w]) return lemmas[w]
  if (w.endsWith('ing') && w.length > 5) {
    const base = w.slice(0, -3)
    if (base.endsWith('e')) return base
    return base + (base.match(/[aeiou][^aeiou]$/) ? base.slice(-1) : '') || base
  }
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2) + (w.slice(-3, -2).match(/[^aeiou]/) ? 'e' : '')
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y'
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

// Interactive Demos
function PipelineDemo({ dark }) {
  const [text, setText] = useState('The students were studying Natural Language Processing techniques')
  const tokens = text.split(/\s+/).filter(Boolean)
  const noStop = tokens.filter(t => !STOP_WORDS.has(t.toLowerCase()))
  const stemmed = noStop.map(t => stemWord(t))
  const lemmatized = noStop.map(t => lemmatize(t))

  const card = `rounded-lg p-3 ${dark ? 'bg-slate-800' : 'bg-white'} border ${dark ? 'border-slate-700' : 'border-gray-200'}`

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Enter text to process:</label>
        <input value={text} onChange={e => setText(e.target.value)} className={`w-full p-3 rounded-lg border text-sm ${dark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`} />
      </div>
      <div className="flex items-center gap-2 flex-wrap text-sm">
        {['Raw Text', 'Tokenize', 'Stop Words', 'Stem', 'Lemmatize'].map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            {i > 0 && <span className="text-teal-500">→</span>}
            <span className={`px-3 py-1 rounded-full font-medium ${dark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-800'}`}>{step}</span>
          </span>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={card}>
          <div className="text-xs font-semibold text-amber-500 mb-1">1. TOKENIZED</div>
          <div className="flex flex-wrap gap-1">{tokens.map((t,i) => <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>{t}</span>)}</div>
        </div>
        <div className={card}>
          <div className="text-xs font-semibold text-red-500 mb-1">2. STOP WORDS REMOVED</div>
          <div className="flex flex-wrap gap-1">{noStop.map((t,i) => <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-slate-700' : 'bg-gray-100'}`}>{t}</span>)}</div>
        </div>
        <div className={card}>
          <div className="text-xs font-semibold text-purple-500 mb-1">3. STEMMED</div>
          <div className="flex flex-wrap gap-1">{stemmed.map((t,i) => <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-purple-900/30' : 'bg-purple-50'}`}>{noStop[i]} → <strong>{t}</strong></span>)}</div>
        </div>
        <div className={card}>
          <div className="text-xs font-semibold text-blue-500 mb-1">4. LEMMATIZED</div>
          <div className="flex flex-wrap gap-1">{lemmatized.map((t,i) => <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>{noStop[i]} → <strong>{t}</strong></span>)}</div>
        </div>
      </div>
    </div>
  )
}

function TfidfDemo({ dark }) {
  const [doc1, setDoc1] = useState('The movie was great and the acting was superb')
  const [doc2, setDoc2] = useState('The movie was terrible and the plot was boring')

  const { bow1, bow2, tfidf1, tfidf2, vocab } = useMemo(() => {
    const words1 = doc1.toLowerCase().split(/\s+/).filter(Boolean)
    const words2 = doc2.toLowerCase().split(/\s+/).filter(Boolean)
    const vocab = [...new Set([...words1, ...words2])].sort()
    const count = (words, w) => words.filter(x => x === w).length
    const bow1 = vocab.map(w => count(words1, w))
    const bow2 = vocab.map(w => count(words2, w))
    const N = 2
    const tfidf1 = vocab.map((w, i) => {
      const tf = bow1[i] / (words1.length || 1)
      const df = (bow1[i] > 0 ? 1 : 0) + (bow2[i] > 0 ? 1 : 0)
      return +(tf * Math.log(N / (df || 1))).toFixed(3)
    })
    const tfidf2 = vocab.map((w, i) => {
      const tf = bow2[i] / (words2.length || 1)
      const df = (bow1[i] > 0 ? 1 : 0) + (bow2[i] > 0 ? 1 : 0)
      return +(tf * Math.log(N / (df || 1))).toFixed(3)
    })
    return { bow1, bow2, tfidf1, tfidf2, vocab }
  }, [doc1, doc2])

  const inp = `w-full p-2 rounded-lg border text-sm ${dark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium block mb-1">Document 1:</label><input value={doc1} onChange={e => setDoc1(e.target.value)} className={inp} /></div>
        <div><label className="text-sm font-medium block mb-1">Document 2:</label><input value={doc2} onChange={e => setDoc2(e.target.value)} className={inp} /></div>
      </div>
      <div className="overflow-x-auto">
        <table className={`text-xs w-full ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
          <thead>
            <tr className={dark ? 'bg-slate-800' : 'bg-gray-100'}>
              <th className="p-2 text-left">Word</th>
              <th className="p-2">BoW Doc1</th>
              <th className="p-2">BoW Doc2</th>
              <th className="p-2">TF-IDF Doc1</th>
              <th className="p-2">TF-IDF Doc2</th>
            </tr>
          </thead>
          <tbody>
            {vocab.map((w, i) => {
              const isShared = bow1[i] > 0 && bow2[i] > 0
              return (
                <tr key={w} className={`border-t ${dark ? 'border-slate-700' : 'border-gray-200'} ${isShared ? (dark ? 'bg-slate-800/50' : 'bg-amber-50') : ''}`}>
                  <td className="p-2 font-mono font-medium">{w} {isShared && <span className="text-amber-500 text-[10px]">shared</span>}</td>
                  <td className="p-2 text-center">{bow1[i]}</td>
                  <td className="p-2 text-center">{bow2[i]}</td>
                  <td className={`p-2 text-center font-mono ${tfidf1[i] > 0 ? 'text-teal-500 font-bold' : ''}`}>{tfidf1[i]}</td>
                  <td className={`p-2 text-center font-mono ${tfidf2[i] > 0 ? 'text-teal-500 font-bold' : ''}`}>{tfidf2[i]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Notice: shared words (like "the", "movie", "was") get TF-IDF = 0 because they appear in both docs. Unique words get highlighted.</p>
    </div>
  )
}

function NgramsDemo({ dark }) {
  const [text, setText] = useState('I did not like the movie at all')
  const [n, setN] = useState(2)
  const tokens = text.split(/\s+/).filter(Boolean)
  const ngrams = []
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '))
  }

  return (
    <div className="space-y-4">
      <input value={text} onChange={e => setText(e.target.value)} className={`w-full p-3 rounded-lg border text-sm ${dark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`} />
      <div className="flex gap-2">
        {[1, 2, 3].map(v => (
          <button key={v} onClick={() => setN(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${n === v ? (dark ? 'bg-teal-800 text-teal-200' : 'bg-teal-100 text-teal-800') : (dark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600')}`}>
            {v === 1 ? 'Unigrams' : v === 2 ? 'Bigrams' : 'Trigrams'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ngrams.map((ng, i) => (
          <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-mono ${
            ng.toLowerCase().includes('not') ? (dark ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200')
            : (dark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 border border-gray-200')
          }`}>
            {ng}
          </span>
        ))}
      </div>
      {n === 2 && text.toLowerCase().includes('not') && (
        <p className={`text-sm ${dark ? 'text-red-400' : 'text-red-600'}`}>
          ↑ Notice how bigrams with "not" (highlighted) capture negation that unigrams would miss!
        </p>
      )}
    </div>
  )
}

function LSTMDemo({ dark }) {
  const [step, setStep] = useState(0)
  const steps = [
    { title: '1. Forget Gate (σ)', color: 'red', desc: 'Sigmoid decides what to REMOVE from cell memory. Output 0 = forget completely, 1 = keep everything.', formula: 'f_t = σ(W_f · [h_{t-1}, x_t] + b_f)', activation: 'Sigmoid → [0, 1]' },
    { title: '2. Input Gate (σ + tanh)', color: 'green', desc: 'Two parts: Sigmoid picks WHAT to update, Tanh creates CANDIDATE values that could be stored.', formula: 'i_t = σ(W_i · [h_{t-1}, x_t] + b_i)\nC̃_t = tanh(W_C · [h_{t-1}, x_t] + b_C)', activation: 'Sigmoid → [0, 1] for gate\nTanh → [-1, 1] for candidates' },
    { title: '3. Cell State Update', color: 'blue', desc: 'ADDITIVE update: old memory × forget gate + new candidates × input gate. This is why LSTMs avoid vanishing gradient!', formula: 'C_t = f_t × C_{t-1} + i_t × C̃_t', activation: 'ADDITIVE (not multiplicative!)' },
    { title: '4. Output Gate (σ + tanh)', color: 'purple', desc: 'Sigmoid filters what to output, then tanh squashes the cell state to [-1,1] for the output.', formula: 'o_t = σ(W_o · [h_{t-1}, x_t] + b_o)\nh_t = o_t × tanh(C_t)', activation: 'Sigmoid → [0, 1] for gate\nTanh → [-1, 1] for output' },
  ]

  const colorMap = { red: 'border-red-500 bg-red-500/10', green: 'border-green-500 bg-green-500/10', blue: 'border-blue-500 bg-blue-500/10', purple: 'border-purple-500 bg-purple-500/10' }
  const textColorMap = { red: 'text-red-500', green: 'text-green-500', blue: 'text-blue-500', purple: 'text-purple-500' }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all border-2 ${
              step === i ? colorMap[s.color] : (dark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white')
            }`}>
            {s.title.split(' ')[0]} {s.title.split(' ').slice(1, 3).join(' ')}
          </button>
        ))}
      </div>
      <div className={`p-6 rounded-xl border-2 ${colorMap[steps[step].color]}`}>
        <h4 className={`text-lg font-bold ${textColorMap[steps[step].color]} mb-2`}>{steps[step].title}</h4>
        <p className={`mb-4 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{steps[step].desc}</p>
        <div className={`font-mono text-sm p-4 rounded-lg ${dark ? 'bg-slate-900' : 'bg-white'} whitespace-pre-line mb-3`}>
          {steps[step].formula}
        </div>
        <div className={`text-sm font-medium ${textColorMap[steps[step].color]}`}>
          Activation: {steps[step].activation}
        </div>
      </div>
      {/* Visual diagram */}
      <div className={`p-4 rounded-lg ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
        <div className="text-xs font-medium mb-2">Gate Summary:</div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-2 rounded border-2 ${step === 0 ? 'border-red-500 bg-red-500/10' : (dark ? 'border-slate-700' : 'border-gray-200')}`}>
            <div className="font-bold text-red-500">Forget</div>
            <div>σ</div>
            <div className={dark ? 'text-slate-400' : 'text-slate-500'}>[0,1]</div>
          </div>
          <div className={`p-2 rounded border-2 ${step === 1 ? 'border-green-500 bg-green-500/10' : (dark ? 'border-slate-700' : 'border-gray-200')}`}>
            <div className="font-bold text-green-500">Input</div>
            <div>σ + tanh</div>
            <div className={dark ? 'text-slate-400' : 'text-slate-500'}>[0,1]×[-1,1]</div>
          </div>
          <div className={`p-2 rounded border-2 ${step === 2 ? 'border-blue-500 bg-blue-500/10' : (dark ? 'border-slate-700' : 'border-gray-200')}`}>
            <div className="font-bold text-blue-500">Cell</div>
            <div>+ (add)</div>
            <div className={dark ? 'text-slate-400' : 'text-slate-500'}>ADDITIVE</div>
          </div>
          <div className={`p-2 rounded border-2 ${step === 3 ? 'border-purple-500 bg-purple-500/10' : (dark ? 'border-slate-700' : 'border-gray-200')}`}>
            <div className="font-bold text-purple-500">Output</div>
            <div>σ + tanh</div>
            <div className={dark ? 'text-slate-400' : 'text-slate-500'}>[0,1]×[-1,1]</div>
          </div>
        </div>
      </div>
      <div className={`text-sm p-3 rounded-lg border ${dark ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
        <strong>Key Insight:</strong> 3 sigmoids (for gating: 0 = block, 1 = pass) + 1 tanh (for values: [-1,1]). The ADDITIVE cell state update is why vanishing gradient is solved.
      </div>
    </div>
  )
}

function SelfAttentionDemo({ dark }) {
  const [step, setStep] = useState(0)
  const words = ['The', 'bank', 'of', 'the', 'river']
  const focusIdx = 1 // "bank"
  // Simulated attention scores
  const rawScores = [0.1, 1.0, 0.2, 0.1, 0.8]
  const expScores = rawScores.map(s => Math.exp(s))
  const sumExp = expScores.reduce((a, b) => a + b, 0)
  const softmaxScores = expScores.map(s => s / sumExp)

  const stepsData = [
    { title: 'Step 1: Dot Products', desc: `Compute dot product between "${words[focusIdx]}" and every word → similarity scores` },
    { title: 'Step 2: Softmax', desc: 'Normalize scores to sum to 1 → attention weights (NOT trainable!)' },
    { title: 'Step 3: Weighted Sum', desc: `Multiply each word's vector by its weight, sum → new contextual embedding for "${words[focusIdx]}"` },
    { title: 'Step 4: Q, K, V Matrices', desc: 'Add TRAINABLE weight matrices. Q & K compute scores, V provides values for the weighted sum.' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {stepsData.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${step === i ? (dark ? 'bg-teal-800 text-teal-200' : 'bg-teal-100 text-teal-800') : (dark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600')}`}>
            {s.title}
          </button>
        ))}
      </div>
      <div className={`p-4 rounded-xl border ${dark ? 'border-teal-800 bg-teal-900/20' : 'border-teal-200 bg-teal-50'}`}>
        <h4 className="font-bold text-teal-500 mb-1">{stepsData[step].title}</h4>
        <p className={`text-sm mb-4 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{stepsData[step].desc}</p>

        <div className="flex gap-3 justify-center flex-wrap mb-4">
          {words.map((w, i) => {
            const isTarget = i === focusIdx
            const weight = step >= 1 ? softmaxScores[i] : rawScores[i]
            const opacity = step >= 1 ? Math.max(0.15, weight) : Math.max(0.15, weight / Math.max(...rawScores))
            return (
              <div key={i} className="text-center">
                <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isTarget ? (dark ? 'bg-teal-700 text-white ring-2 ring-teal-400' : 'bg-teal-500 text-white ring-2 ring-teal-300')
                  : (dark ? 'bg-slate-700' : 'bg-white border border-gray-200')
                }`} style={{ opacity: isTarget ? 1 : opacity }}>
                  {w}
                </div>
                {step === 0 && <div className="text-xs mt-1 font-mono text-teal-500">{rawScores[i].toFixed(1)}</div>}
                {step >= 1 && step < 3 && <div className="text-xs mt-1 font-mono text-teal-500">{(softmaxScores[i] * 100).toFixed(1)}%</div>}
              </div>
            )
          })}
        </div>

        {step === 3 && (
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className={`p-3 rounded-lg ${dark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="font-bold text-blue-500 mb-1">Q (Query)</div>
              <div>"What am I looking for?"</div>
            </div>
            <div className={`p-3 rounded-lg ${dark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
              <div className="font-bold text-green-500 mb-1">K (Key)</div>
              <div>"What do I contain?"</div>
            </div>
            <div className={`p-3 rounded-lg ${dark ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
              <div className="font-bold text-purple-500 mb-1">V (Value)</div>
              <div>"Here's my actual info"</div>
            </div>
          </div>
        )}
      </div>
      {step >= 1 && (
        <div className={`text-xs p-2 rounded ${dark ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-slate-500'}`}>
          Attention weights: {words.map((w, i) => `${w}=${(softmaxScores[i] * 100).toFixed(1)}%`).join(', ')} → "river" gets highest weight for "bank" (contextual!)
        </div>
      )}
    </div>
  )
}

function Word2VecDemo({ dark }) {
  const points = [
    { word: 'king', x: 200, y: 80 },
    { word: 'queen', x: 350, y: 80 },
    { word: 'man', x: 200, y: 200 },
    { word: 'woman', x: 350, y: 200 },
  ]

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 500 300" className={`w-full max-w-lg mx-auto rounded-lg ${dark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Arrows */}
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#14b8a6"/></marker></defs>
        <line x1="200" y1="100" x2="200" y2="180" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="160" y="150" fill="#ef4444" fontSize="11" fontWeight="bold">−man</text>
        <line x1="220" y1="200" x2="330" y2="200" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow)" />
        <text x="255" y="220" fill="#3b82f6" fontSize="11" fontWeight="bold">+woman</text>
        <line x1="350" y1="180" x2="350" y2="100" stroke="#14b8a6" strokeWidth="2" strokeDasharray="6,3" markerEnd="url(#arrow)" />
        <text x="360" y="150" fill="#14b8a6" fontSize="11" fontWeight="bold">≈ queen</text>
        {points.map(p => (
          <g key={p.word}>
            <circle cx={p.x} cy={p.y} r="28" fill={p.word === 'queen' ? '#14b8a6' : dark ? '#334155' : '#f1f5f9'} stroke={p.word === 'queen' ? '#0d9488' : dark ? '#475569' : '#cbd5e1'} strokeWidth="2" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fill={p.word === 'queen' ? 'white' : dark ? '#e2e8f0' : '#334155'} fontSize="12" fontWeight="bold">{p.word}</text>
          </g>
        ))}
        <text x="250" y="270" textAnchor="middle" fill={dark ? '#94a3b8' : '#64748b'} fontSize="11">king − man + woman ≈ queen</text>
      </svg>
      <p className={`text-xs text-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        Vector arithmetic in embedding space captures semantic relationships. Same vector offset (male→female) works for multiple word pairs.
      </p>
    </div>
  )
}

function TransformerDemo({ dark }) {
  const block = `rounded-lg p-3 text-xs text-center border ${dark ? 'border-slate-600' : 'border-gray-300'}`
  const arrow = `text-center text-lg ${dark ? 'text-slate-500' : 'text-gray-400'}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Encoder */}
      <div className={`p-4 rounded-xl border-2 ${dark ? 'border-teal-800 bg-teal-900/10' : 'border-teal-200 bg-teal-50/50'}`}>
        <h4 className="font-bold text-teal-500 text-center mb-3">ENCODER</h4>
        <div className="space-y-2">
          <div className={`${block} ${dark ? 'bg-slate-800' : 'bg-white'}`}>Input Embeddings + Positional Encoding</div>
          <div className={arrow}>↓</div>
          <div className={`${block} ${dark ? 'bg-teal-900/30' : 'bg-teal-100'}`}>Multi-Head Self-Attention</div>
          <div className={`text-center text-[10px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>+ Skip Connection + Layer Norm</div>
          <div className={arrow}>↓</div>
          <div className={`${block} ${dark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>Feed-Forward Network</div>
          <div className={`text-center text-[10px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>+ Skip Connection + Layer Norm</div>
          <div className={arrow}>↓</div>
          <div className={`${block} border-dashed ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>× N blocks (stack)</div>
        </div>
      </div>
      {/* Decoder */}
      <div className={`p-4 rounded-xl border-2 ${dark ? 'border-purple-800 bg-purple-900/10' : 'border-purple-200 bg-purple-50/50'}`}>
        <h4 className="font-bold text-purple-500 text-center mb-3">DECODER</h4>
        <div className="space-y-2">
          <div className={`${block} ${dark ? 'bg-slate-800' : 'bg-white'}`}>Output Embeddings (shifted right) + Pos Encoding</div>
          <div className={arrow}>↓</div>
          <div className={`${block} ${dark ? 'bg-red-900/30' : 'bg-red-100'}`}>MASKED Multi-Head Self-Attention</div>
          <div className={`text-center text-[10px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>+ Skip Connection + Layer Norm</div>
          <div className={arrow}>↓</div>
          <div className={`${block} ${dark ? 'bg-amber-900/30' : 'bg-amber-100'}`}>Cross-Attention (to Encoder output)</div>
          <div className={`text-center text-[10px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>+ Skip Connection + Layer Norm</div>
          <div className={arrow}>↓</div>
          <div className={`${block} ${dark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>Feed-Forward Network</div>
          <div className={arrow}>↓</div>
          <div className={`${block} ${dark ? 'bg-slate-800' : 'bg-white'}`}>Linear → Softmax → Output Word</div>
        </div>
      </div>
    </div>
  )
}

function TransformerTypesDemo({ dark }) {
  const types = [
    { name: 'Encoder-Only', model: 'BERT', tasks: ['Classification', 'NER', 'Similarity', 'Info Extraction'], color: 'teal', direction: 'Bidirectional' },
    { name: 'Decoder-Only', model: 'GPT', tasks: ['Text Generation', 'Code Completion', 'Chat'], color: 'purple', direction: 'Left-to-right (causal)' },
    { name: 'Encoder-Decoder', model: 'T5 / BART', tasks: ['Translation', 'Summarization', 'Q&A'], color: 'amber', direction: 'Full pipeline' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {types.map(t => (
        <div key={t.name} className={`p-4 rounded-xl border-2 ${dark ? `border-${t.color}-800 bg-${t.color}-900/10` : `border-${t.color}-200 bg-${t.color}-50`}`}>
          <h4 className={`font-bold text-${t.color}-500 mb-1`}>{t.name}</h4>
          <div className={`text-sm font-mono mb-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{t.model}</div>
          <div className={`text-xs mb-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{t.direction}</div>
          <ul className="space-y-1">
            {t.tasks.map(task => (
              <li key={task} className={`text-xs px-2 py-1 rounded ${dark ? 'bg-slate-800' : 'bg-white'}`}>{task}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ScaledAttentionDemo({ dark }) {
  const [dk, setDk] = useState(64)
  const rawScores = [2.5, 1.2, 0.8, 3.1, 0.3]
  const scaled = rawScores.map(s => s * Math.sqrt(dk) / 8)
  const softmaxRaw = (() => {
    const maxS = Math.max(...scaled.map(s => s * 4))
    const exp = scaled.map(s => Math.exp(s * 4 - maxS))
    const sum = exp.reduce((a, b) => a + b, 0)
    return exp.map(e => e / sum)
  })()
  const scaledScores = rawScores.map(s => s / Math.sqrt(dk))
  const softmaxScaled = (() => {
    const maxS = Math.max(...scaledScores)
    const exp = scaledScores.map(s => Math.exp(s - maxS))
    const sum = exp.reduce((a, b) => a + b, 0)
    return exp.map(e => e / sum)
  })()

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-lg text-center font-mono text-sm ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
        Attention(Q,K,V) = softmax(QK<sup>T</sup> / √d_k) × V
      </div>
      <div>
        <label className="text-sm font-medium">Embedding dimension (d_k): {dk}</label>
        <input type="range" min="4" max="512" value={dk} onChange={e => setDk(+e.target.value)} className="w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-3 rounded-lg ${dark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-xs font-bold text-red-500 mb-2">WITHOUT Scaling (×√{dk} = ×{Math.sqrt(dk).toFixed(1)})</div>
          <div className="flex gap-1">{softmaxRaw.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="bg-red-500 rounded-t" style={{ height: `${s * 100}px`, opacity: 0.3 + s * 0.7 }}></div>
              <div className="text-[10px] mt-1 font-mono">{(s*100).toFixed(0)}%</div>
            </div>
          ))}</div>
          <div className="text-[10px] mt-2 text-red-400">Extreme peaks → vanishing gradients</div>
        </div>
        <div className={`p-3 rounded-lg ${dark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
          <div className="text-xs font-bold text-green-500 mb-2">WITH Scaling (÷√{dk} = ÷{Math.sqrt(dk).toFixed(1)})</div>
          <div className="flex gap-1">{softmaxScaled.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="bg-green-500 rounded-t" style={{ height: `${s * 100}px`, opacity: 0.3 + s * 0.7 }}></div>
              <div className="text-[10px] mt-1 font-mono">{(s*100).toFixed(0)}%</div>
            </div>
          ))}</div>
          <div className="text-[10px] mt-2 text-green-400">Smooth distribution → stable training</div>
        </div>
      </div>
    </div>
  )
}

function HMMDemo({ dark }) {
  const states = [
    { name: 'Sunny', emoji: '☀️', x: 80, y: 100 },
    { name: 'Rainy', emoji: '🌧️', x: 280, y: 100 },
    { name: 'Cloudy', emoji: '☁️', x: 180, y: 220 },
  ]
  const transitions = [
    { from: 0, to: 0, label: '0.6', curve: -30 },
    { from: 0, to: 1, label: '0.2' },
    { from: 0, to: 2, label: '0.2' },
    { from: 1, to: 0, label: '0.3' },
    { from: 1, to: 1, label: '0.5', curve: -30 },
    { from: 1, to: 2, label: '0.2' },
    { from: 2, to: 0, label: '0.3' },
    { from: 2, to: 1, label: '0.3' },
    { from: 2, to: 2, label: '0.4', curve: 30 },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className={`text-sm font-bold mb-2 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Hidden States (Weather)</div>
          <div className="flex gap-3">
            {states.map(s => (
              <div key={s.name} className={`px-3 py-2 rounded-lg text-sm ${dark ? 'bg-slate-800' : 'bg-white border border-gray-200'}`}>
                {s.emoji} {s.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className={`text-sm font-bold mb-2 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Observed States</div>
          <div className="flex gap-3">
            {['🕶️ Sunglasses', '☂️ Umbrella', '🧥 Coat'].map(o => (
              <div key={o} className={`px-3 py-2 rounded-lg text-sm ${dark ? 'bg-slate-800' : 'bg-white border border-gray-200'}`}>{o}</div>
            ))}
          </div>
        </div>
      </div>
      <div className={`text-xs p-3 rounded-lg ${dark ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-slate-500'}`}>
        Transition probabilities: Sunny→Sunny (0.6), Sunny→Rainy (0.2), Rainy→Rainy (0.5), etc. Each row sums to 1. We observe behavior (sunglasses, umbrella) and infer hidden weather state.
      </div>
    </div>
  )
}

function RNNDemo({ dark }) {
  const types = [
    { name: 'Seq → Seq', example: 'Time series forecasting', visual: '○→○→○ ⇒ ●→●→●' },
    { name: 'Seq → Vec', example: 'Spam classification', visual: '○→○→○ ⇒ ●' },
    { name: 'Vec → Seq', example: 'Image captioning', visual: '● ⇒ ○→○→○' },
    { name: 'Enc → Dec', example: 'Translation', visual: '○→○→● ⇒ ●→○→○' },
  ]

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-lg font-mono text-sm text-center ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
        y_t = tanh(W_x · x_t + W_y · y_t-1 + b)
      </div>
      <div className="grid grid-cols-2 gap-3">
        {types.map(t => (
          <div key={t.name} className={`p-3 rounded-lg border ${dark ? 'border-purple-800 bg-purple-900/10' : 'border-purple-200 bg-purple-50'}`}>
            <div className="font-bold text-purple-500 text-sm">{t.name}</div>
            <div className="font-mono text-lg my-1">{t.visual}</div>
            <div className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{t.example}</div>
          </div>
        ))}
      </div>
      <div className={`text-sm p-3 rounded-lg border ${dark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
        <strong>Vanishing Gradient:</strong> Through long sequences, gradients shrink exponentially → network "forgets" early inputs. This is why LSTMs were invented.
      </div>
    </div>
  )
}

function GRUDemo({ dark }) {
  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-lg font-mono text-sm text-center ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
        h_t = z_t × h̃_t + (1 - z_t) × h_t-1
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border-2 ${dark ? 'border-purple-800 bg-purple-900/10' : 'border-purple-200 bg-purple-50'}`}>
          <h4 className="font-bold text-purple-500 mb-2">LSTM (4 layers)</h4>
          <ul className="space-y-1 text-sm">
            <li>Forget Gate (σ)</li>
            <li>Input Gate (σ + tanh)</li>
            <li>Cell State Update (+)</li>
            <li>Output Gate (σ + tanh)</li>
          </ul>
          <div className={`text-xs mt-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Separate cell state + hidden state</div>
        </div>
        <div className={`p-4 rounded-xl border-2 ${dark ? 'border-teal-800 bg-teal-900/10' : 'border-teal-200 bg-teal-50'}`}>
          <h4 className="font-bold text-teal-500 mb-2">GRU (3 layers)</h4>
          <ul className="space-y-1 text-sm">
            <li>Update Gate (z_t) — replaces forget+input</li>
            <li>Reset Gate (r_t)</li>
            <li>Candidate Hidden State</li>
          </ul>
          <div className={`text-xs mt-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Merged cell + hidden state</div>
        </div>
      </div>
      <div className={`text-sm p-3 rounded-lg ${dark ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-slate-600'}`}>
        <strong>Key simplification:</strong> z_t=1 → use all new info. z_t=0 → keep all old info. One gate does both jobs.
      </div>
    </div>
  )
}

function DefaultDemo({ dark, concept }) {
  return (
    <div className={`p-4 rounded-lg ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
      <div className="space-y-2">
        {concept.details.map((d, i) => (
          <div key={i} className={`p-3 rounded-lg border ${dark ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
            <span className="font-semibold text-sm">{d.label}:</span>{' '}
            <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{d.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DEMO_MAP = {
  pipeline: PipelineDemo,
  tfidf: TfidfDemo,
  ngrams: NgramsDemo,
  lstm: LSTMDemo,
  'self-attention': SelfAttentionDemo,
  word2vec: Word2VecDemo,
  transformer: TransformerDemo,
  'transformer-types': TransformerTypesDemo,
  'scaled-attention': ScaledAttentionDemo,
  hmm: HMMDemo,
  rnn: RNNDemo,
  gru: GRUDemo,
  'multi-head': ({ dark }) => (
    <div className="space-y-3">
      <div className={`p-3 rounded-lg font-mono text-sm text-center ${dark ? 'bg-slate-800' : 'bg-gray-50'}`}>
        MultiHead(Q,K,V) = Concat(head_1, ..., head_h) × W_O
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {['Head 1\n(syntax)', 'Head 2\n(semantics)', 'Head 3\n(proximity)', 'Head 4\n(coreference)'].map((h, i) => (
          <div key={i} className={`p-3 rounded-lg text-center text-xs whitespace-pre-line ${dark ? 'bg-teal-900/30 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
            <div className="font-bold text-teal-500 mb-1">Q,K,V</div>
            {h}
          </div>
        ))}
      </div>
      <div className={`text-center text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        ↓ Concatenate ↓ Dense Layer ↓ Output
      </div>
    </div>
  ),
  'cross-attention': ({ dark }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-3 rounded-lg text-center ${dark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
          <div className="font-bold text-teal-500 text-sm mb-2">Encoder (English)</div>
          {['The', 'cat', 'sat'].map(w => <div key={w} className={`px-2 py-1 rounded text-xs mb-1 ${dark ? 'bg-slate-800' : 'bg-white'}`}>{w} → K, V</div>)}
        </div>
        <div className={`p-3 rounded-lg text-center ${dark ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
          <div className="font-bold text-purple-500 text-sm mb-2">Decoder (French)</div>
          {['Le', 'chat', 'assis'].map(w => <div key={w} className={`px-2 py-1 rounded text-xs mb-1 ${dark ? 'bg-slate-800' : 'bg-white'}`}>{w} → Q</div>)}
        </div>
      </div>
      <div className={`text-xs text-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        Decoder queries (Q) attend to encoder keys/values (K, V) — "what English word should I focus on?"
      </div>
    </div>
  ),
}

export default function ConceptExplorer({ dark, markVisited, getProgress }) {
  const [activeId, setActiveId] = useState(concepts[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const activeConcept = concepts.find(c => c.id === activeId) || concepts[0]
  const colors = TOPIC_COLORS[activeConcept.category]

  useEffect(() => {
    markVisited('concepts', activeId)
  }, [activeId, markVisited])

  useEffect(() => {
    const handler = (e) => {
      const id = e.detail
      if (concepts.find(c => c.id === id)) {
        setActiveId(id)
      }
    }
    window.addEventListener('navigate-concept', handler)
    return () => window.removeEventListener('navigate-concept', handler)
  }, [])

  const progress = getProgress('concepts', concepts.length)

  const DemoComponent = DEMO_MAP[activeConcept.interactive] || null

  return (
    <div className="flex gap-6">
      {/* Mobile toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`md:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full shadow-lg ${dark ? 'bg-teal-700 text-white' : 'bg-teal-500 text-white'}`}>
        📚
      </button>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'fixed inset-0 z-30 pt-20' : 'hidden'} md:block md:static md:w-72 flex-shrink-0 ${dark ? 'bg-slate-900' : 'bg-white'} md:bg-transparent`}>
        <div className={`md:sticky md:top-20 p-4 md:p-0 h-full md:h-auto overflow-y-auto ${sidebarOpen ? `${dark ? 'bg-slate-900' : 'bg-white'} p-6` : ''}`}>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="md:hidden float-right p-2 text-lg">✕</button>
          )}
          <div className="mb-3">
            <div className={`text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Progress: {progress}%</div>
            <div className={`h-1.5 rounded-full mt-1 ${dark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {CATEGORIES.map(cat => {
            const catConcepts = concepts.filter(c => c.category === cat.id)
            return (
              <div key={cat.id} className="mb-4">
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${TOPIC_COLORS[cat.id].accent}`}>{cat.label}</div>
                {catConcepts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setActiveId(c.id); setSidebarOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                      activeId === c.id
                        ? `${TOPIC_COLORS[c.category].bg} ${TOPIC_COLORS[c.category].border} border font-medium`
                        : dark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-50 text-slate-600'
                    }`}
                  >
                    {c.priority >= 2 && <span className="mr-1">{c.priority === 3 ? '⭐⭐' : '⭐'}</span>}
                    {c.title.replace(/^\d+\.\d+\s*/, '')}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className={`rounded-2xl border p-6 md:p-8 ${colors.bg} ${colors.border}`}>
          {/* Title */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {activeConcept.title}
                </h2>
                {activeConcept.priority === 3 && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>HIGHEST PRIORITY</span>}
                {activeConcept.priority === 2 && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dark ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>HIGH PRIORITY</span>}
              </div>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                {CATEGORIES.find(c => c.id === activeConcept.category)?.label}
              </span>
            </div>
          </div>

          {/* Summary */}
          <p className={`text-base leading-relaxed mb-6 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
            {activeConcept.summary}
          </p>

          {/* Interactive Demo */}
          {DemoComponent ? (
            <div className="mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${colors.accent}`}>Interactive Demo</h3>
              <DemoComponent dark={dark} concept={activeConcept} />
            </div>
          ) : (
            <DefaultDemo dark={dark} concept={activeConcept} />
          )}

          {/* Details (for demos that have them separately) */}
          {DemoComponent && (
            <div className="mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Key Concepts</h3>
              <div className="space-y-2">
                {activeConcept.details.map((d, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white/70'}`}>
                    <span className={`font-semibold text-sm ${colors.accent}`}>{d.label}:</span>{' '}
                    <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{d.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Callout boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${dark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🌍</span>
                <h4 className="font-bold text-teal-500 text-sm">Real-World Application</h4>
              </div>
              <p className={`text-sm ${dark ? 'text-teal-300' : 'text-teal-700'}`}>{activeConcept.realWorld}</p>
            </div>
            <div className={`p-4 rounded-xl border ${dark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <h4 className="font-bold text-amber-500 text-sm">Key Exam Insight</h4>
              </div>
              <p className={`text-sm ${dark ? 'text-amber-300' : 'text-amber-700'}`}>{activeConcept.examInsight}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          {(() => {
            const idx = concepts.findIndex(c => c.id === activeId)
            const prev = idx > 0 ? concepts[idx - 1] : null
            const next = idx < concepts.length - 1 ? concepts[idx + 1] : null
            return (
              <>
                {prev ? (
                  <button onClick={() => setActiveId(prev.id)} className={`px-4 py-2 rounded-lg text-sm ${dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-gray-50 text-slate-600 border border-gray-200'}`}>
                    ← {prev.title.replace(/^\d+\.\d+\s*/, '')}
                  </button>
                ) : <div />}
                {next ? (
                  <button onClick={() => setActiveId(next.id)} className={`px-4 py-2 rounded-lg text-sm ${dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-gray-50 text-slate-600 border border-gray-200'}`}>
                    {next.title.replace(/^\d+\.\d+\s*/, '')} →
                  </button>
                ) : <div />}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
