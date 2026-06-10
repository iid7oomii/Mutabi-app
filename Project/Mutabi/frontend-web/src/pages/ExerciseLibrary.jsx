import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config';
import { WarningIcon, CloseIcon } from '../components/Icons'
import Button from '../components/ui/Button'

const EX_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]
const exColor = (str) => EX_COLORS[(str || 'A').charCodeAt(0) % EX_COLORS.length]

/* SVG icon shapes — each returns a <path> string for a 24×24 viewBox */
const ICON_OPTIONS = [
  {
    value: 'walk-outline', label: 'Walking',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="4" r="1.5"/><path d="M9 8l-2 5h3l1 5 2-3-1-2h3l-2-5"/></svg>,
  },
  {
    value: 'fitness-outline', label: 'Fitness',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 9H4a1 1 0 00-1 1v4a1 1 0 001 1h2m0-6v6m0-6h12m0 0h2a1 1 0 011 1v4a1 1 0 01-1 1h-2m0-6v6M8 9v6m8-6v6"/></svg>,
  },
  {
    value: 'mic-outline', label: 'Speech',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/></svg>,
  },
  {
    value: 'happy-outline', label: 'Expression',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="9"/><path d="M8.5 14s1 2 3.5 2 3.5-2 3.5-2"/><circle cx="9" cy="10" r="0.5" fill="currentColor"/><circle cx="15" cy="10" r="0.5" fill="currentColor"/></svg>,
  },
  {
    value: 'musical-notes-outline', label: 'Music',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  },
  {
    value: 'hand-left-outline', label: 'Hand',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 11V7a2 2 0 00-4 0v4M14 7V5a2 2 0 00-4 0v6M10 5V4a2 2 0 00-4 0v10l-2-2a2 2 0 00-3 3l5 5h9a4 4 0 004-4v-4a2 2 0 00-4 0v1"/></svg>,
  },
  {
    value: 'eye-outline', label: 'Vision',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  },
  {
    value: 'ear-outline', label: 'Hearing',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 12a6 6 0 1112 0c0 4-3 6-3 9H9c0-3-3-5-3-9z"/><path d="M10 16a2 2 0 004 0"/></svg>,
  },
  {
    value: 'body-outline', label: 'Body',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="4" r="1.5"/><path d="M12 7v7M9 10l-2 5M15 10l2 5M9 22l2-4h2l2 4"/></svg>,
  },
  {
    value: 'extension-puzzle-outline', label: 'Games',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M19.5 12c0-.23-.01-.45-.03-.68l2.02-1.56a.5.5 0 00.12-.63l-1.87-3.24a.5.5 0 00-.6-.22l-2.4.96a8.3 8.3 0 00-1.14-.66l-.36-2.55A.5.5 0 0014.75 3h-3.5a.5.5 0 00-.49.43l-.36 2.55c-.39.18-.77.4-1.14.66l-2.4-.96a.5.5 0 00-.6.22L4.39 9.14a.5.5 0 00.12.63l2.02 1.56A7.17 7.17 0 006.5 12a7.17 7.17 0 00.03.68l-2.02 1.56a.5.5 0 00-.12.63l1.87 3.24a.5.5 0 00.6.22l2.4-.96c.37.26.75.47 1.14.66l.36 2.55c.07.25.3.42.49.42h3.5a.5.5 0 00.49-.43l.36-2.55c.39-.18.77-.4 1.14-.66l2.4.96a.5.5 0 00.6-.22l1.87-3.24a.5.5 0 00-.12-.63l-2.02-1.56c.01-.23.03-.45.03-.68z"/><circle cx="12" cy="12" r="3"/></svg>,
  },
  {
    value: 'color-palette-outline', label: 'Art',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2a10 10 0 000 20c1.1 0 2-.9 2-2v-.5c0-.55.45-1 1-1h2.5a3 3 0 003-3A10 10 0 0012 2z"/><circle cx="8.5" cy="10.5" r="1" fill="currentColor"/><circle cx="12" cy="7" r="1" fill="currentColor"/><circle cx="15.5" cy="10.5" r="1" fill="currentColor"/></svg>,
  },
  {
    value: 'basketball-outline', label: 'Sports',
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><path d="M4.9 4.9a14.1 14.1 0 0014.2 14.2M4.9 19.1A14.1 14.1 0 0119.1 4.9M12 2v20M2 12h20"/></svg>,
  },
]

