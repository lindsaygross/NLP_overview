import { useState, useEffect, useCallback, useRef } from 'react'
import { concepts, TOPIC_COLORS } from '../data/concepts'

/* ---------- constants ---------- */
const CATEGORIES = [
  { key: 'traditional', label: 'Traditional NLP' },
  { key: 'embeddings', label: 'Embeddings' },
  { key: 'sequence', label: 'Sequence Models' },
  { key: 'attention', label: 'Attention & Transformers' },
  { key: 'applications', label: 'Applications' },
]

const STOP_WORDS = new Set([
  'i','me','my','myself','we','our','ours','ourselves','you','your','yours',
  'yourself','yourselves','he','him','his','himself','she','her','hers',
  'herself','it','its','itself','they','them','their','theirs','themselves',
  'what','which','who','whom','this','that','these','those','am','is','are',
  'was','were','be','been','being','have','has','had','having','do','does',
  'did','doing','a','an','the','and','but','if','or','because','as','until',
  'while','of','at','by','for','with','about','against','between','through',
  'during','before','after','above','below','to','from','up','down','in',
  'out','on','off','over','under','again','further','then','once','here',
  'there','when','where','why','how','all','both','each','few','more','most',
  'other','some','such','no','nor','not','only','own','same','so','than',
  'too','very','s','t','can','will','just','don','should','now',
])

const SUFFIX_RE = /(ing|tion|sion|ment|ness|ful|less|able|ible|ous|ive|ly|ed|er|est|es|s)$/i

function priorityLabel(p) {
  if (p === 3) return { stars: '\u2B50\u2B50', tag: 'HIGHEST PRIORITY' }
  if (p === 2) return { stars: '\u2B50', tag: 'HIGH PRIORITY' }
  if (p === 1) return { stars: '', tag: 'Important' }
  return { stars: '', tag: '' }
}

/* ================================================================
   Interactive Demo Components
   ================================================================ */

