import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || "https://gnosis-gen-production.up.railway.app";



function normalizeAnswer(s) {
  return s?.toString().trim().toLowerCase()
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
  const [darkMode, setDarkMode] = useState(false)

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
    const isCorrect = normalizeAnswer(userVal) === normalizeAnswer(correct)
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
     <div
        className={`min-h-screen transition-all duration-700 m-0 p-0 overflow-x-hidden
        ${darkMode
          ? 'bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-800 text-gray-100'
          : 'bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 text-gray-800'
        }`}
    >
      <div className={`max-w-4xl mx-auto p-6 rounded-xl shadow-md mt-6 border transition-all
        ${darkMode ? 'bg-gray-800/80 border-gray-700 backdrop-blur-md' : 'bg-white border-gray-200'}`}>

      <div className="flex justify-between items-center mb-4">
  <div className="flex items-center gap-3">
    <img
      src="/logo.png"
      alt="Gnosis Gen Logo"
      className="w-10 h-10 rounded-lg shadow-md"
    />
    <div>
      <h1 className="text-3xl font-bold tracking-wide">Gnosis Gen</h1>
      <p className={`text-sm italic ${darkMode ? 'text-indigo-300' : 'text-teal-600'}`}>
        AI Quiz & Notes Assistant
      </p>
    </div>
  </div>

  <button
    onClick={() => setDarkMode(!darkMode)}
    className={`px-3 py-1 rounded-full font-medium transition
      ${darkMode
        ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
        : 'bg-teal-500 hover:bg-teal-600 text-white'
      }`}
  >
    {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
  </button>
</div>


        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Mode</label>
            <select
  value={mode}
  onChange={(e) => setMode(e.target.value)}
  className={`mt-1 block w-full border rounded p-2 transition-colors duration-300
    ${darkMode
      ? "bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700"
      : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
    }`}
>
  <option value="quiz">Quiz</option>
  <option value="notes">Notes</option>
</select>

          </div>
          <div>
            <label className="block text-sm font-medium">Topic (optional)</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="mt-1 block w-full border rounded p-2 bg-transparent"
              placeholder="e.g. Binary Search Trees"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Your request (natural language)</label>
          <textarea
            value={userRequest}
            onChange={e => setUserRequest(e.target.value)}
            rows={3}
            className="mt-1 block w-full border rounded p-2 bg-transparent"
            placeholder="e.g. Explain stacks and how to implement them without arrays; quiz me on stack operations"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Optional text input</label>
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              rows={4}
              className="mt-1 block w-full border rounded p-2 bg-transparent"
              placeholder="Paste lecture notes or extra info here"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Optional PDF upload</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={loading}
            onClick={submit}
            className={`px-4 py-2 rounded font-medium text-white transition 
              ${darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-teal-500 hover:bg-teal-600'}
              disabled:opacity-50`}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <div className="text-sm text-red-500">{error}</div>
          {result && result.mode === 'quiz' && (
            <div
              className={`ml-auto font-medium px-3 py-1 rounded-full
                ${darkMode
                  ? 'bg-indigo-900 text-indigo-200'
                  : 'bg-teal-100 text-teal-800'
                }`}
            >
              Score: {score} / {(result.quiz.mcq?.length || 0) + (result.quiz.short_answer?.length || 0)}
            </div>
          )}
        </div>

        {result && result.mode === 'notes' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Generated Notes</h2>
            <div className="mt-3 whitespace-pre-wrap p-4 bg-slate-50 dark:bg-gray-700 rounded">
              {result.notes}
            </div>
          </div>
        )}

        {result && result.mode === "quiz" && (
  <div className="mt-6 animate-fadeIn">
    <h2 className="text-xl font-semibold">Quiz</h2>
    <div className="mt-3 space-y-6">
      {/* MCQs */}
      {result.quiz.mcq?.map((q, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl transition border
            ${darkMode
              ? 'bg-gray-900/80 border-indigo-700/40 hover:border-indigo-500/50 shadow-md shadow-indigo-500/10'
              : 'bg-white border-gray-200 hover:shadow-md'
            }`}
        >
          <div className="font-medium text-lg mb-2">{i + 1}. {q.question}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(i, idx)}
                className={`p-2 text-left border rounded-lg transition-all duration-200 font-medium
                  ${checked[`mcq-${i}`] !== undefined
                    ? (checked[`mcq-${i}`]
                      ? darkMode
                        ? 'bg-green-900/50 border-green-500 text-green-300'
                        : 'bg-green-100 border-green-400 text-green-800'
                      : darkMode
                        ? 'bg-pink-900/50 border-pink-500 text-pink-300'
                        : 'bg-red-100 border-red-400 text-red-800')
                    : darkMode
                      ? 'bg-gray-900/50 border-gray-700 text-gray-200 hover:bg-gray-800'
                      : 'bg-white border-gray-200 hover:bg-slate-100'
                  }`}
              >
                <div className="font-semibold inline-block mr-1">{String.fromCharCode(65 + idx)}.</div>
                {opt}
              </button>
            ))}
          </div>
          {checked[`mcq-${i}`] !== undefined && (
            <div
              className={`mt-2 text-sm font-medium 
                ${checked[`mcq-${i}`]
                  ? (darkMode ? 'text-green-400' : 'text-green-700')
                  : (darkMode ? 'text-pink-400' : 'text-red-600')
                }`}
            >
              {checked[`mcq-${i}`]
                ? '✅ Correct'
                : `❌ Correct answer: ${q.correct_answer}`}
            </div>
          )}
        </div>
      ))}

      {/* Short Answer Questions */}
      {result.quiz.short_answer?.map((q, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl transition border
            ${darkMode
              ? 'bg-gray-900/80 border-indigo-700/40 hover:border-indigo-500/50 shadow-md shadow-indigo-500/10'
              : 'bg-white border-gray-200 hover:shadow-md'
            }`}
        >
          <div className="font-medium text-lg mb-2">SA {i + 1}. {q.question}</div>
          <textarea
            value={shortAnswers[`short-${i}`] || ''}
            onChange={(e) => handleShortAnswer(i, e.target.value)}
            rows={3}
            className={`mt-2 w-full border rounded-lg p-2 font-medium transition
              ${darkMode
                ? 'bg-gray-900/50 border-gray-700 text-gray-100 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
              }`}
          />
          <div className="flex gap-2 mt-2 items-center">
            <button
              onClick={() => submitShortAnswer(i)}
              className={`px-3 py-1 rounded font-medium text-white transition
                ${darkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-teal-500 hover:bg-teal-600'
                }`}
            >
              Check
            </button>
            {checked[`short-${i}`] !== undefined && (
              <div className={`px-2 py-1 rounded font-medium 
                ${checked[`short-${i}`]
                  ? (darkMode ? 'bg-green-900/50 text-green-300 border border-green-500' : 'bg-green-100 text-green-800')
                  : (darkMode ? 'bg-pink-900/50 text-pink-300 border border-pink-500' : 'bg-red-100 text-red-800')
                }`}
              >
                {checked[`short-${i}`]
                  ? '✅ Correct'
                  : `❌ Answer: ${q.correct_answer}`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      </div>
    </div>
  )
}
