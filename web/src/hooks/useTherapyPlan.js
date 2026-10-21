import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../services/api/config'
import useAuthStore from '../store/authStore'

export default function useTherapyPlan() {
  const { user } = useAuthStore()
  const location = useLocation()
  const patient = location.state?.patient
  const existingPlan = patient?.active_plan
  const [form, setForm] = useState({
    patient_id: patient?.id || '', title: existingPlan?.title || '',
    start_date: existingPlan?.start_date || '', end_date: existingPlan?.end_date || '',
    status: existingPlan?.status || 'active',
  })
  const [existingPlanId, setExistingPlanId] = useState(existingPlan?.id || null)
  const [patients, setPatients] = useState([])
  const [exercises, setExercises] = useState([])
  const [selected, setSelected] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const requests = [
          fetch(`${API_BASE_URL}/api/v1/children/`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/v1/exercises/`, { credentials: 'include' }),
        ]
        if (existingPlan?.id) requests.push(fetch(`${API_BASE_URL}/api/v1/plan-exercises/plan/${existingPlan.id}`, { credentials: 'include' }))
        const responses = await Promise.all(requests)
        if (responses.some(response => !response.ok)) throw new Error('تعذر تحميل بيانات الخطط العلاجية. حدّث الصفحة وحاول مجددًا.')
        const [childrenData, exercisesData, planEntries] = await Promise.all(responses.map(response => response.json()))
        if (cancelled) return
        const available = Array.isArray(exercisesData) ? exercisesData : []
        setPatients(Array.isArray(childrenData) ? childrenData : [])
        setExercises(available)
        if (Array.isArray(planEntries)) setSelected(planEntries.map(entry => ({
          planExerciseId: entry.id,
          exercise: available.find(exercise => exercise.id === entry.exercise_id) || {
            id: entry.exercise_id, title: 'تمرين غير متاح في المكتبة', description: 'تمرين محفوظ في الخطة الحالية.', icon: null,
          },
          target_days: entry.target_days, reps: entry.reps, duration_minutes: entry.duration_minutes,
        })))
      } catch (cause) {
        if (!cancelled) setLoadError(cause.message || 'تعذر تحميل بيانات الخطط العلاجية.')
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [existingPlan?.id, user?.user_id])

  const isAdded = id => selected.some(item => item.exercise.id === id)
  const changePatient = id => {
    if (id === form.patient_id) return
    if (existingPlanId) {
      setForm({ patient_id: id, title: '', start_date: '', end_date: '', status: 'active' })
      setSelected([])
      setExistingPlanId(null)
      setError('')
      setSuccess('')
    } else {
      setForm(current => ({ ...current, patient_id: id }))
    }
  }
  const addExercise = exercise => {
    if (isAdded(exercise.id)) return
    setSelected(current => [...current, { exercise, target_days: 'monday', reps: null, duration_minutes: null }])
  }
  const matches = (item, id) => (item.planExerciseId || item.exercise.id) === id
  const removeExercise = id => setSelected(current => current.filter(item => !matches(item, id)))
  const updateDay = (id, target_days) => setSelected(current => current.map(item => matches(item, id) ? { ...item, target_days } : item))
  const updateReps = (id, reps) => setSelected(current => current.map(item => matches(item, id) ? { ...item, reps } : item))
  const updateDuration = (id, duration_minutes) => setSelected(current => current.map(item => matches(item, id) ? { ...item, duration_minutes } : item))
  const setPlanExerciseId = (id, planExerciseId) => setSelected(current => current.map(item => matches(item, id) ? { ...item, planExerciseId } : item))

  return { form, setForm, patients, exercises, selected, loadingData, loadError,
    saving, setSaving, error, setError, success, setSuccess,
    isAdmin: user?.role === 'admin', isAdded, changePatient, addExercise, removeExercise,
    updateDay, updateReps, updateDuration, existingPlanId, setExistingPlanId, setPlanExerciseId, originalPlan: existingPlan }
}
