import { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { Baby, Bell, Camera, ChevronLeft, LockKeyhole, LogOut, Plus, UserRoundPen } from 'lucide-react-native'
import Header from '../../components/ui/Header'
import { ActionButton, AppText, EmptyState, SurfaceCard } from '../../components/ui/design-system/components'
import { ThemeToggle } from '../../components/ui/design-system/templates'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet } from '../../services/api/client'
import { API_BASE } from '../../services/api/config'
import { useChild } from '../../store/ChildContext'

export default function ProfileScreen({ activeTab }) {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { selectedChildId, switchChild, clearChild, ready } = useChild()
  const [dashboard, setDashboard] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const load = async childId => {
    setLoading(true)
    setError('')
    try {
      const response = await apiGet(childId ? `/dashboard/parent?child_id=${childId}` : '/dashboard/parent')
      const data = await response.json()
      if (response.status === 401) {
        await AsyncStorage.removeItem('token')
        await clearChild()
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
        return
      }
      if (!response.ok) throw new Error(data.error || 'تعذر تحميل الملف')
      setDashboard(data)
      setPhotoUrl(data.profile_picture_url || null)
      if (!childId && data.children?.[0]) await switchChild(data.children[0].id)
    } catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم') }
    finally { setLoading(false) }
  }
  useFocusEffect(useCallback(() => { if (ready && activeTab === 'Profile') load(selectedChildId) }, [ready, selectedChildId, activeTab]))

  const uploadPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permission.status !== 'granted') { Alert.alert('إذن مطلوب', 'يرجى السماح بالوصول إلى الصور.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: .8 })
    if (result.canceled || !result.assets?.[0]) return
    setUploading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const asset = result.assets[0]
      const form = new FormData()
      form.append('file', { uri: asset.uri, name: 'avatar.jpg', type: asset.mimeType || 'image/jpeg' })
      const response = await fetch(`${API_BASE}/api/v1/upload/avatar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
      if (!response.ok) throw new Error()
      const data = await response.json()
      setPhotoUrl(data.url)
    } catch { Alert.alert('تعذر رفع الصورة', 'حاول مجددًا.') }
    finally { setUploading(false) }
  }
  const logout = () => Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج من الحساب؟', [
    { text: 'إلغاء', style: 'cancel' },
    { text: 'تسجيل الخروج', style: 'destructive', onPress: async () => { await AsyncStorage.removeItem('token'); await clearChild(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) } },
  ])

  const children = dashboard?.children || []
  const selectedChild = children.find(child => String(child.id) === String(selectedChildId)) || children[0]
  const name = dashboard?.parent_name || 'الملف الشخصي'
  const settings = [
    { title: 'تعديل الملف', Icon: UserRoundPen, onPress: () => navigation.navigate('EditProfile', { first_name: name.split(' ')[0] || '', second_name: name.split(' ').slice(1).join(' '), phone: dashboard?.phone || '' }) },
    { title: 'تغيير كلمة المرور', Icon: LockKeyhole, onPress: () => navigation.navigate('ChangePassword') },
    { title: 'تذكيرات الأهداف', Icon: Bell, onPress: () => navigation.navigate('GoalReminderSettings') },
    { title: 'تسجيل الخروج', Icon: LogOut, onPress: logout, danger: true },
  ]
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <Header clinicName={dashboard?.clinic_name} onBellPress={() => navigation.navigate('Notifications')} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 15 }}>
      <View><AppText variant="tiny" color="muted">الحساب والتفضيلات</AppText><AppText variant="page" weight="bold">الملف الشخصي</AppText><AppText variant="support" color="muted">بيانات الحساب والأطفال والتفضيلات.</AppText></View>
      {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} /> : error || !dashboard ? <EmptyState icon={Baby} title="تعذر تحميل الملف" description={error || 'حاول مجددًا.'} action={<ActionButton title="إعادة المحاولة" variant="secondary" onPress={() => load(selectedChildId)} />} /> : <>
        <SurfaceCard style={{ padding: 15, flexDirection: 'row-reverse', alignItems: 'center', gap: 11 }}><Pressable onPress={uploadPhoto} accessibilityRole="button" accessibilityLabel="تغيير الصورة الشخصية" disabled={uploading} style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{uploading ? <ActivityIndicator color={colors.blue} /> : photoUrl ? <Image source={{ uri: photoUrl }} style={{ width: 50, height: 50 }} /> : <AppText variant="section" weight="bold" color="blue">{name[0]}</AppText>}<View style={{ position: 'absolute', bottom: 0, left: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' }}><Camera size={11} color={colors.orangeOn} /></View></Pressable><View style={{ flex: 1 }}><AppText variant="support" weight="bold">{name}</AppText><AppText variant="tiny" color="muted">{dashboard.email || '—'}</AppText></View></SurfaceCard>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}><AppText variant="section" weight="bold">الأطفال</AppText><Pressable accessibilityRole="button" onPress={() => navigation.navigate('AddChild')} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}><Plus size={16} color={colors.orangeText} /><AppText variant="support" color="orangeText" weight="semibold">إضافة طفل</AppText></Pressable></View>
        {children.length > 1 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>{children.map(child => { const selected = child.id === selectedChild?.id; return <Pressable key={child.id} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => switchChild(String(child.id))} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 99, backgroundColor: selected ? colors.blue : colors.surface, borderWidth: 1, borderColor: selected ? colors.blue : colors.border }}><AppText variant="support" color={selected ? colors.surface : colors.text}>{child.name}</AppText></Pressable> })}</ScrollView>}
        {selectedChild ? <Pressable accessibilityRole="button" onPress={() => navigation.navigate('EditChild', { childId: selectedChild.id })}><SurfaceCard style={{ padding: 14, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}><View style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' }}><Baby size={20} color={colors.blue} /></View><View style={{ flex: 1 }}><AppText variant="support" weight="semibold">{selectedChild.name}</AppText><AppText variant="tiny" color="muted">{dashboard.active_plan ? 'الخطة العلاجية نشطة' : 'لا توجد خطة نشطة'}</AppText></View><ChevronLeft size={17} color={colors.muted} /></SurfaceCard></Pressable> : <EmptyState icon={Baby} title="لا يوجد أطفال مسجلون" description="يمكن إضافة طفل من الزر أعلاه." />}
        <AppText variant="section" weight="bold">الإعدادات</AppText>
        <SurfaceCard style={{ paddingHorizontal: 13 }}>{settings.map((item, index) => <Pressable key={item.title} accessibilityRole="button" onPress={item.onPress} style={{ minHeight: 55, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}><View style={{ width: 35, height: 35, borderRadius: 10, backgroundColor: item.danger ? colors.orangeSoft : colors.blueSoft, alignItems: 'center', justifyContent: 'center' }}><item.Icon size={18} color={item.danger ? colors.error : colors.blue} /></View><AppText variant="support" weight="semibold" color={item.danger ? 'error' : 'text'} style={{ flex: 1 }}>{item.title}</AppText>{!item.danger && <ChevronLeft size={16} color={colors.muted} />}</Pressable>)}</SurfaceCard>
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}><AppText variant="support" color="muted">المظهر</AppText><ThemeToggle /></View>
      </>}
    </ScrollView>
  </View>
}
