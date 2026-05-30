import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { WarningIcon, CloseIcon, TrashIcon } from '../components/Icons'

const AVATAR_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]
const avatarColor = (name) => AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]

const STATUS_FILTERS = ['All Status', 'Active', 'Inactive']


export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [tempPassword, setTempPassword] = useState(null)
  const [form, setForm] = useState({
    first_name: '', second_name: '', email: '', phone: '', specialty: ''
  })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

	const navigate = useNavigate()

  const load = () => {
    fetch(`${API_BASE_URL}/api/v1/users?role=Doctor`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = doctors.filter(d => {
    if (statusFilter === 'Active') return d.is_active
    if (statusFilter === 'Inactive') return !d.is_active
    return true
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async () => {
    setError(null)
    if (!form.first_name || !form.second_name) return setError('Please enter doctor full name.')
    if (!form.email) return setError('Please enter email.')
    if (!form.specialty) return setError('Please enter specialty.')

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/doctor`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Failed to create doctor')
      }
      const data = await res.json()
      setTempPassword(data.temp_password)
      setForm({ first_name: '', second_name: '', email: '', phone: '', specialty: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/${confirmDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        load()
        setConfirmDelete(null)
      } else {
        const data = await res.json()
        setDeleteError(data.error || 'Failed to delete doctor')
      }
    } catch (e) {
      console.error(e)
      setDeleteError('Connection error. Please try again.')
    }
    finally { setDeleting(false) }
  }

  const handleToggleStatus = async (doctor) => {
    const endpoint = doctor.is_active
      ? `${API_BASE_URL}/api/v1/users/${doctor.id}/deactivate`
      : `${API_BASE_URL}/api/v1/users/${doctor.id}/activate`
    await fetch(endpoint, { method: 'PUT', credentials: 'include' })
    load()
  }

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Doctors Directory</h1>
              <p className="text-sm text-gray-400 mt-1">Manage doctor profiles, specialties, and system access.</p>
            </div>
            <button onClick={() => { setShowModal(true); setTempPassword(null); setError(null) }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition"
              style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
              <span className="text-lg leading-none">+</span>
              Add Doctor
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Filters */}
            <div className="flex items-center gap-1 px-6 py-4 border-b border-gray-100">
              {STATUS_FILTERS.map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                    statusFilter === f
                      ? 'text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  style={statusFilter === f ? { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' } : {}}>
                  {f}
                </button>
              ))}
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Specialty</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                        style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-sm text-gray-400">No doctors found</td>
                  </tr>
                )}
                {!loading && filtered.map(d => {
                  const fullName = `${d.first_name} ${d.second_name}`
                  const initials = `${d.first_name[0]}${d.second_name[0]}`.toUpperCase()
                  const color = avatarColor(fullName)
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/doctors/${d.id}`)}>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: d.is_active ? color : '#d1d5db' }}>
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Dr. {fullName}</p>
                            <p className="text-xs text-gray-400">{d.email}</p>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.specialty || '—'}</td>
                    <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        d.is_active ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {d.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/doctors/${d.id}`) }}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                            View Profile
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(d) }}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                              d.is_active
                                ? 'border-orange-200 text-orange-500 hover:bg-orange-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}>
                            {d.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: d.id, name: `Dr. ${fullName}` }) }}
                            className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                    </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Footer */}
            {!loading && (
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-400">
                  Showing {filtered.length} of {doctors.length} doctors
                </p>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">Add New Doctor</h2>
              <button onClick={() => { setShowModal(false); setTempPassword(null); setError(null) }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {tempPassword ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Doctor Added Successfully!</p>
                <p className="text-xs text-gray-400 mb-4">Share this temporary password with the doctor:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-gray-800 tracking-widest">
                  {tempPassword}
                </div>
                <p className="text-xs text-gray-400 mt-3">The doctor should change this password upon first login.</p>
                <button
                  onClick={() => { setShowModal(false); setTempPassword(null) }}
                  className="mt-5 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition"
                  style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                    <WarningIcon className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                      <input type="text" placeholder="e.g. Ahmed" value={form.first_name}
                        onChange={set('first_name')} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                      <input type="text" placeholder="e.g. Al-Ghamdi" value={form.second_name}
                        onChange={set('second_name')} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                    <input type="email" placeholder="doctor@clinic.com" value={form.email}
                      onChange={set('email')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                    <input type="tel" placeholder="0512345678" value={form.phone}
                      onChange={set('phone')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Specialty</label>
                    <input type="text" placeholder="e.g. Occupational Therapy" value={form.specialty}
                      onChange={set('specialty')} className={inputClass} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button onClick={() => { setShowModal(false); setError(null) }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition font-medium">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={saving}
                    className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                    {saving ? 'Adding...' : 'Add Doctor'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 text-center mb-1">Delete Doctor</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg px-3 py-2 mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmDelete(null); setDeleteError(null) }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}