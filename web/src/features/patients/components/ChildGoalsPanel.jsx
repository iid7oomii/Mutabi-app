import { useCallback, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../services/api/config'
import './ChildGoalsPanel.css'

const frequencies = [
  ['none', 'بدون تذكير'], ['weekly', 'مرة أسبوعيًا'],
  ['twice_weekly', 'مرتين أسبوعيًا'], ['daily', 'يوميًا'],
]
const localToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
const initialForm = { title: '', success_criteria: '', notes: '', start_date: localToday(), end_date: '', reminder_frequency: 'none' }
const statusLabel = { active: 'قيد المتابعة', awaiting_review: 'بانتظار مراجعة الأخصائي', completed: 'مكتمل', closed: 'مغلق' }
function remainingLabel(goal) {
  if (goal.status !== 'active') return statusLabel[goal.status] || goal.status
  const days = goal.remaining_days
  if (days === 0) return 'آخر يوم'
  const weeks = Math.floor(days / 7)
  const rest = days % 7
  return [weeks && `${weeks} أسبوع`, rest && `${rest} يوم`].filter(Boolean).join(' و ')
}
async function goalRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/v1/goals${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'تعذر تنفيذ الطلب. حاول مجددًا.')
  return body
}

export default function ChildGoalsPanel({ childId }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const load = useCallback(async () => {
    setLoading(true)
    try { setGoals(await goalRequest(`/child/${childId}`)); setError('') }
    catch (cause) { setError(cause.message) }
    finally { setLoading(false) }
  }, [childId])
  useEffect(() => {
    let active = true
    goalRequest(`/child/${childId}`).then(data => { if (active) { setGoals(data); setError('') } })
      .catch(cause => { if (active) setError(cause.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [childId])
  const reset = () => { setEditingId(null); setForm({ ...initialForm }) }
  const edit = goal => {
    setEditingId(goal.id)
    setForm({ title: goal.title, success_criteria: goal.success_criteria, notes: goal.notes || '', start_date: goal.start_date, end_date: goal.end_date, reminder_frequency: goal.reminder_frequency })
  }
  const save = async event => {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      const payload = { ...form, notes: form.notes || null, ...(!editingId ? { child_id: childId } : {}) }
      await goalRequest(editingId ? `/${editingId}` : '/', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      reset(); await load()
    } catch (cause) { setError(cause.message) }
    finally { setBusy(false) }
  }
  const changeStatus = async (goal, action) => {
    if (!window.confirm(action === 'complete' ? `تأكيد تحقق هدف «${goal.title}»؟` : `إغلاق هدف «${goal.title}» دون تحقيقه؟`)) return
    setBusy(true); setError('')
    try { await goalRequest(`/${goal.id}/${action}`, { method: 'POST', body: '{}' }); await load() }
    catch (cause) { setError(cause.message) }
    finally { setBusy(false) }
  }
  return <section className="mt-profile-card mt-child-goals" aria-labelledby="child-goals-title">
    <div className="mt-child-goals__heading"><div><h2 id="child-goals-title">أهداف الطفل</h2><p>كل هدف عنصر في قائمة المتابعة، ويؤكد الأخصائي تحققه.</p></div></div>
    {error && <p role="alert" className="mt-child-goals__error">{error}</p>}
    {loading ? <p>جارٍ تحميل الأهداف…</p> : goals.length ? <ul className="mt-child-goals__list">{goals.map(goal => <li key={goal.id}>
      <div className="mt-child-goals__item"><span className="mt-child-goals__check" aria-label={statusLabel[goal.status]}>{goal.status === 'completed' ? '✓' : ''}</span><div className="mt-child-goals__details"><strong>{goal.title}</strong><p>{goal.success_criteria}</p><small>{remainingLabel(goal)} · حتى {goal.end_date}</small></div></div>
      <div className="mt-child-goals__actions"><button type="button" disabled={busy} onClick={() => edit(goal)}>تعديل</button>{!['completed', 'closed'].includes(goal.status) && <><button type="button" disabled={busy} onClick={() => changeStatus(goal, 'complete')}>تم تحقيقه</button><button type="button" disabled={busy} onClick={() => changeStatus(goal, 'close')}>إغلاق</button></>}</div>
    </li>)}</ul> : <p>لا توجد أهداف لهذا الطفل بعد.</p>}
    <form className="mt-child-goals__form" onSubmit={save}>
      <h3>{editingId ? 'تعديل الهدف' : 'إضافة هدف'}</h3>
      <label>عنوان الهدف<input required maxLength={160} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
      <label>معيار النجاح<textarea required maxLength={300} value={form.success_criteria} onChange={event => setForm({ ...form, success_criteria: event.target.value })} /></label>
      <label>ملاحظات اختيارية<textarea maxLength={2000} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></label>
      <div className="mt-child-goals__dates"><label>تاريخ البداية<input type="date" required value={form.start_date || ''} onChange={event => setForm({ ...form, start_date: event.target.value })} /></label><label>تاريخ النهاية<input type="date" required min={form.start_date} value={form.end_date || ''} onChange={event => setForm({ ...form, end_date: event.target.value })} /></label></div>
      <label>تكرار التذكير<select value={form.reminder_frequency} onChange={event => setForm({ ...form, reminder_frequency: event.target.value })}>{frequencies.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="mt-child-goals__actions"><button type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : editingId ? 'حفظ التعديل' : 'إضافة الهدف'}</button>{editingId && <button type="button" onClick={reset} disabled={busy}>إلغاء</button>}</div>
    </form>
  </section>
}
