import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { WarningIcon, CheckIcon } from '../components/Icons'
import PlanForm from '../components/therapy/PlanForm'
import ExerciseList from '../components/therapy/ExerciseList'
import ExerciseLibrary from '../components/therapy/ExerciseLibrary'
import { API_BASE_URL } from '../config';
import useTherapyPlan from '../hooks/useTherapyPlan'

export default function TherapyPlanBuilder() {
  const navigate = useNavigate()
  const {
    form, setForm,
    patients, exercises, doctors,
    loadingData, selected,
    saving, setSaving,
    error, setError,
    success, setSuccess,
    isAdmin, isAdded,
    addExercise, removeExercise, updateDay,
    existingPlanId,
    updateReps,
    updateDuration
  } = useTherapyPlan()

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
        if (form.end_date) body.end_date = form.end_date

        let plan
        if (existingPlanId) {
            const updateRes = await fetch(`${API_BASE_URL}/api/v1/therapy-plans/${existingPlanId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            })
            if (!updateRes.ok) {
            const e = await updateRes.json()
            throw new Error(e.error || 'Failed to update plan')
            }
            plan = await updateRes.json()
        } else {
            const planRes = await fetch(`${API_BASE_URL}/api/v1/therapy-plans/`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            })
            if (!planRes.ok) {
            const e = await planRes.json()
            throw new Error(e.error || 'Failed to create plan')
            }
            plan = await planRes.json()
        }

        await Promise.all(
            selected.map(({ exercise, target_days, reps, duration_minutes }) =>
                fetch(`${API_BASE_URL}/api/v1/plan-exercises/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    therapy_plan_id: plan.id,
                    exercise_id: exercise.id,
                    target_days,
                    reps: reps || null,
                    duration_minutes: duration_minutes || null,
                }),
                })
            )
            )

        setSuccess('Plan saved successfully!')
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
            <button onClick={handleActivate} disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition shadow-sm disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
              {saving ? 'Saving…' : 'Activate Plan'}
            </button>
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

          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-5 min-w-0">
              <PlanForm form={form} setForm={setForm} patients={patients} doctors={doctors} isAdmin={isAdmin} />
              <ExerciseList 
                selected={selected} 
                removeExercise={removeExercise} 
                updateDay={updateDay}
                updateReps={updateReps}
                updateDuration={updateDuration}
                />
            </div>
            <ExerciseLibrary exercises={exercises} loadingData={loadingData} isAdded={isAdded} addExercise={addExercise} />
          </div>

        </main>
      </div>
    </div>
  )
}