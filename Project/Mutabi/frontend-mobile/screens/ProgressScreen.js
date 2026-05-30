import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header'
import { apiGet } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const FILTERS = ['هذا الأسبوع', 'هذا الشهر', '3 أشهر']

const DAY_LABELS_SHORT   = ['إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد']
const MONTH_NAMES        = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function dateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getWeekStart() {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function calcStreak(sessions) {
  let streak = 0
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < 90; i++) {
    const ds = dateStr(d)
    const hit = sessions.some(s => s.date === ds && s.completion_status === 'completed')
    if (!hit && i > 0) break
    if (hit) streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function getSessionTag(s) {
  if (s.completion_status === 'completed' && s.pain_level <= 2) return { label: 'إنجاز',      bg: '#FFF3E8', color: ORANGE }
  if (s.completion_status === 'completed')                      return { label: 'مكتمل',      bg: '#E8F5E9', color: '#2E7D32' }
  if (s.completion_status === 'partially_completed')            return { label: 'مراجعة',     bg: '#EEF3FA', color: BLUE }
  return                                                               { label: 'تم التخطي', bg: '#FFEBEE', color: '#B71C1C' }
}

function buildChartData(sessions, filter) {
  const now = new Date()

  if (filter === 'هذا الأسبوع') {
    const weekStart = getWeekStart()
    const bars = DAY_LABELS_SHORT.map((label, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      const ds = dateStr(d)
      const count = sessions.filter(s => s.date === ds && s.completion_status === 'completed').length
      return { label, count }
    })
    const todayIdx = (now.getDay() + 6) % 7
    return { bars, highlightIdx: todayIdx }
  }

  if (filter === 'هذا الشهر') {
    const year  = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const groupSize = Math.ceil(daysInMonth / 4)
    const bars = []
    for (let w = 0; w < 4; w++) {
      const startDay = w * groupSize + 1
      const endDay   = Math.min((w + 1) * groupSize, daysInMonth)
      let count = 0
      for (let day = startDay; day <= endDay; day++) {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        count += sessions.filter(s => s.date === ds && s.completion_status === 'completed').length
      }
      bars.push({ label: `الأسبوع ${w + 1}`, count })
    }

    const currentWeekIdx = Math.min(Math.floor((now.getDate() - 1) / groupSize), 3)
    return { bars, highlightIdx: currentWeekIdx }
  }

  if (filter === '3 أشهر') {
    const bars = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year  = d.getFullYear()
      const month = d.getMonth()
      const lastDay = new Date(year, month + 1, 0).getDate()

      let count = 0
      for (let day = 1; day <= lastDay; day++) {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        count += sessions.filter(s => s.date === ds && s.completion_status === 'completed').length
      }
      bars.push({ label: MONTH_NAMES[month], count })
    }
    return { bars, highlightIdx: 2 }
  }

  return { bars: [], highlightIdx: -1 }
}

function ConsistencyChart({ bars, highlightIdx, selectedBar, onBarPress }) {
  const max = Math.max(...bars.map(b => b.count), 1)
  return (
    <View>
      <View style={chartStyles.wrapper}>
        {bars.map((item, i) => {
          const heightPct  = item.count > 0 ? item.count / max : 0
          const isHighlight = i === highlightIdx
          const isSelected  = i === selectedBar
          return (
            <TouchableOpacity
              key={i}
              style={chartStyles.col}
              activeOpacity={0.7}
              onPress={() => onBarPress(i)}
            >
              {/* Tooltip */}
              {isSelected && (
                <View style={chartStyles.tooltip}>
                  <Text style={chartStyles.tooltipText}>{item.count} تمارين</Text>
                  <View style={chartStyles.tooltipArrow} />
                </View>
              )}
              <View style={chartStyles.track}>
                <View style={[
                  chartStyles.bar,
                  { height: `${Math.max(heightPct * 100, item.count > 0 ? 10 : 3)}%` },
                  isSelected  ? chartStyles.barSelected  :
                  isHighlight ? chartStyles.barHighlight  :
                  chartStyles.barNormal,
                ]} />
              </View>
              <Text style={[chartStyles.dayLabel, isHighlight && chartStyles.dayLabelToday]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      {selectedBar !== null && (
        <Text style={chartStyles.tapHint}>اضغط مرة أخرى لإخفاء</Text>
      )}
    </View>
  )
}

const chartStyles = StyleSheet.create({
  wrapper:        { flexDirection: 'row', height: 110, alignItems: 'flex-end', gap: 6, marginTop: 46, overflow: 'visible' },
  col:            { flex: 1, alignItems: 'center', gap: 6, position: 'relative', overflow: 'visible' },
  track:          { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: '#f5f5f5', borderRadius: 4 },
  bar:            { width: '100%', borderRadius: 4 },
  barNormal:      { backgroundColor: '#c7d8f5' },
  barHighlight:   { backgroundColor: BLUE },
  barSelected:    { backgroundColor: ORANGE },
  dayLabel:       { fontSize: 8, color: '#aaa', textAlign: 'center' },
  dayLabelToday:  { color: BLUE, fontWeight: '700' },
  tooltip:        { position: 'absolute', top: -42, backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, zIndex: 99, alignItems: 'center', minWidth: 70 },
  tooltipText:    { fontSize: 11, color: '#fff', fontWeight: '700', textAlign: 'center' },
  tooltipArrow:   { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#1a1a2e', marginTop: 1 },
  tapHint:        { fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 6 },
})

export default function ProgressScreen({ activeTab }) {
  const navigation                  = useNavigation()
  const [filter, setFilter]         = useState('هذا الأسبوع')
  const [sessions, setSessions]     = useState([])
  const [clinicName, setClinicName] = useState('')
  const [loading, setLoading]       = useState(true)
  const [selectedBar, setSelectedBar] = useState(null)

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (activeTab === 'Progress') loadData()
  }, [activeTab])

  useEffect(() => { setSelectedBar(null) }, [filter])

  const loadData = async () => {
    setLoading(true)
    try {
      const [historyRes, dashRes] = await Promise.all([
        apiGet('/feedback/parent/history'),
        apiGet('/dashboard/parent'),
      ])
      const [history, dash] = await Promise.all([historyRes.json(), dashRes.json()])
      if (historyRes.ok) setSessions(Array.isArray(history) ? history : [])
      if (dashRes.ok) setClinicName(dash.clinic_name || '')
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const { bars, highlightIdx } = buildChartData(sessions, filter)
  const streak    = calcStreak(sessions)
  const totalDone = sessions.filter(s => s.completion_status === 'completed').length

  const recent = [...sessions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 20)

  const handleBarPress = (i) => {
    setSelectedBar(prev => prev === i ? null : i)
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        clinicName={clinicName}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>مسار التقدم</Text>
        <Text style={styles.subtitle}>تتبع رحلتك العلاجية وإنجازاتك.</Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]} numberOfLines={1}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={BLUE} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Consistency Trend */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>منحنى الانتظام</Text>
              </View>
              <ConsistencyChart
                bars={bars}
                highlightIdx={highlightIdx}
                selectedBar={selectedBar}
                onBarPress={handleBarPress}
              />
            </View>

            {/* Streak */}
            <View style={styles.streakCard}>
              <Text style={styles.streakSub}>الانتظام الحالي</Text>
              <Text style={styles.streakNum}>{streak} أيام</Text>
              <Text style={styles.streakMsg}>
                {streak > 0 ? 'أنت تبني عادة قوية. استمر!' : 'ابدأ بتسجيل الجلسات لبناء انتظامك!'}
              </Text>
            </View>

            {/* Sessions Completed */}
            <View style={styles.sessionsCard}>
              <View>
                <Text style={styles.sessionsLabel}>الجلسات المكتملة</Text>
                <Text style={styles.sessionsNum}>{totalDone}</Text>
              </View>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark-circle-outline" size={28} color={BLUE} />
              </View>
            </View>

            {/* Recent Sessions */}
            <Text style={styles.recentTitle}>الجلسات الأخيرة</Text>
            {recent.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="journal-outline" size={36} color="#ccc" />
                <Text style={styles.emptyText}>لا توجد جلسات مسجلة بعد.</Text>
                <Text style={styles.emptySubText}>أكمل التمارين وسجّل النتائج لعرضها هنا.</Text>
              </View>
            ) : (
              recent.map((s, i) => {
                const tag  = getSessionTag(s)
                const date = new Date(s.created_at).toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' })
                return (
                  <View key={i} style={styles.sessionItem}>
                    <View style={[styles.sessionDot, { backgroundColor: tag.color }]}>
                      <Ionicons
                        name={s.completion_status === 'completed' ? 'checkmark' : s.completion_status === 'skipped' ? 'close' : 'remove'}
                        size={14} color="#fff"
                      />
                    </View>
                    <View style={styles.sessionContent}>
                      <View style={[styles.sessionTag, { backgroundColor: tag.bg }]}>
                        <Text style={[styles.sessionTagText, { color: tag.color }]}>{tag.label}</Text>
                      </View>
                      <View style={styles.sessionDateRow}>
                        <Ionicons name="calendar-outline" size={11} color="#aaa" />
                        <Text style={styles.sessionDate}>{date}</Text>
                      </View>
                      <Text style={styles.sessionTitle}>{s.exercise_title}</Text>
                      {s.notes ? <Text style={styles.sessionNotes} numberOfLines={2}>{s.notes}</Text> : null}
                    </View>
                  </View>
                )
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  scroll:   { padding: 20, paddingBottom: 24 },
  title:    { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  filterRow:       { flexDirection: 'row', gap: 6, marginBottom: 20 },
  filterBtn:       { flex: 1, paddingVertical: 9, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center' },
  filterBtnActive: { backgroundColor: BLUE },
  filterText:      { fontSize: 12, color: '#888', fontWeight: '600', textAlign: 'center' },
  filterTextActive:{ color: '#fff', fontWeight: '600' },

  card:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  filterHint:    { fontSize: 12, color: '#aaa' },

  streakCard: { backgroundColor: '#0F4C81', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'flex-start', gap: 4 },
  streakSub:  { fontSize: 13, color: '#cce0ff' },
  streakNum:  { fontSize: 36, fontWeight: '700', color: '#fff' },
  streakMsg:  { fontSize: 13, color: '#cce0ff', lineHeight: 18 },

  sessionsCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sessionsLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
  sessionsNum:   { fontSize: 32, fontWeight: '700', color: '#1a1a2e' },
  checkCircle:   { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },

  recentTitle:    { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },
  sessionItem:    { flexDirection: 'row', gap: 14, marginBottom: 16 },
  sessionDot:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 },
  sessionContent: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1, gap: 4 },
  sessionTag:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  sessionTagText: { fontSize: 11, fontWeight: '700' },
  sessionDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionDate:    { fontSize: 11, color: '#aaa' },
  sessionTitle:   { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  sessionNotes:   { fontSize: 12, color: '#888', lineHeight: 18 },

  emptyCard:    { alignItems: 'center', padding: 40, gap: 8 },
  emptyText:    { fontSize: 15, fontWeight: '600', color: '#666' },
  emptySubText: { fontSize: 13, color: '#aaa', textAlign: 'center', lineHeight: 18 },
})
