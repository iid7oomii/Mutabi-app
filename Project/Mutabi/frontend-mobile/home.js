import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, FontAwesome, FontAwesome6 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const BLUE = '#1F6FEB'
const ORANGE = '#FF7A00'
const IP = 'http://192.168.1.50:5000'

export default function Home({ navigation }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const articles = []

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token')
        const res = await fetch(`${IP}/api/v1/dashboard/parent`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || 'حدث خطأ')
          return
        }
        setData(json)
      } catch {
        setError('تعذر تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 18) return 'مساء الخير'
    return 'مساء النور'
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarBox}>
            <Ionicons name="person" size={18} color={BLUE} />
          </View>
          <Text style={styles.clinicName}>{data?.clinic_name || 'العيادة'}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Greeting */}
        <Text style={styles.greeting}>{greeting()}، {data?.parent_name}</Text>

        {/* Priority Goal Card */}
        <View>
            {data?.today_exercises?.length > 0 ? (
            <LinearGradient
                colors={['#1F6FEB', '#0a3d9e', '#0F4C81']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goalCard}
            >
                <Text style={styles.goalTitle}>{data.today_exercises[0].exercise_title}</Text>
                <Text style={styles.goalStatus}>{data.today_exercises[0].exercise_description}</Text>
                <View style={styles.goalMeta}>
                {data.today_exercises[0].duration_minutes && (
                    <>
                    <Ionicons name="time-outline" size={14} color="#ccc" />
                    <Text style={styles.goalMetaText}>{data.today_exercises[0].duration_minutes} دقيقة</Text>
                    </>
                )}
                {data.today_exercises[0].reps && (
                    <>
                    <Ionicons name="repeat-outline" size={14} color="#ccc" style={{ marginLeft: 12 }} />
                    <Text style={styles.goalMetaText}>{data.today_exercises[0].reps} تكرار</Text>
                    </>
                )}
                </View>
                <TouchableOpacity style={styles.startBtn}>
                <Text style={styles.startBtnText}>ابدأ الجلسة ←</Text>
                </TouchableOpacity>
            </LinearGradient>
            ) : (
            <View style={styles.emptyGoalCard}>
                <Ionicons name="calendar-outline" size={32} color="#aaa" />
                <Text style={styles.emptyGoalText}>لا يوجد تمرين لهذا اليوم</Text>
            </View>
            )}
        </View>

        {/* Doctor's Notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ملاحظات الدكتور</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>عرض الكل</Text>
          </TouchableOpacity>
        </View>

        {data?.latest_note ? (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <View style={styles.doctorAvatar}>
                <Ionicons name="person" size={18} color={BLUE} />
              </View>
              <View>
                <Text style={styles.doctorName}>{data.latest_note.doctor_name}</Text>
                <Text style={styles.doctorSpecialty}>
                  {data.latest_note.doctor_specialty || 'معالج وظيفي'} • منذ قليل
                </Text>
              </View>
            </View>
            <View style={styles.noteLine} />
            <Text style={styles.noteContent}>"{data.latest_note.content}"</Text>
          </View>
        ) : (
          <View style={styles.noteCard}>
            <Text style={styles.emptyText}>لا توجد ملاحظات بعد</Text>
          </View>
        )}

        {/* Articles */}
        <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>مقالات توعوية</Text>
        <TouchableOpacity>
            <Text style={styles.viewAll}>استكشف المكتبة</Text>
        </TouchableOpacity>
        </View>

        {articles.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.articlesRow}>
            {articles.map((article, i) => (
            <TouchableOpacity key={i} style={styles.articleCard}>
                <View style={styles.articleImg} />
                <Text style={styles.articleTag}>{article.tag}</Text>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleDesc} numberOfLines={2}>{article.desc}</Text>
            </TouchableOpacity>
            ))}
        </ScrollView>
        ) : (
        <View style={styles.noteCard}>
            <Text style={styles.emptyText}>لا يوجد مقالات حالياً</Text>
        </View>
        )}

        {/* Bottom Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>سلسلة أسبوعية</Text>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>
                {data?.weekly_streak ? `${data.weekly_streak} أيام` : 'لا يوجد'}
              </Text>
              <FontAwesome6 name="fire" size={20} color={data?.weekly_streak ? ORANGE : '#ccc'} />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>الموعد القادم</Text>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>
                {data?.upcoming_appointment
                  ? new Date(data.upcoming_appointment.appointment).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })
                  : 'لا يوجد'}
              </Text>
              <FontAwesome name="calendar-o" size={20} color={BLUE} />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <View style={styles.tabActive}>
            <Ionicons name="home" size={22} color="#fff" />
          </View>
          <Text style={styles.tabLabelActive}>الرئيسية</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="medical-outline" size={22} color="#888" />
          <Text style={styles.tabLabel}>العلاج</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="bar-chart-outline" size={22} color="#888" />
          <Text style={styles.tabLabel}>التقدم</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={22} color="#888" />
          <Text style={styles.tabLabel}>الملف</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: 'red', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  clinicName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  scroll: { padding: 20, paddingBottom: 100 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4, textAlign: 'right' },
  subGreeting: { fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'right' },
  goalCard: { borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#1F6FEB', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  goalBadge: { backgroundColor: ORANGE, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  goalBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  goalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  goalMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  goalMetaText: { color: '#ccc', fontSize: 13 },
  startBtn: { backgroundColor: ORANGE, borderRadius: 10, height: 44, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  emptyGoalCard: { backgroundColor: '#f0f4ff', borderRadius: 16, padding: 30, marginBottom: 24, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#dce8ff', borderStyle: 'dashed' },
  emptyGoalText: { fontSize: 14, color: '#aaa', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  viewAll: { fontSize: 13, color: ORANGE },
  noteCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  doctorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  doctorSpecialty: { fontSize: 12, color: '#888' },
  noteLine: { width: 3, height: 60, backgroundColor: ORANGE, borderRadius: 2, position: 'absolute', left: 68, top: 52 },
  noteContent: { fontSize: 13, color: '#444', lineHeight: 20, paddingLeft: 16 },
  emptyText: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 10 },
  articlesRow: { marginBottom: 24 },
  articleCard: { width: 200, backgroundColor: '#fff', borderRadius: 14, marginRight: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  articleImg: { width: '100%', height: 120, backgroundColor: '#e8f0fe' },
  articleTag: { fontSize: 11, color: ORANGE, fontWeight: '600', paddingHorizontal: 12, paddingTop: 10 },
  articleTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', paddingHorizontal: 12, paddingTop: 4 },
  articleDesc: { fontSize: 12, color: '#888', paddingHorizontal: 12, paddingVertical: 8 },
  emptyCard: { width: 200, backgroundColor: '#fff', borderRadius: 14, padding: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  statValue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingVertical: 10, paddingHorizontal: 20 },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabActive: { backgroundColor: ORANGE, borderRadius: 12, padding: 6 },
  tabLabel: { fontSize: 11, color: '#888' },
  tabLabelActive: { fontSize: 11, color: ORANGE, fontWeight: '600' },
  goalStatus: { color: '#fff', fontSize: 13, marginTop: 4, opacity: 0.8 },
})