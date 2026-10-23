import { useState } from 'react'
import TherapyPlanView from './components/TherapyPlanView'
import '../../design-system/plans.css'

const samplePatients = [
  { id: 'child-1', first_name: 'ليان', second_name: 'العتيبي', date_of_birth: '2020-04-12', doctor: { name: 'نورة العتيبي' } },
  { id: 'child-2', first_name: 'عبدالله', second_name: 'القحطاني', date_of_birth: '2019-06-03', doctor: { name: 'محمد القحطاني' } },
]
const sampleExercises = [
  { id: 'ex-1', title: 'توازن الوقوف', description: 'تدريب التوازن مع دعم خفيف.', icon: 'walk-outline', difficulty: 'easy' },
  { id: 'ex-2', title: 'نقل الكرات الملونة', description: 'تقوية المهارات الحركية الدقيقة.', icon: 'hand-left-outline', difficulty: 'medium' },
  { id: 'ex-3', title: 'تقليد الأصوات', description: 'تكرار الأصوات القصيرة بوضوح.', icon: 'mic-outline', difficulty: 'easy' },
  { id: 'ex-4', title: 'المسار الحركي', description: 'المشي والقفز وتغيير الاتجاه.', icon: 'body-outline', difficulty: 'hard' },
]

export default function TherapyPlanDesignPreview({ filled, role }) {
  const [form, setForm] = useState({ patient_id: filled ? 'child-1' : '', title: filled ? 'خطة تنمية التوازن' : '', start_date: '', end_date: '', status: 'active' })
  const [selected, setSelected] = useState(filled ? [
    { exercise: sampleExercises[0], target_days: 'monday', reps: 8, duration_minutes: null },
    { exercise: sampleExercises[1], target_days: 'wednesday', reps: null, duration_minutes: 10 },
  ] : [])
  const [success, setSuccess] = useState('')
  const [existingPlanId, setExistingPlanId] = useState(filled ? 'plan-preview' : null)
  const update = (id, changes) => setSelected(current => current.map(item => item.exercise.id === id ? { ...item, ...changes } : item))
  const changePatient = id => {
    if (id === form.patient_id) return
    if (existingPlanId) {
      setForm({ patient_id: id, title: '', start_date: '', end_date: '', status: 'active' })
      setSelected([])
      setExistingPlanId(null)
      setSuccess('')
    } else {
      setForm(current => ({ ...current, patient_id: id }))
    }
  }
  const visiblePatients = role === 'doctor'
    ? samplePatients.map(patient => ({ ...patient, doctor: { name: 'نورة العتيبي' } }))
    : samplePatients

  return <TherapyPlanView form={form} setForm={setForm} patients={filled ? visiblePatients : []}
    exercises={filled ? sampleExercises : []} selected={selected} success={success} existingPlanId={existingPlanId}
    isAdmin={role === 'admin'} onPatientChange={changePatient}
    onSave={() => setSuccess('هذه معاينة للتصميم. التغييرات التجريبية لا تُحفظ في العيادة.')}
    onAddExercise={exercise => setSelected(current => current.some(item => item.exercise.id === exercise.id) ? current : [...current, { exercise, target_days: 'monday', reps: null, duration_minutes: null }])}
    onRemoveExercise={id => setSelected(current => current.filter(item => item.exercise.id !== id))}
    onUpdateDay={(id, target_days) => update(id, { target_days })}
    onUpdateReps={(id, reps) => update(id, { reps })}
    onUpdateDuration={(id, duration_minutes) => update(id, { duration_minutes })} />
}
