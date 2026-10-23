import { useState } from 'react'
import { Pressable, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react-native'
import { apiPost } from '../../services/api/client'
import { API_BASE } from '../../services/api/config'
import { registerDeviceToken, syncGoalReminderTimezone } from '../../services/notifications'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { AuthTemplate } from '../../components/ui/design-system/templates'
import { ActionButton, AppText, Message, TextField } from '../../components/ui/design-system/components'

export default function Login({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { colors } = useTheme()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('يلزم إدخال البريد الإلكتروني أو رقم الجوال وكلمة المرور')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await apiPost('/auth/login', { email: email.trim(), password })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 401) {
          setError(`البريد الإلكتروني أو كلمة المرور غير صحيحة على الخادم الحالي. تحقق من بيانات الدخول واتصال التطبيق بالخادم الصحيح.${__DEV__ ? ` (${API_BASE})` : ''}`)
        } else if (res.status >= 500) {
          setError('حدث خطأ في الخادم. حاول مرة أخرى لاحقًا.')
        } else {
          setError(data.error || data.message || `تعذر تسجيل الدخول (رمز ${res.status})`)
        }
        return
      }
      if (data.role !== 'parent') {
        setError('تطبيق الجوال مخصص لحسابات الأسرة')
        return
      }
      if (data.token) {
        await AsyncStorage.setItem('token', data.token)
        registerDeviceToken(data.token)
        syncGoalReminderTimezone()
      }
      navigation.reset({ index: 0, routes: [{ name: data.active ? 'Main' : 'SetPassword' }] })
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return <AuthTemplate title="تسجيل الدخول إلى متابع" description="متابعة التمارين والأهداف في مكان واحد.">
    <View style={{ gap: 16 }}>
      {error ? <Message tone="error">{error}</Message> : null}
      <TextField label="البريد الإلكتروني أو رقم الجوال" icon={Mail} value={email}
        onChangeText={setEmail} placeholder="البريد الإلكتروني أو رقم الجوال" />
      <TextField label="كلمة المرور" icon={LockKeyhole} value={password}
        onChangeText={setPassword} placeholder="كلمة المرور" secureTextEntry={!showPassword}
        trailing={<Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          onPress={() => setShowPassword(current => !current)} hitSlop={8}>
          {showPassword ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
        </Pressable>} />
      <Pressable accessibilityRole="link" onPress={() => navigation.navigate('ForgotPassword')}
        style={{ alignSelf: 'flex-end', minHeight: 30, justifyContent: 'center' }}>
        <AppText variant="support" weight="semibold" color="orangeText">نسيت كلمة المرور؟</AppText>
      </Pressable>
      <ActionButton title="تسجيل الدخول" icon={ArrowLeft} loading={loading} onPress={handleLogin} />
    </View>
  </AuthTemplate>
}
