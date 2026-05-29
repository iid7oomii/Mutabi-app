import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header'
import { apiGet } from '../utils/api'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

export default function ProfileScreen() {
  const navigation = useNavigation()
  const [user, setUser]           = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
        setLoading(true)
        setError('')
        fetchData()
    }, [])
    )

    const fetchData = async () => {
    try {
        const res = await apiGet('/dashboard/parent')
        const json = await res.json()
        if (res.ok) {
        setUser({
            first_name: json.parent_name?.split(' ')[0],
            second_name: json.parent_name?.split(' ').slice(1).join(' '),
            email: json.email,
        })
        setDashboard(json)
        }
    } catch {
    } finally {
        setLoading(false)
    }
    }

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token')
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
          },
        },
      ]
    )
  }

  const displayName = user
    ? `${user.first_name} ${user.second_name}`
    : 'مستخدم'

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.second_name?.[0] || ''}`.toUpperCase()
    : 'U'

  const children = dashboard?.child ? [dashboard.child] : []

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={BLUE} size="large" />
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <Header
        clinicName={dashboard?.clinic_name}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => navigation.navigate('EditProfile', {
                first_name:  user?.first_name  || '',
                second_name: user?.second_name || '',
                phone:       dashboard?.phone  || '',
              })}
            >
              <Ionicons name="pencil" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color="#aaa" />
            <Text style={styles.infoText}>{dashboard?.email || '—'}</Text>
          </View>
          {/* Phone hidden from /auth/me response, shown if available */}
        </View>

        {/* My Children */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>أطفالي</Text>
          <TouchableOpacity
            style={styles.addChildBtn}
            onPress={() => navigation.navigate('AddChild')}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={styles.addChildText}>إضافة طفل</Text>
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={32} color="#ccc" />
            <Text style={styles.emptyText}>لا يوجد أطفال مسجلون بعد</Text>
          </View>
        ) : (
          children.map((child, i) => (
            <View key={child.id || i} style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Ionicons name="person" size={20} color={BLUE} />
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                {child.plan_status && (
                  <Text style={styles.childPlan}>
                    الخطة: <Text style={{ color: ORANGE }}>{child.plan_status}</Text>
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditChild', { child, childId: child.id })}
              >
                <Ionicons name="pencil-outline" size={18} color="#aaa" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Settings Section */}
        <Text style={styles.sectionTitle2}>الحساب</Text>
        {[
          { icon: 'lock-closed-outline', label: 'تغيير كلمة المرور', color: '#555', action: () => navigation.navigate('ChangePassword') },
          { icon: 'log-out-outline',     label: 'تسجيل الخروج',      color: '#dc2626', action: handleLogout },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.settingsRow}
            onPress={item.action || (() => Alert.alert(item.label, 'قادم قريباً.'))}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, item.label === 'تسجيل الخروج' && styles.settingsIconRed]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[styles.settingsLabel, { flex: 1 }, item.label === 'تسجيل الخروج' && { color: '#dc2626' }]}>
              {item.label}
            </Text>
            {item.label !== 'تسجيل الخروج' && (
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            )}
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 32 },

  profileCard:   { backgroundColor: BLUE, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 28, gap: 8 },
  avatarWrap:    { position: 'relative', marginBottom: 4 },
  avatar:        { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText:    { fontSize: 28, fontWeight: '700', color: '#fff' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BLUE },
  profileName:   { fontSize: 20, fontWeight: '700', color: '#fff' },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText:      { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  sectionHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  addChildBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: ORANGE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addChildText:   { fontSize: 12, color: '#fff', fontWeight: '700' },
  childCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  childAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  childInfo:      { flex: 1 },
  childName:      { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  childPlan:      { fontSize: 12, color: '#888', marginTop: 2 },
  emptyCard:      { backgroundColor: '#fff', borderRadius: 14, padding: 30, alignItems: 'center', gap: 10, marginBottom: 24 },
  emptyText:      { fontSize: 14, color: '#aaa' },

  sectionTitle2:  { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 12, marginTop: 8 },
  settingsRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  settingsIcon:   { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  settingsIconRed:{ backgroundColor: '#FFEBEE' },
  settingsLabel:  { fontSize: 14, color: '#333', fontWeight: '500' },
})
