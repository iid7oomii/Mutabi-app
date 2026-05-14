import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import useAuthStore from '../store/authStore'

const EX_COLORS = [
  '#FF8C42', '#4ECDC4', '#0F4C81', '#9B59B6', '#E67E22', '#1ABC9C', '#3498DB', '#E74C3C',
]
const exColor = (str) => EX_COLORS[(str || 'A').charCodeAt(0) % EX_COLORS.length]

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const STATUS_OPTS = ['active', 'completed', 'cancelled']
const FILTERS = ['All', 'Vestibular', 'Tactile']

function matchesFilter(ex, filter) {
  if (filter === 'All') return true
  const text = (ex.title + ' ' + ex.description).toLowerCase()
  if (filter === 'Vestibular')
    return ['vestibular', 'swing', 'balance', 'linear', 'motion', 'rotation'].some(k => text.includes(k))
  if (filter === 'Tactile')
    return ['tactile', 'texture', 'touch', 'bin', 'sensory', 'pressure', 'proprioceptive'].some(k => text.includes(k))
  return true
}

function getAge(dob) {
  if (!dob) return ''
  const yrs = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000))
  return `${yrs} yrs`
}

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const DragIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 16 16">
    <circle cx="5" cy="4" r="1.2" /><circle cx="11" cy="4" r="1.2" />
    <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
    <circle cx="5" cy="12" r="1.2" /><circle cx="11" cy="12" r="1.2" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)


const DoctorFieldIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EmptyPlanIcon = () => (
  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 4v16m8-8H4" />
  </svg>
)

function Select({ value, onChange, children, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-100 transition pr-8 ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
    </div>
  )
}

function Label({ children }) {
  return <label className="block text-xs font-medium text-gray-500 mb-1.5">{children}</label>
}

