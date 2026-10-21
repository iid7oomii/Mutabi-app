import { useState } from 'react'
import { Alert, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Eye, EyeOff } from 'lucide-react-native'
import FormPage, { FormInput } from '../../components/ui/FormPage'
import { ActionButton, Message } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiPut } from '../../services/api/client'

function PasswordField({ label, value, onChangeText }) {
  const { colors } = useTheme()
  const [visible, setVisible] = useState(false)
  return <FormInput label={label} value={value} onChangeText={onChangeText} secureTextEntry={!visible} placeholder="••••••••" trailing={<Pressable accessibilityRole="button" accessibilityLabel={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onPress={() => setVisible(current => !current)}>{visible ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}</Pressable>} />
}
export default function ChangePasswordScreen() {
  const navigation = useNavigation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const save = async () => {
    setError('')
    if (!oldPassword || !newPassword || !confirmPassword) { setError('أكمل جميع الحقول.'); return }
    if (newPassword !== confirmPassword) { setError('كلمتا المرور الجديدتان غير متطابقتين.'); return }
    if (newPassword.length < 8) { setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.'); return }
    setLoading(true)
    try { const response = await apiPut('/auth/reset-password', { old_password: oldPassword, new_password: newPassword }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر تغيير كلمة المرور.'); Alert.alert('تم الحفظ', 'تم تغيير كلمة المرور.', [{ text: 'حسنًا', onPress: () => navigation.goBack() }]) }
    catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') }
    finally { setLoading(false) }
  }
  return <FormPage title="تغيير كلمة المرور" description="اختر كلمة مرور جديدة لحسابك.">
    <PasswordField label="كلمة المرور الحالية" value={oldPassword} onChangeText={setOldPassword} />
    <PasswordField label="كلمة المرور الجديدة" value={newPassword} onChangeText={setNewPassword} />
    <PasswordField label="تأكيد كلمة المرور الجديدة" value={confirmPassword} onChangeText={setConfirmPassword} />
    {error && <Message tone="error">{error}</Message>}
    <ActionButton title="حفظ كلمة المرور" onPress={save} loading={loading} />
  </FormPage>
}
