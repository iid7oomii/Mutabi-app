import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config';
import useAuthStore from '../store/authStore'
import { WarningIcon, CheckIcon, ChevronDownIcon } from '../components/Icons'

const RELATIONSHIPS = ['mother', 'father', 'guardian', 'therapist', 'doctor', 'other']

export default function Registration() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const [doctors, setDoctors] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [customRelationship, setCustomRelationship] = useState('')

  const [form, setForm] = useState({
    parent_first_name: '',
    parent_second_name: '',
    parent_email: '',
    parent_phone: '',
    parent_relationship: '',
    child_first_name: '',
    child_second_name: '',
    child_dob: '',
    child_diagnosis: '',
    doctor_id: '',
  })

  const generatePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const lower = 'abcdefghijkmnpqrstuvwxyz'
    const numbers = '23456789'
    const special = '@#$!'
    const required = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      special[Math.floor(Math.random() * special.length)],
    ]
    const all = upper + lower + numbers + special
    const rest = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)])
    return [...required, ...rest].sort(() => Math.random() - 0.5).join('')
  }

  const loadDoctors = () => {
    fetch(`${API_BASE_URL}/api/v1/users?role=Doctor`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setDoctors(Array.isArray(data) ? data : []))
      .catch(console.error)
  }

  useEffect(() => {
    if (isAdmin) loadDoctors()
  }, [isAdmin])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleReset = () => {
    setForm({
      parent_first_name: '', parent_second_name: '', parent_email: '',
      parent_phone: '', parent_relationship: '',
      child_first_name: '', child_second_name: '', child_dob: '',
      child_diagnosis: '', doctor_id: '',
    })
    setCustomRelationship('')
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async () => {
  setError(null)
  if (!form.parent_first_name || !form.parent_second_name)
    return setError('Please enter parent full name.')
  if (!form.parent_email)
    return setError('Please enter parent email.')
  if (!form.parent_relationship)
    return setError('Please select relationship to child.')
  if (form.parent_relationship === 'other' && !customRelationship.trim())
    return setError('Please specify the relationship.')
  if (!form.child_first_name || !form.child_second_name)
    return setError('Please enter child full name.')
  if (!form.child_dob)
    return setError('Please enter child date of birth.')
  if (isAdmin && !form.doctor_id)
    return setError('Please assign a doctor.')

  setSaving(true)
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/children/register-family`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parent_first_name: form.parent_first_name,
        parent_second_name: form.parent_second_name,
        parent_email: form.parent_email,
        parent_phone: form.parent_phone,
        parent_relationship: form.parent_relationship === 'other' ? customRelationship : form.parent_relationship,
        parent_password: generatePassword(),
        child_first_name: form.child_first_name,
        child_second_name: form.child_second_name,
        date_of_birth: form.child_dob,
        diagnosis_notes: form.child_diagnosis,
        doctor_id: form.doctor_id || user?.user_id,
      }),
    })

    if (!res.ok) {
      const e = await res.json()
      const msg = e.error || 'Registration failed'
      if (msg.toLowerCase().includes('doctor')) {
        loadDoctors()
        setForm(f => ({ ...f, doctor_id: '' }))
      }
      throw new Error(msg)
    }

    setSuccess('Family registered successfully!')
    setTimeout(() => navigate('/patients'), 1600)
  } catch (err) {
    setError(err.message)
  } finally {
    setSaving(false)
  }
}

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
  const selectClass = "w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Family Registration</h1>
            <p className="text-sm text-gray-400 mt-1">Register a new parent and child profile for SPD therapy.</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <WarningIcon className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 flex items-center gap-2">
              <CheckIcon className="w-4 h-4 flex-shrink-0" /> {success}
            </div>
          )}

          <div className="space-y-5">

            {/* Parent Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-800">Parent Information</h2>
              </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                <input type="text" placeholder="e.g. Jane" value={form.parent_first_name}
                onChange={set('parent_first_name')} className={inputClass} />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                <input type="text" placeholder="e.g. Doe" value={form.parent_second_name}
                onChange={set('parent_second_name')} className={inputClass} />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                <input type="email" placeholder="jane.doe@example.com" value={form.parent_email}
                onChange={set('parent_email')} className={inputClass} />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                <input type="tel" placeholder="(555) 123-4567" value={form.parent_phone}
                onChange={set('parent_phone')} className={inputClass} />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Relationship to Child</label>
                <div className="relative">
                <select value={form.parent_relationship} onChange={set('parent_relationship')} className={selectClass}>
                    <option value="">Select relationship</option>
                    {RELATIONSHIPS.map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronDownIcon className="w-3 h-3" />
                </span>
                </div>
            </div>
            <div>
                {form.parent_relationship === 'other' && (
                <>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Specify Relationship</label>
                    <input
                    type="text"
                    placeholder="Please specify relationship..."
                    value={customRelationship}
                    onChange={e => setCustomRelationship(e.target.value)}
                    className={inputClass}
                    />
                </>
                )}
            </div>
            </div>
            </div>
            </div>

            {/* Child Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-800">Child Information</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                  <input type="text" placeholder="e.g. Sam" value={form.child_first_name}
                    onChange={set('child_first_name')} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                  <input type="text" placeholder="e.g. Doe" value={form.child_second_name}
                    onChange={set('child_second_name')} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Date of Birth</label>
                  <input type="date" value={form.child_dob}
                    onChange={set('child_dob')} className={inputClass} />
                </div>

                {isAdmin ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Assign Primary Doctor</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <select value={form.doctor_id} onChange={set('doctor_id')}
                        className={selectClass + ' pl-10'}>
                        <option value="">Select a specialist</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>
                            Dr. {d.first_name} {d.second_name}{d.specialty ? ` – ${d.specialty}` : ''}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <ChevronDownIcon className="w-3 h-3" />
                </span>
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Preliminary Diagnosis Notes</label>
                  <textarea
                    placeholder="Enter any initial observations, previous diagnoses, or primary concerns regarding Sensory Processing Disorder..."
                    value={form.child_diagnosis}
                    onChange={set('child_diagnosis')}
                    rows={4}
                    className={inputClass + ' resize-none'}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <button onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 transition font-medium">
              Reset Form
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {saving ? 'Registering...' : 'Register Patients'}
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}