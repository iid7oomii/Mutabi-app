import { useEffect, useState } from 'react'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import { ThemeToggle } from '../../design-system/templates'
import AdminDashboard from '../dashboard/components/AdminDashboard'
import DoctorDashboard from '../dashboard/components/DoctorDashboard'
import PatientsDesignPreview from '../patients/PatientsDesignPreview'
import RegistrationDesignPreview from '../auth/RegistrationDesignPreview'
import ExerciseLibraryDesignPreview from '../therapy/ExerciseLibraryDesignPreview'
import TherapyPlanDesignPreview from '../therapy/TherapyPlanDesignPreview'
import FeedbackDesignPreview from '../therapy/FeedbackDesignPreview'
import DoctorNotesDesignPreview from '../therapy/DoctorNotesDesignPreview'
import AppointmentsDesignPreview from '../appointments/AppointmentsDesignPreview'
import ArticlesDesignPreview from '../articles/ArticlesDesignPreview'
import DoctorsDesignPreview from '../doctors/DoctorsDesignPreview'
import DoctorProfileDesignPreview from '../doctors/DoctorProfileDesignPreview'
import PatientProfileDesignPreview from '../patients/PatientProfileDesignPreview'
import ProgressDesignPreview from '../progress/ProgressDesignPreview'
import logoMark from '../../assets/logo-mark.svg'
import { getWebNavItems } from '../../components/webNavigation'
import '../../design-system/dashboard.css'

