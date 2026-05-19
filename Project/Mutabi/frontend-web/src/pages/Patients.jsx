// src/pages/Patients.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useAuthStore from '../store/authStore'

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

const STATUS_FILTERS = ['All Assigned', 'Active Plans', 'Inactive / Completed']

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

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Assigned')

  useEffect(() => {
    fetch('/api/v1/children', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p => {
    const name = `${p.first_name} ${p.second_name}`.toLowerCase()
    const parentName = p.parent?.name?.toLowerCase() || ''
    const matchSearch = !search || name.includes(search.toLowerCase()) || parentName.includes(search.toLowerCase())

    const matchStatus =
      statusFilter === 'All Assigned' ? true :
      statusFilter === 'Active Plans' ? p.plan?.status === 'active' :
      statusFilter === 'Inactive / Completed' ? (p.plan?.status === 'completed' || p.plan?.status === 'cancelled' || !p.plan?.status) :
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
              <h1 className="text-2xl font-bold text-gray-800">Patients List</h1>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="text-center py-12">
                      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                        style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
                    </td>
                  </tr>
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="text-center py-12 text-sm text-gray-400">
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
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm text-gray-600">Dr. {p.doctor?.name || '—'}</span>
                          </div>
                        </td>
                      )}
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

        </main>
      </div>
    </div>
  )
}