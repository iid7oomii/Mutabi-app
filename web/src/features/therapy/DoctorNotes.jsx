import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { API_BASE_URL } from '../../services/api/config'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import DoctorNotesView from './components/DoctorNotesView'
import '../../design-system/dashboard.css'
import '../../design-system/notes.css'

function DoctorNotesContent() {
  const [children, setChildren] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [notes, setNotes] = useState([])
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [childrenError, setChildrenError] = useState('')
  const [notesError, setNotesError] = useState('')

  useEffect(() => {
    document.title = 'ملاحظات الأخصائي | متابع'
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/children/`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        setChildren(list)
        setSelectedId(list[0]?.id || '')
        setLoadingNotes(Boolean(list[0]?.id))
      })
      .catch(() => { if (!cancelled) setChildrenError('تعذر تحميل قائمة الأطفال. حدّث الصفحة وحاول مجددًا.') })
      .finally(() => { if (!cancelled) setLoadingChildren(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    fetch(`${API_BASE_URL}/api/v1/doctor-notes/child/${selectedId}`, { credentials: 'include' })
      .then(response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { if (!cancelled) setNotes(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setNotesError('تعذر تحميل ملاحظات هذا الطفل. اختر طفلًا آخر ثم أعد المحاولة.') })
      .finally(() => { if (!cancelled) setLoadingNotes(false) })
    return () => { cancelled = true }
  }, [selectedId])

  const selectChild = id => {
    if (id === selectedId) return
    setSelectedId(id)
    setNotes([])
    setNotesError('')
    setLoadingNotes(true)
  }

  const addNote = async content => {
    const response = await fetch(`${API_BASE_URL}/api/v1/doctor-notes/`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: selectedId, content }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'تعذر حفظ الملاحظة. حاول مجددًا.')
    setNotes(current => [data, ...current])
  }

  const deleteNote = async id => {
    const response = await fetch(`${API_BASE_URL}/api/v1/doctor-notes/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'تعذر حذف الملاحظة. حاول مجددًا.')
    }
    setNotes(current => current.filter(note => note.id !== id))
  }

  return <div className="mt-dashboard-shell" dir="rtl"><Sidebar /><main className="mt-dashboard-main">
    <DoctorNotesView children={children} selectedId={selectedId} notes={notes}
      loadingChildren={loadingChildren} loadingNotes={loadingNotes} childrenError={childrenError} notesError={notesError}
      onSelectChild={selectChild} onAddNote={addNote} onDeleteNote={deleteNote} />
  </main></div>
}

export default function DoctorNotes() {
  return <ThemeProvider><DoctorNotesContent /></ThemeProvider>
}
