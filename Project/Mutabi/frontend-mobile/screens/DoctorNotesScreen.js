import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { apiGet } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function DoctorNotesScreen() {
  const navigation = useNavigation()
  const route      = useRoute()
  const childId    = route.params?.childId

  const [notes, setNotes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError('')
      const res  = await apiGet(`/doctor-notes/child/${childId}`)
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'فشل في تحميل الملاحظات'); return }
      setNotes(Array.isArray(json) ? json : [])
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchNotes() }, [childId]))

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ملاحظات الطبيب</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BLUE} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNotes} style={styles.retryBtn}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {notes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>لا توجد ملاحظات بعد</Text>
            </View>
          ) : (
            notes.map((note, i) => (
              <View key={note.id || i} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.docAvatar}>
                    <Ionicons name="person" size={18} color={BLUE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>
                      {note.doctor_name || 'الطبيب'}
                    </Text>
                    <Text style={styles.docSpecialty}>
                      {note.doctor_specialty || 'معالج'}
                    </Text>
                  </View>
                  <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
                </View>
                <View style={styles.quoteRow}>
                  <View style={styles.quoteAccent} />
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f7f9fc' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText:   { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  retryBtn:    { backgroundColor: BLUE, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:   { color: '#fff', fontWeight: '600' },
  scroll:      { padding: 20, paddingBottom: 40 },
  emptyBox:    { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText:   { fontSize: 14, color: '#aaa' },
  noteCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  noteHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  docAvatar:   { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  docName:     { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  docSpecialty:{ fontSize: 12, color: '#888' },
  noteDate:    { fontSize: 11, color: '#bbb' },
  quoteRow:    { flexDirection: 'row', gap: 10 },
  quoteAccent: { width: 3, borderRadius: 2, backgroundColor: ORANGE },
  noteContent: { flex: 1, fontSize: 14, color: '#444', lineHeight: 22 },
})
