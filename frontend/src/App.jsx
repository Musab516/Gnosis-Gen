import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || "https://gnosis-gen-production.up.railway.app";

function normalizeAnswer(s) {
  return s?.toString().trim().toLowerCase()
}

function calculateSimilarity(str1, str2) {
  const s1 = normalizeAnswer(str1)
  const s2 = normalizeAnswer(str2)
  
  if (s1 === s2) return 1.0
  
  // Get first word only from user input
  const userWord = s1.split(/\s+/)[0]
  
  // Get all important words from correct answer
  const fillerWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'and', 'or', 'but'])
  const correctWords = s2.split(/\s+/).filter(w => w.length > 2 && !fillerWords.has(w))
  
  // Check if user's single word matches any important word in correct answer
  if (correctWords.includes(userWord)) {
    return 1.0
  }
  
  return 0
}

export default function App() {
  const [mode, setMode] = useState('quiz')
  const [userRequest, setUserRequest] = useState('')
  const [topic, setTopic] = useState('')
  const [textInput, setTextInput] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  const [answers, setAnswers] = useState({})
  const [shortAnswers, setShortAnswers] = useState({})
  const [checked, setChecked] = useState({})
  const [score, setScore] = useState(0)

  useEffect(() => {
    setAnswers({})
    setShortAnswers({})
    setChecked({})
    setScore(0)
  }, [result])

  async function submit() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append('mode', mode)
      form.append('user_request', userRequest)
      form.append('topic', topic)
      if (textInput) form.append('text_input', textInput)
      if (file) form.append('file', file)

      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        body: form,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || JSON.stringify(data))
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(questionIdx, optionIdx) {
    const key = `mcq-${questionIdx}`
    setAnswers(prev => ({ ...prev, [key]: optionIdx }))

    const q = result.quiz.mcq[questionIdx]
    const selectedLabel = q.options[optionIdx]
    const correct = q.correct_answer
    const isCorrect =
      normalizeAnswer(selectedLabel) === normalizeAnswer(correct) ||
      String.fromCharCode(65 + optionIdx).toLowerCase() === normalizeAnswer(correct)

    setChecked(prev => ({ ...prev, [key]: isCorrect }))
    recalcScore({ ...answers, [key]: optionIdx }, shortAnswers, { ...checked, [key]: isCorrect })
  }

  function handleShortAnswer(questionIdx, value) {
    const key = `short-${questionIdx}`
    setShortAnswers(prev => ({ ...prev, [key]: value }))
  }

  function submitShortAnswer(questionIdx) {
    const key = `short-${questionIdx}`
    const userVal = shortAnswers[key] || ''
    const correct = result.quiz.short_answer[questionIdx].correct_answer
    const similarity = calculateSimilarity(userVal, correct)
    const isCorrect = similarity >= 1.0
    setChecked(prev => ({ ...prev, [key]: isCorrect }))
    recalcScore(answers, shortAnswers, { ...checked, [key]: isCorrect })
  }

  function recalcScore(ans, shortAns, checkedState) {
    let s = 0
    if (result && result.quiz && result.quiz.mcq) {
      result.quiz.mcq.forEach((q, i) => {
        const key = `mcq-${i}`
        if (checkedState[key]) s += 1
      })
    }
    if (result && result.quiz && result.quiz.short_answer) {
      result.quiz.short_answer.forEach((q, i) => {
        const key = `short-${i}`
        if (checkedState[key]) s += 1
      })
    }
    setScore(s)
  }

  return (
    <div className={`min-h-screen transition-all duration-700 relative overflow-hidden
      ${darkMode
        ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900'
        : 'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse
          ${darkMode ? 'bg-purple-600' : 'bg-orange-400'}
          top-10 -left-20`}></div>
        <div className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse
          ${darkMode ? 'bg-blue-600' : 'bg-pink-400'}
          bottom-10 -right-20`} style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl mb-8 p-8 border transition-all
          ${darkMode 
            ? 'bg-slate-900/50 border-purple-500/20 shadow-purple-500/10' 
            : 'bg-white/60 border-pink-200/50 shadow-pink-200/20'
          }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform
                ${darkMode 
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                  : 'bg-gradient-to-br from-orange-400 to-pink-500'
                }`}>
                <div className="text-4xl">🧠</div>
              </div>
              <div>
                <h1 className={`text-4xl font-black tracking-tight
                  ${darkMode 
                    ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent'
                  }`}>
                  Gnosis Gen
                </h1>
                <p className={`text-sm font-medium mt-1
                  ${darkMode ? 'text-purple-300' : 'text-pink-600'}`}>
                  Your AI-Powered Learning Companion
                </p>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all
                ${darkMode
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                  : 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-300 hover:to-pink-400 text-white'
                }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 border transition-all
          ${darkMode 
            ? 'bg-slate-900/50 border-purple-500/20 shadow-purple-500/10' 
            : 'bg-white/60 border-pink-200/50 shadow-pink-200/20'
          }`}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-bold mb-2 uppercase tracking-wide
                ${darkMode ? 'text-purple-300' : 'text-pink-600'}`}>
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`w-full border-2 rounded-xl p-3 font-medium transition-all focus:ring-4 outline-none
                  ${darkMode
                    ? "bg-slate-800/50 border-purple-500/30 text-gray-100 hover:bg-slate-800 focus:border-purple-400 focus:ring-purple-500/20"
                    : "bg-white/80 border-pink-300/50 text-gray-800 hover:bg-white focus:border-pink-400 focus:ring-pink-300/20"
                  }`}
              >
                <option value="quiz">🎯 Quiz Mode</option>
                <option value="notes">📝 Notes Mode</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 uppercase tracking-wide
                ${darkMode ? 'text-purple-300' : 'text-pink-600'}`}>
                Topic (Optional)
              </label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className={`w-full border-2 rounded-xl p-3 font-medium transition-all focus:ring-4 outline-none
                  ${darkMode
                    ? "bg-slate-800/50 border-purple-500/30 text-gray-100 placeholder-gray-500 focus:border-purple-400 focus:ring-purple-500/20"
                    : "bg-white/80 border-pink-300/50 text-gray-800 placeholder-gray-400 focus:border-pink-400 focus:ring-pink-300/20"
                  }`}
                placeholder="e.g., Binary Search Trees"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-bold mb-2 uppercase tracking-wide
              ${darkMode ? 'text-purple-300' : 'text-pink-600'}`}>
              What would you like to learn?
            </label>
            <textarea
              value={userRequest}
              onChange={e => setUserRequest(e.target.value)}
              rows={3}
              className={`w-full border-2 rounded-xl p-3 font-medium transition-all focus:ring-4 outline-none
                ${darkMode
                  ? "bg-slate-800/50 border-purple-500/30 text-gray-100 placeholder-gray-500 focus:border-purple-400 focus:ring-purple-500/20"
                  : "bg-white/80 border-pink-300/50 text-gray-800 placeholder-gray-400 focus:border-pink-400 focus:ring-pink-300/20"
                }`}
              placeholder="e.g., Explain stacks and how to implement them; quiz me on stack operations"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-bold mb-2 uppercase tracking-wide
                ${darkMode ? 'text-purple-300' : 'text-pink-600'}`}>
                Additional Text
              </label>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                rows={4}
                className={`w-full border-2 rounded-xl p-3 font-medium transition-all focus:ring-4 outline-none
                  ${darkMode
                    ? "bg-slate-800/50 border-purple-500/30 text-gray-100 placeholder-gray-500 focus:border-purple-400 focus:ring-purple-500/20"
                    : "bg-white/80 border-pink-300/50 text-gray-800 placeholder-gray-400 focus:border-pink-400 focus:ring-pink-300/20"
                  }`}
                placeholder="Paste lecture notes or extra info here"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold mb-2 uppercase tracking-wide
                ${darkMode ? 'text-purple-300' : 'text-pink-600'}`}>
                Upload PDF
              </label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all hover:border-solid
                ${darkMode
                  ? 'border-purple-500/30 hover:border-purple-400 hover:bg-slate-800/50'
                  : 'border-pink-300/50 hover:border-pink-400 hover:bg-white/80'
                }`}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className={`text-4xl mb-2`}>📄</div>
                  <div className={`text-sm font-medium
                    ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {file ? file.name : 'Click to upload PDF'}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              disabled={loading}
              onClick={submit}
              className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${darkMode
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                  : 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500'
                }`}
            >
              {loading ? '✨ Generating Magic...' : '🚀 Generate'}
            </button>
            
            {error && (
              <div className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-xl text-red-400 font-medium">
                {error}
              </div>
            )}
            
            {result && result.mode === 'quiz' && (
              <div className={`ml-auto px-6 py-3 rounded-xl font-bold shadow-lg
                ${darkMode
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                }`}>
                🎯 Score: {score} / {(result.quiz.mcq?.length || 0) + (result.quiz.short_answer?.length || 0)}
              </div>
            )}
          </div>
        </div>

        {result && result.mode === 'notes' && (
          <div className={`mt-8 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border transition-all
            ${darkMode 
              ? 'bg-slate-900/50 border-purple-500/20 shadow-purple-500/10' 
              : 'bg-white/60 border-pink-200/50 shadow-pink-200/20'
            }`}>
            <h2 className={`text-3xl font-black mb-6
              ${darkMode 
                ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent'
              }`}>
              📚 Your Notes
            </h2>
            <div className={`whitespace-pre-wrap p-6 rounded-2xl font-medium leading-relaxed
              ${darkMode ? 'bg-slate-800/50 text-gray-100' : 'bg-white/80 text-gray-800'}`}>
              {result.notes}
            </div>
          </div>
        )}

        {result && result.mode === "quiz" && (
          <div className={`mt-8 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border transition-all
            ${darkMode 
              ? 'bg-slate-900/50 border-purple-500/20 shadow-purple-500/10' 
              : 'bg-white/60 border-pink-200/50 shadow-pink-200/20'
            }`}>
            <h2 className={`text-3xl font-black mb-6
              ${darkMode 
                ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent'
              }`}>
              🎯 Your Quiz
            </h2>
            
            <div className="space-y-6">
              {result.quiz.mcq?.map((q, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-2xl transition-all border-2 transform hover:scale-[1.02]
                    ${darkMode
                      ? 'bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 shadow-lg shadow-purple-500/5'
                      : 'bg-white/80 border-pink-200/50 hover:border-pink-300 shadow-lg shadow-pink-200/10'
                    }`}
                >
                  <div className={`font-bold text-lg mb-4
                    ${darkMode ? 'text-purple-200' : 'text-pink-700'}`}>
                    Question {i + 1}: {q.question}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(i, idx)}
                        className={`p-4 text-left border-2 rounded-xl transition-all duration-200 font-semibold transform hover:scale-105
                          ${checked[`mcq-${i}`] !== undefined
                            ? (checked[`mcq-${i}`]
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 text-white shadow-lg shadow-green-500/20'
                              : 'bg-gradient-to-r from-red-500 to-pink-500 border-red-400 text-white shadow-lg shadow-red-500/20')
                            : darkMode
                              ? 'bg-slate-900/50 border-purple-400/30 text-gray-200 hover:bg-slate-800 hover:border-purple-400'
                              : 'bg-white border-pink-300/50 hover:bg-pink-50 hover:border-pink-400'
                          }`}
                      >
                        <span className={`inline-block w-8 h-8 rounded-lg text-center leading-8 mr-2 font-black
                          ${checked[`mcq-${i}`] !== undefined
                            ? 'bg-white/30'
                            : darkMode ? 'bg-purple-500' : 'bg-pink-400'
                          }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  
                  {checked[`mcq-${i}`] !== undefined && (
                    <div className={`mt-4 p-3 rounded-xl font-bold text-center
                      ${checked[`mcq-${i}`]
                        ? 'bg-green-500/20 text-green-400 border-2 border-green-400'
                        : 'bg-red-500/20 text-red-400 border-2 border-red-400'
                      }`}>
                      {checked[`mcq-${i}`]
                        ? '✅ Perfect! You got it right!'
                        : `❌ Not quite. The answer is: ${q.correct_answer}`}
                    </div>
                  )}
                </div>
              ))}

              {result.quiz.short_answer?.map((q, i) => {
                const hasBlank = q.question.includes('_____')
                
                return (
                  <div
                    key={i}
                    className={`p-6 rounded-2xl transition-all border-2 transform hover:scale-[1.02]
                      ${darkMode
                        ? 'bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 shadow-lg shadow-purple-500/5'
                        : 'bg-white/80 border-pink-200/50 hover:border-pink-300 shadow-lg shadow-pink-200/10'
                      }`}
                  >
                    <div className={`font-bold text-lg mb-4
                      ${darkMode ? 'text-purple-200' : 'text-pink-700'}`}>
                      Fill in the Blank {i + 1}:
                    </div>
                    
                    {hasBlank ? (
                      <div className={`text-lg mb-4 font-medium leading-relaxed
                        ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {q.question.split('_____').map((part, idx, arr) => (
                          <React.Fragment key={idx}>
                            {part}
                            {idx < arr.length - 1 && (
                              <input
                                type="text"
                                value={shortAnswers[`short-${i}`] || ''}
                                onChange={(e) => handleShortAnswer(i, e.target.value)}
                                className={`inline-block mx-1 px-3 border-b-4 bg-transparent outline-none font-bold text-center transition-all
                                  ${checked[`short-${i}`] !== undefined
                                    ? checked[`short-${i}`]
                                      ? 'border-green-400 text-green-400'
                                      : 'border-red-400 text-red-400'
                                    : darkMode
                                      ? 'border-purple-400 text-purple-300 focus:border-blue-400'
                                      : 'border-pink-400 text-pink-600 focus:border-orange-400'
                                  }`}
                                style={{ width: '150px' }}
                                placeholder="answer"
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className={`text-lg mb-3 font-medium
                          ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {q.question}
                        </div>
                        <div className={`text-sm mb-3 font-semibold
                          ${darkMode ? 'text-purple-300' : 'text-pink-600'}`}>
                          Answer with one key word:
                        </div>
                        <input
                          type="text"
                          value={shortAnswers[`short-${i}`] || ''}
                          onChange={(e) => handleShortAnswer(i, e.target.value)}
                          className={`w-full border-2 rounded-xl p-3 font-bold transition-all focus:ring-4 outline-none
                            ${checked[`short-${i}`] !== undefined
                              ? checked[`short-${i}`]
                                ? 'border-green-400 text-green-400 bg-green-500/10'
                                : 'border-red-400 text-red-400 bg-red-500/10'
                              : darkMode
                                ? 'bg-slate-900/50 border-purple-500/30 text-gray-100 placeholder-gray-500 focus:border-purple-400 focus:ring-purple-500/20'
                                : 'bg-white border-pink-300/50 text-gray-800 placeholder-gray-400 focus:border-pink-400 focus:ring-pink-300/20'
                            }`}
                          placeholder="Type one word..."
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-4 items-center flex-wrap">
                      <button
                        onClick={() => submitShortAnswer(i)}
                        className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all
                          ${darkMode
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                            : 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500'
                          }`}
                      >
                        ✓ Check Answer
                      </button>
                      
                      {checked[`short-${i}`] !== undefined && (
                        <div className={`px-4 py-3 rounded-xl font-bold flex-1
                          ${checked[`short-${i}`]
                            ? 'bg-green-500/20 text-green-400 border-2 border-green-400'
                            : 'bg-red-500/20 text-red-400 border-2 border-red-400'
                          }`}
                        >
                          {checked[`short-${i}`]
                            ? '✅ Excellent work!'
                            : `❌ Key word: ${q.correct_answer.split(/\s+/).filter(w => w.length > 3)[0] || q.correct_answer.split(/\s+/)[0]}`}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}