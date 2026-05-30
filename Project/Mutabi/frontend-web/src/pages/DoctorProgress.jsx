import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config';
import Sidebar from '../components/Sidebar'
import { DotIcon } from '../components/Icons'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STATUS_STYLES = {
  completed: 'bg-orange-50 text-orange-500',
  skipped: 'bg-red-50 text-red-500',
  partially_completed: 'bg-yellow-50 text-yellow-600',
}

const STATUS_LABELS = {
  completed: 'Completed',
  skipped: 'Skipped',
  partially_completed: 'Partial',
}

const PAIN_COLORS = {
  1: 'text-green-500', 2: 'text-green-500',
  3: 'text-yellow-500', 4: 'text-orange-500', 5: 'text-red-500',
}

const PAIN_LABELS = {
  1: 'Low', 2: 'Low', 3: 'Mild', 4: 'High', 5: 'High',
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function DoctorProgress() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hoveredDay, setHoveredDay] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/feedback/doctor/progress`, { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
      </div>
    </div>
  )

  const feedback = data?.feedback || []

  const adherenceByDay = DAY_KEYS.map(day => ({
    day,
    count: feedback.filter(f => f.target_days === day && f.completion_status === 'completed').length
  }))
  const maxCount = Math.max(...adherenceByDay.map(d => d.count), 1)

  const filtered = feedback.filter(f =>
    !search ||
    f.exercise_title?.toLowerCase().includes(search.toLowerCase()) ||
    f.child_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.parent_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Progress Review</h1>
              <p className="text-sm text-gray-400 mt-1">Overview of all patient sessions and adherence.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-500">Average Adherence Rate</p>
                <span className="text-orange-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-800 mt-3">{data?.adherence_rate ?? 0}%</p>
              <p className="text-xs text-gray-400 mt-1">{data?.total_patients ?? 0} total patients</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-500">Pending Therapy Plans</p>
                <span className="text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
              </div>
              <p className="text-4xl font-bold text-gray-800 mt-3">{data?.pending_plans ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">out of {data?.total_patients ?? 0} Patients</p>
            </div>
          </div>

          {/* Peak Activity Days */}
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
					<h2 className="text-base font-semibold text-gray-800 mb-6">Peak Activity Days</h2>
					<div className="flex items-end gap-3 h-40 relative">
							{adherenceByDay.map((d, i) => (
							<div key={d.day} className="flex-1 flex flex-col items-center gap-2 relative"
									onMouseEnter={() => setHoveredDay(i)}
									onMouseLeave={() => setHoveredDay(null)}
									style={{ height: '100%', justifyContent: 'flex-end' }}
							>
									{hoveredDay === i && (
									<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
											{d.count} completed
									</div>
									)}
									<div
									className="w-full rounded-t-lg transition-all duration-300 cursor-pointer"
									style={{
											height: maxCount === 0 ? '4px' : `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 2)}%`,
											background: hoveredDay === i
											? 'linear-gradient(180deg, #FF6B2C, #FF8F5E)'
											: d.count > 0
													? 'linear-gradient(180deg, #2c78bb, #0F4C81)'
													: '#e5e7eb'
									}}
									/>
									<p className="text-xs text-gray-400 flex-shrink-0">{DAYS[i]}</p>
							</div>
							))}
					</div>
					</div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Recent Sessions</h2>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search exercises or patients..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Exercise</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pain Level</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Parent Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                      No sessions found
                    </td>
                  </tr>
                ) : filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(f.feedback_date)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{f.exercise_title}</p>
                      <p className="text-xs text-gray-400">{f.child_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[f.completion_status] || 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[f.completion_status] || f.completion_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${PAIN_COLORS[f.pain_level] || 'text-gray-400'}`}>
                        <DotIcon className="w-2.5 h-2.5 flex-shrink-0" />
                        {PAIN_LABELS[f.pain_level] || f.pain_level || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{f.parent_name}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/patients/${f.child_id}/progress`)}
                        className="flex items-center gap-1 text-sm font-medium hover:underline"
                        style={{ color: '#0F4C81' }}>
                        View
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  )
}