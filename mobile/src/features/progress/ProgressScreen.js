import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { CalendarDays, ChartNoAxesColumn, Check, CircleCheck, Flame, Target } from 'lucide-react-native'
import Header from '../../components/ui/Header'
import { AppText, EmptyState, GoalCard, Message, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet } from '../../services/api/client'
import { useChild } from '../../store/ChildContext'

const periods = ['هذا الأسبوع', 'هذا الشهر', '٣ أشهر']
const dayLabels = ['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح']
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const sessionDate = item => String(item.feedback_date || item.date || item.created_at || '').slice(0, 10)
function buildBars(sessions, period) {
  const now = new Date()
  if (period === periods[0]) {
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    return dayLabels.map((label, index) => { const day = new Date(monday); day.setDate(monday.getDate() + index); return { label, count: sessions.filter(item => item.completion_status === 'completed' && sessionDate(item) === dateKey(day)).length, current: dateKey(day) === dateKey(now) } })
  }
  if (period === periods[1]) return [0, 1, 2, 3].map(index => ({ label: `أ${index + 1}`, count: sessions.filter(item => { const day = new Date(sessionDate(item)); return item.completion_status === 'completed' && day.getFullYear() === now.getFullYear() && day.getMonth() === now.getMonth() && Math.min(3, Math.floor((day.getDate() - 1) / 8)) === index }).length, current: Math.min(3, Math.floor((now.getDate() - 1) / 8)) === index }))
  return [2, 1, 0].map(offset => { const month = new Date(now.getFullYear(), now.getMonth() - offset, 1); return { label: month.toLocaleDateString('ar-SA-u-ca-gregory', { month: 'short' }), count: sessions.filter(item => { const day = new Date(sessionDate(item)); return item.completion_status === 'completed' && day.getFullYear() === month.getFullYear() && day.getMonth() === month.getMonth() }).length, current: offset === 0 } })
}
function currentStreak(sessions) {
  let count = 0
  const day = new Date()
  for (let index = 0; index < 90; index++) {
    const found = sessions.some(item => item.completion_status === 'completed' && sessionDate(item) === dateKey(day))
    if (!found && (index > 0 || count > 0)) break
    if (found) count++
    day.setDate(day.getDate() - 1)
  }
  return count
}
const formatDate = value => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' }) : null
const remainingLabel = goal => goal.status !== 'active' ? null : goal.remaining_days === 0 ? 'آخر يوم' : [Math.floor(goal.remaining_days / 7) && `${Math.floor(goal.remaining_days / 7)} أسبوع`, goal.remaining_days % 7 && `${goal.remaining_days % 7} يوم`].filter(Boolean).join(' و ')

