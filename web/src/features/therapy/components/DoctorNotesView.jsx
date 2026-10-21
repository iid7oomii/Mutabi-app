import { useState } from 'react'
import { CircleAlert, MessageSquareText, NotebookPen, Search, Send, Trash2, UserRound, UsersRound } from 'lucide-react'
import { Button, EmptyState, Message } from '../../../design-system/components'

const dateFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric' })
function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'تاريخ غير محدد' : dateFormatter.format(date)
}
const childName = child => [child.first_name, child.second_name].filter(Boolean).join(' ') || 'طفل'

export default function DoctorNotesView({ children = [], selectedId, notes = [], loadingChildren = false, loadingNotes = false,
  childrenError = '', notesError = '', onSelectChild, onAddNote, onDeleteNote }) {
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const selected = children.find(child => child.id === selectedId)
  const filtered = children.filter(child => childName(child).toLocaleLowerCase('ar').includes(search.trim().toLocaleLowerCase('ar')))

  const selectChild = id => {
    setDraft('')
    setFormError('')
    onSelectChild(id)
  }
  const submitNote = async event => {
    event.preventDefault()
    if (!draft.trim()) { setFormError('اكتب الملاحظة أولًا.'); return }
    setSaving(true)
    setFormError('')
    try { await onAddNote(draft.trim()); setDraft('') }
    catch (error) { setFormError(error.message || 'تعذر حفظ الملاحظة. حاول مجددًا.') }
    finally { setSaving(false) }
  }
  const confirmDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try { await onDeleteNote(deleteTarget.id); setDeleteTarget(null) }
    catch (error) { setDeleteError(error.message || 'تعذر حذف الملاحظة. حاول مجددًا.') }
    finally { setDeleting(false) }
  }

  return <div className="mt-dash-content mt-notes">
    <header className="mt-dash-header"><div><span className="mt-dash-eyebrow">التواصل العلاجي</span><h1>ملاحظات الأخصائي</h1><p>اكتب ملاحظات المتابعة لكل طفل وارجع إليها عند الحاجة.</p></div></header>
    {childrenError && <div className="mt-notes-message"><Message tone="error">{childrenError}</Message></div>}
    <div className="mt-notes-layout">
      <section className="mt-notes-children" aria-label="قائمة الأطفال">
        <div className="mt-notes-section-head"><span className="mt-notes-section-icon"><UsersRound size={19} /></span><div><h2>الأطفال</h2><p>اختر طفلًا لعرض ملاحظاته</p></div><small>{children.length}</small></div>
        <label className="mt-patients-search mt-notes-search"><Search size={17} /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث عن طفل" aria-label="البحث عن طفل" /></label>
        {loadingChildren ? <div className="mt-dash-loading" role="status">جارٍ تحميل الأطفال…</div>
          : filtered.length ? <div className="mt-notes-child-list">{filtered.map(child => <button key={child.id} type="button" className={`mt-notes-child ${selectedId === child.id ? 'is-active' : ''}`} onClick={() => selectChild(child.id)} disabled={saving || deleting} aria-current={selectedId === child.id ? 'true' : undefined}><span className="mt-notes-child__avatar"><UserRound size={18} /></span><span><strong>{childName(child)}</strong><small>عرض الملاحظات</small></span></button>)}</div>
            : <div className="mt-notes-list-empty">{search ? 'لا يوجد طفل مطابق للبحث.' : 'لا يوجد أطفال متاحون بعد.'}</div>}
      </section>
      <section className="mt-notes-panel" aria-label="ملاحظات الطفل المحدد">
        {!selected ? <EmptyState icon={UserRound} title={loadingChildren ? 'جارٍ تحميل الأطفال' : 'اختر طفلًا للبدء'} description={loadingChildren ? 'ستظهر القائمة بعد لحظات.' : children.length ? 'اختر طفلًا من القائمة لعرض ملاحظاته.' : 'ستظهر الملاحظات بعد إضافة طفل إلى العيادة.'} />
          : <><div className="mt-notes-panel-head"><span className="mt-notes-child__avatar"><UserRound size={20} /></span><div><h2>{childName(selected)}</h2><p>{loadingNotes ? 'جارٍ تحميل الملاحظات…' : `${notes.length} ملاحظات`}</p></div></div>
            <form className="mt-notes-compose" onSubmit={submitNote}><div className="mt-notes-compose__title"><span className="mt-notes-section-icon"><NotebookPen size={18} /></span><div><h3>ملاحظة جديدة</h3><p>ستظهر الملاحظة للأسرة بعد حفظها.</p></div></div><label htmlFor="doctor-note-content">نص الملاحظة</label><textarea id="doctor-note-content" value={draft} onChange={event => setDraft(event.target.value)} rows="4" placeholder="اكتب ملاحظة واضحة عن متابعة الطفل…" disabled={loadingNotes || Boolean(notesError)} />{formError && <p className="mt-notes-form-error" role="alert">{formError}</p>}<div className="mt-notes-compose__actions"><Button type="submit" loading={saving} disabled={loadingNotes || Boolean(notesError) || !draft.trim()}><Send size={16} /> حفظ الملاحظة</Button></div></form>
            {notesError && <div className="mt-notes-message"><Message tone="error">{notesError}</Message></div>}
            <div className="mt-notes-history"><div className="mt-notes-history__head"><h3>الملاحظات السابقة</h3><span>{notes.length}</span></div>{loadingNotes ? <div className="mt-dash-loading" role="status">جارٍ تحميل الملاحظات…</div> : notesError ? null : notes.length ? <div className="mt-notes-cards">{notes.map(note => <article className="mt-notes-card" key={note.id}><div className="mt-notes-card__head"><span><MessageSquareText size={16} /> ملاحظة علاجية</span><time dateTime={note.created_at}>{formatDate(note.created_at)}</time></div><p>{note.content}</p><button type="button" onClick={() => { setDeleteTarget(note); setDeleteError('') }} aria-label="حذف الملاحظة"><Trash2 size={16} /> حذف</button></article>)}</div> : <EmptyState icon={NotebookPen} title="لا توجد ملاحظات لهذا الطفل بعد" description="أضف أول ملاحظة من النموذج أعلاه." />}</div></>}
      </section>
    </div>
    {deleteTarget && <div className="mt-notes-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null) }}><div className="mt-notes-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-note-title"><span className="mt-notes-dialog__icon"><CircleAlert size={21} /></span><h2 id="delete-note-title">حذف الملاحظة؟</h2><p>سيُحذف نص الملاحظة من سجل الطفل ولن يظهر للأسرة.</p>{deleteError && <p className="mt-notes-form-error" role="alert">{deleteError}</p>}<div><Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>إلغاء</Button><Button type="button" variant="danger" loading={deleting} onClick={confirmDelete}>حذف الملاحظة</Button></div></div></div>}
  </div>
}
