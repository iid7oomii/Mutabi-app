import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { apiPut } from '../utils/api'

const BLUE = '#1F6FEB'

export default function ChangePasswordScreen() {
  const navigation = useNavigation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld]         = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    setLoading(true)
    try {
      const res  = await apiPut('/auth/reset-password', { old_password: oldPassword, new_password: newPassword })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'فشل تغيير كلمة المرور')
        return
      }
      Alert.alert('تم', 'تم تغيير كلمة المرور بنجاح', [
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تغيير كلمة المرور</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <PasswordField
            label="كلمة المرور الحالية"
            value={oldPassword}
            onChangeText={setOldPassword}
            show={showOld}
            onToggle={() => setShowOld(v => !v)}
          />
          <PasswordField
            label="كلمة المرور الجديدة"
            value={newPassword}
            onChangeText={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
          />
          <PasswordField
            label="تأكيد كلمة المرور الجديدة"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
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

function PasswordField({ label, value, onChangeText, show, onToggle }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          textAlign="right"
          autoCapitalize="none"
          placeholder="••••••••"
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  scroll:      { padding: 20, paddingBottom: 40 },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  fieldWrap:   { gap: 6 },
  label:       { fontSize: 13, fontWeight: '600', color: '#555', textAlign: 'right' },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa' },
  input:       { flex: 1, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: '#1a1a2e' },
  eyeBtn:      { paddingHorizontal: 12, paddingVertical: 12 },
  errorText:   { fontSize: 13, color: '#dc2626', textAlign: 'center', backgroundColor: '#fff5f5', padding: 10, borderRadius: 8 },
  submitBtn:   { backgroundColor: BLUE, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  submitText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
})
