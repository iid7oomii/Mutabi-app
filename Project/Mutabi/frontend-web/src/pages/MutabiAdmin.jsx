import { useState, useEffect, useCallback } from 'react'

const API = '/api/v1/admin'

function useAdminKey() {
  const [key, setKey] = useState(() => sessionStorage.getItem('mutabi_admin_key') || '')
  const save = (k) => { sessionStorage.setItem('mutabi_admin_key', k); setKey(k) }
  const clear = () => { sessionStorage.removeItem('mutabi_admin_key'); setKey('') }
  return { key, save, clear }
}

function headers(key) {
  return { 'Content-Type': 'application/json', 'X-Admin-Key': key }
}

async function apiFetch(path, key, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { ...headers(key), ...(opts.headers || {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconBuilding = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const IconUsers = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconPatients = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const IconCheck = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconTrial = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const IconCard = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

// ── Sub-status badge ──────────────────────────────────────────────────────────

function SubBadge({ status }) {
  const map = {
    active:  'bg-green-100 text-green-700',
    trial:   'bg-blue-100 text-blue-700',
    expired: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || 'none'}
    </span>
  )
}

// ── Stats cards ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    teal:   'bg-teal-50 text-teal-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      </div>
    </div>
  )
}

// ── Edit User Modal ───────────────────────────────────────────────────────────

function EditUserModal({ user, adminKey, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    second_name: user.second_name || '',
    email: user.email || '',
    phone: user.phone || '',
    is_active: user.is_active ?? true,
    specialty: user.specialty || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const updated = await apiFetch(`/users/${user.id}`, adminKey, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      onSaved(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Edit User</h3>

        <div className="space-y-3">
          {[
            ['first_name', 'First Name'],
            ['second_name', 'Last Name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['specialty', 'Specialty'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="accent-orange-500"
            />
            Active
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Manage Subscription Modal ─────────────────────────────────────────────────

function ManageSubModal({ clinic, adminKey, onClose, onSaved }) {
  const [form, setForm] = useState({ plan_type: 'clinic', status: 'active', days: 365 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (clinic.subscription) {
      setForm(f => ({
        ...f,
        plan_type: clinic.subscription.plan_type || 'clinic',
        status: clinic.subscription.status || 'active',
      }))
    }
  }, [clinic])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await apiFetch(`/subscriptions/${clinic.id}`, adminKey, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Manage Subscription</h3>
        <p className="text-sm text-gray-500 mb-4">{clinic.name}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Plan</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.plan_type}
              onChange={e => setForm(f => ({ ...f, plan_type: e.target.value }))}
            >
              <option value="specialist">Specialist</option>
              <option value="clinic">Clinic</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Duration (days)</label>
            <input
              type="number"
              min={1}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.days}
              onChange={e => setForm(f => ({ ...f, days: parseInt(e.target.value) || 365 }))}
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Clinic Users Panel ────────────────────────────────────────────────────────

function ClinicUsersPanel({ clinic, adminKey, onClose, onRefresh }) {
  const [users, setUsers] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiFetch(`/clinics/${clinic.id}/users`, adminKey)
      setUsers(data)
    } catch (e) {
      setError(e.message)
    }
  }, [clinic.id, adminKey])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return
    setDeleting(userId)
    try {
      await apiFetch(`/users/${userId}`, adminKey, { method: 'DELETE' })
      setUsers(u => u.filter(x => x.id !== userId))
      onRefresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(null)
    }
  }

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-blue-100 text-blue-700',
    parent: 'bg-green-100 text-green-700',
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{clinic.name}</h2>
            <p className="text-sm text-gray-400">Users ({users?.length ?? '…'})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {users === null ? (
            <div className="text-center text-gray-400 py-12">Loading…</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No users found</div>
          ) : (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm">
                        {u.first_name} {u.second_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                      {!u.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                    {u.specialty && <p className="text-xs text-gray-400">{u.specialty}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditUser(u)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deleting === u.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-40"
                      title="Delete"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          adminKey={adminKey}
          onClose={() => setEditUser(null)}
          onSaved={(updated) => {
            setUsers(u => u.map(x => x.id === updated.id ? updated : x))
            setEditUser(null)
          }}
        />
      )}
    </div>
  )
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────

export default function MutabiAdmin() {
  const { key, save, clear } = useAdminKey()
  const [keyInput, setKeyInput] = useState('')
  const [authError, setAuthError] = useState('')

  const [stats, setStats] = useState(null)
  const [clinics, setClinics] = useState(null)
  const [loadingData, setLoadingData] = useState(false)
  const [dataError, setDataError] = useState('')

  const [tab, setTab] = useState('overview')
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [subClinic, setSubClinic] = useState(null)

  const [search, setSearch] = useState('')

  const loadAll = useCallback(async (k) => {
    setLoadingData(true)
    setDataError('')
    try {
      const [statsData, clinicsData] = await Promise.all([
        apiFetch('/stats', k),
        apiFetch('/clinics', k),
      ])
      setStats(statsData)
      setClinics(clinicsData)
    } catch (e) {
      if (e.message.includes('401') || e.message.toLowerCase().includes('unauthorized')) {
        setDataError('Invalid admin key')
        clear()
      } else {
        setDataError(e.message)
      }
    } finally {
      setLoadingData(false)
    }
  }, [clear])

  useEffect(() => {
    if (key) loadAll(key)
  }, [key, loadAll])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      await apiFetch('/stats', keyInput)
      save(keyInput)
    } catch {
      setAuthError('Invalid admin key')
    }
  }

  const handleDeleteClinic = async (clinicId) => {
    if (!confirm('Delete this clinic and all its data?')) return
    try {
      await apiFetch(`/clinics/${clinicId}`, key, { method: 'DELETE' })
      setClinics(c => c.filter(x => x.id !== clinicId))
      await loadAll(key)
    } catch (e) {
      alert(e.message)
    }
  }

  // ── Login screen ─────────────────────────────────────────────────────────────

  if (!key) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-3">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Mutabi Admin</h1>
            <p className="text-sm text-gray-400 mt-1">Platform super-admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Admin Key</label>
              <input
                type="password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="Enter admin key"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                autoFocus
              />
            </div>
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Authenticated ─────────────────────────────────────────────────────────

  const filteredClinics = (clinics || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_phone || '').includes(search)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-bold text-gray-800">Mutabi Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => loadAll(key)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={clear}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {dataError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {dataError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl border border-gray-100 p-1 w-fit shadow-sm">
          {[['overview', 'Overview'], ['clinics', 'Clinics']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                tab === id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loadingData && !stats && (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        )}

        {/* Overview Tab */}
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatCard icon={<IconBuilding />} label="Total Clinics" value={stats.total_clinics} color="blue" />
              <StatCard icon={<IconUsers />} label="Total Users" value={stats.total_users} color="orange" />
              <StatCard icon={<IconPatients />} label="Total Patients" value={stats.total_patients} color="teal" />
              <StatCard icon={<IconCheck />} label="Active Subs" value={stats.active_subs} color="green" />
              <StatCard icon={<IconTrial />} label="Trial Subs" value={stats.trial_subs} color="purple" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Roles Breakdown */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Users by Role</h3>
                <div className="space-y-3">
                  {Object.entries(stats.roles || {}).map(([role, count]) => {
                    const total = stats.total_users || 1
                    const pct = Math.round((count / total) * 100)
                    const colors = {
                      admin: 'bg-purple-400',
                      doctor: 'bg-blue-400',
                      parent: 'bg-green-400',
                    }
                    return (
                      <div key={role}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 capitalize">{role}</span>
                          <span className="text-gray-800 font-medium">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[role] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Clinics */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Clinics</h3>
                <div className="space-y-3">
                  {(clinics || []).slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.user_count} users · {c.patient_count} patients</p>
                      </div>
                      <SubBadge status={c.subscription?.status} />
                    </div>
                  ))}
                  {!clinics?.length && <p className="text-sm text-gray-400">No clinics yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clinics Tab */}
        {tab === 'clinics' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search clinics…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
              />
              <span className="text-sm text-gray-400">{filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Clinic</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Users</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patients</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expires</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredClinics.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-400 py-10">No clinics found</td>
                    </tr>
                  )}
                  {filteredClinics.map(clinic => (
                    <tr key={clinic.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">{clinic.name}</p>
                        {clinic.contact_phone && (
                          <p className="text-xs text-gray-400">{clinic.contact_phone}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600 capitalize">
                        {clinic.subscription?.plan_type || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <SubBadge status={clinic.subscription?.status} />
                      </td>
                      <td className="px-5 py-4 text-gray-600">{clinic.user_count}</td>
                      <td className="px-5 py-4 text-gray-600">{clinic.patient_count}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {clinic.subscription?.expires_at
                          ? new Date(clinic.subscription.expires_at).toLocaleDateString('en-GB')
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setSelectedClinic(clinic)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                            title="View users"
                          >
                            <IconEye />
                          </button>
                          <button
                            onClick={() => setSubClinic(clinic)}
                            className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                            title="Manage subscription"
                          >
                            <IconCard />
                          </button>
                          <button
                            onClick={() => handleDeleteClinic(clinic.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete clinic"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Users Panel */}
      {selectedClinic && (
        <ClinicUsersPanel
          clinic={selectedClinic}
          adminKey={key}
          onClose={() => setSelectedClinic(null)}
          onRefresh={() => loadAll(key)}
        />
      )}

      {/* Subscription Modal */}
      {subClinic && (
        <ManageSubModal
          clinic={subClinic}
          adminKey={key}
          onClose={() => setSubClinic(null)}
          onSaved={() => { setSubClinic(null); loadAll(key) }}
        />
      )}
    </div>
  )
}
