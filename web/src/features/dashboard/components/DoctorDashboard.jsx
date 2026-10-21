import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, CalendarX2, ClipboardPlus, MessageSquareText, TriangleAlert, UsersRound } from 'lucide-react'
import { API_BASE_URL } from '../../../services/api/config'
import useAuthStore from '../../../store/authStore'
import { Button, Card, EmptyState, Message, StatusBadge } from '../../../design-system/components'

const number = value => new Intl.NumberFormat('ar-SA').format(value ?? 0)

const feedbackStatus = {
  completed: { label: 'مكتمل', variant: 'completed' },
  skipped: { label: 'لم يُنفذ', variant: 'later' },
  partial: { label: 'جزئي', variant: 'partial' },
}

export default function DoctorDashboard({ previewData, previewUser }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const open = path => { if (!previewData) navigate(path) }
  const [data, setData] = useState(previewData ?? null)
  const [loading, setLoading] = useState(!previewData)
  const [error, setError] = useState('')

  useEffect(() => {
    if (previewData) return
    fetch(`${API_BASE_URL}/api/v1/dashboard/doctor`, { credentials: 'include' })
      .then(response => {
        if (!response.ok) throw new Error('تعذر تحميل لوحة التحكم')
        return response.json()
      })
      .then(setData)
      .catch(() => setError('تعذر تحميل بيانات لوحة التحكم. حدّث الصفحة للمحاولة مجددًا.'))
      .finally(() => setLoading(false))
  }, [previewData])

  const withoutPlan = data?.patients_without_plan || []
  return <div className="mt-dash-content">
    <header className="mt-dash-header">
      <div><span className="mt-dash-eyebrow">لوحة الأخصائي</span><h1>مرحبًا، {previewUser?.first_name || user?.first_name || 'بك'}</h1>
        <p>ملخص الأطفال والتمارين التي تتابعها.</p></div>
      <div className="mt-dash-actions">
        <Button variant="secondary" type="button" onClick={() => open('/exercises')}><BookOpen size={18} /> مكتبة التمارين</Button>
        <Button type="button" onClick={() => open('/plans')}><ClipboardPlus size={18} /> إنشاء خطة</Button>
      </div>
    </header>

    {loading ? <div className="mt-dash-loading" role="status">جارٍ تحميل بيانات المتابعة…</div>
      : error ? <Message tone="error">{error}</Message>
        : <>
          {withoutPlan.length > 0 && <div className="mt-dash-alert" role="status">
            <TriangleAlert size={20} strokeWidth={1.9} aria-hidden="true" />
            <div><strong>{number(withoutPlan.length)} أطفال بلا خطة علاجية</strong>
              <p>{withoutPlan.map(patient => patient.name).join('، ')}</p></div>
            <button type="button" className="mt-dash-link" onClick={() => open('/patients')}>عرض الأطفال <ArrowLeft size={16} aria-hidden="true" /></button>
          </div>}

          <section className="mt-dash-metrics mt-dash-metrics--doctor" aria-label="إحصاءات المتابعة">
            <Card className="mt-dash-metric"><span className="mt-dash-metric__icon"><UsersRound size={21} strokeWidth={1.9} /></span>
              <span className="mt-dash-metric__label">الأطفال المسندون</span><strong>{number(data?.assigned_patients)}</strong><small>ضمن نطاق متابعتك</small></Card>
            <Card className="mt-dash-metric"><span className="mt-dash-metric__icon mt-dash-metric__icon--orange"><CalendarX2 size={21} strokeWidth={1.9} /></span>
              <span className="mt-dash-metric__label">الجلسات غير المنفذة</span><strong>{number(data?.skipped_sessions)}</strong><small>تحتاج إلى متابعة</small></Card>
          </section>

          <section className="mt-dash-section" aria-labelledby="feedback-title">
            <div className="mt-dash-section__head"><div><h2 id="feedback-title">آخر ملاحظات التمارين</h2>
              <p>ما وصل من الأسرة عن تنفيذ التمارين.</p></div>
              <button type="button" className="mt-dash-link" onClick={() => open('/feedback')}>عرض الجميع <ArrowLeft size={16} aria-hidden="true" /></button>
            </div>
            {data?.recent_feedback?.length ? <div className="mt-dash-feedback-list">
              {data.recent_feedback.map(item => {
                const status = feedbackStatus[item.status] || { label: 'قيد المتابعة', variant: 'next' }
                return <article key={item.id} className="mt-dash-feedback">
                  <span className="mt-dash-avatar"><MessageSquareText size={18} strokeWidth={1.9} /></span>
                  <div className="mt-dash-feedback__body"><div><strong>{item.child}</strong><small>{item.date}</small></div>
                    <p>{item.exercise}</p>{item.notes && <blockquote>{item.notes}</blockquote>}</div>
                  <StatusBadge status={status.variant}>{status.label}</StatusBadge>
                </article>
              })}
            </div> : <EmptyState icon={MessageSquareText} title="لا توجد ملاحظات حديثة"
              description="ستظهر هنا ملاحظات الأسرة بعد تسجيل تنفيذ التمارين." />}
          </section>
        </>}
  </div>
}
