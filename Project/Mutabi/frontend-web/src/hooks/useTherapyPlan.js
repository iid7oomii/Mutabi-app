import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config';
import useAuthStore from '../store/authStore'

export default function useTherapyPlan() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  const patient = location.state?.patient
  const existingPlan = patient?.active_plan

  const [form, setForm] = useState({
    patient_id: patient?.id || '',
    title: existingPlan?.title || '',
    start_date: existingPlan?.start_date || '',
    end_date: existingPlan?.end_date || '',
    status: existingPlan?.status || 'active',
    doctor_id: '',
  })

  const [existingPlanId] = useState(existingPlan?.id || null)
  const [patients, setPatients] = useState([])
  const [exercises, setExercises] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/children`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/v1/exercises`, { credentials: 'include' }),
        ])
        const [cData, eData] = await Promise.all([cRes.json(), eRes.json()])
        setPatients(Array.isArray(cData) ? cData : [])
        setExercises(Array.isArray(eData) ? eData : [])

        if (isAdmin) {
          const dRes = await fetch(`${API_BASE_URL}/api/v1/users?role=Doctor`, { credentials: 'include' })
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

  const isAdded = (id) => selected.some(s => s.exercise.id === id)

  const addExercise = (ex) => {
  if (isAdded(ex.id)) return
  setSelected(prev => [...prev, { 
    exercise: ex, 
    target_days: 'monday',
    reps: null,
    duration_minutes: null,
  }])
	}

	const updateReps = (id, reps) =>
		setSelected(prev => prev.map(s => s.exercise.id === id ? { ...s, reps } : s))

	const updateDuration = (id, duration_minutes) =>
		setSelected(prev => prev.map(s => s.exercise.id === id ? { ...s, duration_minutes } : s))

  const removeExercise = (id) =>
    setSelected(prev => prev.filter(s => s.exercise.id !== id))

  const updateDay = (id, day) =>
    setSelected(prev => prev.map(s => s.exercise.id === id ? { ...s, target_days: day } : s))

  return {
    form, setForm,
    patients, exercises, doctors,
    loadingData, selected,
    saving, setSaving,
    error, setError,
    success, setSuccess,
    isAdmin, isAdded,
    addExercise, removeExercise, updateDay,
    existingPlanId,
		updateReps, updateDuration,
  }
}