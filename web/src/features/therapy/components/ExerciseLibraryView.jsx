import { createElement, useState } from 'react'
import { BookOpen, FilePlus2, ImagePlus, ListOrdered, Plus, Search, Trash2, X } from 'lucide-react'
import { Button, EmptyState, Message } from '../../../design-system/components'
import { difficultyLabel, difficultyOptions, emptyExerciseForm, exerciseIcon, goalLabel, goalOptions, iconOptions, mediaKind } from './exerciseOptions'

function ExerciseArtwork({ exercise }) {
  const kind = mediaKind(exercise.doctor_media_url)
  return <div className="mt-exlib-art">
    {kind === 'image' ? <img src={exercise.doctor_media_url} alt="" />
      : kind === 'video' ? <video src={exercise.doctor_media_url} preload="metadata" muted />
        : <span>{createElement(exerciseIcon(exercise.icon), { size: 34, strokeWidth: 1.65 })}</span>}
    {kind && <small>{kind === 'video' ? 'فيديو' : 'صورة'}</small>}
  </div>
}

function ExerciseForm({ form, setForm, error, saving, uploading, onUpload, onClose, onSubmit }) {
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const updateStep = (index, value) => setForm(current => ({ ...current, steps: current.steps.map((step, i) => i === index ? value : step) }))
  const removeStep = index => setForm(current => ({ ...current, steps: current.steps.filter((_, i) => i !== index) }))
  return <div className="mt-exlib-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="mt-exlib-dialog" role="dialog" aria-modal="true" aria-labelledby="exlib-dialog-title">
      <div className="mt-exlib-dialog__head"><div><span className="mt-dash-eyebrow">مكتبة التمارين</span><h2 id="exlib-dialog-title">إضافة تمرين</h2><p>أنشئ تمرينًا يمكن استخدامه في الخطط العلاجية.</p></div>
        <button type="button" onClick={onClose} aria-label="إغلاق"><X size={19} /></button></div>
      <form onSubmit={onSubmit} className="mt-exlib-form">
        {error && <Message tone="error">{error}</Message>}
        <label>اسم التمرين <span>*</span><input value={form.title} onChange={event => set('title', event.target.value)} placeholder="مثال: تمرين توازن الوقوف" maxLength="255" required /></label>
        <div className="mt-exlib-form__split"><label>نوع التمرين
          <select value={form.goal} onChange={event => set('goal', event.target.value)}><option value="">غير محدد</option>{goalOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label><label>مستوى الصعوبة
          <select value={form.difficulty} onChange={event => set('difficulty', event.target.value)}><option value="">غير محدد</option>{difficultyOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label></div>
        <fieldset className="mt-exlib-icons"><legend>الأيقونة</legend><div>{iconOptions.map(({ value, label, Icon }) => <button key={value} type="button" className={form.icon === value ? 'is-active' : ''} aria-label={label} aria-pressed={form.icon === value} title={label} onClick={() => set('icon', form.icon === value ? '' : value)}><Icon size={20} strokeWidth={1.8} /></button>)}</div></fieldset>
        <fieldset className="mt-exlib-content-type"><legend>طريقة عرض التعليمات</legend><div>
          <button type="button" className={!form.useSteps ? 'is-active' : ''} onClick={() => set('useSteps', false)}>وصف مختصر</button>
          <button type="button" className={form.useSteps ? 'is-active' : ''} onClick={() => set('useSteps', true)}>خطوات مرقمة</button>
        </div></fieldset>
        {form.useSteps ? <div className="mt-exlib-steps"><strong>خطوات التمرين <span>*</span></strong>{form.steps.map((step, index) => <div key={index}><span>{index + 1}</span><input value={step} onChange={event => updateStep(index, event.target.value)} placeholder={`الخطوة ${index + 1}`} />{form.steps.length > 1 && <button type="button" onClick={() => removeStep(index)} aria-label={`حذف الخطوة ${index + 1}`}><X size={17} /></button>}</div>)}
          <button type="button" onClick={() => set('steps', [...form.steps, ''])}><Plus size={16} /> إضافة خطوة</button></div>
          : <label>وصف التمرين <span>*</span><textarea value={form.description} onChange={event => set('description', event.target.value)} rows="4" placeholder="اشرح طريقة أداء التمرين بوضوح لولي الأمر..." required /></label>}
        <div className="mt-exlib-upload"><strong>صورة أو فيديو <small>اختياري</small></strong>
          {form.doctor_media_url ? <div className="mt-exlib-upload__preview">{mediaKind(form.doctor_media_url) === 'video' ? <video src={form.doctor_media_url} controls /> : <img src={form.doctor_media_url} alt="معاينة الوسائط" />}
            <button type="button" onClick={() => set('doctor_media_url', '')} aria-label="إزالة الوسائط"><X size={16} /></button></div>
            : <label className="mt-exlib-upload__zone"><ImagePlus size={21} /><span>{uploading ? 'جارٍ رفع الملف…' : 'اختر صورة أو فيديو للتمرين'}</span><input type="file" accept="image/*,video/*" onChange={onUpload} disabled={uploading} /></label>}
        </div>
        <div className="mt-exlib-dialog__actions"><Button type="button" variant="secondary" onClick={onClose} disabled={saving}>إلغاء</Button><Button type="submit" loading={saving} disabled={uploading}>حفظ التمرين</Button></div>
      </form>
    </div>
  </div>
}

export default function ExerciseLibraryView({ exercises = [], loading = false, loadError = '', onCreate, onDelete, onUpload }) {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [form, setForm] = useState({ ...emptyExerciseForm, steps: [''] })
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const filtered = exercises.filter(exercise => {
    const text = `${exercise.title || ''} ${exercise.description || ''}`.toLocaleLowerCase('ar')
    return text.includes(search.trim().toLocaleLowerCase('ar')) && (difficulty === 'all' || exercise.difficulty === difficulty)
  })
  const openForm = () => { setForm({ ...emptyExerciseForm, steps: [''] }); setError(''); setShowForm(true) }
  const closeForm = () => { if (!saving && !uploading) { setShowForm(false); setError('') } }
  const submit = async event => {
    event.preventDefault()
    setError('')
    if (!form.title.trim()) return setError('أدخل اسم التمرين.')
    if (!form.useSteps && !form.description.trim()) return setError('أدخل وصف التمرين.')
    const steps = form.steps.map(step => step.trim()).filter(Boolean)
    if (form.useSteps && steps.length === 0) return setError('أضف خطوة واحدة على الأقل.')
    setSaving(true)
    try {
      await onCreate({ title: form.title.trim(), description: form.useSteps ? steps.map((step, i) => `${i + 1}. ${step}`).join('\n') : form.description.trim(),
        doctor_media_url: form.doctor_media_url || null, icon: form.icon || null, difficulty: form.difficulty || null,
        goal: form.goal || null, steps_json: form.useSteps ? JSON.stringify(steps) : null })
      setShowForm(false)
    } catch (cause) { setError(cause.message || 'تعذر حفظ التمرين.') }
    finally { setSaving(false) }
  }
  const upload = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try { const url = await onUpload(file); setForm(current => ({ ...current, doctor_media_url: url })) }
    catch (cause) { setError(cause.message || 'تعذر رفع الملف.') }
    finally { setUploading(false); event.target.value = '' }
  }
  const remove = async () => {
    setSaving(true); setError('')
    try { await onDelete(deleteTarget.id); setDeleteTarget(null) }
    catch (cause) { setError(cause.message || 'تعذر حذف التمرين.') }
    finally { setSaving(false) }
  }

  return <div className="mt-dash-content mt-exlib">
    <header className="mt-dash-header"><div><span className="mt-dash-eyebrow">المحتوى العلاجي</span><h1>مكتبة التمارين</h1><p>تمارين قابلة للاستخدام في الخطط العلاجية للأطفال.</p></div>
      <Button type="button" onClick={openForm}><Plus size={18} /> إضافة تمرين</Button></header>
    <div className="mt-exlib-overview"><span><BookOpen size={18} /> جميع التمارين</span><strong>{exercises.length}</strong><small>تمرين في مكتبة العيادة</small></div>
    {(loadError || (!showForm && error)) && <div className="mt-exlib-message"><Message tone="error">{loadError || error}</Message></div>}
    <div className="mt-exlib-tools"><label className="mt-patients-search"><Search size={18} aria-hidden="true" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث باسم التمرين أو وصفه" aria-label="البحث في التمارين" /></label>
      <div className="mt-exlib-filters" aria-label="تصفية حسب مستوى الصعوبة"><button type="button" className={difficulty === 'all' ? 'is-active' : ''} onClick={() => setDifficulty('all')}>الكل</button>{difficultyOptions.map(([value, label]) => <button key={value} type="button" className={difficulty === value ? 'is-active' : ''} onClick={() => setDifficulty(value)}>{label}</button>)}</div></div>
    {loading ? <div className="mt-dash-loading">جارٍ تحميل التمارين…</div>
      : filtered.length === 0 ? <EmptyState icon={search || difficulty !== 'all' ? Search : BookOpen} title={search || difficulty !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد تمارين بعد'} description={search || difficulty !== 'all' ? 'جرّب تغيير البحث أو مستوى الصعوبة.' : 'أضف أول تمرين لتبدأ بناء مكتبة العيادة.'} action={!search && difficulty === 'all' ? <Button type="button" onClick={openForm}><FilePlus2 size={17} /> إضافة تمرين</Button> : null} />
        : <div className="mt-exlib-grid">{filtered.map(exercise => <article className="mt-exlib-card" key={exercise.id}><ExerciseArtwork exercise={exercise} /><div className="mt-exlib-card__body"><div className="mt-exlib-card__title"><h2>{exercise.title}</h2>{exercise.difficulty && <span className={`mt-exlib-difficulty mt-exlib-difficulty--${exercise.difficulty}`}>{difficultyLabel(exercise.difficulty)}</span>}</div>
          {exercise.goal && <small className="mt-exlib-goal">{goalLabel(exercise.goal)}</small>}<p>{exercise.description}</p><div className="mt-exlib-card__foot"><span><ListOrdered size={15} />{exercise.steps_json ? 'تعليمات بخطوات' : 'وصف مباشر'}</span><button type="button" onClick={() => { setDeleteTarget(exercise); setError('') }}><Trash2 size={15} /> حذف</button></div></div></article>)}</div>}
    {showForm && <ExerciseForm form={form} setForm={setForm} error={error} saving={saving} uploading={uploading} onUpload={upload} onClose={closeForm} onSubmit={submit} />}
    {deleteTarget && <div className="mt-exlib-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setDeleteTarget(null) }}><div className="mt-exlib-confirm" role="dialog" aria-modal="true" aria-labelledby="exlib-confirm-title"><span className="mt-exlib-confirm__icon"><Trash2 size={21} /></span><h2 id="exlib-confirm-title">حذف التمرين؟</h2><p>سيُحذف «{deleteTarget.title}» من المكتبة. قد يتعذر الحذف إذا كان ضمن خطة علاجية نشطة.</p>{error && <Message tone="error">{error}</Message>}<div><Button type="button" variant="secondary" onClick={() => { setDeleteTarget(null); setError('') }} disabled={saving}>إلغاء</Button><Button type="button" className="mt-button--danger" onClick={remove} loading={saving}>حذف التمرين</Button></div></div></div>}
  </div>
}
