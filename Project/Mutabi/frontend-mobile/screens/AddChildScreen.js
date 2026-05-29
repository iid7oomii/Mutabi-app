import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { apiPost } from '../utils/api'

const BLUE = '#1F6FEB'

export default function AddChildScreen() {
  const navigation = useNavigation()

  const [firstName,       setFirstName]       = useState('')
  const [secondName,      setSecondName]       = useState('')
  const [dateOfBirth,     setDateOfBirth]     = useState('')
  const [diagnosisNotes,  setDiagnosisNotes]  = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!firstName.trim() || !secondName.trim()) {
      setError('الاسم الأول والأخير مطلوبان')
      return
    }
    if (!dateOfBirth.trim()) {
      setError('تاريخ الميلاد مطلوب')
      return
    }
    // Basic date format validation YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      setError('صيغة التاريخ غير صحيحة. استخدم: YYYY-MM-DD')
      return
    }

    setLoading(true)
    try {
      const res  = await apiPost('/children/request', {
        first_name:      firstName.trim(),
        second_name:     secondName.trim(),
        date_of_birth:   dateOfBirth.trim(),
        diagnosis_notes: diagnosisNotes.trim() || undefined,
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'فشل إرسال الطلب')
        return
      }
      Alert.alert(
        'تم الإرسال',
        'تم إرسال طلب تسجيل طفلك للعيادة. سيتم مراجعة الطلب وإضافة الطفل في أقرب وقت.',
        [{ text: 'حسناً', onPress: () => navigation.goBack() }]
      )
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
        <Text style={styles.headerTitle}>إضافة طفل</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color={BLUE} />
          <Text style={styles.infoText}>
            سيتم مراجعة الطلب من قبل العيادة وتعيين طبيب مناسب لطفلك.
          </Text>
        </View>

        <View style={styles.card}>
          <Field label="الاسم الأول" value={firstName} onChangeText={setFirstName} placeholder="أحمد" />
          <Field label="الاسم الأخير" value={secondName} onChangeText={setSecondName} placeholder="العمري" />
          <Field
            label="تاريخ الميلاد"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="2018-05-10"
            keyboardType="numeric"
            hint="YYYY-MM-DD"
          />
          <Field
            label="ملاحظات التشخيص (اختياري)"
            value={diagnosisNotes}
            onChangeText={setDiagnosisNotes}
            placeholder="أي معلومات إضافية تودّ إبلاغها للعيادة"
            multiline
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>إرسال الطلب للعيادة</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

function Field({ label, value, onChangeText, placeholder, keyboardType, hint, multiline }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 90, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        textAlign="right"
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        autoCapitalize="none"
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  scroll:      { padding: 20, paddingBottom: 40 },
  infoBanner:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EEF3FA', borderRadius: 12, padding: 14, marginBottom: 16 },
  infoText:    { flex: 1, fontSize: 13, color: '#1F6FEB', lineHeight: 20, textAlign: 'right' },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  fieldWrap:   { gap: 6 },
  label:       { fontSize: 13, fontWeight: '600', color: '#555', textAlign: 'right' },
  input:       { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa', paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: '#1a1a2e' },
  hint:        { fontSize: 11, color: '#aaa', textAlign: 'right' },
  errorText:   { fontSize: 13, color: '#dc2626', textAlign: 'center', backgroundColor: '#fff5f5', padding: 10, borderRadius: 8 },
  submitBtn:   { backgroundColor: BLUE, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  submitText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
})
