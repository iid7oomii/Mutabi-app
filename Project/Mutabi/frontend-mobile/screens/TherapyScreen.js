import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header'
import { apiGet, getLocalSessions, todayString } from '../utils/api'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const DAY_LABELS = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
const DAY_KEYS   = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const ICONS  = ['mic-outline', 'happy-outline', 'walk-outline', 'musical-notes-outline', 'fitness-outline', 'eye-outline']
const ICON_BG = ['#EEF3FA', '#FFF3E8', '#F0FFF4', '#F5F0FF', '#FFF0F0', '#F0FAFF']

function getWeekDates() {
  const today = new Date()
  const dayOfWeek = (today.getDay() + 6) % 7
  return DAY_LABELS.map((label, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    return { label, date: d.getDate(), isToday: i === dayOfWeek }
  })
}

function StatusBadge({ status }) {
  const configs = {
    completed: { bg: '#E8F5E9', color: '#2E7D32', label: 'مكتمل',         icon: 'checkmark-circle' },
    upcoming:  { bg: '#FFF3E8', color: ORANGE,    label: 'التالي',         icon: null },
    pending:   { bg: '#F5F5F5', color: '#888',    label: 'قيد الانتظار',  icon: null },
    bonus:     { bg: '#EEF3FA', color: BLUE,      label: 'إضافي',         icon: null },
  }
  const c = configs[status] || configs.pending
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
      {c.icon && <Ionicons name={c.icon} size={12} color={c.color} />}
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  )
}