const GOAL_OPTIONS = [
  'Initial Exercise',
  'Core Exercise',
  'Additional Exercise',
  'Key Exercise',
  'Assessment Exercise',
  'Reinforcement Exercise',
]

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'Easy',   color: '#2E7D32', bg: '#E8F5E9' },
  { value: 'medium', label: 'Medium', color: '#E65100', bg: '#FFF3E8' },
  { value: 'hard',   label: 'Hard',   color: '#B71C1C', bg: '#FFEBEE' },
]

const EMPTY_FORM = {
  title: '', description: '', doctor_media_url: '',
  icon: '', difficulty: '', goal: '',
  useSteps: false, steps: [''],
}

export default function ExerciseLibrary() {
  document.title = 'Exercise Library | Mutabi'
  const [exercises, setExercises] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)

  const load = () => {
    fetch(`${API_BASE_URL}/api/v1/exercises`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setExercises(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = exercises.filter(ex =>
    !search ||
    ex.title.toLowerCase().includes(search.toLowerCase()) ||
    ex.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Delete this exercise?')) return
    const res = await fetch(`${API_BASE_URL}/api/v1/exercises/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to delete'); return }
    load()
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('folder', 'exercises')
      const res = await fetch(`${API_BASE_URL}/api/v1/upload/media`, { method: 'POST', credentials: 'include', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setForm(f => ({ ...f, doctor_media_url: data.url }))
    } catch { setError('Failed to upload file') }
    finally { setUploading(false) }
  }

  const addStep    = () => setForm(f => ({ ...f, steps: [...f.steps, ''] }))
  const updateStep = (i, v) => setForm(f => { const s = [...f.steps]; s[i] = v; return { ...f, steps: s } })
  const removeStep = (i) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.title.trim()) return setError('Please enter exercise title.')
    if (!form.useSteps && !form.description.trim()) return setError('Please enter description.')
    if (form.useSteps && form.steps.every(s => !s.trim())) return setError('Please add at least one step.')

    const validSteps = form.useSteps ? form.steps.filter(s => s.trim()).map(s => s.trim()) : []
    const payload = {
      title:            form.title.trim(),
      description:      form.useSteps
                          ? validSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')
                          : form.description.trim(),
      doctor_media_url: form.doctor_media_url || null,
      icon:             form.icon || null,
      difficulty:       form.difficulty || null,
      goal:             form.goal || null,
      steps_json:       form.useSteps ? JSON.stringify(validSteps) : null,
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/exercises/`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create exercise') }
      setShowModal(false); setForm(EMPTY_FORM); load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const difficultyInfo = (val) => DIFFICULTY_OPTIONS.find(d => d.value === val)
  const iconInfo       = (val) => ICON_OPTIONS.find(o => o.value === val)

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Exercise Library</h1>
              <p className="text-sm text-gray-400 mt-1">Manage and template reusable therapy exercises.</p>
            </div>
            <Button
              onClick={() => { setShowModal(true); setError(null); setForm(EMPTY_FORM) }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition"
              variant="primary"
            >
              <span className="text-lg leading-none">+</span> Add Exercise
            </Button>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><WarningIcon /><span>{error}</span></div>
              <Button variant="ghost" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search exercises by name or description..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm" />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-sm text-gray-400">No exercises found</div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {filtered.map(ex => {
                const color   = exColor(ex.title)
                const isVideo = ex.doctor_media_url?.match(/\.(mp4|mov|webm)$/i)
                const isImage = ex.doctor_media_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                const icon    = iconInfo(ex.icon)
                const diff    = difficultyInfo(ex.difficulty)

                return (
                  <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="h-40 relative overflow-hidden flex-shrink-0"
                      style={{ background: ex.doctor_media_url ? '#f3f4f6' : color + '20' }}>
                      {ex.doctor_media_url ? (
                        <>
                          {isVideo
                            ? <video src={ex.doctor_media_url} className="w-full h-full object-cover" controls />
                            : isImage
                              ? <img src={ex.doctor_media_url} alt={ex.title} className="w-full h-full object-cover" />
                              : null}
                          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                            {isVideo ? 'VIDEO' : 'IMAGE'}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                            style={{ background: color }}>
                            {icon
                              ? <span style={{ color: '#fff' }}>{icon.svg}</span>
                              : <span className="text-2xl font-bold">{ex.title[0].toUpperCase()}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-800">{ex.title}</h3>
                        {diff && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: diff.bg, color: diff.color }}>
                            {diff.label}
                          </span>
                        )}
                      </div>
                      {ex.goal && (
                        <p className="text-xs font-medium text-blue-600 mb-1">{ex.goal}</p>
                      )}
                      <p className="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-3">
                        {ex.description || '—'}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => handleDelete(ex.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add Exercise Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">Add New Exercise</h2>
              <Button variant="ghost" onClick={() => { setShowModal(false); setError(null) }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
                <CloseIcon className="w-4 h-4" />
              </Button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                <WarningIcon className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
                <input type="text" placeholder="e.g. Sensory Brushing"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Icon <span className="text-gray-300">(optional)</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map(opt => (
                    <Button key={opt.value} type="button" variant="ghost"
                      onClick={() => setForm(f => ({ ...f, icon: f.icon === opt.value ? '' : opt.value }))}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition ${
                        form.icon === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-700'
                      }`}
                      title={opt.label}
                    >
                      {opt.svg}
                      <span className="text-[9px] leading-tight text-center">{opt.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Goal <span className="text-gray-300">(optional)</span>
                </label>
                <select value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white">
                  <option value="">— Select goal —</option>
                  {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Difficulty <span className="text-gray-300">(optional)</span>
                </label>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map(d => (
                    <Button key={d.value} type="button" variant="ghost"
                      onClick={() => setForm(f => ({ ...f, difficulty: f.difficulty === d.value ? '' : d.value }))}
                      className="flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition"
                      style={form.difficulty === d.value
                        ? { borderColor: d.color, backgroundColor: d.bg, color: d.color }
                        : { borderColor: '#e5e7eb', backgroundColor: '#f9fafb', color: '#9ca3af' }}>
                      {d.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content type toggle */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Content Type</label>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                  <Button type="button" variant="ghost" onClick={() => setForm(f => ({ ...f, useSteps: false }))}
                    className={`flex-1 py-2 text-sm font-medium transition ${!form.useSteps ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    Plain Description
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setForm(f => ({ ...f, useSteps: true, steps: f.steps.length ? f.steps : [''] }))}
                    className={`flex-1 py-2 text-sm font-medium transition ${form.useSteps ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    Numbered Steps
                  </Button>
                </div>
              </div>

              {/* Description or Steps */}
              {form.useSteps ? (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Steps</label>
                  <div className="space-y-2">
                    {form.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <input type="text" placeholder={`Step ${i + 1}...`}
                          value={step} onChange={e => updateStep(i, e.target.value)}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
                        {form.steps.length > 1 && (
                          <Button type="button" variant="ghost" onClick={() => removeStep(i)}
                            className="text-gray-300 hover:text-red-400 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" onClick={addStep}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 transition">
                      <span className="text-base leading-none">+</span> Add Step
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                  <textarea placeholder="Describe the exercise..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-none" />
                </div>
              )}

              {/* Media */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Media <span className="text-gray-300">(optional)</span>
                </label>
                {form.doctor_media_url ? (
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 h-32 mb-2">
                    {form.doctor_media_url.match(/\.(mp4|mov|webm)$/i)
                      ? <video src={form.doctor_media_url} className="w-full h-full object-cover" />
                      : <img src={form.doctor_media_url} alt="preview" className="w-full h-full object-cover" />}
                    <Button variant="ghost" onClick={() => setForm(f => ({ ...f, doctor_media_url: '' }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full text-white flex items-center justify-center hover:bg-black/70 transition">
                      <CloseIcon className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploading
                      ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                      : <>
                          <svg className="w-5 h-5 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-400">Click to upload image or video</span>
                        </>}
                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => { setShowModal(false); setError(null) }}
                className="text-sm text-gray-500 hover:text-gray-700 transition font-medium">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving || uploading}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                variant="primary">
                {saving ? 'Saving...' : 'Add Exercise'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