/* ---------- Pipeline ---------- */
function PipelineDemo({ dark }) {
  const [text, setText] = useState('The cats are quickly running through the beautiful gardens')
  const tokens = text.trim() ? text.trim().split(/\s+/) : []
  const noStop = tokens.filter(w => !STOP_WORDS.has(w.toLowerCase()))
  const stemmed = noStop.map(w => w.replace(SUFFIX_RE, '').toLowerCase() || w.toLowerCase())
  const lemmaMap = {
    cats:'cat', running:'run', gardens:'garden', quickly:'quick',
    beautiful:'beauty', studies:'study', changing:'change', better:'good',
    are:'be', were:'be', is:'be', has:'have', had:'have',
  }
  const lemmatized = noStop.map(w =>
    lemmaMap[w.toLowerCase()] || w.replace(SUFFIX_RE, '').toLowerCase() || w.toLowerCase()
  )

  const box = dark
    ? 'bg-slate-700/60 border border-slate-600 rounded-lg p-3'
    : 'bg-white border border-gray-200 rounded-lg p-3 shadow-sm'

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-1">Enter text to process:</label>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300 text-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
        placeholder="Type a sentence\u2026"
      />
      <div className="grid gap-3">
        <div className={box}>
          <div className="text-xs font-semibold text-teal-500 mb-1">1. Raw Tokens</div>
          <div className="flex flex-wrap gap-1">
            {tokens.map((w, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-slate-600' : 'bg-gray-100'}`}>{w}</span>
            ))}
          </div>
        </div>
        <div className="text-center text-lg select-none opacity-40">&darr;</div>
        <div className={box}>
          <div className="text-xs font-semibold text-amber-500 mb-1">2. Stop Words Removed</div>
          <div className="flex flex-wrap gap-1">
            {noStop.map((w, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-amber-900/40 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>{w}</span>
            ))}
          </div>
          <div className={`text-xs mt-1 italic ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Removed: {tokens.filter(w => STOP_WORDS.has(w.toLowerCase())).join(', ') || 'none'}
          </div>
        </div>
        <div className="text-center text-lg select-none opacity-40">&darr;</div>
        <div className={box}>
          <div className="text-xs font-semibold text-purple-500 mb-1">3. Stemmed (suffix removal)</div>
          <div className="flex flex-wrap gap-1">
            {stemmed.map((w, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-purple-900/40 text-purple-200' : 'bg-purple-50 text-purple-800'}`}>{w}</span>
            ))}
          </div>
        </div>
        <div className="text-center text-lg select-none opacity-40">&darr;</div>
        <div className={box}>
          <div className="text-xs font-semibold text-green-500 mb-1">4. Lemmatized (dictionary form)</div>
          <div className="flex flex-wrap gap-1">
            {lemmatized.map((w, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-xs ${dark ? 'bg-green-900/40 text-green-200' : 'bg-green-50 text-green-800'}`}>{w}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- TF-IDF ---------- */
function TfidfDemo({ dark }) {
  const [doc1, setDoc1] = useState('the cat sat on the mat')
  const [doc2, setDoc2] = useState('the dog sat on the log')

  const getWords = t => t.toLowerCase().split(/\s+/).filter(Boolean)
  const w1 = getWords(doc1)
  const w2 = getWords(doc2)
  const vocab = [...new Set([...w1, ...w2])].sort()

  const freq = (words) => {
    const m = {}
    words.forEach(w => { m[w] = (m[w] || 0) + 1 })
    return m
  }
  const f1 = freq(w1)
  const f2 = freq(w2)
  const N = 2

  const df = {}
  vocab.forEach(w => { df[w] = (f1[w] ? 1 : 0) + (f2[w] ? 1 : 0) })

  const tfidf = (tf, word) => {
    const termFreq = tf[word] || 0
    const idf = Math.log(N / df[word])
    return +(termFreq * idf).toFixed(3)
  }

  const inp = `w-full px-3 py-2 rounded-lg border text-sm ${dark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300 text-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500`

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Document 1</label>
          <input value={doc1} onChange={e => setDoc1(e.target.value)} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Document 2</label>
          <input value={doc2} onChange={e => setDoc2(e.target.value)} className={inp} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-xs border-collapse ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
          <thead>
            <tr className={dark ? 'bg-slate-700/50' : 'bg-gray-100'}>
              <th className="px-2 py-1.5 text-left font-semibold">Word</th>
              <th className="px-2 py-1.5 font-semibold">BoW D1</th>
              <th className="px-2 py-1.5 font-semibold">BoW D2</th>
              <th className="px-2 py-1.5 font-semibold">DF</th>
              <th className="px-2 py-1.5 font-semibold">IDF</th>
              <th className="px-2 py-1.5 font-semibold">TF-IDF D1</th>
              <th className="px-2 py-1.5 font-semibold">TF-IDF D2</th>
            </tr>
          </thead>
          <tbody>
            {vocab.map(w => {
              const idf = Math.log(N / df[w])
              const t1 = tfidf(f1, w)
              const t2 = tfidf(f2, w)
              const highlight = idf > 0
              return (
                <tr key={w} className={`border-t ${dark ? 'border-slate-700' : 'border-gray-200'} ${highlight ? (dark ? 'bg-teal-900/20' : 'bg-teal-50/50') : ''}`}>
                  <td className="px-2 py-1 font-mono">{w}</td>
                  <td className="px-2 py-1 text-center">{f1[w] || 0}</td>
                  <td className="px-2 py-1 text-center">{f2[w] || 0}</td>
                  <td className="px-2 py-1 text-center">{df[w]}</td>
                  <td className="px-2 py-1 text-center">{idf.toFixed(3)}</td>
                  <td className={`px-2 py-1 text-center font-semibold ${t1 > 0 ? 'text-teal-500' : ''}`}>{t1}</td>
                  <td className={`px-2 py-1 text-center font-semibold ${t2 > 0 ? 'text-teal-500' : ''}`}>{t2}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-xs italic ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        Words shared across both documents get IDF=0, meaning TF-IDF=0. Unique words get higher scores &mdash; this is the key insight of TF-IDF.
      </p>
    </div>
  )
}

/* ---------- N-grams ---------- */
function NgramsDemo({ dark }) {
  const [text, setText] = useState('I did not love the movie but the acting was good')
  const [n, setN] = useState(1)
  const words = text.trim().split(/\s+/).filter(Boolean)
  const ngrams = []
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '))
  }
  const labels = { 1: 'Unigrams', 2: 'Bigrams', 3: 'Trigrams' }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-1">Enter text:</label>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-gray-300 text-slate-800'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
      />
      <div className="flex gap-2">
        {[1, 2, 3].map(v => (
          <button
            key={v}
            onClick={() => setN(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              n === v
                ? 'bg-teal-600 text-white shadow-md'
                : dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
            }`}
          >
            {labels[v]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ngrams.map((g, i) => (
          <span key={i} className={`px-3 py-1 rounded-full text-sm ${dark ? 'bg-amber-900/40 text-amber-200 border border-amber-700' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
            {g}
          </span>
        ))}
      </div>
      <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        {ngrams.length} {labels[n].toLowerCase()} generated.
        {n >= 2 && ' Notice how "not love" appears as a bigram \u2014 capturing negation that unigrams miss!'}
      </p>
    </div>
  )
}

/* ---------- LSTM ---------- */
function LstmDemo({ dark }) {
  const [step, setStep] = useState(0)
  const TOTAL = 5

  const gates = [
    {
      name: 'Overview',
      color: 'slate',
      desc: 'An LSTM cell processes one timestep. It receives the previous hidden state h(t\u22121), previous cell state C(t\u22121), and current input x(t). Four components work together to decide what to remember, what to forget, and what to output.',
      formula: '',
      activation: '',
    },
    {
      name: 'Forget Gate',
      color: 'red',
      desc: 'Decides what to THROW AWAY from the cell state. Sigmoid outputs values between 0 (forget completely) and 1 (keep completely) for each dimension of the cell state vector.',
      formula: 'f(t) = \u03C3( W_f \u00B7 [h(t\u22121), x(t)] + b_f )',
      activation: 'Sigmoid \u2192 [0, 1]',
    },
    {
      name: 'Input Gate',
      color: 'green',
      desc: 'Two parts work together: (1) A sigmoid layer decides WHICH values to update. (2) A tanh layer creates a vector of NEW candidate values. Their element-wise product determines what new information enters the cell state.',
      formula: 'i(t) = \u03C3( W_i \u00B7 [h(t\u22121), x(t)] + b_i )\n\u0108(t) = tanh( W_C \u00B7 [h(t\u22121), x(t)] + b_C )',
      activation: 'Sigmoid [0,1] \u00D7 Tanh [\u22121,1]',
    },
    {
      name: 'Cell State Update',
      color: 'blue',
      desc: 'The ADDITIVE update is the key innovation that solves vanishing gradients. The old cell state is scaled by the forget gate, then the new candidate values (scaled by the input gate) are ADDED. Because this is addition (not multiplication), gradients flow through unchanged.',
      formula: 'C(t) = f(t) \u2299 C(t\u22121) + i(t) \u2299 \u0108(t)',
      activation: 'Additive update (not multiplicative!)',
    },
    {
      name: 'Output Gate',
      color: 'purple',
      desc: 'Determines what parts of the cell state to OUTPUT as the hidden state. A sigmoid gate filters the cell state, then tanh squashes it to [\u22121, 1]. The resulting hidden state h(t) is both the output and the recurrent input for the next timestep.',
      formula: 'o(t) = \u03C3( W_o \u00B7 [h(t\u22121), x(t)] + b_o )\nh(t) = o(t) \u2299 tanh( C(t) )',
      activation: 'Sigmoid [0,1] \u00D7 Tanh [\u22121,1]',
    },
  ]

  const colorMap = {
    slate:  { bg: dark ? 'bg-slate-700'       : 'bg-slate-200',   border: dark ? 'border-slate-500'  : 'border-slate-400',  text: dark ? 'text-slate-200'  : 'text-slate-700'  },
    red:    { bg: dark ? 'bg-red-900/50'       : 'bg-red-100',     border: dark ? 'border-red-600'    : 'border-red-400',    text: dark ? 'text-red-300'    : 'text-red-700'    },
    green:  { bg: dark ? 'bg-green-900/50'     : 'bg-green-100',   border: dark ? 'border-green-600'  : 'border-green-400',  text: dark ? 'text-green-300'  : 'text-green-700'  },
    blue:   { bg: dark ? 'bg-blue-900/50'      : 'bg-blue-100',    border: dark ? 'border-blue-600'   : 'border-blue-400',   text: dark ? 'text-blue-300'   : 'text-blue-700'   },
    purple: { bg: dark ? 'bg-purple-900/50'    : 'bg-purple-100',  border: dark ? 'border-purple-600' : 'border-purple-400', text: dark ? 'text-purple-300' : 'text-purple-700' },
  }

  const g = gates[step]
  const c = colorMap[g.color]

  return (
    <div className="space-y-4">
      {/* Step navigation buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {gates.map((gate, i) => {
          const gc = colorMap[gate.color]
          return (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                step === i
                  ? `${gc.bg} ${gc.border} ${gc.text} ring-2 ring-offset-1 ${dark ? 'ring-offset-slate-800' : 'ring-offset-white'} ring-current`
                  : `${dark ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-gray-100 border-gray-300 text-slate-500'} hover:opacity-80`
              }`}
            >
              {i === 0 ? 'Overview' : `${i}. ${gate.name}`}
            </button>
          )
        })}
      </div>

      {/* Active gate detail */}
      <div className={`rounded-xl border-2 p-5 transition-all duration-300 ${c.bg} ${c.border}`}>
        <h4 className={`text-lg font-bold mb-2 ${c.text}`}>{g.name}</h4>
        <p className={`text-sm mb-3 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{g.desc}</p>
        {g.formula && (
          <div className={`font-mono text-sm p-3 rounded-lg mb-2 ${dark ? 'bg-slate-900/50' : 'bg-white/70'}`}>
            {g.formula.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}
        {g.activation && (
          <div className={`text-xs font-semibold ${c.text}`}>Activation: {g.activation}</div>
        )}
      </div>

      {/* Visual LSTM cell diagram */}
      <div className={`rounded-xl p-4 ${dark ? 'bg-slate-800/50' : 'bg-gray-50'} border ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="text-xs font-semibold mb-3 text-center opacity-70">LSTM Cell Data Flow</div>
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap text-xs">
          <div className={`px-3 py-2 rounded border-2 text-center ${dark ? 'bg-slate-700 border-slate-500' : 'bg-white border-gray-300'}`}>
            h(t-1)<br />x(t)
          </div>
          <span className="opacity-40">&rarr;</span>
          <div className={`px-3 py-2 rounded border-2 text-center transition-all ${step === 1 ? 'ring-2 ring-red-400 scale-105' : ''} ${colorMap.red.bg} ${colorMap.red.border}`}>
            <div className={`font-bold ${colorMap.red.text}`}>Forget</div>
            <div className="opacity-60">&sigma;</div>
          </div>
          <span className="opacity-40">&rarr;</span>
          <div className={`px-3 py-2 rounded border-2 text-center transition-all ${step === 2 ? 'ring-2 ring-green-400 scale-105' : ''} ${colorMap.green.bg} ${colorMap.green.border}`}>
            <div className={`font-bold ${colorMap.green.text}`}>Input</div>
            <div className="opacity-60">&sigma; + tanh</div>
          </div>
          <span className="opacity-40">&rarr;</span>
          <div className={`px-3 py-2 rounded border-2 text-center transition-all ${step === 3 ? 'ring-2 ring-blue-400 scale-105' : ''} ${colorMap.blue.bg} ${colorMap.blue.border}`}>
            <div className={`font-bold ${colorMap.blue.text}`}>Cell</div>
            <div className="opacity-60">C(t)</div>
          </div>
          <span className="opacity-40">&rarr;</span>
          <div className={`px-3 py-2 rounded border-2 text-center transition-all ${step === 4 ? 'ring-2 ring-purple-400 scale-105' : ''} ${colorMap.purple.bg} ${colorMap.purple.border}`}>
            <div className={`font-bold ${colorMap.purple.text}`}>Output</div>
            <div className="opacity-60">&sigma; &times; tanh</div>
          </div>
          <span className="opacity-40">&rarr;</span>
          <div className={`px-3 py-2 rounded border-2 text-center ${dark ? 'bg-slate-700 border-slate-500' : 'bg-white border-gray-300'}`}>
            h(t)<br />C(t)
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${step === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'} ${dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-slate-700'}`}
        >&larr; Previous</button>
        <button
          onClick={() => setStep(Math.min(TOTAL - 1, step + 1))}
          disabled={step === TOTAL - 1}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${step === TOTAL - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'} ${dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-slate-700'}`}
        >Next &rarr;</button>
      </div>
    </div>
  )
}

/* ---------- Self-Attention ---------- */
function SelfAttentionDemo({ dark }) {
  const [step, setStep] = useState(0)
  const words = ['The', 'bank', 'of', 'the', 'river']

  // Simulated dot-product similarity scores when "bank" is the query
  const rawScores = [0.1, 1.0, 0.05, 0.1, 0.85]
  const expScores = rawScores.map(s => Math.exp(s))
  const sumExp = expScores.reduce((a, b) => a + b, 0)
  const softmax = expScores.map(s => s / sumExp)

  const steps = [
    { title: 'Step 1: Compute Dot Products',   desc: 'For the word "bank", compute the dot product with every word\'s vector (including itself). Higher dot product = more similar/relevant.' },
    { title: 'Step 2: Softmax Normalization',   desc: 'Apply softmax to convert raw scores into a probability distribution summing to 1. These are the attention WEIGHTS (computed, not trained).' },
    { title: 'Step 3: Weighted Sum',            desc: 'Multiply each word\'s value vector by its attention weight and sum. "bank" now has a context-aware representation influenced most by "river".' },
  ]

  const maxRaw = Math.max(...rawScores)
  const maxSm  = Math.max(...softmax)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${step === i ? 'bg-teal-600 text-white' : dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-slate-700 hover:bg-gray-300'}`}>
            {s.title.split(':')[0]}
          </button>
        ))}
      </div>

      <div className={`rounded-xl p-4 border ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
        <h4 className="font-semibold text-sm mb-1">{steps[step].title}</h4>
        <p className={`text-xs mb-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{steps[step].desc}</p>

        <div className="text-center mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${dark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
            Query word: &ldquo;bank&rdquo;
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {words.map((w, i) => {
            const raw = rawScores[i]
            const sm  = softmax[i]
            const intensity = step === 0 ? raw / maxRaw : sm / maxSm
            const opVal = 0.15 + intensity * 0.85
            return (
              <div key={i} className="text-center space-y-1">
                <div
                  className={`px-2 py-3 rounded-lg border-2 transition-all duration-500 ${
                    i === 1
                      ? dark ? 'bg-teal-800/60 border-teal-500' : 'bg-teal-100 border-teal-400'
                      : dark ? 'bg-slate-700/60 border-slate-600' : 'bg-white border-gray-300'
                  }`}
                  style={{ opacity: step >= 2 ? opVal : 1 }}
                >
                  <div className="font-semibold text-sm">{w}</div>
                </div>
                <div className={`text-xs font-mono ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {step === 0 && raw.toFixed(2)}
                  {step >= 1 && `${(sm * 100).toFixed(1)}%`}
                </div>
                {step >= 2 && (
                  <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: dark ? '#334155' : '#e2e8f0' }}>
                    <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${sm * 100}%` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {step >= 2 && (
          <p className={`mt-3 text-xs text-center ${dark ? 'text-teal-400' : 'text-teal-600'}`}>
            &ldquo;bank&rdquo; now attends most to &ldquo;river&rdquo; ({(softmax[4] * 100).toFixed(1)}%) &mdash; becoming a context-aware &ldquo;river bank&rdquo; embedding.
          </p>
        )}
      </div>

      {/* Q / K / V explanation */}
      <div className={`rounded-lg p-3 text-xs space-y-2 ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
        <div className="font-semibold mb-1">Adding Q, K, V Matrices:</div>
        <div className="grid sm:grid-cols-3 gap-2">
          <div className={`rounded p-2 ${dark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <span className="font-bold">Q (Query)</span>: &ldquo;What am I looking for?&rdquo;
          </div>
          <div className={`rounded p-2 ${dark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
            <span className="font-bold">K (Key)</span>: &ldquo;What do I contain?&rdquo;
          </div>
          <div className={`rounded p-2 ${dark ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
            <span className="font-bold">V (Value)</span>: The actual info aggregated
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Word2Vec ---------- */
function Word2VecDemo({ dark }) {
  const pts = {
    king:  { x: 2, y: 4 },
    queen: { x: 4, y: 4 },
    man:   { x: 2, y: 1.5 },
    woman: { x: 4, y: 1.5 },
  }
  const result = {
    x: pts.king.x - pts.man.x + pts.woman.x,
    y: pts.king.y - pts.man.y + pts.woman.y,
  }

  const S  = 50
  const OX = 30
  const OY = 20
  const toSvg = p => ({ cx: OX + p.x * S, cy: 260 - (OY + p.y * S) })

  const fillFor = name => (name === 'king' || name === 'man') ? '#3b82f6' : '#ec4899'

  return (
    <div className="space-y-3">
      <div className={`rounded-xl p-4 border ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="text-center mb-3">
          <span className="font-mono text-sm font-bold">king &minus; man + woman = queen</span>
        </div>
        <svg viewBox="0 0 300 280" className="w-full max-w-md mx-auto" style={{ height: 280 }}>
          {/* grid */}
          {[0,1,2,3,4,5].map(i => (
            <g key={i}>
              <line x1={OX+i*S} y1={260-OY} x2={OX+i*S} y2={260-OY-5*S} stroke={dark?'#475569':'#cbd5e1'} strokeWidth="0.5" strokeDasharray="4,4" />
              <line x1={OX} y1={260-OY-i*S} x2={OX+5*S} y2={260-OY-i*S} stroke={dark?'#475569':'#cbd5e1'} strokeWidth="0.5" strokeDasharray="4,4" />
            </g>
          ))}

          <defs>
            <marker id="agender" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
            <marker id="aroyalty" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" /></marker>
          </defs>

          {/* gender arrows */}
          <line x1={toSvg(pts.man).cx} y1={toSvg(pts.man).cy} x2={toSvg(pts.woman).cx} y2={toSvg(pts.woman).cy} stroke="#f59e0b" strokeWidth="2" markerEnd="url(#agender)" strokeDasharray="6,3" />
          <line x1={toSvg(pts.king).cx} y1={toSvg(pts.king).cy} x2={toSvg(pts.queen).cx} y2={toSvg(pts.queen).cy} stroke="#f59e0b" strokeWidth="2" markerEnd="url(#agender)" strokeDasharray="6,3" />
          {/* royalty arrows */}
          <line x1={toSvg(pts.man).cx} y1={toSvg(pts.man).cy} x2={toSvg(pts.king).cx} y2={toSvg(pts.king).cy} stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#aroyalty)" strokeDasharray="6,3" />
          <line x1={toSvg(pts.woman).cx} y1={toSvg(pts.woman).cy} x2={toSvg(pts.queen).cx} y2={toSvg(pts.queen).cy} stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#aroyalty)" strokeDasharray="6,3" />

          {/* points */}
          {Object.entries(pts).map(([name, p]) => {
            const s = toSvg(p)
            return (
              <g key={name}>
                <circle cx={s.cx} cy={s.cy} r="6" fill={fillFor(name)} />
                <text x={s.cx} y={s.cy - 12} textAnchor="middle" fontSize="12" fontWeight="bold" fill={dark ? '#e2e8f0' : '#1e293b'}>{name}</text>
                <text x={s.cx} y={s.cy + 18} textAnchor="middle" fontSize="9" fill={dark ? '#94a3b8' : '#64748b'}>({p.x}, {p.y})</text>
              </g>
            )
          })}

          {/* axis labels */}
          <text x={OX + 3*S} y={toSvg(pts.man).cy + 35} textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold">gender direction &rarr;</text>
        </svg>
      </div>
      <div className={`text-xs space-y-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        <p><strong>Arithmetic:</strong> king(2,4) &minus; man(2,1.5) + woman(4,1.5) = ({result.x},{result.y}) = queen!</p>
        <p>The &ldquo;gender&rdquo; direction (horizontal) and &ldquo;royalty&rdquo; direction (vertical) are learned automatically from text co-occurrence patterns.</p>
        <p><strong>Limitation:</strong> These are STATIC embeddings &mdash; &ldquo;bank&rdquo; always gets the same vector regardless of context.</p>
      </div>
    </div>
  )
}

/* ---------- Transformer Architecture ---------- */
function TransformerDemo({ dark }) {
  const block = (color, text) => (
    <div className={`rounded-lg border-2 px-3 py-2 text-xs font-medium text-center ${color}`}>{text}</div>
  )

  const enc  = dark ? 'bg-blue-900/40 border-blue-600 text-blue-300'       : 'bg-blue-50 border-blue-400 text-blue-700'
  const dec  = dark ? 'bg-purple-900/40 border-purple-600 text-purple-300' : 'bg-purple-50 border-purple-400 text-purple-700'
  const ffn  = dark ? 'bg-slate-700 border-slate-500 text-slate-300'       : 'bg-gray-100 border-gray-400 text-gray-700'
  const norm = dark ? 'bg-amber-900/30 border-amber-700 text-amber-300'    : 'bg-amber-50 border-amber-400 text-amber-700'
  const xatt = dark ? 'bg-teal-900/40 border-teal-600 text-teal-300'      : 'bg-teal-50 border-teal-400 text-teal-700'
  const out  = dark ? 'bg-green-900/40 border-green-600 text-green-300'    : 'bg-green-50 border-green-400 text-green-700'
  const ar   = 'text-center text-sm opacity-40 select-none'

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 border ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="text-center text-xs font-bold mb-4 uppercase tracking-wider opacity-60">Transformer Architecture</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Encoder */}
          <div className="space-y-2">
            <div className={`text-center text-sm font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>ENCODER</div>
            {block(enc, 'Input Embeddings + Positional Encoding')}
            <div className={ar}>&darr;</div>
            <div className={`rounded-xl border-2 p-3 space-y-2 ${dark ? 'border-blue-700 bg-blue-950/20' : 'border-blue-300 bg-blue-50/50'}`}>
              <div className="text-xs font-bold text-center opacity-60">&times; N blocks</div>
              {block(enc, 'Multi-Head Self-Attention')}
              <div className={ar}>&darr; + skip connection</div>
              {block(norm, 'Layer Normalization')}
              <div className={ar}>&darr;</div>
              {block(ffn, 'Feed-Forward Network (2 linear layers + ReLU)')}
              <div className={ar}>&darr; + skip connection</div>
              {block(norm, 'Layer Normalization')}
            </div>
            <div className={ar}>&darr; encoder output</div>
          </div>

          {/* Decoder */}
          <div className="space-y-2">
            <div className={`text-center text-sm font-bold ${dark ? 'text-purple-400' : 'text-purple-600'}`}>DECODER</div>
            {block(dec, 'Output Embeddings + Positional Encoding (shifted right)')}
            <div className={ar}>&darr;</div>
            <div className={`rounded-xl border-2 p-3 space-y-2 ${dark ? 'border-purple-700 bg-purple-950/20' : 'border-purple-300 bg-purple-50/50'}`}>
              <div className="text-xs font-bold text-center opacity-60">&times; N blocks</div>
              {block(dec, 'Masked Multi-Head Self-Attention')}
              <div className={ar}>&darr; + skip connection</div>
              {block(norm, 'Layer Normalization')}
              <div className={ar}>&darr;</div>
              {block(xatt, 'Cross-Attention (Q from decoder, K/V from encoder)')}
              <div className={ar}>&darr; + skip connection</div>
              {block(norm, 'Layer Normalization')}
              <div className={ar}>&darr;</div>
              {block(ffn, 'Feed-Forward Network')}
              <div className={ar}>&darr; + skip connection</div>
              {block(norm, 'Layer Normalization')}
            </div>
            <div className={ar}>&darr;</div>
            {block(out, 'Linear + Softmax \u2192 Output Probabilities')}
          </div>
        </div>
      </div>
      <div className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'} space-y-1`}>
        <p><strong>Skip connections</strong> add the input of each sub-layer to its output (like ResNet), preventing vanishing gradients in deep stacks.</p>
        <p><strong>Masking</strong> in the decoder prevents attending to future tokens by setting them to &minus;&infin; before softmax.</p>
        <p><strong>Cross-attention</strong> lets the decoder attend to the full encoder output &mdash; this is how it &ldquo;reads&rdquo; the source sequence.</p>
      </div>
    </div>
  )
}

/* ---------- Generic / fallback demos ---------- */
function GenericInteractiveDemo({ dark, type, concept }) {
  const diagrams = {
    'hmm': (
      <div className="space-y-3">
        <div className="text-xs font-bold text-center uppercase tracking-wider opacity-60 mb-2">Hidden Markov Model</div>
        <div className="flex items-center justify-center gap-3 flex-wrap text-xs">
          {['Sunny', 'Rainy', 'Cloudy'].map(state => (
            <div key={state} className={`px-4 py-3 rounded-xl border-2 text-center ${dark ? 'bg-amber-900/30 border-amber-600 text-amber-300' : 'bg-amber-50 border-amber-400 text-amber-700'}`}>
              <div className="font-bold">{state}</div>
              <div className="text-xs opacity-60 mt-1">Hidden State</div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm opacity-40">&darr; emit observations with probability</div>
        <div className="flex items-center justify-center gap-3 flex-wrap text-xs">
          {['\uD83C\uDF02 Umbrella', '\uD83D\uDD76\uFE0F Sunglasses', '\uD83E\uDDE5 Coat'].map(obs => (
            <div key={obs} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-slate-700 border-slate-500 text-slate-300' : 'bg-white border-gray-300 text-slate-700'}`}>
              {obs}
            </div>
          ))}
        </div>
        <p className={`text-xs text-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          We observe outputs but must infer the hidden states using transition and emission probabilities.
        </p>
      </div>
    ),
    'rnn': (
      <div className="space-y-3">
        <div className="text-xs font-bold text-center uppercase tracking-wider opacity-60 mb-2">RNN Unrolled Through Time</div>
        <div className="flex items-center justify-center gap-4 flex-wrap text-xs">
          {['t-2', 't-1', 't'].map((t, i) => (
            <div key={t} className="flex flex-col items-center gap-1">
              <div className={`px-3 py-2 rounded-lg border ${dark ? 'bg-slate-700 border-slate-500' : 'bg-white border-gray-300'}`}>x({t})</div>
              <span className="opacity-40">&darr;</span>
              <div className={`px-3 py-2 rounded-lg border-2 ${dark ? 'bg-purple-900/40 border-purple-600 text-purple-300' : 'bg-purple-50 border-purple-400 text-purple-700'}`}>
                h({t})
              </div>
              <span className="opacity-40">&darr;</span>
              <div className={`px-3 py-2 rounded-lg border ${dark ? 'bg-teal-900/40 border-teal-600 text-teal-300' : 'bg-teal-50 border-teal-400 text-teal-700'}`}>
                y({t})
              </div>
            </div>
          ))}
        </div>
        <div className={`text-center font-mono text-xs p-2 rounded-lg ${dark ? 'bg-slate-900/50' : 'bg-white'}`}>
          h(t) = tanh( W_x &middot; x(t) + W_h &middot; h(t-1) + b )
        </div>
        <p className={`text-xs text-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Each hidden state depends on the current input AND the previous hidden state. Gradients must flow through all timesteps &mdash; causing the vanishing gradient problem for long sequences.
        </p>
      </div>
    ),
    'gru': (
      <div className="space-y-3">
        <div className="text-xs font-bold text-center uppercase tracking-wider opacity-60 mb-2">GRU vs LSTM Comparison</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className={`rounded-lg p-3 border ${dark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'}`}>
            <div className="font-bold text-center mb-2">LSTM (4 components)</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Forget gate (&sigma;)</li>
              <li>Input gate (&sigma; + tanh)</li>
              <li>Cell state (separate)</li>
              <li>Output gate (&sigma;)</li>
            </ul>
          </div>
          <div className={`rounded-lg p-3 border ${dark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-300'}`}>
            <div className="font-bold text-center mb-2">GRU (3 components)</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Update gate (z) &mdash; replaces forget+input</li>
              <li>Reset gate (r)</li>
              <li>Hidden state (merged with cell)</li>
            </ul>
          </div>
        </div>
        <div className={`text-center font-mono text-xs p-2 rounded-lg ${dark ? 'bg-slate-900/50' : 'bg-white'}`}>
          h(t) = z(t) &odot; h&#x0303;(t) + (1 &minus; z(t)) &odot; h(t&minus;1)
        </div>
      </div>
    ),
    'scaled-attention': (
      <div className="space-y-3">
        <div className="text-xs font-bold text-center uppercase tracking-wider opacity-60 mb-2">Why Scale by &radic;d_k?</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className={`rounded-lg p-3 border ${dark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-700'}`}>
            <div className="font-bold mb-1">Without Scaling (d=512)</div>
            <div className="font-mono">dot products ~ [&minus;30, 30]</div>
            <div className="font-mono">softmax &rarr; [0.00, 0.00, 0.99, 0.00]</div>
            <div className="mt-1 opacity-70">Near one-hot &rarr; vanishing gradients</div>
          </div>
          <div className={`rounded-lg p-3 border ${dark ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-50 border-green-300 text-green-700'}`}>
            <div className="font-bold mb-1">With Scaling (/&radic;512 &asymp; 22.6)</div>
            <div className="font-mono">scores ~ [&minus;1.3, 1.3]</div>
            <div className="font-mono">softmax &rarr; [0.15, 0.20, 0.40, 0.25]</div>
            <div className="mt-1 opacity-70">Smooth distribution &rarr; stable gradients</div>
          </div>
        </div>
        <div className={`text-center font-mono text-sm p-2 rounded-lg ${dark ? 'bg-slate-800' : 'bg-white'} border ${dark ? 'border-slate-700' : 'border-gray-200'}`}>
          Attention(Q,K,V) = softmax(QK<sup>T</sup> / &radic;d<sub>k</sub>) &times; V
        </div>
      </div>
    ),
    'multi-head': (
      <div className="space-y-3">
        <div className="text-xs font-bold text-center uppercase tracking-wider opacity-60 mb-2">Multi-Head Attention</div>
        <div className="flex items-start justify-center gap-2 flex-wrap text-xs">
          {[
            { label: 'Head 1', sub: 'Syntactic' },
            { label: 'Head 2', sub: 'Semantic' },
            { label: 'Head 3', sub: 'Positional' },
            { label: '\u2026', sub: '' },
            { label: 'Head h', sub: 'Other' },
          ].map((h, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg border text-center ${
              h.sub === '' ? 'border-transparent' :
              dark ? 'bg-teal-900/30 border-teal-600 text-teal-300' : 'bg-teal-50 border-teal-400 text-teal-700'
            }`}>
              <div className="font-bold">{h.label}</div>
              {h.sub && <div className="opacity-60 text-xs">{h.sub}</div>}
            </div>
          ))}
        </div>
        <div className="text-center text-sm opacity-40">&darr; Concatenate all heads</div>
        <div className={`text-center px-4 py-2 rounded-lg border mx-auto max-w-xs text-xs ${dark ? 'bg-amber-900/30 border-amber-600 text-amber-300' : 'bg-amber-50 border-amber-400 text-amber-700'}`}>
          Dense Layer &rarr; Final Output
        </div>
        <p className={`text-xs text-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          Each head independently computes attention with its own Q, K, V weight matrices, learning different relationship types. More heads = more parameters = more aspects captured.
        </p>
      </div>
    ),
    'cross-attention': (
      <div className="space-y-3 text-xs">
        <div className="text-xs font-bold text-center uppercase tracking-wider opacity-60 mb-2">Cross-Attention: Translation Example</div>
        <div className="flex items-center justify-between gap-4">
          <div className={`flex-1 rounded-lg p-3 border ${dark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'}`}>
            <div className="font-bold text-center mb-2">Encoder (English)</div>
            <div className="flex gap-1 justify-center flex-wrap">
              {['The', 'cat', 'sat'].map(w => <span key={w} className={`px-2 py-1 rounded ${dark ? 'bg-blue-800/50' : 'bg-blue-100'}`}>{w}</span>)}
            </div>
            <div className="text-center mt-1 opacity-60">Provides K and V</div>
          </div>
          <div className="text-lg opacity-40">&rarr;</div>
          <div className={`flex-1 rounded-lg p-3 border ${dark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-300'}`}>
            <div className="font-bold text-center mb-2">Decoder (French)</div>
            <div className="flex gap-1 justify-center flex-wrap">
              {['Le', 'chat', '\u2026'].map(w => <span key={w} className={`px-2 py-1 rounded ${dark ? 'bg-purple-800/50' : 'bg-purple-100'}`}>{w}</span>)}
            </div>
            <div className="text-center mt-1 opacity-60">Provides Q</div>
          </div>
        </div>
        <p className={`text-center ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          The decoder asks &ldquo;what should I focus on?&rdquo; (Q) and the encoder answers with its representations (K, V).
        </p>
      </div>
    ),
    'transformer-types': (
      <div className="space-y-3">
        <div className="text-xs font-bold text-center uppercase tracking-wider opacity-60 mb-2">Transformer Architecture Types</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className={`rounded-lg p-3 border ${dark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'}`}>
            <div className="font-bold text-center mb-1">Encoder-Only</div>
            <div className="text-center opacity-70 mb-2">BERT, RoBERTa</div>
            <div className="text-center">&larr; Bidirectional &rarr;</div>
            <ul className="mt-2 space-y-0.5 opacity-80 list-disc list-inside">
              <li>Classification</li>
              <li>NER</li>
              <li>Similarity</li>
            </ul>
          </div>
          <div className={`rounded-lg p-3 border ${dark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-300'}`}>
            <div className="font-bold text-center mb-1">Decoder-Only</div>
            <div className="text-center opacity-70 mb-2">GPT, LLaMA</div>
            <div className="text-center">&rarr; Autoregressive</div>
            <ul className="mt-2 space-y-0.5 opacity-80 list-disc list-inside">
              <li>Text generation</li>
              <li>Code generation</li>
              <li>Chatbots</li>
            </ul>
          </div>
          <div className={`rounded-lg p-3 border ${dark ? 'bg-teal-900/30 border-teal-700' : 'bg-teal-50 border-teal-300'}`}>
            <div className="font-bold text-center mb-1">Encoder-Decoder</div>
            <div className="text-center opacity-70 mb-2">T5, BART</div>
            <div className="text-center">&larr;&rarr; + &rarr;</div>
            <ul className="mt-2 space-y-0.5 opacity-80 list-disc list-inside">
              <li>Translation</li>
              <li>Summarization</li>
              <li>Q&amp;A</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  }

  if (diagrams[type]) {
    return (
      <div className={`rounded-xl p-4 border ${dark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
        {diagrams[type]}
      </div>
    )
  }

  // Fallback for any other interactive type
  return (
    <div className={`rounded-xl p-4 border text-center text-sm ${dark ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-200 text-slate-500'}`}>
      Interactive exploration for &ldquo;{concept.title}&rdquo; &mdash; review the detailed breakdown above to build your understanding.
    </div>
  )
}

/* ---------- Interactive router ---------- */
function InteractiveDemo({ dark, type, concept }) {
  switch (type) {
    case 'pipeline':       return <PipelineDemo dark={dark} />
    case 'tfidf':          return <TfidfDemo dark={dark} />
    case 'ngrams':         return <NgramsDemo dark={dark} />
    case 'lstm':           return <LstmDemo dark={dark} />
    case 'self-attention': return <SelfAttentionDemo dark={dark} />
    case 'word2vec':       return <Word2VecDemo dark={dark} />
    case 'transformer':    return <TransformerDemo dark={dark} />
    default:               return <GenericInteractiveDemo dark={dark} type={type} concept={concept} />
  }
}

/* ================================================================
   ConceptExplorer  (main export)
   ================================================================ */

export default function ConceptExplorer({ dark, markVisited, getProgress }) {
  const [activeId, setActiveId] = useState(concepts[0].id)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [expandedDetails, setExpandedDetails] = useState({})
  const contentRef = useRef(null)

  const active = concepts.find(c => c.id === activeId) || concepts[0]

  // Mark concept as visited whenever it changes
  useEffect(() => {
    markVisited('concepts', activeId)
  }, [activeId, markVisited])

  // Listen for custom navigation events dispatched by ConnectionsMap
  useEffect(() => {
    const handler = (e) => {
      const id = e.detail
      if (concepts.find(c => c.id === id)) {
        setActiveId(id)
        setMobileSidebarOpen(false)
        if (contentRef.current) {
          contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }
    window.addEventListener('navigate-concept', handler)
    return () => window.removeEventListener('navigate-concept', handler)
  }, [])

  const selectConcept = useCallback((id) => {
    setActiveId(id)
    setMobileSidebarOpen(false)
    setExpandedDetails({})
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const toggleDetail = (idx) => {
    setExpandedDetails(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: concepts.filter(c => c.category === cat.key),
  }))

  const colors = TOPIC_COLORS[active.category] || TOPIC_COLORS.traditional
  const { stars, tag } = priorityLabel(active.priority)
  const progress = getProgress('concepts', concepts.length)

  return (
    <div className="space-y-4">
      {/* -------- Progress bar -------- */}
      <div className={`rounded-xl p-4 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Concept Explorer Progress</span>
          <span className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{progress}% explored</span>
        </div>
        <div className={`w-full h-2 rounded-full ${dark ? 'bg-slate-700' : 'bg-gray-200'}`}>
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* -------- Mobile dropdown trigger -------- */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${
            dark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-slate-800'
          }`}
        >
          <span className="truncate">{active.title}</span>
          <svg className={`w-5 h-5 flex-shrink-0 transition-transform ${mobileSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile dropdown list */}
        {mobileSidebarOpen && (
          <div className={`relative z-40 mt-2 rounded-xl border shadow-xl max-h-[70vh] overflow-y-auto ${
            dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            {grouped.map(group => (
              <div key={group.key}>
                <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider sticky top-0 ${
                  dark ? 'bg-slate-800 text-slate-400 border-b border-slate-700' : 'bg-gray-50 text-slate-500 border-b border-gray-200'
                }`}>
                  {group.label}
                </div>
                {group.items.map(c => {
                  const cCol = TOPIC_COLORS[c.category]
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectConcept(c.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                        activeId === c.id
                          ? `${cCol.bg} ${cCol.accent} font-semibold`
                          : dark ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate block">{c.title}</span>
                      {c.priority >= 2 && (
                        <span className="text-xs ml-1">{c.priority === 3 ? '\u2B50\u2B50' : '\u2B50'}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------- Two-column layout -------- */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className={`hidden lg:block w-72 flex-shrink-0 rounded-xl border overflow-hidden ${
          dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            {grouped.map(group => (
              <div key={group.key}>
                <div className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider sticky top-0 z-10 ${
                  dark ? 'bg-slate-800 text-slate-400 border-b border-slate-700' : 'bg-gray-50 text-slate-500 border-b border-gray-100'
                }`}>
                  {group.label}
                </div>
                {group.items.map(c => {
                  const cCol = TOPIC_COLORS[c.category]
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectConcept(c.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm border-l-4 transition-all ${
                        activeId === c.id
                          ? `${cCol.bg} ${cCol.border} ${cCol.accent} font-semibold`
                          : `border-transparent ${dark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100' : 'text-slate-700 hover:bg-gray-50'}`
                      }`}
                    >
                      <span className="block truncate">{c.title}</span>
                      {c.priority >= 2 && (
                        <span className="text-xs">{c.priority === 3 ? '\u2B50\u2B50' : '\u2B50'}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content area */}
        <div ref={contentRef} className="flex-1 min-w-0 space-y-6">

          {/* Title card */}
          <div className={`rounded-xl border-2 p-6 ${colors.bg} ${colors.border}`}>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{active.title}</h2>
                {tag && (
                  <div className="flex items-center gap-2 mt-1">
                    {stars && <span>{stars}</span>}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      active.priority === 3
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : active.priority === 2
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}>
                      {tag}
                    </span>
                  </div>
                )}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors.badge}`}>
                {CATEGORIES.find(c => c.key === active.category)?.label}
              </span>
            </div>
          </div>

          {/* Plain English Summary */}
          <div className={`rounded-xl border p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Plain English Summary
            </h3>
            <p className={`text-base leading-relaxed ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
              {active.summary}
            </p>
          </div>

          {/* Detailed Breakdown (expandable) */}
          <div className={`rounded-xl border p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Detailed Breakdown
            </h3>
            <div className="space-y-2">
              {active.details.map((d, idx) => {
                const isOpen = expandedDetails[idx] !== false
                return (
                  <div key={idx} className={`rounded-lg border overflow-hidden ${dark ? 'border-slate-600' : 'border-gray-200'}`}>
                    <button
                      onClick={() => toggleDetail(idx)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors ${
                        dark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`${colors.accent} font-semibold`}>{d.label}</span>
                      <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className={`px-4 pb-3 text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {d.text}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Real-World Application callout (green/teal) */}
          <div className={`rounded-xl border-2 p-5 ${dark ? 'bg-teal-950/30 border-teal-700' : 'bg-teal-50 border-teal-300'}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{'\uD83C\uDF0D'}</span>
              <div>
                <h3 className={`text-sm font-bold mb-1 ${dark ? 'text-teal-400' : 'text-teal-700'}`}>
                  Real-World Application
                </h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-teal-200' : 'text-teal-800'}`}>
                  {active.realWorld}
                </p>
              </div>
            </div>
          </div>

          {/* Key Exam Insight callout (amber/yellow) */}
          <div className={`rounded-xl border-2 p-5 ${dark ? 'bg-amber-950/30 border-amber-700' : 'bg-amber-50 border-amber-300'}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{'\uD83C\uDFAF'}</span>
              <div>
                <h3 className={`text-sm font-bold mb-1 ${dark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Key Exam Insight
                </h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-amber-200' : 'text-amber-800'}`}>
                  {active.examInsight}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          {active.interactive && (
            <div className={`rounded-xl border p-5 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>{'\u26A1'}</span> Interactive Demo
              </h3>
              <InteractiveDemo dark={dark} type={active.interactive} concept={active} />
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex justify-between pt-2 pb-4">
            {(() => {
              const idx = concepts.findIndex(c => c.id === activeId)
              const prev = idx > 0 ? concepts[idx - 1] : null
              const next = idx < concepts.length - 1 ? concepts[idx + 1] : null
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => selectConcept(prev.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-white hover:bg-gray-50 text-slate-700 border border-gray-200'
                      }`}
                    >
                      <span>&larr;</span>
                      <span className="hidden sm:inline truncate max-w-[200px]">{prev.title}</span>
                      <span className="sm:hidden">Previous</span>
                    </button>
                  ) : <div />}
                  {next ? (
                    <button
                      onClick={() => selectConcept(next.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-white hover:bg-gray-50 text-slate-700 border border-gray-200'
                      }`}
                    >
                      <span className="hidden sm:inline truncate max-w-[200px]">{next.title}</span>
                      <span className="sm:hidden">Next</span>
                      <span>&rarr;</span>
                    </button>
                  ) : <div />}
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
