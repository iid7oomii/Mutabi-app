import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import Header from '../components/Header'
import { apiGet } from '../utils/api'
import { API_BASE } from '../config'
import { useChild } from '../contexts/ChildContext'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

export default function ProfileScreen() {
  const navigation = useNavigation()
  const { selectedChildId, switchChild, clearChild, ready } = useChild()
  const [user, setUser]                   = useState(null)
  const [dashboard, setDashboard]         = useState(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [profilePicUrl, setProfilePicUrl] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (!ready) return
    setLoading(true)
    setError('')
    fetchData(selectedChildId)
  }, [selectedChildId, ready])

  const fetchData = async (childId) => {
    try {
      const url = childId ? `/dashboard/parent?child_id=${childId}` : '/dashboard/parent'
      const res = await apiGet(url)
      let json
      try { json = await res.json() } catch { json = {} }

      if (res.status === 401) {
        await AsyncStorage.removeItem('token')
        await clearChild()
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
        return
      }

      if (!res.ok) {
        setError(json.error || 'فشل تحميل البيانات')
        return
      }

      setUser({
        first_name: json.parent_name?.split(' ')[0],
        second_name: json.parent_name?.split(' ').slice(1).join(' '),
        email: json.email,
      })
      setDashboard(json)
      setProfilePicUrl(json.profile_picture_url || null)
      if (!childId && json.children?.length > 0) {
        await switchChild(json.children[0].id)
      }
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleChildSwitch = async (childId) => {
    const id = String(childId)
    if (id === String(selectedChildId)) return
    await switchChild(id)
  }

  const handleAvatarUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('الإذن مطلوب', 'يرجى السماح بالوصول إلى معرض الصور.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    setUploadingAvatar(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const fd = new FormData()
      fd.append('file', {
        uri: asset.uri,
        name: 'avatar.jpg',
        type: asset.mimeType || 'image/jpeg',
      })
      const res = await fetch(`${API_BASE}/api/v1/upload/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        setProfilePicUrl(data.url)
      } else {
        Alert.alert('خطأ', 'فشل رفع الصورة.')
      }
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم.')
    } finally {
      setUploadingAvatar(false)
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
            await clearChild()
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

  const children = dashboard?.children || []
  const selectedChild = children.find(c => String(c.id) === String(selectedChildId)) || children[0] || null

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={BLUE} size="large" />
    </View>
  )

  if (!dashboard && !loading) return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={48} color="#ccc" />
      <Text style={{ color: '#888', marginTop: 12, textAlign: 'center', paddingHorizontal: 32 }}>
        {error || 'تعذر تحميل البيانات'}
      </Text>
      <TouchableOpacity
        onPress={() => { setLoading(true); setError(''); fetchData(selectedChildId) }}
        style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: BLUE, borderRadius: 12 }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>إعادة المحاولة</Text>
      </TouchableOpacity>
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
          <View style={styles.avatarWrap}>
            {profilePicUrl ? (
              <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={handleAvatarUpload}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={14} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={14} color="#aaa" />
            <Text style={styles.infoText}>{dashboard?.email || '—'}</Text>
          </View>
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
          <>
            {/* Child switcher pills */}
            {children.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsRow}
              >
                {children.map(child => {
                  const isActive = String(child.id) === String(selectedChildId || children[0]?.id)
                  return (
                    <TouchableOpacity
                      key={child.id}
                      style={[styles.pill, isActive && styles.pillActive]}
                      onPress={() => handleChildSwitch(child.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                        {child.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            )}

            {/* Selected child detail card */}
            {selectedChild && (
              <View style={styles.childCard}>
                <View style={styles.childAvatar}>
                  <Ionicons name="person" size={20} color={BLUE} />
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{selectedChild.name}</Text>
                  {dashboard?.active_plan ? (
                    <Text style={styles.childPlan}>
                      الخطة: <Text style={{ color: ORANGE }}>{dashboard.active_plan.status}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.childPlan}>لا توجد خطة نشطة</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditChild', { childId: selectedChild.id })}
                >
                  <Ionicons name="pencil-outline" size={18} color="#aaa" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Settings Section */}
        <Text style={styles.sectionTitle2}>الحساب</Text>
        {[
          { icon: 'person-outline',      label: 'تعديل الملف الشخصي', color: '#555', action: () => navigation.navigate('EditProfile', { first_name: user?.first_name || '', second_name: user?.second_name || '', phone: dashboard?.phone || '' }) },
          { icon: 'lock-closed-outline', label: 'تغيير كلمة المرور',  color: '#555', action: () => navigation.navigate('ChangePassword') },
          { icon: 'log-out-outline',     label: 'تسجيل الخروج',       color: '#dc2626', action: handleLogout },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.settingsRow}
            onPress={item.action || (() => Alert.alert(item.label, 'قادم قريباً.'))}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIcon, item.color === '#dc2626' && styles.settingsIconRed]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[styles.settingsLabel, { flex: 1 }, item.color === '#dc2626' && { color: '#dc2626' }]}>
              {item.label}
            </Text>
            {item.color !== '#dc2626' && (
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
  avatarImage:   { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText:    { fontSize: 28, fontWeight: '700', color: '#fff' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BLUE },
  profileName:   { fontSize: 20, fontWeight: '700', color: '#fff' },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText:      { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  sectionHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  addChildBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: ORANGE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addChildText:   { fontSize: 12, color: '#fff', fontWeight: '700' },

  pillsRow:      { gap: 8, paddingBottom: 12, paddingRight: 4 },
  pill:          { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f4ff', borderWidth: 1.5, borderColor: '#dce8ff' },
  pillActive:    { backgroundColor: BLUE, borderColor: BLUE },
  pillText:      { fontSize: 14, fontWeight: '600', color: '#555' },
  pillTextActive:{ color: '#fff' },

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
