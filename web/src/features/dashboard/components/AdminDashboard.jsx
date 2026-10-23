import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, UserPlus, UsersRound } from 'lucide-react'
import { API_BASE_URL } from '../../../services/api/config'
import useAuthStore from '../../../store/authStore'
import { Button, Card, EmptyState, Message } from '../../../design-system/components'

const number = value => new Intl.NumberFormat('ar-SA').format(value ?? 0)

function Metric({ icon: Icon, label, value, detail, tone = 'blue' }) {
  return <Card className="mt-dash-metric">
    <span className={`mt-dash-metric__icon mt-dash-metric__icon--${tone}`}><Icon size={21} strokeWidth={1.9} aria-hidden="true" /></span>
    <span className="mt-dash-metric__label">{label}</span>
    <strong>{number(value)}</strong>
    <small>{detail}</small>
  </Card>
}

export default function AdminDashboard({ previewData, previewUser }) {
  const { user, subscription } = useAuthStore()
  const navigate = useNavigate()
  const isSpecialist = !previewData && subscription?.plan_type === 'specialist'
  const open = path => { if (!previewData) navigate(path) }
  const [data, setData] = useState(previewData ?? null)
  const [loading, setLoading] = useState(!previewData)
  const [error, setError] = useState('')

  useEffect(() => {
    if (previewData) return
    fetch(`${API_BASE_URL}/api/v1/dashboard/admin`, { credentials: 'include' })
      .then(response => {
        if (!response.ok) throw new Error('تعذر تحميل لوحة التحكم')
        return response.json()
      })
      .then(setData)
      .catch(() => setError('تعذر تحميل بيانات لوحة التحكم. حدّث الصفحة للمحاولة مجددًا.'))
      .finally(() => setLoading(false))
  }, [previewData])

  return <div className="mt-dash-content">
    <header className="mt-dash-header">
      <div><span className="mt-dash-eyebrow">لوحة التحكم</span><h1>مرحبًا، {previewUser?.first_name || user?.first_name || 'بك'}</h1>
        <p>نظرة واضحة على نشاط العيادة والمتابعة العلاجية.</p></div>
      <div className="mt-dash-actions">
        {!isSpecialist && <Button variant="secondary" type="button" onClick={() => open('/doctors')}><UserPlus size={18} /> إضافة أخصائي</Button>}
        <Button type="button" onClick={() => open('/registration')}><UserPlus size={18} /> تسجيل طفل</Button>
      </div>
    </header>

    {loading ? <div className="mt-dash-loading" role="status">جارٍ تحميل بيانات العيادة…</div>
      : error ? <Message tone="error">{error}</Message>
        : <>
          <section className="mt-dash-metrics" aria-label="إحصاءات العيادة">
            {!isSpecialist && <Metric icon={UsersRound} label="الأخصائيون" value={data?.total_doctors} detail="ضمن فريق العيادة" />}
            <Metric icon={ClipboardList} label="الأطفال قيد المتابعة" value={data?.active_patients} detail="لديهم خطط علاجية نشطة" tone="orange" />
            <Metric icon={UserPlus} label="التسجيلات الجديدة" value={data?.new_registrations} detail="خلال آخر ٧ أيام" />
          </section>

          {!isSpecialist && <section className="mt-dash-section" aria-labelledby="recent-doctors-title">
            <div className="mt-dash-section__head"><div><h2 id="recent-doctors-title">الأخصائيون المضافون حديثًا</h2>
              <p>آخر الأعضاء الذين انضموا إلى العيادة.</p></div>
              <button className="mt-dash-link" type="button" onClick={() => open('/doctors')}>عرض الجميع <ArrowLeft size={16} aria-hidden="true" /></button>
            </div>
            {data?.recent_onboarding?.length ? <div className="mt-dash-table-wrap"><table className="mt-dash-table">
              <thead><tr><th>الأخصائي</th><th>التخصص</th><th>الحالة</th><th><span className="sr-only">الإجراء</span></th></tr></thead>
              <tbody>{data.recent_onboarding.map(doctor => <tr key={doctor.id}>
                <td><span className="mt-dash-person"><span className="mt-dash-avatar">{doctor.initials || doctor.name?.[0] || 'أ'}</span><strong>{doctor.name}</strong></span></td>
                <td>{doctor.specialty || 'غير محدد'}</td>
                <td><span className={`mt-dash-state ${doctor.is_active ? 'mt-dash-state--active' : ''}`}>{doctor.is_active ? 'نشط' : 'بانتظار التفعيل'}</span></td>
                <td><button type="button" className="mt-dash-link" onClick={() => open(`/doctors/${doctor.id}`)}>عرض الملف <ArrowLeft size={15} aria-hidden="true" /></button></td>
              </tr>)}</tbody>
            </table></div> : <EmptyState icon={UsersRound} title="لا يوجد أخصائيون مضافون بعد"
              description="سيظهر أعضاء الفريق هنا بعد إضافتهم."
              action={<Button type="button" onClick={() => open('/doctors')}>إضافة أخصائي</Button>} />}
          </section>}
        </>}
  </div>
}