const adminWithData = {
  total_doctors: 8,
  active_patients: 42,
  new_registrations: 6,
  recent_onboarding: [
    { id: 1, initials: 'ن', name: 'نورة العتيبي', specialty: 'علاج وظيفي', is_active: true },
    { id: 2, initials: 'م', name: 'محمد القحطاني', specialty: 'علاج النطق', is_active: true },
    { id: 3, initials: 'ر', name: 'ريم الحربي', specialty: 'علاج طبيعي', is_active: false },
  ],
}
const doctorWithData = {
  assigned_patients: 12,
  skipped_sessions: 3,
  patients_without_plan: [{ name: 'ليان' }, { name: 'عبدالله' }],
  recent_feedback: [
    { id: 1, child: 'ليان', exercise: 'تمرين توازن الوقوف', date: 'اليوم', notes: 'تم تنفيذ التمرين مع مساعدة بسيطة.', status: 'completed' },
    { id: 2, child: 'عبدالله', exercise: 'تمرين تقوية اليد', date: 'أمس', notes: 'توقف قبل نهاية الوقت المحدد.', status: 'partial' },
    { id: 3, child: 'سارة', exercise: 'تمرين التمدد', date: 'قبل يومين', status: 'skipped' },
  ],
}
function PreviewContent() {
  const [role, setRole] = useState('admin')
  const [filled, setFilled] = useState(true)
  const [screen, setScreen] = useState('dashboard')

  useEffect(() => { document.title = 'معاينة تصميم الويب | متابع' }, [])

  const adminData = filled ? adminWithData : { total_doctors: 0, active_patients: 0, new_registrations: 0, recent_onboarding: [] }
  const doctorData = filled ? doctorWithData : { assigned_patients: 0, skipped_sessions: 0, patients_without_plan: [], recent_feedback: [] }

  return <div className="mt-dashboard-shell mt-preview">
    <aside className="mt-sidebar" aria-label="معاينة القائمة الجانبية">
      <div className="mt-sidebar__brand"><img src={logoMark} alt="" /><div><strong>متابع</strong><small>إدارة المتابعة العلاجية</small></div></div>
      <div className="mt-sidebar__clinic"><span className="mt-sidebar__clinic-logo">ع</span><div><strong>عيادة النمو</strong><small>مساحة العمل</small></div></div>
      <nav className="mt-sidebar__nav"><span className="mt-sidebar__nav-label">القائمة</span>
        {getWebNavItems({ role }).map(item => { const Icon = item.icon; return <span key={item.path} className={`mt-sidebar__link ${item.path === `/${screen}` ? 'mt-sidebar__link--active' : ''}`}><Icon size={19} strokeWidth={1.9} />{item.label}</span> })}
      </nav>
      <div className="mt-sidebar__footer"><div className="mt-sidebar__person"><span className="mt-sidebar__avatar">م</span><div><strong>مستخدم تجريبي</strong><small>{role === 'admin' ? 'مدير العيادة' : 'أخصائي'}</small></div></div><ThemeToggle /></div>
    </aside>
    <main className="mt-dashboard-main">
      <div className="mt-preview__toolbar" aria-label="خيارات المعاينة">
        <div><strong>معاينة تصميم الويب</strong><span>بيانات تجريبية للعرض فقط</span></div>
        <div className="mt-preview__controls">
          <label>الصفحة <select value={screen} onChange={event => setScreen(event.target.value)}><option value="dashboard">لوحة التحكم</option><option value="patients">الأطفال</option><option value="registration">تسجيل طفل</option><option value="exercises">مكتبة التمارين</option><option value="plans">الخطط العلاجية</option><option value="feedback">ملاحظات الأسرة</option><option value="notes">ملاحظات الأخصائي</option><option value="appointments">المواعيد</option><option value="articles">المقالات</option>{role === 'admin' && <><option value="doctors">الأخصائيون</option><option value="doctor-profile">ملف الأخصائي</option><option value="progress">التقدم</option></>}<option value="patient-profile">ملف الطفل</option><option value="patient-progress">تقدم الطفل</option></select></label>
          <label>الواجهة <select value={role} onChange={event => { const nextRole = event.target.value; setRole(nextRole); if (nextRole !== 'admin' && ['doctors', 'doctor-profile', 'progress'].includes(screen)) setScreen('dashboard') }}><option value="admin">مدير العيادة</option><option value="doctor">الأخصائي</option></select></label>
          <label>البيانات <select value={filled ? 'filled' : 'empty'} onChange={event => setFilled(event.target.value === 'filled')}><option value="filled">مع بيانات</option><option value="empty">بدون بيانات</option></select></label>
          <span className="mt-preview__mobile-theme"><ThemeToggle /></span>
        </div>
      </div>
      {screen === 'patient-progress' ? <ProgressDesignPreview key={`${role}-${filled}-child`} filled={filled} mode="child" />
        : screen === 'patient-profile' ? <PatientProfileDesignPreview key={`${role}-${filled}`} filled={filled} />
        : screen === 'progress' ? <ProgressDesignPreview key={`${role}-${filled}`} filled={filled} />
        : screen === 'doctor-profile' ? <DoctorProfileDesignPreview key={`${role}-${filled}`} filled={filled} />
        : screen === 'doctors' ? <DoctorsDesignPreview key={`${role}-${filled}`} filled={filled} />
        : screen === 'articles' ? <ArticlesDesignPreview key={`${role}-${filled}`} filled={filled} role={role} />
        : screen === 'appointments' ? <AppointmentsDesignPreview key={`${role}-${filled}`} filled={filled} role={role} />
        : screen === 'notes' ? <DoctorNotesDesignPreview key={`${role}-${filled}`} filled={filled} role={role} />
        : screen === 'feedback' ? <FeedbackDesignPreview key={`${role}-${filled}`} filled={filled} role={role} />
        : screen === 'plans' ? <TherapyPlanDesignPreview key={`${role}-${filled}`} filled={filled} role={role} />
        : screen === 'exercises' ? <ExerciseLibraryDesignPreview key={String(filled)} filled={filled} />
        : screen === 'registration' ? <RegistrationDesignPreview key={String(filled)} role={role} filled={filled} />
        : screen === 'patients' ? <PatientsDesignPreview role={role} filled={filled} />
        : role === 'admin' ? <AdminDashboard key={`admin-${filled}`} previewData={adminData} previewUser={{ first_name: 'محمد' }} />
          : <DoctorDashboard key={`doctor-${filled}`} previewData={doctorData} previewUser={{ first_name: 'نورة' }} />}
    </main>
  </div>
}

export default function WebDesignPreview() {
  return <ThemeProvider><PreviewContent /></ThemeProvider>
}
