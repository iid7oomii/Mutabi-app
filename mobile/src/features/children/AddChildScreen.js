import { useState } from 'react'
import { Alert, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Info } from 'lucide-react-native'
import FormPage, { FormInput } from '../../components/ui/FormPage'
import { ActionButton, AppText, Message } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiPost } from '../../services/api/client'

export default function AddChildScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [diagnosisNotes, setDiagnosisNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    setError('')
    if (!firstName.trim() || !secondName.trim()) { setError('الاسم الأول والأخير مطلوبان.'); return }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) { setError('أدخل تاريخ الميلاد بصيغة YYYY-MM-DD.'); return }
    setLoading(true)
    try {
      const response = await apiPost('/children/request', { first_name: firstName.trim(), second_name: secondName.trim(), date_of_birth: dateOfBirth.trim(), diagnosis_notes: diagnosisNotes.trim() || undefined })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'تعذر إرسال الطلب.')
      Alert.alert('تم إرسال الطلب', 'ستراجع العيادة بيانات الطفل وتتواصل مع الأسرة.', [{ text: 'حسنًا', onPress: () => navigation.goBack() }])
    } catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') }
    finally { setLoading(false) }
  }
  return <FormPage title="إضافة طفل" description="أدخل بيانات الطفل لإرسال طلب التسجيل إلى العيادة.">
    <View style={{ padding: 13, borderRadius: 12, backgroundColor: colors.blueSoft, flexDirection: 'row-reverse', gap: 8 }}><Info size={18} color={colors.blue} /><AppText variant="support" style={{ flex: 1 }}>تراجع العيادة الطلب وتعيّن الأخصائي المسؤول.</AppText></View>
    <FormInput label="الاسم الأول" value={firstName} onChangeText={setFirstName} placeholder="الاسم الأول" />
    <FormInput label="الاسم الأخير" value={secondName} onChangeText={setSecondName} placeholder="الاسم الأخير" />
    <FormInput label="تاريخ الميلاد" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" hint="السنة-الشهر-اليوم" />
    <FormInput label="ملاحظات التشخيص (اختياري)" value={diagnosisNotes} onChangeText={setDiagnosisNotes} placeholder="معلومات تساعد العيادة في مراجعة الطلب" multiline />
    {error && <Message tone="error">{error}</Message>}
    <ActionButton title="إرسال الطلب للعيادة" onPress={submit} loading={loading} />
  </FormPage>
}
