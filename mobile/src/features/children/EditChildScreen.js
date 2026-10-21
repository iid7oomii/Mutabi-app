import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import FormPage, { FormInput } from '../../components/ui/FormPage'
import { ActionButton, Message } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet, apiPut } from '../../services/api/client'

export default function EditChildScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colors } = useTheme()
  const childId = route.params?.childId || route.params?.child?.id
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [diagnosisNotes, setDiagnosisNotes] = useState('')
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const load = async () => {
      try { const response = await apiGet(`/children/${childId}`); const child = await response.json(); if (!response.ok) throw new Error(child.error || 'تعذر تحميل بيانات الطفل.'); if (active) { setFirstName(child.first_name || ''); setSecondName(child.second_name || ''); setDateOfBirth(child.date_of_birth || ''); setDiagnosisNotes(child.diagnosis_notes || '') } }
      catch (cause) { if (active) setError(cause.message || 'تعذر الاتصال بالخادم.') }
      finally { if (active) setFetching(false) }
    }
    load()
    return () => { active = false }
  }, [childId])
  const save = async () => {
    setError('')
    if (!firstName.trim() || !secondName.trim()) { setError('الاسم الأول والأخير مطلوبان.'); return }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) { setError('أدخل تاريخ الميلاد بصيغة YYYY-MM-DD.'); return }
    setSaving(true)
    try { const response = await apiPut(`/children/${childId}`, { first_name: firstName.trim(), second_name: secondName.trim(), date_of_birth: dateOfBirth.trim(), diagnosis_notes: diagnosisNotes.trim() || null }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر حفظ البيانات.'); Alert.alert('تم الحفظ', 'تم تحديث بيانات الطفل.', [{ text: 'حسنًا', onPress: () => navigation.goBack() }]) }
    catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') }
    finally { setSaving(false) }
  }
  return <FormPage title="تعديل بيانات الطفل" description="تحديث البيانات الأساسية للطفل.">
    {fetching ? <ActivityIndicator color={colors.blue} /> : <>
      <FormInput label="الاسم الأول" value={firstName} onChangeText={setFirstName} placeholder="الاسم الأول" />
      <FormInput label="الاسم الأخير" value={secondName} onChangeText={setSecondName} placeholder="الاسم الأخير" />
      <FormInput label="تاريخ الميلاد" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" hint="السنة-الشهر-اليوم" />
      <FormInput label="ملاحظات التشخيص (اختياري)" value={diagnosisNotes} onChangeText={setDiagnosisNotes} placeholder="ملاحظات إضافية" multiline />
      {error && <Message tone="error">{error}</Message>}
      <ActionButton title="حفظ التغييرات" onPress={save} loading={saving} />
    </>}
  </FormPage>
}
