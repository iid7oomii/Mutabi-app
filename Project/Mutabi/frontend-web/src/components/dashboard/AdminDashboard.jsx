import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config';
import useAuthStore from '../../store/authStore'

const AVATAR_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]

function avatarColor(name) {
  return AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]
}

function DoctorsStatIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function PatientsStatIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function RegistrationsStatIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/dashboard/admin`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load dashboard')
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div
        className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }}
      />
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  )

  const stats = [
    {
      label: 'Total Doctors',
      value: data?.total_doctors ?? 0,
      subColor: 'text-green-500',
      icon: <DoctorsStatIcon />,
    },
    {
      label: 'Active Patients',
      value: (data?.active_patients ?? 0).toLocaleString(),
      sub: 'Currently in therapy plans',
      subColor: 'text-gray-400',
      icon: <PatientsStatIcon />,
    },
    {
      label: 'New Registrations',
      value: data?.new_registrations ?? 0,
      sub: 'Last 7 days',
      subColor: 'text-gray-400',
      icon: <RegistrationsStatIcon />,
    },
  ]

  return (
    <div className="space-y-6"  dir="ltr">

      <div className="flex items-start  justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back, {user?.first_name}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/doctors')}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition font-medium shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Doctor
          </button>
          <button
            onClick={() => navigate('/registration')}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-medium transition shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Add Patients
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
              >
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Doctor Onboarding</h2>
          <button
            onClick={() => navigate('/doctors')}
            className="text-xs font-medium hover:underline"
            style={{ color: '#0F4C81' }}
          >
            View All
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Doctor
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Specialty
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(!data?.recent_onboarding || data.recent_onboarding.length === 0) && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-sm text-gray-400">
                  No doctors registered yet
                </td>
              </tr>
            )}
            {data?.recent_onboarding?.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: avatarColor(doc.name) }}
                    >
                      {doc.initials}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{doc.specialty}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                    doc.is_active
                      ? 'bg-orange-50 text-orange-500'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
                    <DotsIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}