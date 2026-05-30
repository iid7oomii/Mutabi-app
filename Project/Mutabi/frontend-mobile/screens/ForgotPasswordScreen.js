import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { apiPost } from '../utils/api'

const BLUE = '#1F6FEB'

export default function ForgotPasswordScreen() {
  const navigation = useNavigation()
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res  = await apiPost('/auth/forgot-password', { email: email.trim() })
      await res.json()
      setSuccess(true)
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
        style={styles.inner}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>

        {success ? (
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Ionicons name="mail-outline" size={40} color={BLUE} />
            </View>
            <Text style={styles.successTitle}>تم إرسال الرابط</Text>
            <Text style={styles.successBody}>
              إذا كان البريد الإلكتروني مسجلاً، ستجد رابط إعادة تعيين كلمة المرور في صندوق الوارد.
              الرابط صالح لمدة ساعة واحدة.
            </Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.loginBtnText}>العودة لتسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>نسيت كلمة المرور؟</Text>
              <Text style={styles.subtitle}>
                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.
              </Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope-o" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>إرسال رابط إعادة التعيين</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-forward" size={14} color={BLUE} />
              <Text style={styles.backLinkText}>العودة لتسجيل الدخول</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner:     { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },

  backBtn: { position: 'absolute', top: 16, right: 0, padding: 8 },

  header:   { marginBottom: 32 },
  title:    { fontSize: 26, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', lineHeight: 22 },

  errorBox:  { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },

  label:          { fontSize: 13, fontWeight: '500', color: '#444', marginBottom: 6, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, height: 48, backgroundColor: '#fff' },
  inputIcon:      { fontSize: 15, marginLeft: 8, color: '#999' },
  input:          { flex: 1, fontSize: 14, color: '#333' },

  submitBtn:     { backgroundColor: BLUE, borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  backLink:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  backLinkText: { fontSize: 13, color: BLUE, fontWeight: '500' },

  successBox:   { alignItems: 'center', paddingHorizontal: 8 },
  successIcon:  { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  successBody:  { fontSize: 14, color: '#666', lineHeight: 22, textAlign: 'center', marginBottom: 32 },

  loginBtn:     { backgroundColor: BLUE, borderRadius: 10, height: 50, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