export default function TherapyPlanBuilder() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  // form
  const [form, setForm] = useState({
    patient_id: '',
    title: '',
    start_date: '',
    end_date: '',
    status: 'active',
    doctor_id: '',
  })


  const [patients, setPatients]   = useState([])
  const [exercises, setExercises] = useState([])
  const [doctors, setDoctors]     = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [selected, setSelected] = useState([])   // [{ exercise, target_days }]
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          fetch('/api/v1/children',   { credentials: 'include' }),
          fetch('/api/v1/exercises',  { credentials: 'include' }),
        ])
        const [cData, eData] = await Promise.all([cRes.json(), eRes.json()])
        setPatients(Array.isArray(cData) ? cData : [])
        setExercises(Array.isArray(eData) ? eData : [])

        if (isAdmin) {
          const dRes  = await fetch('/api/v1/users?role=Doctor', { credentials: 'include' })
          const dData = await dRes.json()
          setDoctors(Array.isArray(dData) ? dData : [])
        }
      } catch (err) {
        console.error('Failed to load data', err)
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [isAdmin])

  const visible = exercises.filter(ex => {
    const q = search.toLowerCase()
    const hit = !q || ex.title.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q)
    return hit && matchesFilter(ex, filter)
  })

  const isAdded = (id) => selected.some(s => s.exercise.id === id)

  const addExercise = (ex) => {
    if (isAdded(ex.id)) return
    setSelected(prev => [...prev, { exercise: ex, target_days: 'monday' }])
  }

  const removeExercise = (id) =>
    setSelected(prev => prev.filter(s => s.exercise.id !== id))

  const updateDay = (id, day) =>
    setSelected(prev => prev.map(s => s.exercise.id === id ? { ...s, target_days: day } : s))

  const handleActivate = async () => {
    setError(null)
    if (!form.patient_id) return setError('Please select a patient.')
    if (!form.title.trim()) return setError('Please enter a plan title.')
    if (selected.length === 0) return setError('Add at least one exercise from the library.')

    setSaving(true)
    try {
      const body = {
        child_id: form.patient_id,
        title: form.title.trim(),
        status: form.status,
      }
      if (form.start_date) body.start_date = form.start_date
      if (form.end_date)   body.end_date   = form.end_date

      const planRes = await fetch('/api/v1/therapy-plans', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!planRes.ok) {
        const e = await planRes.json()
        throw new Error(e.error || 'Failed to create plan')
      }
      const plan = await planRes.json()


      await Promise.all(
        selected.map(({ exercise, target_days }) =>
          fetch('/api/v1/plan-exercises', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              therapy_plan_id: plan.id,
              exercise_id:     exercise.id,
              target_days,
              reps: 10,
            }),
          })
        )
      )

      setSuccess('Plan activated successfully!')
      setTimeout(() => navigate('/dashboard'), 1600)
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

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Therapy Plan Builder</h1>
              <p className="text-sm text-gray-400 mt-1">Create or update a structured plan for your patient.</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleActivate}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition shadow-sm disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
              >
                {saving ? 'Saving…' : 'Activate Plan'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}

          <div className="flex gap-6 items-start">

            <div className="flex-1 space-y-5 min-w-0">

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-800 mb-5">Plan Details</h2>

                <div className="space-y-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Patient</Label>
                      <Select
                        value={form.patient_id}
                        onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
                      >
                        <option value="">Select patient…</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.first_name} {p.second_name}
                            {p.date_of_birth ? ` (${getAge(p.date_of_birth)})` : ''}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label>Plan Title</Label>
                      <input
                        type="text"
                        placeholder="e.g. Sensory Integration Focus – Q3"
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                          focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                          focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <Label>End Date</Label>
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                          focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <Label>API Status</Label>
                      <Select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      >
                        {STATUS_OPTS.map(s => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {isAdmin && (
                    <div>
                      <Label>Assign Primary Doctor</Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                          <DoctorFieldIcon />
                        </span>
                        <select
                          value={form.doctor_id}
                          onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))}
                          className="w-full appearance-none border border-gray-200 rounded-xl pl-10 pr-8 py-2.5
                            text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                        >
                          <option value="">Select a specialist</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                              Dr. {d.first_name} {d.second_name}
                              {d.specialty ? ` – ${d.specialty}` : ''}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-gray-800">Selected Exercises</h2>
                  {selected.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {selected.length} {selected.length === 1 ? 'Item' : 'Items'}
                    </span>
                  )}
                </div>

                {selected.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                      <EmptyPlanIcon />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No exercises added yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click an exercise from the library on the right.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selected.map(({ exercise, target_days }) => {
                      const color = exColor(exercise.id)
                      return (
                        <div
                          key={exercise.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition"
                        >
                          <span className="cursor-grab active:cursor-grabbing flex-shrink-0">
                            <DragIcon />
                          </span>

                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ background: color }}
                          >
                            {exercise.title[0].toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{exercise.title}</p>
                            <p className="text-xs text-gray-400 truncate">{exercise.description}</p>
                          </div>

                          <div className="relative flex-shrink-0">
                            <select
                              value={target_days}
                              onChange={e => updateDay(exercise.id, e.target.value)}
                              className="appearance-none text-xs font-semibold border border-gray-200 rounded-lg
                                px-3 py-1.5 pr-6 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-100 transition"
                            >
                              {DAYS.map(d => (
                                <option key={d} value={d}>
                                  {d.charAt(0).toUpperCase() + d.slice(1)}
                                </option>
                              ))}
                            </select>
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                          </div>

                          <button
                            onClick={() => removeExercise(exercise.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300
                              hover:text-red-400 hover:bg-red-50 transition flex-shrink-0"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>

            <div className="w-72 flex-shrink-0 sticky top-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Exercise Library</h2>

                <div className="relative mb-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700
                      focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div className="flex gap-2 mb-4">
                  {FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        filter === f ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      style={filter === f ? { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' } : {}}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5">
                  {loadingData && (
                    <div className="flex justify-center py-8">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }}
                      />
                    </div>
                  )}

                  {!loadingData && visible.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">No exercises found</p>
                  )}

                  {!loadingData && visible.map(ex => {
                    const added = isAdded(ex.id)
                    const color = exColor(ex.id)
                    return (
                      <button
                        key={ex.id}
                        onClick={() => addExercise(ex)}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition ${
                          added
                            ? 'bg-orange-50 border-orange-100 cursor-default'
                            : 'border-transparent hover:bg-gray-50 hover:border-gray-100 cursor-pointer'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: added ? '#F7A072' : color }}
                        >
                          {ex.title[0].toUpperCase()}
                        </div>


                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold leading-snug ${added ? 'text-orange-600' : 'text-gray-800'}`}>
                            {ex.title}
                          </p>
                          <p className={`text-xs mt-0.5 ${added ? 'text-orange-400' : 'text-gray-400'}`}>
                            {added ? 'Added to plan.' : ex.description}
                          </p>
                        </div>

                        {added && (
                          <span className="text-orange-400 flex-shrink-0 mt-0.5">
                            <CheckCircleIcon />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}