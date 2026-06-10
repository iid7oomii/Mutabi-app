import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, Linking, Dimensions, Modal, Pressable,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, FontAwesome, FontAwesome6 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Header from '../components/Header'
import { apiGet, getLocalSessions, todayString, localDayName } from '../utils/api'
import { useChild } from '../contexts/ChildContext'

const BLUE    = '#1F6FEB'
const ORANGE  = '#FF7A00'
const CARD_W  = Dimensions.get('window').width - 40

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح الخير'
  if (h < 18) return 'مساء الخير'
  return 'مساء النور'
}

export default function HomeScreen({ onTabPress }) {
  const navigation = useNavigation()
  const { selectedChildId, ready } = useChild()
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [articles, setArticles]   = useState([])
  const [apptModal, setApptModal] = useState(false)
  const [completedIds, setCompletedIds] = useState([])

  const fetchData = async (childId) => {
    try {
      const childParam = childId ? `&child_id=${childId}` : ''
      const [dashRes, artRes, sessions] = await Promise.all([
        apiGet(`/dashboard/parent?day=${localDayName()}${childParam}`),
        apiGet('/articles/'),
        getLocalSessions(),
      ])
      const dashJson = await dashRes.json()
      if (!dashRes.ok) { setError(dashJson.error || 'فشل في تحميل البيانات'); return }
      setData(dashJson)
      const artJson = await artRes.json()
      if (artRes.ok) setArticles(Array.isArray(artJson) ? artJson : [])
      const today = todayString()
      const ids = sessions
        .filter(s => s.date === today && s.completion_status === 'completed')
        .map(s => s.plan_exercise_id)
      setCompletedIds(ids)
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!ready) return
    setLoading(true)
    setError('')
    fetchData(selectedChildId)
  }, [selectedChildId, ready])

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={BLUE} size="large" />
    </View>
  )

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={() => { setLoading(true); setError(''); fetchData() }} style={styles.retryBtn}>
        <Text style={styles.retryText}>إعادة المحاولة</Text>
      </TouchableOpacity>
    </View>
  )

  const todayEx   = (data?.today_exercises || []).find(ex => !completedIds.includes(ex.id)) || null
  const childName = data?.child?.name?.split(' ')[0] || 'your child'
  const parentName = data?.parent_name?.split(' ')[0] || 'there'

  const apptDate = data?.upcoming_appointment?.appointment
    ? new Date(data.upcoming_appointment.appointment)
        .toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : null

  const appt = data?.upcoming_appointment
  const apptDt = appt?.appointment ? new Date(appt.appointment) : null

  return (
    <View style={{ flex: 1 }}>

      {/* Appointment Modal */}
      <Modal visible={apptModal} transparent animationType="fade" onRequestClose={() => setApptModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setApptModal(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Ionicons name="calendar" size={22} color={BLUE} />
              </View>
              <Text style={styles.modalTitle}>تفاصيل الموعد</Text>
              <TouchableOpacity onPress={() => setApptModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalRow}>
              <Ionicons name="calendar-outline" size={16} color={BLUE} />
              <Text style={styles.modalLabel}>التاريخ</Text>
              <Text style={styles.modalValue}>
                {apptDt ? apptDt.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.modalRow}>
              <Ionicons name="time-outline" size={16} color={ORANGE} />
              <Text style={styles.modalLabel}>الوقت</Text>
              <Text style={styles.modalValue}>
                {apptDt ? apptDt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </Text>
            </View>

            {appt?.notes && (
              <>
                <View style={styles.modalDivider} />
                <View style={[styles.modalRow, { alignItems: 'flex-start' }]}>
                  <Ionicons name="document-text-outline" size={16} color="#888" style={{ marginTop: 2 }} />
                  <Text style={styles.modalLabel}>ملاحظات</Text>
                  <Text style={[styles.modalValue, { flex: 1 }]}>{appt.notes}</Text>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.modalBtn} onPress={() => setApptModal(false)}>
              <Text style={styles.modalBtnText}>حسناً</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Header
        clinicName={data?.clinic_name}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Greeting */}
        <Text style={styles.greeting}>{greeting()}، {parentName}</Text>
        <Text style={styles.subGreeting}>إليك كيف ندعم {childName} اليوم.</Text>

        {/* Priority Goal Card */}
        {todayEx ? (
          <LinearGradient
            colors={['#1F6FEB', '#0a3d9e', '#0F4C81']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.goalCard}
          >
            <View style={styles.priorityBadge}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.priorityText}>الهدف الأولوي</Text>
              </View>
            </View>
            <Text style={styles.goalTitle}>{todayEx.exercise_title}</Text>
            <View style={styles.goalMeta}>
              {todayEx.duration_minutes ? (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={13} color="#ccc" />
                  <Text style={styles.metaText}>{todayEx.duration_minutes} دقيقة</Text>
                </View>
              ) : null}
              {todayEx.reps ? (
                <View style={styles.metaItem}>
                  <Ionicons name="repeat-outline" size={13} color="#ccc" />
                  <Text style={styles.metaText}>{todayEx.reps} تكرار</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => onTabPress('Therapy')}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.startBtnText}>ابدأ الجلسة</Text>
                <Ionicons name="arrow-back" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <View style={styles.emptyGoalCard}>
            {(data?.today_exercises?.length ?? 0) > 0 ? (
              <>
                <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                <Text style={styles.emptyGoalText}>أحسنت! أتممت جميع تمارين اليوم</Text>
              </>
            ) : (
              <>
                <Ionicons name="calendar-outline" size={32} color="#aaa" />
                <Text style={styles.emptyGoalText}>لا يوجد تمرين مخصص لليوم</Text>
              </>
            )}
          </View>
        )}

        {/* Doctor's Notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ملاحظات الطبيب</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DoctorNotes', { childId: data?.child?.id })}>
            <Text style={styles.viewAll}>عرض الكل</Text>
          </TouchableOpacity>
        </View>

        {data?.latest_note ? (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <View style={styles.docAvatar}>
                {data.latest_note.doctor_profile_picture_url ? (
                  <Image
                    source={{ uri: data.latest_note.doctor_profile_picture_url }}
                    style={styles.docAvatarImg}
                  />
                ) : (
                  <Ionicons name="person" size={18} color={BLUE} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{data.latest_note.doctor_name}</Text>
                <Text style={styles.docSpecialty}>
                  {data.latest_note.doctor_specialty || 'معالج'}
                </Text>
              </View>
            </View>
            <View style={styles.quoteRow}>
              <View style={styles.quoteAccent} />
              <Text style={styles.noteContent}>{data.latest_note.content}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noteCard}>
            <Text style={styles.emptyText}>لا توجد ملاحظات بعد</Text>
          </View>
        )}

        {/* Awareness Articles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>مقالات التوعية</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Articles')}>
            <Text style={styles.viewAll}>استكشف المكتبة</Text>
          </TouchableOpacity>
        </View>
        {articles.length === 0 ? (
          <View style={[styles.noteCard, { marginBottom: 24 }]}>
            <Text style={styles.emptyText}>لا توجد مقالات بعد</Text>
          </View>
        ) : (
          <FlatList
            data={articles}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            snapToInterval={CARD_W}
            decelerationRate="fast"
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.articleCard}
                activeOpacity={0.88}
                onPress={() => item.article_url && Linking.openURL(item.article_url)}
              >
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.articleImg}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#EEF3FA', '#dbeafe']}
                    style={[styles.articleImg, styles.articleImgFallback]}
                  >
                    <Ionicons name="document-text-outline" size={36} color="#93c5fd" />
                  </LinearGradient>
                )}
                <View style={styles.articleBody}>
                  <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                  {item.summary ? (
                    <Text style={styles.articleSummary} numberOfLines={2}>{item.summary}</Text>
                  ) : null}
                  <View style={styles.readMore}>
                    <Text style={styles.readMoreText}>اقرأ المقال</Text>
                    <Ionicons name="arrow-back" size={13} color={ORANGE} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>الانتظام الأسبوعي</Text>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>
								{data?.weekly_streak ? `${data.weekly_streak} أيام` : '0 أيام'}
							</Text>
							<FontAwesome6 name="fire" size={20} color={data?.weekly_streak ? ORANGE : '#ccc'} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={data?.upcoming_appointment ? 0.75 : 1}
            onPress={() => data?.upcoming_appointment && setApptModal(true)}
          >
            <Text style={styles.statLabel}>الموعد القادم</Text>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>{apptDate || 'لا يوجد'}</Text>
              <FontAwesome name="calendar-o" size={18} color={BLUE} />
            </View>
            {data?.upcoming_appointment && (
              <Text style={styles.statHint}>اضغط للتفاصيل</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText:     { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  retryBtn:      { backgroundColor: '#1F6FEB', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:     { color: '#fff', fontWeight: '600' },
  scroll:        { padding: 20, paddingBottom: 24 },
  greeting:      { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subGreeting:   { fontSize: 13, color: '#888', marginBottom: 20 },

  /* Goal card */
  goalCard:      { borderRadius: 16, padding: 20, marginBottom: 24 },
  priorityBadge: { backgroundColor: ORANGE, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  priorityText:  { color: '#fff', fontSize: 12, fontWeight: '700' },
  goalTitle:     { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  goalMeta:      { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:      { color: '#ccc', fontSize: 13 },
  startBtn:      { backgroundColor: ORANGE, borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center' },
  startBtnText:  { color: '#fff', fontSize: 15, fontWeight: '600' },
  emptyGoalCard: { backgroundColor: '#f0f4ff', borderRadius: 16, padding: 30, marginBottom: 24, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#dce8ff', borderStyle: 'dashed' },
  emptyGoalText: { fontSize: 14, color: '#aaa', textAlign: 'center' },

  /* Sections */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  viewAll:       { fontSize: 13, color: ORANGE },

  /* Doctor note */
  noteCard:    { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  noteHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  docAvatar:      { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  docAvatarImg:   { width: 40, height: 40, borderRadius: 20 },
  docName:     { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  docSpecialty:{ fontSize: 12, color: '#888' },
  quoteRow:    { flexDirection: 'row', gap: 10 },
  quoteAccent: { width: 3, borderRadius: 2, backgroundColor: ORANGE },
  noteContent: { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
  emptyText:   { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 10 },

  /* Articles */
  articleCard:        { width: CARD_W, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  articleImg:         { width: '100%', height: 160 },
  articleImgFallback: { alignItems: 'center', justifyContent: 'center' },
  articleBody:        { padding: 16 },
  articleTitle:       { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 6, lineHeight: 22 },
  articleSummary:     { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 12 },
  readMore:           { flexDirection: 'row', alignItems: 'center', gap: 5 },
  readMoreText:       { fontSize: 13, color: ORANGE, fontWeight: '600' },

  /* Stats */
  statsRow:   { flexDirection: 'row', gap: 12 },
  statCard:   { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statLabel:  { fontSize: 11, color: '#888', marginBottom: 8, fontWeight: '600', letterSpacing: 0.3 },
  statValue:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  statHint:   { fontSize: 10, color: BLUE, marginTop: 6, textAlign: 'right' },

  /* Appointment Modal */
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox:      { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  modalHeader:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  modalIconBox:  { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  modalTitle:    { flex: 1, fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  modalClose:    { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  modalRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  modalLabel:    { fontSize: 13, color: '#888', width: 56 },
  modalValue:    { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  modalDivider:  { height: 1, backgroundColor: '#f3f4f6', marginVertical: 10 },
  modalBtn:      { marginTop: 20, backgroundColor: BLUE, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  modalBtnText:  { color: '#fff', fontSize: 15, fontWeight: '600' },
})
