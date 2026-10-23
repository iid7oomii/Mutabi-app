const FILTERS = ['All', 'Vestibular', 'Tactile']

function matchesFilter(ex, filter) {
  if (filter === 'All') return true
  const text = (ex.title + ' ' + ex.description).toLowerCase()
  if (filter === 'Vestibular')
    return ['vestibular', 'swing', 'balance', 'linear', 'motion', 'rotation'].some(k => text.includes(k))
  if (filter === 'Tactile')
    return ['tactile', 'texture', 'touch', 'bin', 'sensory', 'pressure', 'proprioceptive'].some(k => text.includes(k))
  return true
}

const EX_COLORS = ['#FF8C42', '#4ECDC4', '#0F4C81', '#9B59B6', '#E67E22', '#1ABC9C', '#3498DB', '#E74C3C']
const exColor = (str) => EX_COLORS[(str || 'A').charCodeAt(0) % EX_COLORS.length]

import { useState } from 'react'

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function ExerciseLibrary({ exercises, loadingData, isAdded, addExercise }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const visible = exercises.filter(ex => {
    const q = search.toLowerCase()
    const hit = !q || ex.title.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q)
    return hit && matchesFilter(ex, filter)
  })

  return (
    <div className="w-72 flex-shrink-0 sticky top-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Exercise Library</h2>

        <div className="relative mb-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700
              focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div className="flex gap-2 mb-4">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                filter === f ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={filter === f ? { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5">
          {loadingData && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
            </div>
          )}

          {!loadingData && visible.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No exercises found</p>
          )}

          {!loadingData && visible.map(ex => {
            const added = isAdded(ex.id)
            const color = exColor(ex.id)
            return (
              <button
                key={ex.id}
                onClick={() => addExercise(ex)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition ${
                  added ? 'bg-orange-50 border-orange-100 cursor-default'
                    : 'border-transparent hover:bg-gray-50 hover:border-gray-100 cursor-pointer'
                }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: added ? '#F7A072' : color }}>
                  {ex.title[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug ${added ? 'text-orange-600' : 'text-gray-800'}`}>
                    {ex.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${added ? 'text-orange-400' : 'text-gray-400'}`}>
                    {added ? 'Added to plan.' : ex.description}
                  </p>
                </div>
                {added && <span className="text-orange-400 flex-shrink-0 mt-0.5"><CheckCircleIcon /></span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}