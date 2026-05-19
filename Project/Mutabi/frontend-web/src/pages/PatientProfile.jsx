import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const AVATAR_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]
const avatarColor = (name) => AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]

function getAge(dob) {
  if (!dob) return '—'
  const d = new Date(dob)
  const now = new Date()
  let years = now.getFullYear() - d.getFullYear()
  let months = now.getMonth() - d.getMonth()
  if (months < 0) { years--; months += 12 }
  if (months === 0) return `${years} years`
  return `${years} years ${months} months`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PlanBadge({ status }) {
  if (!status) return null
  const styles = {
    active: 'bg-orange-100 text-orange-600',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-500',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {status.toUpperCase()}
    </span>
  )
}

export default function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExercises, setShowExercises] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/children/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setPatient(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    </div>
  )

  const fullName = `${patient.first_name} ${patient.second_name}`
  const initials = `${patient.first_name[0]}${patient.second_name[0]}`.toUpperCase()
  const color = avatarColor(fullName)
  const plan = patient.active_plan
  const parentInitials = patient.parent?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const parentColor = avatarColor(patient.parent?.name || '')
  const handleDeleteExercise = async (planExerciseId) => {
  if (!confirm('Delete this exercise from the plan?')) return
  try {
    const res = await fetch(`/api/v1/plan-exercises/${planExerciseId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) {
      const updated = await fetch(`/api/v1/children/${id}`, { credentials: 'include' })
      const data = await updated.json()
      setPatient(data)
    }
  } catch (err) {
    console.error(err)
  }
}

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">

          {/* Back */}
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Patients
          </button>

        {/* Header */}
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ background: color }}>
                {initials}
                </div>
                <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
                    <PlanBadge status={plan?.status} />
                </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                onClick={() => navigate(`/patients/${id}/progress`)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
                >
                Review Progress
                </button>
                <button
                onClick={() => navigate('/plans', { state: { patient } })}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition shadow-sm"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                >
                {plan ? 'Edit Plan' : 'Create Plan'}
                </button>
            </div>
            </div>

          <div className="grid grid-cols-3 gap-5 mb-5">

            {/* Patient Details */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5">Patient Details</h2>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(patient.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Age (Derived)</p>
                  <p className="text-sm font-medium text-gray-700">{getAge(patient.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Started Therapy</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(patient.created_at)}</p>
                </div>
              </div>

              {patient.diagnosis_notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-700">Diagnosis Notes</p>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{patient.diagnosis_notes}</p>
                </div>
              )}
            </div>

            {/* Primary Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5">Primary Contact</h2>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: parentColor }}>
                  {parentInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{patient.parent?.name || '—'}</p>
                  <p className="text-xs text-gray-400 capitalize">{patient.parent?.relationship_type || '—'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700">{patient.parent?.phone || '—'}</p>
                    <p className="text-xs text-gray-400">Mobile</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700">{patient.parent?.email || '—'}</p>
                    <p className="text-xs text-gray-400">Primary Email</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Therapy Plan */}
            {plan ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-gray-800">
                    Active Therapy Plan: <span style={{ color: '#0F4C81' }}>{plan.title}</span>
                </h2>
                {plan.start_date && plan.end_date && (
                    <span className="text-sm text-gray-400">
                    {formatDate(plan.start_date)} — {formatDate(plan.end_date)}
                    </span>
                )}
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Plan Completion */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Plan Completion</p>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{plan.completion_pct ?? 0}%</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all"
                        style={{ width: `${plan.completion_pct ?? 0}%`, background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }} />
                    </div>
                    <p className="text-xs text-gray-400">
                    {plan.completed_exercises ?? 0} of {plan.total_exercises ?? 0} sessions completed
                    </p>
                </div>

                {/* Upcoming Exercises */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming Exercises</p>
                    <div className="flex flex-wrap gap-2">
                    {plan.upcoming_exercises?.length > 0 ? plan.upcoming_exercises.map((ex, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {ex.title}
                        </span>
                    )) : (
                        <span className="text-sm text-gray-400">No exercises</span>
                    )}
                    </div>
                </div>

                {/* Upcoming Appointment */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Next Scheduled Session</p>
                    {patient.upcoming_appointment ? (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="text-center flex-shrink-0">
                        <p className="text-xs font-semibold text-orange-500 uppercase">
                            {new Date(patient.upcoming_appointment.appointment).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                            {new Date(patient.upcoming_appointment.appointment).getDate()}
                        </p>
                        </div>
                        <div>
                        <p className="text-sm font-semibold text-gray-700">Clinic Visit</p>
                        {patient.upcoming_appointment.notes && (
                            <p className="text-xs text-gray-400 mt-0.5">{patient.upcoming_appointment.notes}</p>
                        )}
                        </div>
                    </div>
                    ) : (
                    <p className="text-sm text-gray-400">No upcoming appointments</p>
                    )}
                </div>
                </div>

                {/* Collapsible Exercises */}
                {plan.all_exercises?.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                    <button
                    onClick={() => setShowExercises(!showExercises)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
                    >
                    <span>Plan Exercises ({plan.all_exercises.length})</span>
                    <svg
                        className={`w-4 h-4 transition-transform ${showExercises ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </button>

                    {showExercises && (
                    <div className="mt-3 space-y-2">
                        {plan.all_exercises.map((ex) => (
                        <div key={ex.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition">
                            <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: '#0F4C81' }}>
                                {ex.title[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{ex.title}</p>
                                <p className="text-xs text-gray-400 capitalize">
                                {ex.target_days}
                                {ex.reps ? ` • ${ex.reps} reps` : ''}
                                {ex.duration_minutes ? ` • ${ex.duration_minutes} mins` : ''}
                                </p>
                            </div>
                            </div>
                            <button
                            onClick={() => handleDeleteExercise(ex.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                            >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            </button>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                )}
            </div>
            ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <p className="text-sm text-gray-400 mb-3">No active therapy plan</p>
                <button
                onClick={() => navigate('/plans', { state: { patient } })}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                >
                + Create Plan
                </button>
            </div>
            )}

        </main>
      </div>
    </div>
  )
}