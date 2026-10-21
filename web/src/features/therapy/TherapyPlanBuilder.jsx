import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import TherapyPlanView from './components/TherapyPlanView'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import useTherapyPlan from '../../hooks/useTherapyPlan'
import '../../design-system/dashboard.css'
import '../../design-system/plans.css'

async function requestJson(url, options) {
  const response = await fetch(url, { credentials: 'include', ...options })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'تعذر حفظ الخطة العلاجية. حاول مجددًا.')
  return data
}

function planErrorMessage(message) {
  if (/already has an active therapy plan/i.test(message)) return 'لدى هذا الطفل خطة علاجية نشطة بالفعل. افتح ملف الطفل لتعديلها.'
  if (/end_date must be after start_date/i.test(message)) return 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية.'
  if (/start_date must be today or in the future/i.test(message)) return 'تاريخ بداية الخطة الجديدة يجب أن يكون اليوم أو بعده.'
  return message
}

function TherapyPlanContent() {
  const navigate = useNavigate()
  const { form, setForm, patients, exercises, selected, loadingData, loadError,
    saving, setSaving, error, setError, success, setSuccess,
    isAdmin, changePatient, addExercise, removeExercise, updateDay, updateReps, updateDuration,
    existingPlanId, setExistingPlanId, setPlanExerciseId, originalPlan } = useTherapyPlan()
  const [invalidIds, setInvalidIds] = useState([])

  useEffect(() => { document.title = 'الخطط العلاجية | متابع' }, [])

  const save = async () => {
    setError('')
    setInvalidIds([])
    if (!form.patient_id) return setError('اختر الطفل أولًا.')
    if (!form.title.trim()) return setError('أدخل عنوان الخطة.')
    if (selected.length === 0) return setError('أضف تمرينًا واحدًا على الأقل من المكتبة.')
    const schedule = selected.map(item => `${item.exercise.id}:${item.target_days}`)
    if (new Set(schedule).size !== schedule.length) return setError('التمرين نفسه لا يمكن تكراره في اليوم ذاته.')
    const invalid = selected.filter(item => {
      const repsValid = Number.isInteger(item.reps) && item.reps > 0
      const durationValid = Number.isInteger(item.duration_minutes) && item.duration_minutes > 0
      return (!repsValid && !durationValid) || (item.reps != null && !repsValid) || (item.duration_minutes != null && !durationValid)
    })
    if (invalid.length) {
      setInvalidIds(invalid.map(item => item.planExerciseId || item.exercise.id))
      return setError('أدخل عدد تكرارات أو مدة صحيحة لكل تمرين.')
    }
    if (form.start_date && form.end_date && form.end_date <= form.start_date) return setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية.')
    if (!existingPlanId && form.start_date && new Date(`${form.start_date}T00:00:00`) < new Date(new Date().setHours(0, 0, 0, 0))) return setError('تاريخ بداية الخطة الجديدة يجب أن يكون اليوم أو بعده.')

    setSaving(true)
    try {
      let planId = existingPlanId
      const base = { title: form.title.trim() }
      if (existingPlanId) {
        const body = { ...base, status: form.status }
        if (form.start_date !== (originalPlan?.start_date || '')) body.start_date = form.start_date || null
        if (form.end_date !== (originalPlan?.end_date || '')) body.end_date = form.end_date || null
        await requestJson(`${API_BASE_URL}/api/v1/therapy-plans/${planId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
      } else {
        const body = { ...base, child_id: form.patient_id }
        if (form.start_date) body.start_date = form.start_date
        if (form.end_date) body.end_date = form.end_date
        const plan = await requestJson(`${API_BASE_URL}/api/v1/therapy-plans/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        planId = plan.id
        setExistingPlanId(planId)
      }

      const current = await requestJson(`${API_BASE_URL}/api/v1/plan-exercises/plan/${planId}`)
      const existingEntries = Array.isArray(current) ? current : []
      const keptIds = new Set()
      for (const item of selected) {
        const saved = existingEntries.find(entry => entry.id === item.planExerciseId)
          || existingEntries.find(entry => entry.exercise_id === item.exercise.id && entry.target_days === item.target_days)
        const body = { target_days: item.target_days, reps: item.reps || null, duration_minutes: item.duration_minutes || null }
        if (saved) {
          keptIds.add(saved.id)
          await requestJson(`${API_BASE_URL}/api/v1/plan-exercises/${saved.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
          })
          if (!item.planExerciseId) setPlanExerciseId(item.exercise.id, saved.id)
        } else {
          const created = await requestJson(`${API_BASE_URL}/api/v1/plan-exercises/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, therapy_plan_id: planId, exercise_id: item.exercise.id }),
          })
          keptIds.add(created.id)
          setPlanExerciseId(item.exercise.id, created.id)
        }
      }
      for (const entry of existingEntries) {
        if (!keptIds.has(entry.id)) {
          await requestJson(`${API_BASE_URL}/api/v1/plan-exercises/${entry.id}`, { method: 'DELETE' })
        }
      }
      setSuccess('تم حفظ الخطة العلاجية بنجاح. جارٍ فتح لوحة التحكم…')
      window.setTimeout(() => navigate('/dashboard'), 1600)
    } catch (cause) { setError(planErrorMessage(cause.message || 'تعذر حفظ الخطة العلاجية.')) }
    finally { setSaving(false) }
  }

  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main">
    <TherapyPlanView form={form} setForm={setForm} patients={patients} exercises={exercises} selected={selected}
      isAdmin={isAdmin} onPatientChange={changePatient}
      loading={loadingData} loadError={loadError} error={error} success={success} saving={saving}
      existingPlanId={existingPlanId} invalidIds={invalidIds} onSave={save}
      onAddExercise={addExercise} onRemoveExercise={removeExercise} onUpdateDay={updateDay}
      onUpdateReps={(id, value) => { setInvalidIds(current => current.filter(item => item !== id)); updateReps(id, value) }}
      onUpdateDuration={(id, value) => { setInvalidIds(current => current.filter(item => item !== id)); updateDuration(id, value) }} />
  </main></div>
}

export default function TherapyPlanBuilder() {
  return <ThemeProvider><TherapyPlanContent /></ThemeProvider>
}