export default function TherapyScreen({ onTabPress }) {
  const navigation = useNavigation()
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [completed, setCompleted]     = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayExercises, setDayExercises] = useState(null)
  const [loadingDay, setLoadingDay]   = useState(false)

  const weekDates = getWeekDates()

	const fetchData = async () => {
		try {
			const res = await apiGet('/dashboard/parent')
			const json = await res.json()
			if (!res.ok) { setError(json.error || 'خطأ'); return }
			setData(json)
		} catch {
			setError('تعذر الاتصال بالخادم')
		} finally {
			setLoading(false)
		}
	}

	const loadCompleted = async () => {
		const sessions = await getLocalSessions()
		const today = todayString()
		const ids = sessions
			.filter(s => s.date === today && s.completion_status === 'completed')
			.map(s => s.plan_exercise_id)
		setCompleted(ids)
	}

	useFocusEffect(
		useCallback(() => {
			setLoading(true)
			setError('')
			setSelectedDay(null)
			setDayExercises(null)
			fetchData()
			loadCompleted()
		}, [])
	)

		const handleDayPress = (dayIndex, isToday) => {
			if (!isToday) return
		}

  const getStatus = (exercise, index) => {
    if (completed.includes(exercise.id)) return 'completed'
    const firstPending = (data?.today_exercises || []).findIndex(e => !completed.includes(e.id))
    if (index === firstPending) return 'upcoming'
    if (index > (data?.today_exercises?.length - 1) * 0.75) return 'bonus'
    return 'pending'
  }

  const getActionLabel = status => {
    if (status === 'completed') return 'مراجعة'
    if (status === 'upcoming')  return 'ابدأ الآن'
    return 'عرض التفاصيل'
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={BLUE} size="large" />
    </View>
  )

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  )
	

  const exercises = data?.today_exercises || []

  return (
    <View style={{ flex: 1 }}>
      <Header
        clinicName={data?.clinic_name}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>تمارين اليوم</Text>
        <Text style={styles.subtitle}>
          {selectedDay !== null
            ? `تمارين ${DAY_LABELS[selectedDay]}`
            : `${exercises.length} تمرين مخصص لليوم`}
        </Text>

        {/* Week Calendar */}
				<View style={styles.calendar}>
					{weekDates.map(({ label, date, isToday }, i) => {
						const isActive = selectedDay !== null ? selectedDay === i : isToday
						return (
							<TouchableOpacity
								key={label}
								style={styles.dayCol}
								onPress={() => handleDayPress(i, isToday)}
							>
								<Text style={[styles.dayLabel, isActive && styles.dayLabelToday]}>
									{label}
								</Text>
								<View style={[styles.dayCircle, isActive && styles.dayCircleToday]}>
									<Text style={[styles.dayNum, isActive && styles.dayNumToday]}>
										{date}
									</Text>
								</View>
							</TouchableOpacity>
						)
					})}
				</View>

        {/* Exercise Cards */}
				{loadingDay ? (
					<ActivityIndicator color={BLUE} style={{ marginTop: 20 }} />
				) : selectedDay !== null && !loadingDay && dayExercises !== null ? (
          dayExercises.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color="#aaa" />
              <Text style={styles.emptyText}>لا تمارين لهذا اليوم</Text>
            </View>
          ) : (
            dayExercises.map((ex, i) => (
              <TouchableOpacity
                key={ex.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ExerciseDetail', { exercise: ex })}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: ICON_BG[i % ICON_BG.length] }]}>
                    <Ionicons name={ICONS[i % ICONS.length]} size={22} color={BLUE} />
                  </View>
                </View>
                <Text style={styles.cardTitle}>{ex.exercise_title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{ex.exercise_description}</Text>
                {ex.duration_minutes ? (
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={13} color="#888" />
                    <Text style={styles.durationText}>{ex.duration_minutes} mins</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))
          )
        ) : exercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color="#aaa" />
            <Text style={styles.emptyText}>لا تمارين لليوم</Text>
          </View>
        ) : (
					exercises.map((ex, i) => {
						const status = getStatus(ex, i)
						return (
							<TouchableOpacity
								key={ex.id}
								style={styles.cardBlue}
								activeOpacity={0.8}
								onPress={() => navigation.navigate('ExerciseDetail', { exercise: ex })}
							>
								<View style={styles.cardTop}>
									<View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
										<Ionicons name={ICONS[i % ICONS.length]} size={22} color="#fff" />
									</View>
									<StatusBadge status={status} />
								</View>
								<Text style={styles.cardTitleWhite}>{ex.exercise_title}</Text>
								<Text style={styles.cardDescWhite} numberOfLines={2}>{ex.exercise_description}</Text>
								<View style={styles.cardFooter}>
									{ex.duration_minutes ? (
										<View style={styles.durationRow}>
											<Ionicons name="time-outline" size={13} color="#cce0ff" />
											<Text style={[styles.durationText, { color: '#cce0ff' }]}>{ex.duration_minutes} mins</Text>
										</View>
									) : <View />}
									<TouchableOpacity
												style={[styles.actionBtn, status === 'completed' && styles.actionBtnGrey]}
												onPress={() => {
													if (status === 'completed') return
													navigation.navigate('ExerciseDetail', { exercise: ex })
												}}
											>
										<Text style={[styles.actionText, status === 'completed' && { color: '#555' }]}>
											{getActionLabel(status)}
										</Text>
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						)
					})
        )}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText:        { color: '#dc2626', fontSize: 14 },
  scroll:           { padding: 20, paddingBottom: 24 },
  title:            { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subtitle:         { fontSize: 13, color: '#888', marginBottom: 20 },
  calendar:         { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  dayCol:           { alignItems: 'center', gap: 6 },
  dayLabel:         { fontSize: 11, color: '#aaa', fontWeight: '600' },
  dayLabelToday:    { color: ORANGE },
  dayCircle:        { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayCircleToday: { backgroundColor: ORANGE, borderRadius: 16 },
  dayNum:           { fontSize: 13, color: '#555', fontWeight: '600' },
  dayNumToday:      { color: '#fff' },
  card:             { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHighlight:    { backgroundColor: BLUE },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  iconWrap:         { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:        { fontSize: 11, fontWeight: '700' },
  cardTitle:        { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  cardTitleWhite:   { color: '#fff' },
  cardDesc:         { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 12 },
  cardDescWhite:    { color: '#cce0ff' },
  cardFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  durationRow:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  durationText:     { fontSize: 12, color: '#888' },
  actionBtn:        { backgroundColor: ORANGE, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  actionBtnGrey:    { backgroundColor: '#f0f0f0' },
  actionText:       { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyCard:        { alignItems: 'center', padding: 40, gap: 12 },
  emptyText:        { color: '#aaa', fontSize: 14 },
	cardBlue: { backgroundColor: BLUE, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#1F6FEB', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
})