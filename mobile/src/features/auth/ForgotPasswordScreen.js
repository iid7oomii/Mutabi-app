import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ArrowRight, Mail, MailCheck } from 'lucide-react-native'
import { apiPost } from '../../services/api/client'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { AuthTemplate } from '../../components/ui/design-system/templates'
import { ActionButton, AppText, Message, TextField } from '../../components/ui/design-system/components'

export default function ForgotPasswordScreen() {
  const navigation = useNavigation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { colors } = useTheme()

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('يلزم إدخال البريد الإلكتروني')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await apiPost('/auth/forgot-password', { email: email.trim() })
      await res.json()
      setSuccess(true)
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const back = <Pressable accessibilityRole="button" accessibilityLabel="العودة لتسجيل الدخول"
    onPress={() => navigation.goBack()} style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
    <ArrowRight size={20} color={colors.blue} strokeWidth={2} />
  </Pressable>

  if (success) {
    return <AuthTemplate title="تم إرسال الطلب"
      description="إذا كان البريد مرتبطًا بحساب في متابع، تُرسل رسالة تحتوي على رابط لإعادة تعيين كلمة المرور."
      backAction={back}>
      <View style={{ width: 58, height: 58, borderRadius: 14, backgroundColor: colors.blueSoft,
        justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
        <MailCheck size={28} color={colors.blue} strokeWidth={2} />
      </View>
      <ActionButton title="العودة لتسجيل الدخول" onPress={() => navigation.goBack()} />
    </AuthTemplate>
  }

  return <AuthTemplate title="نسيت كلمة المرور؟"
    description="يُرسل رابط إعادة التعيين إلى البريد الإلكتروني المرتبط بالحساب."
    backAction={back}>
    <View style={{ gap: 16 }}>
      {error ? <Message tone="error">{error}</Message> : null}
      <TextField label="البريد الإلكتروني" icon={Mail} value={email} onChangeText={setEmail}
        placeholder="البريد الإلكتروني" keyboardType="email-address" />
      <ActionButton title="إرسال رابط إعادة التعيين" loading={loading} onPress={handleSubmit} />
      <Pressable accessibilityRole="link" onPress={() => navigation.goBack()}
        style={{ alignItems: 'center', minHeight: 36, justifyContent: 'center' }}>
        <AppText variant="support" weight="semibold" color="blue">العودة لتسجيل الدخول</AppText>
      </Pressable>
    </View>
  </AuthTemplate>
}
