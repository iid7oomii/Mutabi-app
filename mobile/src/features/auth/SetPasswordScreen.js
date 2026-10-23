import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native'
import { apiPut } from '../../services/api/client'
import { AuthTemplate } from '../../components/ui/design-system/templates'
import { ActionButton, AppText, Message, TextField } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'

function PasswordField({ label, value, onChangeText }) {
  const [visible, setVisible] = useState(false)
  const { colors } = useTheme()
  return <TextField label={label} icon={LockKeyhole} value={value} onChangeText={onChangeText} placeholder="••••••••" secureTextEntry={!visible}
    trailing={<Pressable accessibilityRole="button" accessibilityLabel={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onPress={() => setVisible(current => !current)}>{visible ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}</Pressable>} />
}
export default function SetPasswordScreen({ navigation }) {
  const [tempPassword, setTempPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    setError('')
    if (!tempPassword || !newPassword || !confirmPassword) { setError('أكمل جميع الحقول.'); return }
    if (newPassword !== confirmPassword) { setError('كلمتا المرور الجديدتان غير متطابقتين.'); return }
    if (newPassword.length < 8) { setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل.'); return }
    setLoading(true)
    try { const response = await apiPut('/auth/set_password', { tempPassword, newPassword }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر تفعيل الحساب.'); navigation.reset({ index: 0, routes: [{ name: 'Main' }] }) }
    catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') }
    finally { setLoading(false) }
  }
  return <AuthTemplate title="تفعيل الحساب" description="أدخل كلمة المرور المؤقتة، ثم اختر كلمة مرور جديدة.">
    <View style={{ gap: 16 }}>{error && <Message tone="error">{error}</Message>}
      <PasswordField label="كلمة المرور المؤقتة" value={tempPassword} onChangeText={setTempPassword} />
      <PasswordField label="كلمة المرور الجديدة" value={newPassword} onChangeText={setNewPassword} />
      <PasswordField label="تأكيد كلمة المرور" value={confirmPassword} onChangeText={setConfirmPassword} />
      <AppText variant="tiny" color="muted">استخدم 8 أحرف على الأقل تشمل حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا.</AppText>
      <ActionButton title="تفعيل الحساب" onPress={submit} loading={loading} />
    </View>
  </AuthTemplate>
}
