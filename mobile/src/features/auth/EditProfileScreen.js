import { useState } from 'react'
import { Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import FormPage, { FormInput } from '../../components/ui/FormPage'
import { ActionButton, Message } from '../../components/ui/design-system/components'
import { apiPut } from '../../services/api/client'

export default function EditProfileScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const [firstName, setFirstName] = useState(route.params?.first_name || '')
  const [secondName, setSecondName] = useState(route.params?.second_name || '')
  const [phone, setPhone] = useState(route.params?.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const save = async () => {
    setError('')
    if (!firstName.trim() || !secondName.trim()) { setError('الاسم الأول والأخير مطلوبان.'); return }
    setLoading(true)
    try { const response = await apiPut('/users/me', { first_name: firstName.trim(), second_name: secondName.trim(), phone: phone.trim() }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر حفظ البيانات.'); Alert.alert('تم الحفظ', 'تم تحديث بيانات الحساب.', [{ text: 'حسنًا', onPress: () => navigation.goBack() }]) }
    catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') }
    finally { setLoading(false) }
  }
  return <FormPage title="تعديل الملف" description="تحديث بيانات الحساب الأساسية.">
    <FormInput label="الاسم الأول" value={firstName} onChangeText={setFirstName} placeholder="الاسم الأول" />
    <FormInput label="الاسم الأخير" value={secondName} onChangeText={setSecondName} placeholder="الاسم الأخير" />
    <FormInput label="رقم الجوال" value={phone} onChangeText={setPhone} placeholder="05xxxxxxxx" keyboardType="phone-pad" />
    {error && <Message tone="error">{error}</Message>}
    <ActionButton title="حفظ التغييرات" onPress={save} loading={loading} />
  </FormPage>
}
