import { createElement, useState } from 'react'
import { CalendarDays, Check, ClipboardList, Clock3, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { Button, EmptyState, Message } from '../../../design-system/components'
import { difficultyLabel, difficultyOptions, exerciseIcon } from './exerciseOptions'

const dayOptions = [
  ['sunday', 'الأحد'], ['monday', 'الاثنين'], ['tuesday', 'الثلاثاء'],
  ['wednesday', 'الأربعاء'], ['thursday', 'الخميس'], ['friday', 'الجمعة'], ['saturday', 'السبت'],
]
const statusOptions = [['active', 'نشطة'], ['completed', 'مكتملة'], ['cancelled', 'ملغاة']]
const age = value => {
  if (!value) return ''
  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return ''
  const today = new Date()
  let years = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) years--
  return years >= 0 ? ` · ${years} سنوات` : ''
}

export default function TherapyPlanView({ form, setForm, patients = [], exercises = [], selected = [], loading = false,
  loadError = '', error = '', success = '', saving = false, existingPlanId, invalidIds = [], isAdmin = false,
  onPatientChange, onSave, onAddExercise, onRemoveExercise, onUpdateDay, onUpdateReps, onUpdateDuration }) {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const child = patients.find(patient => patient.id === form.patient_id)
  const available = exercises.filter(exercise => {
    const text = `${exercise.title || ''} ${exercise.description || ''}`.toLocaleLowerCase('ar')
    return text.includes(search.trim().toLocaleLowerCase('ar')) && (difficulty === 'all' || exercise.difficulty === difficulty)
  })
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))

  return <div className="mt-dash-content mt-plan">
    <header className="mt-dash-header"><div><span className="mt-dash-eyebrow">المتابعة العلاجية</span><h1>{existingPlanId ? 'تعديل الخطة العلاجية' : 'إنشاء خطة علاجية'}</h1>
      <p>حدد الطفل، ثم أضف التمارين ومواعيد تنفيذها.</p></div>
      <Button type="button" onClick={onSave} loading={saving} disabled={loading || Boolean(loadError)}><Check size={17} /> {existingPlanId ? 'حفظ التعديلات' : 'تفعيل الخطة'}</Button></header>
    {(loadError || error) && <div className="mt-plan-message"><Message tone="error">{loadError || error}</Message></div>}
    {success && <div className="mt-plan-message"><Message>{success}</Message></div>}
    <div className="mt-plan-layout"><div className="mt-plan-main">
      <section className="mt-plan-card" aria-labelledby="plan-details-title"><div className="mt-plan-card__head"><span className="mt-plan-card__icon"><ClipboardList size={20} /></span><div><h2 id="plan-details-title">تفاصيل الخطة</h2><p>الطفل والفترة الزمنية للخطة.</p></div><small>01</small></div>
        <div className="mt-plan-fields"><label>الطفل <span>*</span><select value={form.patient_id} onChange={event => onPatientChange ? onPatientChange(event.target.value) : set('patient_id', event.target.value)}><option value="">اختر طفلًا</option>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.first_name} {patient.second_name}{age(patient.date_of_birth)}</option>)}</select>{existingPlanId && <small className="mt-plan-field-hint">اختيار طفل آخر يبدأ خطة جديدة له.</small>}</label>
          <label>عنوان الخطة <span>*</span><input value={form.title} onChange={event => set('title', event.target.value)} placeholder="مثال: تنمية التوازن والمهارات الحركية" maxLength="255" /></label>
          <label>تاريخ البداية<input type="date" value={form.start_date || ''} onChange={event => set('start_date', event.target.value)} /></label>
          <label>تاريخ النهاية<input type="date" value={form.end_date || ''} min={form.start_date || undefined} onChange={event => set('end_date', event.target.value)} /></label>
          {existingPlanId && <label>حالة الخطة<select value={form.status} onChange={event => set('status', event.target.value)}>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
          {isAdmin && child?.doctor?.name && child.doctor.name !== '—' && <div className="mt-plan-assignee"><UserRound size={17} /><span>الأخصائي المسؤول</span><strong>{child.doctor.name}</strong></div>}
        </div>
        {!loading && patients.length === 0 && <p className="mt-plan-note">لا يوجد أطفال متاحون. سجّل طفلًا أولًا من صفحة «تسجيل طفل».</p>}
      </section>
      <section className="mt-plan-card" aria-labelledby="plan-exercises-title"><div className="mt-plan-card__head"><span className="mt-plan-card__icon mt-plan-card__icon--orange"><CalendarDays size={20} /></span><div><h2 id="plan-exercises-title">تمارين الخطة</h2><p>حدد يوم التنفيذ والتكرارات أو المدة لكل تمرين.</p></div><small>02</small></div>
        {selected.length === 0 ? <EmptyState icon={Plus} title="لم تُضف تمارين بعد" description="اختر تمرينًا من المكتبة لإضافته إلى الخطة." />
          : <div className="mt-plan-selected">{selected.map(({ exercise, planExerciseId, target_days, reps, duration_minutes }) => {
            const itemId = planExerciseId || exercise.id
            return <article key={itemId} className={`mt-plan-exercise ${invalidIds.includes(itemId) ? 'is-invalid' : ''}`}>
              <div className="mt-plan-exercise__top"><span className="mt-plan-exercise__icon">{createElement(exerciseIcon(exercise.icon), { size: 20, strokeWidth: 1.8 })}</span><div><strong>{exercise.title}</strong><small>{exercise.description}</small></div><button type="button" onClick={() => onRemoveExercise(itemId)} aria-label={`إزالة ${exercise.title}`}><Trash2 size={17} /></button></div>
              <div className="mt-plan-exercise__fields"><label>يوم التنفيذ<select value={target_days} onChange={event => onUpdateDay(itemId, event.target.value)}>{dayOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label>التكرارات<input type="number" min="1" value={reps ?? ''} onChange={event => onUpdateReps(itemId, event.target.value ? Number(event.target.value) : null)} placeholder="عدد" /></label>
                <label>المدة بالدقائق<input type="number" min="1" value={duration_minutes ?? ''} onChange={event => onUpdateDuration(itemId, event.target.value ? Number(event.target.value) : null)} placeholder="دقيقة" /></label></div>
              {invalidIds.includes(itemId) && <small className="mt-plan-exercise__error">أدخل عدد التكرارات أو المدة لهذا التمرين.</small>}
            </article>
          })}</div>}
      </section>
    </div><aside className="mt-plan-library" aria-label="مكتبة التمارين"><div className="mt-plan-library__head"><div><h2>مكتبة التمارين</h2><p>اختر التمارين المناسبة للخطة.</p></div><span>{exercises.length}</span></div>
      <div className="mt-plan-library__tools"><label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث عن تمرين" aria-label="البحث في مكتبة التمارين" /></label><select value={difficulty} onChange={event => setDifficulty(event.target.value)} aria-label="مستوى الصعوبة"><option value="all">جميع المستويات</option>{difficultyOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {loading ? <div className="mt-dash-loading">جارٍ تحميل التمارين…</div> : available.length ? <div className="mt-plan-library__list">{available.map(exercise => { const added = selected.some(item => item.exercise.id === exercise.id); return <button key={exercise.id} type="button" disabled={added} onClick={() => onAddExercise(exercise)}><span className="mt-plan-library__icon">{createElement(exerciseIcon(exercise.icon), { size: 19, strokeWidth: 1.8 })}</span><span><strong>{exercise.title}</strong><small>{exercise.difficulty ? difficultyLabel(exercise.difficulty) : 'تمرين علاجي'}</small></span><span className="mt-plan-library__action">{added ? <Check size={18} /> : <Plus size={18} />}</span></button> })}</div>
        : <div className="mt-plan-library__empty"><Clock3 size={23} /><strong>{search || difficulty !== 'all' ? 'لا توجد نتائج مطابقة' : 'المكتبة فارغة'}</strong><small>{search || difficulty !== 'all' ? 'غيّر البحث أو مستوى الصعوبة.' : 'أضف تمارين من صفحة مكتبة التمارين أولًا.'}</small></div>}
    </aside></div>
  </div>
}
