import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { WarningIcon, CloseIcon } from '../components/Icons'

const EX_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]
const exColor = (str) => EX_COLORS[(str || 'A').charCodeAt(0) % EX_COLORS.length]

export default function ExerciseLibrary() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', doctor_media_url: '' })

  const load = () => {
    fetch('/api/v1/exercises', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setExercises(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = exercises.filter(ex =>
    !search || ex.title.toLowerCase().includes(search.toLowerCase()) ||
    ex.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Delete this exercise?')) return
    const res = await fetch(`/api/v1/exercises/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to delete exercise')
        return
    }
    load()
    }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'exercises')
      const res = await fetch('/api/v1/upload/media', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setForm(f => ({ ...f, doctor_media_url: data.url }))
    } catch (err) {
      setError('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!form.title.trim()) return setError('Please enter exercise title.')
    if (!form.description.trim()) return setError('Please enter description.')
    setSaving(true)
    try {
      const res = await fetch('/api/v1/exercises/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Failed to create exercise')
      }
      setShowModal(false)
      setForm({ title: '', description: '', doctor_media_url: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

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
            <button onClick={() => { setShowModal(true); setError(null); setForm({ title: '', description: '', doctor_media_url: '' }) }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition"
              style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
              <span className="text-lg leading-none">+</span>
              Add Exercise
            </button>
          </div>
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                <WarningIcon />
                <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            )}

          {/* Search */}
          <div className="relative mb-6">
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search exercises by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700
                bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-sm"
            />
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
                const color = exColor(ex.title)
                const isVideo = ex.doctor_media_url?.match(/\.(mp4|mov|webm)$/i)
                const isImage = ex.doctor_media_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

                return (
                  <div key={ex.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="h-40 relative overflow-hidden flex-shrink-0"
                      style={{ background: ex.doctor_media_url ? '#f3f4f6' : color + '20' }}>
                      {ex.doctor_media_url ? (
                        <>
                          {isVideo ? (
                            <video src={ex.doctor_media_url} className="w-full h-full object-cover" controls />
                          ) : isImage ? (
                            <img src={ex.doctor_media_url} alt={ex.title} className="w-full h-full object-cover" />
                          ) : null}
                          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                            {isVideo ? (
                              <>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                VIDEO
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                                </svg>
                                IMAGE
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                            style={{ background: color }}>
                            {ex.title[0].toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">{ex.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-3">
                        {ex.description || '—'}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <button onClick={() => handleDelete(ex.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">Add New Exercise</h2>
              <button onClick={() => { setShowModal(false); setError(null) }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                <WarningIcon className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Title</label>
                <input type="text" placeholder="e.g. Sensory Brushing"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                <textarea placeholder="Describe the exercise..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Media (optional)</label>
                {form.doctor_media_url ? (
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 h-32 mb-2">
                    {form.doctor_media_url.match(/\.(mp4|mov|webm)$/i) ? (
                      <video src={form.doctor_media_url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={form.doctor_media_url} alt="preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => setForm(f => ({ ...f, doctor_media_url: '' }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full text-white flex items-center justify-center hover:bg-black/70 transition">
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400">Click to upload image or video</span>
                        <span className="text-xs text-gray-300 mt-0.5">JPG, PNG, MP4, MOV</span>
                      </>
                    )}
                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setError(null) }}
                className="text-sm text-gray-500 hover:text-gray-700 transition font-medium">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving || uploading}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                {saving ? 'Saving...' : 'Add Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}