import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useAuthStore from '../store/authStore'
import { TrashIcon } from '../components/Icons'

const AVATAR_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]
const avatarColor = (name) => AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]

function getAge(dob) {
  if (!dob) return ''
  const yrs = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000))
  return `${yrs}`
}

const STATUS_FILTERS = ['All', 'Active Plans', 'Inactive / Completed', 'No Doctor']

function PlanBadge({ status, title }) {
  if (!status) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      No Plan
    </span>
  )
  const styles = {
    active: 'bg-orange-50 text-orange-600',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-50 text-red-500',
  }
  const dots = {
    active: 'bg-orange-500',
    completed: 'bg-gray-400',
    cancelled: 'bg-red-400',
  }
  const labels = {
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return (
    <div>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full inline-block ${dots[status] || 'bg-gray-400'}`} />
        {labels[status] || status}
      </span>
      {title && <p className="text-xs text-gray-400 mt-1 ml-1">{title}</p>}
    </div>
  )
}

export default function Patients() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('patients')

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Assigned')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const [requests, setRequests]         = useState([])
  const [reqLoading, setReqLoading]     = useState(false)
  const [doctors, setDoctors]           = useState([])
  const [approveModal, setApproveModal] = useState(null)
  const [selectedDoc, setSelectedDoc]   = useState('')
  const [approving, setApproving]       = useState(false)
  const [approveError, setApproveError] = useState('')
  const [rejectModal, setRejectModal]   = useState(null)
  const [rejecting, setRejecting]       = useState(false)

  const fetchRequests = () => {
    setReqLoading(true)
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/children/requests`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/v1/users/?role=Doctor`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([reqs, docs]) => {
      setRequests(Array.isArray(reqs) ? reqs : [])
      setDoctors(Array.isArray(docs) ? docs : [])
    }).catch(console.error).finally(() => setReqLoading(false))
  }

  const handleApprove = async () => {
    if (!selectedDoc) { setApproveError('Please select a doctor'); return }
    setApproving(true)
    setApproveError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/children/requests/${approveModal.id}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: selectedDoc }),
      })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== approveModal.id))
        setApproveModal(null)
        setSelectedDoc('')
        fetch(`${API_BASE_URL}/api/v1/children`, { credentials: 'include' })
          .then(r => r.json()).then(data => setPatients(Array.isArray(data) ? data : []))
      } else {
        const data = await res.json()
        setApproveError(data.error || 'Failed to approve')
      }
    } catch { setApproveError('Connection error') }
    finally { setApproving(false) }
  }

  const handleReject = async () => {
    setRejecting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/children/requests/${rejectModal.id}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== rejectModal.id))
        setRejectModal(null)
      }
    } catch { }
    finally { setRejecting(false) }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/children/${confirmDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setPatients(prev => prev.filter(p => p.id !== confirmDelete.id))
        setConfirmDelete(null)
      } else {
        const data = await res.json()
        setDeleteError(data.error || 'Failed to delete patient')
      }
    } catch (e) {
      console.error(e)
      setDeleteError('Connection error. Please try again.')
    }
    finally { setDeleting(false) }
  }

  const [assignModal, setAssignModal] = useState(null)  // { id, name } for existing patients
  const [assignDoc, setAssignDoc]     = useState('')
  const [assigning, setAssigning]     = useState(false)
  const [assignError, setAssignError] = useState('')

  const handleAssignDoctor = async () => {
    if (!assignDoc) { setAssignError('Please select a doctor'); return }
    setAssigning(true)
    setAssignError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/children/${assignModal.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: assignDoc }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPatients(prev => prev.map(p => p.id === assignModal.id ? { ...p, doctor: { name: updated.doctor_name || '' } } : p))
        setAssignModal(null)
        setAssignDoc('')
        fetch(`${API_BASE_URL}/api/v1/children`, { credentials: 'include' }).then(r => r.json()).then(data => setPatients(Array.isArray(data) ? data : []))
      } else {
        const data = await res.json()
        setAssignError(data.error || 'Failed to assign doctor')
      }
    } catch { setAssignError('Connection error') }
    finally { setAssigning(false) }
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/children`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
    if (isAdmin) {
      fetch(`${API_BASE_URL}/api/v1/users/?role=Doctor`, { credentials: 'include' })
        .then(r => r.json()).then(data => setDoctors(Array.isArray(data) ? data : [])).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'requests' && isAdmin) fetchRequests()
  }, [activeTab])

  const filtered = patients.filter(p => {
    const name = `${p.first_name} ${p.second_name}`.toLowerCase()
    const parentName = p.parent?.name?.toLowerCase() || ''
    const matchSearch = !search || name.includes(search.toLowerCase()) || parentName.includes(search.toLowerCase())

    const matchStatus =
      statusFilter === 'All'                   ? true :
      statusFilter === 'Active Plans'          ? p.plan?.status === 'active' :
      statusFilter === 'Inactive / Completed'  ? (p.plan?.status === 'completed' || p.plan?.status === 'cancelled' || !p.plan?.status) :
      statusFilter === 'No Doctor'             ? (!p.doctor?.name || p.doctor?.name === '—') :
      true

    return matchSearch && matchStatus
  })

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage and track your assigned children and their therapy plans.
              </p>
            </div>
            <button
              onClick={() => navigate('/registration')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition"
              style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
            >
              <span className="text-lg leading-none">+</span>
              Add New Patient
            </button>
          </div>

          {/* Tabs */}
          {isAdmin && (
            <div className="flex gap-2 mb-6">
              {[
                { key: 'patients', label: 'Patients List' },
                { key: 'requests', label: `Registration Requests${requests.length > 0 ? ` (${requests.filter(r => r.status === 'pending').length})` : ''}` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-700 bg-blue-50'
                      : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* ─── Registration Requests Tab ─────────────────────────── */}
          {isAdmin && activeTab === 'requests' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Child Name', 'Parent', 'Date of Birth', 'Diagnosis Notes', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reqLoading && (
                    <tr><td colSpan={6} className="text-center py-12">
                      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                    </td></tr>
                  )}
                  {!reqLoading && requests.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No registration requests</td></tr>
                  )}
                  {!reqLoading && requests.map(r => {
                    const statusColors = { pending: 'bg-yellow-50 text-yellow-700', approved: 'bg-green-50 text-green-700', rejected: 'bg-red-50 text-red-500' }
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{r.first_name} {r.second_name}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{r.parent_name || '—'}</p>
                          <p className="text-xs text-gray-400">{r.parent_phone || r.parent_email || ''}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.date_of_birth}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{r.diagnosis_notes || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[r.status] || 'bg-gray-100 text-gray-500'}`}>
                            {r.status}
                          </span>
                          {r.rejection_reason && <p className="text-xs text-gray-400 mt-1">{r.rejection_reason}</p>}
                        </td>
                        <td className="px-6 py-4">
                          {r.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setApproveModal({ id: r.id, name: `${r.first_name} ${r.second_name}` }); setApproveError(''); setSelectedDoc('') }}
                                className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition"
                                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModal({ id: r.id, name: `${r.first_name} ${r.second_name}` })}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Patients Tab */}
          {(!isAdmin || activeTab === 'patients') && <>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by child or parent name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Status:</span>
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      statusFilter === f
                        ? 'border-blue-600 text-blue-700 bg-blue-50'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Parent / Guardian
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Current Plan Status
                  </th>
                  {isAdmin && (
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Assigned Doctor
                    </th>
                  )}
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="text-center py-12">
                      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                        style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                    </td>
                  </tr>
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="text-center py-12 text-sm text-gray-400">
                      No patients found
                    </td>
                  </tr>
                )}

                {!loading && filtered.map(p => {
                  const fullName = `${p.first_name} ${p.second_name}`
                  const initials = `${p.first_name[0]}${p.second_name[0]}`.toUpperCase()
                  const color = avatarColor(fullName)

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/patients/${p.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: color }}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                            <p className="text-xs text-gray-400">Age: {getAge(p.date_of_birth)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 font-medium">{p.parent?.name || '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.parent?.email || p.parent?.phone || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <PlanBadge status={p.plan?.status} title={p.plan?.title} />
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          {p.doctor?.name && p.doctor.name !== '—' ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-sm text-gray-600">Dr. {p.doctor.name}</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setAssignModal({ id: p.id, name: fullName }); setAssignDoc(''); setAssignError('') }}
                              className="px-3 py-1.5 text-xs font-semibold text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition">
                              Assign Doctor
                            </button>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/patients/${p.id}`) }}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition">
                            View Profile
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: p.id, name: fullName }) }}
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
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {filtered.length} of {patients.length} patients
                </p>
              </div>
            )}
          </div>

          </> /* end patients tab */}

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 text-center mb-1">Delete Patient</h3>
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

      {/* Approve Request Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 text-center mb-1">Approve Request</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Assign a doctor for <strong>{approveModal.name}</strong>
            </p>
            <select
              value={selectedDoc}
              onChange={e => setSelectedDoc(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">— Select Doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.second_name}
                </option>
              ))}
            </select>
            {approveError && <p className="text-xs text-red-500 text-center mb-3">{approveError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setApproveModal(null); setSelectedDoc(''); setApproveError('') }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                {approving ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 text-center mb-1">Reject Request</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Reject registration request for <strong>{rejectModal.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                {rejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Doctor Modal (existing patients) */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 text-center mb-1">Assign Doctor</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Assign a doctor for <strong>{assignModal.name}</strong>
            </p>
            <select
              value={assignDoc}
              onChange={e => setAssignDoc(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">— Select Doctor —</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.second_name}
                </option>
              ))}
            </select>
            {assignError && <p className="text-xs text-red-500 text-center mb-3">{assignError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setAssignModal(null); setAssignDoc(''); setAssignError('') }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleAssignDoctor}
                disabled={assigning}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                {assigning ? 'Saving...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}