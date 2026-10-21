import { useState } from 'react'
import DoctorNotesView from './components/DoctorNotesView'
import '../../design-system/notes.css'

const sampleChildren = [
  { id: 'child-1', first_name: 'ليان', second_name: 'العتيبي', doctor_id: 'noura' },
  { id: 'child-2', first_name: 'عبدالله', second_name: 'القحطاني', doctor_id: 'noura' },
  { id: 'child-3', first_name: 'ريم', second_name: 'السالم', doctor_id: 'mohammed' },
]
const sampleNotes = [
  { id: 'note-1', child_id: 'child-1', content: 'ظهر تحسن في التوازن أثناء الوقوف. يُنصح بالاستمرار في التمرين المنزلي بالمدة الحالية مع تقديم دعم خفيف عند الحاجة.', created_at: '2026-10-15T10:00:00Z' },
  { id: 'note-2', child_id: 'child-1', content: 'استجابت ليان جيدًا للتعليمات، واحتاجت إلى تذكير واحد فقط قبل بدء النشاط.', created_at: '2026-10-10T10:00:00Z' },
  { id: 'note-3', child_id: 'child-2', content: 'أكمل عبدالله النشاط على مرحلتين مع استراحة قصيرة بينهما.', created_at: '2026-10-14T10:00:00Z' },
]

export default function DoctorNotesDesignPreview({ filled, role }) {
  const children = filled ? sampleChildren.filter(child => role === 'admin' || child.doctor_id === 'noura') : []
  const [selectedId, setSelectedId] = useState(children[0]?.id || '')
  const [notes, setNotes] = useState(filled ? sampleNotes : [])
  return <DoctorNotesView children={children} selectedId={selectedId} notes={notes.filter(note => note.child_id === selectedId)}
    onSelectChild={setSelectedId}
    onAddNote={async content => setNotes(current => [{ id: `note-${Date.now()}`, child_id: selectedId, content, created_at: new Date().toISOString() }, ...current])}
    onDeleteNote={async id => setNotes(current => current.filter(note => note.id !== id))} />
}
