import { ArrowLeft, ClipboardList, Search, UserPlus, UsersRound } from 'lucide-react'
import { Button, Card, EmptyState, Message } from '../../../design-system/components'

const filters = [
  ['all', 'الكل'],
  ['active', 'خطة نشطة'],
  ['inactive', 'خطة غير نشطة'],
  ['no_plan', 'بلا خطة'],
  ['no_doctor', 'بلا أخصائي'],
]
const requestStatus = { pending: 'بانتظار المراجعة', approved: 'مقبول', rejected: 'مرفوض' }
const planStatus = { active: 'نشطة', completed: 'مكتملة', cancelled: 'ملغاة' }
const number = value => new Intl.NumberFormat('ar-SA').format(value)

function ageFromDate(value) {
  if (!value) return null
  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1
  return age >= 0 ? age : null
}

export default function PatientsView({
  isAdmin, patients = [], requests = [], loading = false, requestsLoading = false, error = '',
  activeTab = 'patients', onTabChange, search, onSearchChange, statusFilter = 'all', onStatusFilterChange,
  onRegister, onOpenPatient, onDeletePatient, onAssignDoctor, onApproveRequest, onRejectRequest,
}) {
  const filtered = patients.filter(patient => {
    const name = `${patient.first_name || ''} ${patient.second_name || ''}`.trim().toLocaleLowerCase()
    const parent = (patient.parent?.name || '').toLocaleLowerCase()
    const term = (search || '').trim().toLocaleLowerCase()
    const matchesText = !term || name.includes(term) || parent.includes(term)
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && patient.plan?.status === 'active') ||
      (statusFilter === 'inactive' && patient.plan?.status && patient.plan.status !== 'active') ||
      (statusFilter === 'no_plan' && !patient.plan?.status) ||
      (statusFilter === 'no_doctor' && (!patient.doctor?.name || patient.doctor.name === '—'))
    return matchesText && matchesStatus
  })
  const activePlans = patients.filter(patient => patient.plan?.status === 'active').length
  const withoutPlan = patients.filter(patient => !patient.plan?.status).length
  const pendingRequests = requests.filter(request => request.status === 'pending').length

  return <div className="mt-dash-content mt-patients-preview">
    <header className="mt-dash-header"><div><span className="mt-dash-eyebrow">إدارة المتابعة</span><h1>الأطفال</h1>
      <p>{isAdmin ? 'عرض الأطفال المسجلين والخطط المسندة إلى فريق العيادة.' : 'الأطفال المسندون إليك وخططهم العلاجية.'}</p></div>
      <Button type="button" onClick={onRegister}><UserPlus size={18} aria-hidden="true" /> تسجيل طفل</Button>
    </header>

    {error && <Message tone="error">{error}</Message>}
    <div className="mt-patients-summary" aria-label="ملخص الأطفال">
      <Card><span className="mt-patients-summary__icon"><UsersRound size={20} aria-hidden="true" /></span><small>الأطفال المسجلون</small><strong>{number(patients.length)}</strong></Card>
      <Card><span className="mt-patients-summary__icon"><ClipboardList size={20} aria-hidden="true" /></span><small>لديهم خطة نشطة</small><strong>{number(activePlans)}</strong></Card>
      <Card><span className="mt-patients-summary__icon mt-patients-summary__icon--orange"><UserPlus size={20} aria-hidden="true" /></span><small>بانتظار خطة</small><strong>{number(withoutPlan)}</strong></Card>
    </div>

    {isAdmin && <div className="mt-patients-tabs" role="tablist" aria-label="عرض الأطفال والطلبات">
      <button type="button" role="tab" aria-selected={activeTab === 'patients'} className={activeTab === 'patients' ? 'is-active' : ''} onClick={() => onTabChange('patients')}>قائمة الأطفال</button>
      <button type="button" role="tab" aria-selected={activeTab === 'requests'} className={activeTab === 'requests' ? 'is-active' : ''} onClick={() => onTabChange('requests')}>طلبات التسجيل {pendingRequests > 0 && <span>{number(pendingRequests)}</span>}</button>
    </div>}

    {activeTab === 'patients' || !isAdmin ? <section className="mt-patients-panel" aria-label="قائمة الأطفال">
      <div className="mt-patients-panel__head"><div><h2>قائمة الأطفال</h2><p>ابحث بالاسم أو صفِّ حسب حالة الخطة.</p></div><span>{number(filtered.length)} نتائج</span></div>
      <div className="mt-patients-filters"><label className="mt-patients-search"><Search size={18} aria-hidden="true" /><span className="sr-only">البحث عن طفل</span><input value={search} onChange={event => onSearchChange(event.target.value)} placeholder="ابحث باسم الطفل أو ولي الأمر" /></label>
        <div className="mt-patients-filter-buttons" aria-label="تصفية حسب حالة الخطة">{filters.filter(([value]) => isAdmin || value !== 'no_doctor').map(([value, label]) => <button key={value} type="button" className={statusFilter === value ? 'is-active' : ''} onClick={() => onStatusFilterChange(value)}>{label}</button>)}</div>
      </div>
      {loading ? <div className="mt-dash-loading" role="status">جارٍ تحميل الأطفال…</div>
        : filtered.length ? <div className="mt-patients-table-wrap"><table className="mt-dash-table mt-patients-table"><thead><tr><th>الطفل</th><th>ولي الأمر</th><th>الخطة العلاجية</th>{isAdmin && <th>الأخصائي</th>}<th><span className="sr-only">الإجراء</span></th></tr></thead><tbody>{filtered.map(patient => {
          const name = `${patient.first_name || ''} ${patient.second_name || ''}`.trim()
          const age = ageFromDate(patient.date_of_birth)
          const assigned = patient.doctor?.name && patient.doctor.name !== '—'
          return <tr key={patient.id}>
            <td><span className="mt-dash-person"><span className="mt-dash-avatar">{patient.first_name?.[0] || 'ط'}</span><span><strong>{name}</strong>{age !== null && <small>{number(age)} سنوات</small>}</span></span></td>
            <td><strong>{patient.parent?.name || 'غير محدد'}</strong><small className="mt-patients-plan-title" dir="auto">{patient.parent?.email || patient.parent?.phone || ''}</small></td>
            <td><span className={`mt-dash-state ${patient.plan?.status === 'active' ? 'mt-dash-state--active' : ''}`}>{planStatus[patient.plan?.status] || 'بلا خطة'}</span>{patient.plan?.title && <small className="mt-patients-plan-title">{patient.plan.title}</small>}</td>
            {isAdmin && <td>{assigned ? patient.doctor.name : <button type="button" className="mt-dash-link" onClick={() => onAssignDoctor(patient)}>إسناد أخصائي <ArrowLeft size={15} aria-hidden="true" /></button>}</td>}
            <td><div className="mt-patients-row-actions"><button type="button" className="mt-dash-link" onClick={() => onOpenPatient(patient.id)}>عرض الملف <ArrowLeft size={15} aria-hidden="true" /></button>
              <button type="button" className="mt-patients-delete" onClick={() => onDeletePatient(patient)} aria-label={`حذف ${name}`}>حذف</button></div></td>
          </tr>
        })}</tbody></table></div>
          : <EmptyState icon={UsersRound} title={search || statusFilter !== 'all' ? 'لا توجد نتائج مطابقة' : isAdmin ? 'لا يوجد أطفال مسجلون بعد' : 'لا يوجد أطفال مسندون بعد'}
            description={search || statusFilter !== 'all' ? 'جرّب اسمًا آخر أو غيّر التصفية.' : isAdmin ? 'سيظهر الأطفال هنا بعد تسجيلهم في العيادة.' : 'ستظهر الحالات هنا عندما تُسند إليك.'}
            action={!search && statusFilter === 'all' ? <Button type="button" onClick={onRegister}>تسجيل طفل</Button> : null} />}
    </section> : <section className="mt-patients-panel" aria-label="طلبات التسجيل"><div className="mt-patients-panel__head"><div><h2>طلبات التسجيل</h2><p>راجع الطلبات الجديدة قبل إسنادها إلى الأخصائي.</p></div><span>{number(requests.length)} طلبات</span></div>
      {requestsLoading ? <div className="mt-dash-loading" role="status">جارٍ تحميل الطلبات…</div>
        : requests.length ? <div className="mt-patients-table-wrap"><table className="mt-dash-table mt-patients-table"><thead><tr><th>الطفل</th><th>ولي الأمر</th><th>تاريخ الميلاد</th><th>الحالة</th><th><span className="sr-only">الإجراء</span></th></tr></thead><tbody>{requests.map(request => <tr key={request.id}>
          <td><strong>{request.first_name} {request.second_name}</strong>{request.diagnosis_notes && <small className="mt-patients-plan-title">{request.diagnosis_notes}</small>}</td>
          <td>{request.parent_name || 'غير محدد'}<small className="mt-patients-plan-title" dir="auto">{request.parent_phone || request.parent_email || ''}</small></td>
          <td>{request.date_of_birth || '—'}</td>
          <td><span className={`mt-dash-state ${request.status === 'approved' ? 'mt-dash-state--active' : ''}`}>{requestStatus[request.status] || request.status}</span>{request.rejection_reason && <small className="mt-patients-plan-title">{request.rejection_reason}</small>}</td>
          <td>{request.status === 'pending' && <div className="mt-patients-row-actions"><button type="button" className="mt-dash-link" onClick={() => onApproveRequest(request)}>قبول <ArrowLeft size={15} aria-hidden="true" /></button><button type="button" className="mt-patients-delete" onClick={() => onRejectRequest(request)}>رفض</button></div>}</td>
        </tr>)}</tbody></table></div>
          : <EmptyState icon={UserPlus} title="لا توجد طلبات تسجيل" description="ستظهر الطلبات الجديدة هنا عند وصولها." />}
    </section>}
  </div>
}
