import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Activity, CalendarDays, CircleCheck, Clock3, Repeat2 } from 'lucide-react-native'
import Header from '../../components/ui/Header'
import { ActionButton, AppText, EmptyState, StatusBadge, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet, getLocalSessions, localDayName, todayString } from '../../services/api/client'
import { useChild } from '../../store/ChildContext'

const weekDays = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
function weekDates() {
  const today = new Date()
  const index = (today.getDay() + 6) % 7
  return weekDays.map((name, offset) => {
    const day = new Date(today)
    day.setDate(today.getDate() - index + offset)
    return { name, date: day.getDate(), today: offset === index }
  })
}

export default function TherapyScreen({ activeTab }) {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { selectedChildId, ready } = useChild()
  const [dashboard, setDashboard] = useState(null)
  const [completedIds, setCompletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useFocusEffect(useCallback(() => {
    if (!ready || activeTab !== 'Therapy') return undefined
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const suffix = selectedChildId ? `&child_id=${selectedChildId}` : ''
        const [response, sessions] = await Promise.all([apiGet(`/dashboard/parent?day=${localDayName()}${suffix}`), getLocalSessions()])
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'تعذر تحميل التمارين')
        if (active) {
          setDashboard(data)
          setCompletedIds(sessions.filter(item => item.date === todayString() && item.completion_status === 'completed').map(item => item.plan_exercise_id))
        }
      } catch (cause) { if (active) setError(cause.message || 'تعذر الاتصال بالخادم') }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [ready, selectedChildId, activeTab]))

  const exercises = dashboard?.today_exercises || []
  const completedCount = exercises.filter(item => completedIds.includes(item.id)).length
  const firstPending = exercises.findIndex(item => !completedIds.includes(item.id))
  const dates = weekDates()
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <Header clinicName={dashboard?.clinic_name} onBellPress={() => navigation.navigate('Notifications')} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 14 }}>
      <View><AppText variant="tiny" color="muted">الخطة العلاجية</AppText><AppText variant="page" weight="bold">تمارين اليوم</AppText><AppText variant="support" color="muted">{exercises.length} تمارين مخصصة لهذا اليوم</AppText></View>
      <SurfaceCard style={{ padding: 12 }}><View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>{dates.map(day => <View key={day.name} style={{ flex: 1, alignItems: 'center', gap: 5 }}><AppText variant="tiny" weight={day.today ? 'semibold' : 'regular'} color={day.today ? 'blue' : 'muted'} style={{ textAlign: 'center' }}>{day.name.slice(0, 2)}</AppText><View style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: day.today ? colors.blue : 'transparent' }}><AppText variant="tiny" weight="bold" color={day.today ? colors.surface : colors.text} style={{ textAlign: 'center' }}>{day.date}</AppText></View></View>)}</View></SurfaceCard>
      {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} /> : error ? <EmptyState icon={CalendarDays} title="تعذر تحميل التمارين" description={error} /> : <>
        <View style={{ paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}><AppText variant="section" weight="bold">خطة اليوم</AppText><AppText variant="support" color="blue">{completedCount} من {exercises.length} مكتمل</AppText></View>
        {!exercises.length ? <EmptyState icon={CalendarDays} title="لا توجد تمارين لليوم" description="ستظهر التمارين هنا عندما يضيفها الأخصائي إلى الخطة." /> : exercises.map((exercise, index) => {
          const completed = completedIds.includes(exercise.id)
          const next = index === firstPending
          const status = completed ? 'completed' : next ? 'next' : 'later'
          return <Pressable key={exercise.id} accessibilityRole="button" accessibilityLabel={`${exercise.exercise_title}، ${completed ? 'مكتمل' : next ? 'التالي' : 'لاحقًا'}`} onPress={() => navigation.navigate('ExerciseDetail', { exercise, isCompleted: completed })}>
            <SurfaceCard style={{ padding: 15, borderRightWidth: next ? 3 : 1, borderRightColor: next ? colors.blue : colors.border, gap: 8 }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}><View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: completed ? colors.blueSoft : next ? colors.orangeSoft : colors.canvas, alignItems: 'center', justifyContent: 'center' }}>{completed ? <CircleCheck size={19} color={colors.blue} /> : <Activity size={19} color={next ? colors.orangeText : colors.muted} />}</View><StatusBadge status={status} /></View>
              <AppText variant="card" weight="bold">{exercise.exercise_title}</AppText>
              {exercise.exercise_description ? <AppText variant="support" color="muted" numberOfLines={2}>{exercise.exercise_description}</AppText> : null}
              <View style={{ flexDirection: 'row-reverse', gap: 13 }}>{exercise.duration_minutes ? <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}><Clock3 size={14} color={colors.muted} /><AppText variant="tiny" color="muted">{exercise.duration_minutes} دقائق</AppText></View> : null}{exercise.reps ? <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}><Repeat2 size={14} color={colors.muted} /><AppText variant="tiny" color="muted">{exercise.reps} تكرارات</AppText></View> : null}</View>
              {next && <ActionButton title="عرض التمرين" onPress={() => navigation.navigate('ExerciseDetail', { exercise, isCompleted: false })} style={{ marginTop: 3 }} />}
            </SurfaceCard>
          </Pressable>
        })}
      </>}
    </ScrollView>
  </View>
}
