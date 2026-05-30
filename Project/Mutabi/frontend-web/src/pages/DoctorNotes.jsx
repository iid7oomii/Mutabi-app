import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar'

const AVATAR_COLORS = ['#4ECDC4','#45B7D1','#96C93D','#F7A072','#9B59B6','#3498DB','#E67E22','#1ABC9C']
const avatarColor = name => AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]

function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DoctorNotes() {
  const [children, setChildren]       = useState([])
  const [selected, setSelected]       = useState(null)
  const [notes, setNotes]             = useState([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [content, setContent]         = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/children/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setChildren(data) : [])
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoadingNotes(true)
    setNotes([])
    fetch(`${API_BASE_URL}/api/v1/doctor-notes/child/${selected.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setNotes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingNotes(false))
  }, [selected])

  const handleAdd = async () => {
    if (!content.trim() || !selected) return
    setSaving(true)
    setError('')
    try {
      const res  = await fetch(`${API_BASE_URL}/api/v1/doctor-notes/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: selected.id, content: content.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); return }
      setNotes(prev => [data, ...prev])
      setContent('')
    } catch {
      setError('Connection error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return
    await fetch(`${API_BASE_URL}/api/v1/doctor-notes/${id}`, { method: 'DELETE', credentials: 'include' })
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const filtered = children.filter(c =>
    `${c.first_name} ${c.second_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="ltr">
      <Sidebar />
      <div className="flex-1 flex overflow-hidden">

        {/* ── Patient sidebar ── */}
        <div className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Doctor Notes</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select a patient to view or add notes</p>
          </div>

          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search patient..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filtered.map(child => {
              const name   = `${child.first_name} ${child.second_name}`
              const active = selected?.id === child.id
              return (
                <button
                  key={child.id}
                  onClick={() => setSelected(child)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    active ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: avatarColor(name) }}
                  >
                    {child.first_name[0]}{child.second_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? 'text-blue-700' : 'text-gray-800'}`}>
                      {name}
                    </p>
                    <p className="text-xs text-gray-400">Patient</p>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No patients found</p>
            )}
          </div>
        </div>

        {/* ── Notes panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <svg className="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">Select a patient to view their notes</p>
            </div>
          ) : (
            <>
              {/* Patient header */}
              <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: avatarColor(`${selected.first_name} ${selected.second_name}`) }}
                  >
                    {selected.first_name[0]}{selected.second_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{selected.first_name} {selected.second_name}</h3>
                    <p className="text-xs text-gray-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Add note */}
              <div className="px-8 py-5 bg-white border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New Note</p>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write a clinical note for this patient..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700
                    placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100
                    focus:border-blue-300 transition"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAdd}
                    disabled={saving || !content.trim()}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                  >
                    {saving ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </div>

              {/* Notes list */}
              <div className="flex-1 overflow-y-auto p-8">
                {loadingNotes ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No notes yet for this patient</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map(note => (
                      <div key={note.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1 h-full min-h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: '#0F4C81' }} />
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Clinical Note
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                            <p className="text-xs text-gray-400 mt-3">{formatDate(note.created_at)}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-1 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