export default function ProgressScreen({ activeTab }) {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { selectedChildId, ready } = useChild()
  const [sessions, setSessions] = useState([])
  const [goals, setGoals] = useState([])
  const [goalsError, setGoalsError] = useState(false)
  const [clinicName, setClinicName] = useState('')
  const [childName, setChildName] = useState('')
  const [period, setPeriod] = useState(periods[0])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBar, setSelectedBar] = useState(null)

  useFocusEffect(useCallback(() => {
    if (!ready || activeTab !== 'Progress') return undefined
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      setGoalsError(false)
      try {
        const suffix = selectedChildId ? `?child_id=${selectedChildId}` : ''
        const [historyResponse, dashboardResponse] = await Promise.all([apiGet(`/feedback/parent/history${suffix}`), apiGet(`/dashboard/parent${suffix}`)])
        if (!historyResponse.ok || !dashboardResponse.ok) throw new Error('تعذر تحميل التقدم')
        const [history, dashboard] = await Promise.all([historyResponse.json(), dashboardResponse.json()])
        if (!active) return
        setSessions(Array.isArray(history) ? history : [])
        setClinicName(dashboard.clinic_name || '')
        setChildName(dashboard.child?.name || '')
        const childId = selectedChildId || dashboard.child?.id
        if (childId) {
          try { const response = await apiGet(`/goals/child/${childId}`); if (!response.ok) throw new Error(); const list = await response.json(); if (active) setGoals(Array.isArray(list) ? list : []) }
          catch { if (active) { setGoals([]); setGoalsError(true) } }
        } else setGoals([])
      } catch (cause) { if (active) setError(cause.message || 'تعذر الاتصال بالخادم') }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [ready, selectedChildId, activeTab]))
  useEffect(() => setSelectedBar(null), [period])

  const bars = buildBars(sessions, period)
  const max = Math.max(1, ...bars.map(item => item.count))
  const done = bars.reduce((sum, item) => sum + item.count, 0)
  const streak = currentStreak(sessions)
  const recent = [...sessions].sort((a, b) => new Date(b.created_at || b.feedback_date) - new Date(a.created_at || a.feedback_date)).slice(0, 8)
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <Header clinicName={clinicName} onBellPress={() => navigation.navigate('Notifications')} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 14 }}>
      <View><AppText variant="tiny" color="muted">رحلة المتابعة</AppText><AppText variant="page" weight="bold">التقدم</AppText><AppText variant="support" color="muted">ملخص انتظام {childName || 'الطفل'} وتقدمه مع التمارين.</AppText></View>
      <View style={{ flexDirection: 'row-reverse', padding: 3, borderRadius: 12, backgroundColor: colors.blueSoft }}>{periods.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: item === period }} onPress={() => setPeriod(item)} style={{ flex: 1, minHeight: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: item === period ? colors.surface : 'transparent' }}><AppText variant="tiny" weight={item === period ? 'semibold' : 'regular'} color={item === period ? 'text' : 'muted'} style={{ textAlign: 'center' }}>{item}</AppText></Pressable>)}</View>
      {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} /> : error ? <EmptyState icon={ChartNoAxesColumn} title="تعذر تحميل التقدم" description={error} /> : <>
        <View style={{ flexDirection: 'row-reverse', gap: 9 }}><SurfaceCard style={{ flex: 1, padding: 13, gap: 3 }}><AppText variant="tiny" color="muted">جلسات مكتملة</AppText><AppText variant="section" weight="bold">{done}</AppText><View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}><CircleCheck size={14} color={colors.blue} /><AppText variant="tiny" color="blue">خلال {period}</AppText></View></SurfaceCard><SurfaceCard style={{ flex: 1, padding: 13, gap: 3 }}><AppText variant="tiny" color="muted">أيام متتالية</AppText><AppText variant="section" weight="bold">{streak}</AppText><View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}><Flame size={14} color={colors.orangeText} /><AppText variant="tiny" color="orangeText">الانتظام الحالي</AppText></View></SurfaceCard></View>
        <AppText variant="section" weight="bold">نشاط {period}</AppText>
        <SurfaceCard style={{ padding: 15, gap: 15 }}><View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}><AppText variant="support" weight="semibold">{done} جلسات</AppText><AppText variant="tiny" color="muted">الجلسات المكتملة</AppText></View><View style={{ height: 124, flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 9 }}>{bars.map((bar, index) => <Pressable key={index} onPress={() => setSelectedBar(current => current === index ? null : index)} style={{ flex: 1, alignItems: 'center', gap: 5 }}><View style={{ width: '100%', height: 94, borderRadius: 7, backgroundColor: colors.blueSoft, justifyContent: 'flex-end', overflow: 'hidden' }}><View style={{ width: '100%', height: `${Math.max(4, bar.count / max * 100)}%`, borderRadius: 7, backgroundColor: bar.current ? colors.orange : colors.blue }} /></View><AppText variant="tiny" color={bar.current ? 'blue' : 'muted'} style={{ textAlign: 'center' }}>{bar.label}</AppText></Pressable>)}</View>{selectedBar !== null && <AppText variant="tiny" color="muted" style={{ textAlign: 'center' }}>{bars[selectedBar]?.count || 0} جلسات في {bars[selectedBar]?.label}</AppText>}</SurfaceCard>
        <AppText variant="section" weight="bold">الأهداف العلاجية</AppText>
        {goalsError ? <Message tone="error">تعذر تحميل الأهداف. حاول مجددًا لاحقًا.</Message> : goals.length ? goals.map(goal => <GoalCard key={goal.id} title={goal.title} status={goal.status} remaining={remainingLabel(goal)} criteria={goal.success_criteria} endDate={goal.end_date ? `حتى ${formatDate(goal.end_date)}` : null} />) : <EmptyState icon={Target} title="لا توجد أهداف بعد" description="ستظهر أهداف الطفل هنا عند إضافتها من الأخصائي." />}
        <AppText variant="section" weight="bold">أحدث الجلسات</AppText>
        {recent.length ? <SurfaceCard style={{ paddingHorizontal: 13 }}>{recent.map((item, index) => <View key={item.id || index} style={{ minHeight: 64, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}><View style={{ width: 35, height: 35, borderRadius: 10, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' }}><Check size={17} color={colors.blue} /></View><View style={{ flex: 1 }}><AppText variant="support" weight="semibold">{item.exercise_title || 'تمرين علاجي'}</AppText><AppText variant="tiny" color="muted">{formatDate(item.feedback_date || item.created_at)}</AppText></View><AppText variant="tiny" color="blue">{item.completion_status === 'completed' ? 'مكتمل' : item.completion_status === 'skipped' ? 'لم يُنفذ' : 'جزئي'}</AppText></View>)}</SurfaceCard> : <EmptyState icon={CalendarDays} title="لا توجد جلسات مسجلة بعد" description="ستظهر هنا بعد تسجيل تنفيذ التمارين." />}
      </>}
    </ScrollView>
  </View>
}
