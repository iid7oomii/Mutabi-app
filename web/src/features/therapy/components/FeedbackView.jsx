import { useEffect, useState } from 'react'
import { ArrowUpLeft, CalendarDays, CircleCheck, CircleDashed, CircleX, ExternalLink, MessageSquareText, Search, Send, UserRound } from 'lucide-react'
import { Button, EmptyState, Message } from '../../../design-system/components'

const statusInfo = {
  completed: { label: 'مكتمل', Icon: CircleCheck },
  partially_completed: { label: 'منفذ جزئيًا', Icon: CircleDashed },
  skipped: { label: 'لم يُنفذ', Icon: CircleX },
}
const relationships = { mother: 'الأم', father: 'الأب', guardian: 'ولي الأمر', therapist: 'المعالج', doctor: 'الطبيب', other: 'أحد أفراد الأسرة' }
const dateFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric' })
function formatDate(value) {
  if (!value) return 'تاريخ غير محدد'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'تاريخ غير محدد' : dateFormatter.format(date)
}
function mediaKind(url) {
  if (/\.(mp4|mov|webm)(\?|$)/i.test(url)) return 'video'
  if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)) return 'image'
  return 'file'
}

function FeedbackCard({ feedback, highlightId, onOpenPatient, onReply }) {
  const [editing, setEditing] = useState(false)
  const [reply, setReply] = useState(feedback.doctor_reply || '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const status = statusInfo[feedback.completion_status]
  const StatusIcon = status?.Icon || CircleDashed
  const media = feedback.parent_media_url ? mediaKind(feedback.parent_media_url) : null
  const relation = relationships[feedback.parent_relationship] || 'ولي الأمر'
  const saveReply = async event => {
    event.preventDefault()
    if (!reply.trim()) return setError('اكتب الرد أولًا.')
    setSending(true); setError('')
    try { await onReply(feedback.id, reply.trim()); setEditing(false) }
    catch (cause) { setError(cause.message || 'تعذر حفظ الرد. حاول مجددًا.') }
    finally { setSending(false) }
  }

  return <article id={`feedback-${feedback.id}`} className={`mt-feedback-card ${String(feedback.id) === String(highlightId) ? 'is-highlighted' : ''}`}>
    <div className="mt-feedback-card__head"><span className="mt-feedback-avatar"><UserRound size={19} /></span><div><strong>{feedback.parent_name || 'ولي الأمر'}</strong><small>{relation} · {feedback.child_name || 'طفل'}</small></div><time dateTime={feedback.feedback_date}>{formatDate(feedback.feedback_date)}</time></div>
    <div className="mt-feedback-card__session"><div><small>تقرير التمرين</small><strong>{feedback.exercise_title || 'تمرين علاجي'}</strong></div><span className={`mt-feedback-status mt-feedback-status--${feedback.completion_status || 'unknown'}`}><StatusIcon size={15} />{status?.label || 'غير محدد'}</span></div>
    {feedback.pain_level != null && <div className="mt-feedback-card__pain">مستوى الألم المسجل: <strong>{feedback.pain_level} من 10</strong></div>}
    {feedback.parent_notes && <div className="mt-feedback-card__note"><small>ملاحظة الأسرة</small><p>{feedback.parent_notes}</p></div>}
    {feedback.parent_media_url && <div className="mt-feedback-card__media">{media === 'image' ? <img src={feedback.parent_media_url} alt={`مرفق تقرير ${feedback.child_name || 'الطفل'}`} loading="lazy" />
      : media === 'video' ? <video src={feedback.parent_media_url} controls preload="metadata" />
        : <a href={feedback.parent_media_url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> فتح المرفق</a>}</div>}
    {feedback.doctor_reply && !editing && <div className="mt-feedback-card__reply"><small>رد الأخصائي</small><p>{feedback.doctor_reply}</p></div>}
    {editing && <form className="mt-feedback-card__reply-form" onSubmit={saveReply}><label htmlFor={`reply-${feedback.id}`}>الرد على ملاحظة الأسرة</label><textarea id={`reply-${feedback.id}`} value={reply} onChange={event => setReply(event.target.value)} rows="3" maxLength="1000" placeholder="اكتب ردًا واضحًا للأسرة..." />{error && <p role="alert">{error}</p>}<div><Button type="button" variant="secondary" onClick={() => { setEditing(false); setReply(feedback.doctor_reply || ''); setError('') }} disabled={sending}>إلغاء</Button><Button type="submit" loading={sending}><Send size={15} /> حفظ الرد</Button></div></form>}
    <div className="mt-feedback-card__actions"><button type="button" onClick={() => { setEditing(true); setReply(feedback.doctor_reply || ''); setError('') }}>{feedback.doctor_reply ? 'تعديل الرد' : 'إضافة رد'}</button><button type="button" onClick={() => onOpenPatient(feedback.child_id)}>ملف الطفل <ArrowUpLeft size={15} /></button></div>
  </article>
}

export default function FeedbackView({ feedbacks = [], loading = false, loadError = '', highlightId, onReply, onOpenPatient, isAdmin = false }) {
  const [dateFilter, setDateFilter] = useState(0)
  const [search, setSearch] = useState('')
  const [referenceTime] = useState(() => Date.now())
  useEffect(() => {
    if (!highlightId || feedbacks.length === 0) return
    const timeout = window.setTimeout(() => document.getElementById(`feedback-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
    return () => window.clearTimeout(timeout)
  }, [highlightId, feedbacks.length])
  const cutoff = dateFilter ? new Date(referenceTime - dateFilter * 24 * 60 * 60 * 1000) : null
  const filtered = feedbacks.filter(feedback => {
    const text = `${feedback.child_name || ''} ${feedback.parent_name || ''} ${feedback.exercise_title || ''}`.toLocaleLowerCase('ar')
    return text.includes(search.trim().toLocaleLowerCase('ar')) && (!cutoff || new Date(feedback.feedback_date) >= cutoff)
  }).sort((a, b) => new Date(b.feedback_date) - new Date(a.feedback_date))
  const unanswered = feedbacks.filter(feedback => !feedback.doctor_reply).length
  const skipped = feedbacks.filter(feedback => feedback.completion_status === 'skipped').length

  return <div className="mt-dash-content mt-feedback">
    <header className="mt-dash-header"><div><span className="mt-dash-eyebrow">التواصل مع الأسرة</span><h1>ملاحظات الأسرة</h1><p>{isAdmin ? 'تقارير التمارين والملاحظات الواردة من أسر أطفال العيادة.' : 'تقارير التمارين والملاحظات الواردة من أسر الأطفال المسندين إليك.'}</p></div></header>
    {loadError && <div className="mt-feedback-message"><Message tone="error">{loadError}</Message></div>}
    <div className="mt-feedback-summary" aria-label="ملخص ملاحظات الأسرة"><div><span><MessageSquareText size={19} /></span><small>التقارير المحمّلة</small><strong>{feedbacks.length}</strong></div><div><span><Send size={19} /></span><small>بانتظار رد</small><strong>{unanswered}</strong></div><div><span className="mt-feedback-summary__orange"><CircleX size={19} /></span><small>تمارين لم تُنفذ</small><strong>{skipped}</strong></div></div>
    <section className="mt-feedback-panel" aria-label="قائمة ملاحظات الأسرة"><div className="mt-feedback-panel__head"><div><h2>تقارير الأسرة</h2><p>راجع تنفيذ التمارين وردّ على الملاحظات.</p></div><span>{filtered.length} تقرير</span></div>
      <div className="mt-feedback-tools"><label className="mt-patients-search"><Search size={18} /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث باسم الطفل أو ولي الأمر أو التمرين" aria-label="البحث في التقارير" /></label>
        <label className="mt-feedback-date-filter"><CalendarDays size={17} /><select value={dateFilter} onChange={event => setDateFilter(Number(event.target.value))} aria-label="تصفية التقارير حسب الفترة"><option value="0">جميع الفترات</option><option value="7">آخر 7 أيام</option><option value="30">آخر 30 يومًا</option><option value="90">آخر 3 أشهر</option><option value="365">آخر 12 شهرًا</option></select></label></div>
      {loading ? <div className="mt-dash-loading" role="status">جارٍ تحميل تقارير الأسرة…</div>
        : filtered.length ? <div className="mt-feedback-grid">{filtered.map(feedback => <FeedbackCard key={feedback.id} feedback={feedback} highlightId={highlightId} onReply={onReply} onOpenPatient={onOpenPatient} />)}</div>
          : <EmptyState icon={MessageSquareText} title={search || dateFilter ? 'لا توجد تقارير مطابقة' : 'لا توجد ملاحظات من الأسرة بعد'} description={search || dateFilter ? 'غيّر البحث أو الفترة الزمنية.' : 'ستظهر تقارير تنفيذ التمارين هنا عند إرسالها من الأسرة.'} />}
    </section>
  </div>
}
