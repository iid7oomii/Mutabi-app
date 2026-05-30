import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { apiGet, apiPut } from '../utils/api'

const BLUE = '#1F6FEB'

export default function EditProfileScreen() {
  const navigation = useNavigation()
  const route      = useRoute()
  const insets     = useSafeAreaInsets()

  const [firstName,  setFirstName]  = useState(route.params?.first_name  || '')
  const [secondName, setSecondName] = useState(route.params?.second_name || '')
  const [phone,      setPhone]      = useState(route.params?.phone       || '')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const handleSave = async () => {
    setError('')
    if (!firstName.trim() || !secondName.trim()) {
      setError('الاسم الأول والأخير مطلوبان')
      return
    }
    setLoading(true)
    try {
      const res  = await apiPut('/users/me', {
        first_name:  firstName.trim(),
        second_name: secondName.trim(),
        phone:       phone.trim(),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'فشل حفظ البيانات')
        return
      }
      Alert.alert('تم', 'تم تحديث بياناتك بنجاح', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ])
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Field label="الاسم الأول" value={firstName} onChangeText={setFirstName} placeholder="محمد" />
          <Field label="الاسم الأخير" value={secondName} onChangeText={setSecondName} placeholder="العمري" />
          <Field label="رقم الجوال" value={phone} onChangeText={setPhone} placeholder="05xxxxxxxx" keyboardType="phone-pad" />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>حفظ التغييرات</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

function Field({ label, value, onChangeText, placeholder, keyboardType }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        textAlign="right"
        keyboardType={keyboardType || 'default'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  scroll:      { padding: 20, paddingBottom: 40 },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  fieldWrap:   { gap: 6 },
  label:       { fontSize: 13, fontWeight: '600', color: '#555', textAlign: 'right' },
  input:       { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa', paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: '#1a1a2e' },
  errorText:   { fontSize: 13, color: '#dc2626', textAlign: 'center', backgroundColor: '#fff5f5', padding: 10, borderRadius: 8 },
  submitBtn:   { backgroundColor: BLUE, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  submitText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
})
