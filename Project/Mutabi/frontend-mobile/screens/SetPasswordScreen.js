import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { apiPut } from '../utils/api'

const BLUE = '#1F6FEB'

export default function SetPasswordScreen({ navigation }) {
  const [tempPassword, setTempPassword]       = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showTemp, setShowTemp]               = useState(false)
  const [showNew, setShowNew]                 = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')

  const handleSetPassword = async () => {
    if (!tempPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res  = await apiPut('/auth/set_password', { tempPassword, newPassword })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ، يرجى المحاولة مرة أخرى')
        return
      }
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.iconWrapper}>
            <Ionicons name="lock-closed" size={36} color={BLUE} />
          </View>
          <Text style={styles.title}>تفعيل الحساب</Text>
          <Text style={styles.subtitle}>
            أدخل كلمة المرور المؤقتة التي وصلتك عبر البريد الإلكتروني، ثم اختر كلمة مرور جديدة لحسابك.
          </Text>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Temp Password */}
          <Text style={styles.label}>كلمة المرور المؤقتة</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={tempPassword}
              onChangeText={setTempPassword}
              secureTextEntry={!showTemp}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowTemp(p => !p)}>
              <Ionicons name={showTemp ? 'eye' : 'eye-off'} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <Text style={styles.label}>كلمة المرور الجديدة</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNew(p => !p)}>
              <Ionicons name={showNew ? 'eye' : 'eye-off'} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>تأكيد كلمة المرور</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)}>
              <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Password hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وتشمل: حرف كبير، حرف صغير، رقم، ورمز خاص.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSetPassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>تفعيل الحساب</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  inner:          { paddingHorizontal: 32, paddingVertical: 48, flexGrow: 1 },
  iconWrapper:    { width: 72, height: 72, borderRadius: 20, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center', marginBottom: 20, alignSelf: 'center' },
  title:          { fontSize: 22, fontWeight: '700', color: '#1a1a2e', textAlign: 'center', marginBottom: 10 },
  subtitle:       { fontSize: 14, color: '#666', lineHeight: 22, textAlign: 'center', marginBottom: 28 },
  errorBox:       { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText:      { color: '#dc2626', fontSize: 13, textAlign: 'center' },
  label:          { fontSize: 13, fontWeight: '500', color: '#444', marginBottom: 6, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, height: 48, backgroundColor: '#fff' },
  inputIcon:      { fontSize: 15, marginRight: 8, color: '#999' },
  input:          { flex: 1, fontSize: 14, color: '#333' },
  hintBox:        { backgroundColor: '#f8f9fb', borderRadius: 8, padding: 12, marginTop: 16 },
  hintText:       { color: '#888', fontSize: 12, lineHeight: 20 },
  button:         { backgroundColor: BLUE, borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  buttonText:     { color: '#fff', fontSize: 15, fontWeight: '600' },
})
