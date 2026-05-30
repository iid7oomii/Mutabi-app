import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar'

const AVATAR_COLORS = ['#4ECDC4','#45B7D1','#96C93D','#F7A072','#9B59B6','#3498DB','#E67E22','#1ABC9C']
const avatarColor = name => AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]

function formatDateTime(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function isPast(dateStr) {
  return dateStr && new Date(dateStr) < new Date()
}

export default function Appointments() {
  const [children, setChildren] = useState([])
  const [selected, setSelected] = useState(null)
  const [appts, setAppts]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [date, setDate]         = useState('')
  const [notes, setNotes]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/children/`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setChildren(data) : [])
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    setAppts([])
    fetch(`${API_BASE_URL}/api/v1/appointments/child/${selected.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setAppts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selected])

  const handleAdd = async () => {
    if (!date || !selected) return
    setSaving(true)
    setError('')
    try {
      const res  = await fetch(`${API_BASE_URL}/api/v1/appointments/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id:    selected.id,
          appointment: date,
          notes:       notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create appointment'); return }
      setAppts(prev => [...prev, data].sort((a, b) => new Date(a.appointment) - new Date(b.appointment)))
      setDate('')
      setNotes('')
    } catch {
      setError('Connection error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return
    await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, { method: 'DELETE', credentials: 'include' })
    setAppts(prev => prev.filter(a => a.id !== id))
  }

  const filtered = children.filter(c =>
    `${c.first_name} ${c.second_name}`.toLowerCase().includes(search.toLowerCase())
  )

  const upcoming = appts.filter(a => !isPast(a.appointment))
  const past     = appts.filter(a => isPast(a.appointment))

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="ltr">
      <Sidebar />
      <div className="flex-1 flex overflow-hidden">

        {/* ── Patient sidebar ── */}
        <div className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Appointments</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select a patient to manage appointments</p>
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
                    active ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: avatarColor(name) }}
                  >
                    {child.first_name[0]}{child.second_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? 'text-orange-700' : 'text-gray-800'}`}>
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

        {/* ── Appointments panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <svg className="w-14 h-14 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">Select a patient to view their appointments</p>
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
                    <p className="text-xs text-gray-400">
                      {upcoming.length} upcoming · {past.length} past
                    </p>
                  </div>
                </div>
              </div>

              {/* Add appointment form */}
              <div className="px-8 py-5 bg-white border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Schedule Appointment
                </p>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700
                        focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Follow-up session"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700
                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    />
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={saving || !date}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                  >
                    {saving ? 'Saving...' : 'Schedule'}
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

              {/* Appointments list */}
              <div className="flex-1 overflow-y-auto p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                  </div>
                ) : appts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No appointments scheduled yet</p>
                  </div>
                ) : (
                  <>
                    {upcoming.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Upcoming ({upcoming.length})
                        </p>
                        <div className="space-y-3">
                          {upcoming.map(appt => (
                            <AppointmentRow key={appt.id} appt={appt} past={false} onDelete={handleDelete} />
                          ))}
                        </div>
                      </div>
                    )}
                    {past.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Past ({past.length})
                        </p>
                        <div className="space-y-3 opacity-60">
                          {past.map(appt => (
                            <AppointmentRow key={appt.id} appt={appt} past={true} onDelete={handleDelete} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function AppointmentRow({ appt, past, onDelete }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center justify-between gap-4 ${
      past ? 'border-gray-100' : 'border-orange-100'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          past ? 'bg-gray-50' : 'bg-orange-50'
        }`}>
          <svg className={`w-5 h-5 ${past ? 'text-gray-300' : 'text-orange-500'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {new Date(appt.appointment).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(appt.appointment).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            {appt.notes ? ` · ${appt.notes}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          past ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-600'
        }`}>
          {past ? 'Completed' : 'Upcoming'}
        </span>
        <button
          onClick={() => onDelete(appt.id)}
          className="text-gray-300 hover:text-red-400 transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
