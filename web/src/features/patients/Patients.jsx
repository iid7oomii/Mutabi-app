import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../services/api/config'
import Sidebar from '../../components/Sidebar'
import PatientsView from './components/PatientsView'
import useAuthStore from '../../store/authStore'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import { Button } from '../../design-system/components'
import '../../design-system/dashboard.css'

function ActionDialog({ title, description, error, loading, confirmLabel, tone = 'primary', onClose, onConfirm, children }) {
  return <div className="mt-patients-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="mt-patients-dialog" role="dialog" aria-modal="true" aria-labelledby="patient-dialog-title">
      <h2 id="patient-dialog-title">{title}</h2><p>{description}</p>{children}
      {error && <p className="mt-patients-dialog__error" role="alert">{error}</p>}
      <div className="mt-patients-dialog__actions"><Button type="button" variant="secondary" onClick={onClose} disabled={loading}>إلغاء</Button>
        <Button type="button" variant={tone} onClick={onConfirm} loading={loading}>{confirmLabel}</Button></div>
    </div>
  </div>
}

export default function Patients() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [activeTab, setActiveTab] = useState('patients')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [approveModal, setApproveModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [assignModal, setAssignModal] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/children/`, { credentials: 'include' })
      if (!response.ok) throw new Error('تعذر تحميل قائمة الأطفال')
      const data = await response.json()
      setPatients(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('تعذر تحميل قائمة الأطفال. حدّث الصفحة للمحاولة مجددًا.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/?role=Doctor`, { credentials: 'include' })
      if (!response.ok) return
      const data = await response.json()
      setDoctors(Array.isArray(data) ? data : [])
    } catch { /* The list can be retried when opening an assignment dialog. */ }
  }, [])

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/children/requests`, { credentials: 'include' })
      if (!response.ok) throw new Error('تعذر تحميل طلبات التسجيل')
      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
      setError('')
    } catch {
      setError('تعذر تحميل طلبات التسجيل. حاول مجددًا.')
    } finally {
      setRequestsLoading(false)
    }
  }, [])

  useEffect(() => { document.title = 'الأطفال | متابع' }, [])
  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/children/`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error('تعذر تحميل قائمة الأطفال'); return response.json() })
      .then(data => { if (!cancelled) setPatients(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setError('تعذر تحميل قائمة الأطفال. حدّث الصفحة للمحاولة مجددًا.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    if (isAdmin) {
      fetch(`${API_BASE_URL}/api/v1/users/?role=Doctor`, { credentials: 'include' })
        .then(response => response.ok ? response.json() : [])
        .then(data => { if (!cancelled) setDoctors(Array.isArray(data) ? data : []) })
        .catch(() => {})
    }
    return () => { cancelled = true }
  }, [isAdmin])

  const changeTab = value => {
    setActiveTab(value)
    if (value === 'requests' && isAdmin) fetchRequests()
  }

  const closeDialog = () => {
    setConfirmDelete(null)
    setApproveModal(null)
    setRejectModal(null)
    setAssignModal(null)
    setSelectedDoc('')
    setDialogError('')
  }

  const openAssignment = patient => {
    setAssignModal(patient)
    setSelectedDoc('')
    setDialogError('')
    fetchDoctors()
  }

  const approve = async () => {
    if (!selectedDoc) { setDialogError('اختر الأخصائي أولًا.'); return }
    setSaving(true)
    setDialogError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/children/requests/${approveModal.id}/approve`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: selectedDoc }),
      })
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'تعذر قبول الطلب') }
      setRequests(current => current.filter(request => request.id !== approveModal.id))
      closeDialog()
      fetchPatients()
    } catch (cause) { setDialogError(cause.message || 'تعذر قبول الطلب. حاول مجددًا.') }
    finally { setSaving(false) }
  }

  const reject = async () => {
    setSaving(true)
    setDialogError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/children/requests/${rejectModal.id}/reject`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      })
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'تعذر رفض الطلب') }
      setRequests(current => current.filter(request => request.id !== rejectModal.id))
      closeDialog()
    } catch (cause) { setDialogError(cause.message || 'تعذر رفض الطلب. حاول مجددًا.') }
    finally { setSaving(false) }
  }

  const assignDoctor = async () => {
    if (!selectedDoc) { setDialogError('اختر الأخصائي أولًا.'); return }
    setSaving(true)
    setDialogError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/children/${assignModal.id}`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: selectedDoc }),
      })
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'تعذر إسناد الأخصائي') }
      closeDialog()
      fetchPatients()
    } catch (cause) { setDialogError(cause.message || 'تعذر إسناد الأخصائي. حاول مجددًا.') }
    finally { setSaving(false) }
  }

  const deletePatient = async () => {
    setSaving(true)
    setDialogError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/children/${confirmDelete.id}`, { method: 'DELETE', credentials: 'include' })
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'تعذر حذف الطفل') }
      setPatients(current => current.filter(patient => patient.id !== confirmDelete.id))
      closeDialog()
    } catch (cause) { setDialogError(cause.message || 'تعذر حذف الطفل. حاول مجددًا.') }
    finally { setSaving(false) }
  }

  const nameOf = item => `${item.first_name || ''} ${item.second_name || ''}`.trim()
  const doctorSelect = <label className="mt-patients-dialog__field">الأخصائي
    <select value={selectedDoc} onChange={event => setSelectedDoc(event.target.value)}>
      <option value="">اختر الأخصائي</option>
      {doctors.map(doctor => <option key={doctor.id} value={doctor.id}>{doctor.first_name} {doctor.second_name}</option>)}
    </select>
  </label>

  return <ThemeProvider><div className="mt-dashboard-shell">
    <Sidebar />
    <main className="mt-dashboard-main" id="main-content"><PatientsView isAdmin={isAdmin} patients={patients} requests={requests}
      loading={loading} requestsLoading={requestsLoading} error={error}
      activeTab={activeTab} onTabChange={changeTab} search={search} onSearchChange={setSearch}
      statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
      onRegister={() => navigate('/registration')} onOpenPatient={id => navigate(`/patients/${id}`)}
      onDeletePatient={patient => { setConfirmDelete(patient); setDialogError('') }}
      onAssignDoctor={openAssignment}
      onApproveRequest={request => { setApproveModal(request); setSelectedDoc(''); setDialogError(''); fetchDoctors() }}
      onRejectRequest={request => { setRejectModal(request); setDialogError('') }} />
    </main>
    {confirmDelete && <ActionDialog title="حذف الطفل" description={`هل تريد حذف ملف ${nameOf(confirmDelete)}؟ لا يمكن التراجع عن هذا الإجراء.`}
      error={dialogError} loading={saving} confirmLabel="حذف الطفل" tone="danger" onClose={closeDialog} onConfirm={deletePatient} />}
    {approveModal && <ActionDialog title="قبول طلب التسجيل" description={`اختر أخصائيًا لمتابعة ${nameOf(approveModal)}.`}
      error={dialogError} loading={saving} confirmLabel="قبول الطلب" onClose={closeDialog} onConfirm={approve}>{doctorSelect}</ActionDialog>}
    {rejectModal && <ActionDialog title="رفض طلب التسجيل" description={`هل تريد رفض طلب تسجيل ${nameOf(rejectModal)}؟`}
      error={dialogError} loading={saving} confirmLabel="رفض الطلب" tone="danger" onClose={closeDialog} onConfirm={reject} />}
    {assignModal && <ActionDialog title="إسناد أخصائي" description={`اختر أخصائيًا لمتابعة ${nameOf(assignModal)}.`}
      error={dialogError} loading={saving} confirmLabel="حفظ الإسناد" onClose={closeDialog} onConfirm={assignDoctor}>{doctorSelect}</ActionDialog>}
  </div></ThemeProvider>
}
