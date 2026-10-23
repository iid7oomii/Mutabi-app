import { useEffect, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Moon, Sun } from 'lucide-react-native'
import LogoMark from '../../../assets/logo-mark.svg'
import { useTheme } from './ThemeProvider'
import { AppText } from './components'

export function ThemeToggle() {
  const { mode, colors, toggleMode } = useTheme()
  const Icon = mode === 'light' ? Moon : Sun
  return <Pressable accessibilityRole="button" accessibilityLabel={mode === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
    onPress={toggleMode} style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
    <Icon size={18} color={colors.text} strokeWidth={2} />
  </Pressable>
}

export function AuthTemplate({ title, description, children, backAction, footer }) {
  const { colors } = useTheme()
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
    const hidden = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))
    return () => { shown.remove(); hidden.remove() }
  }, [])

  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}>
        <View style={{ minHeight: 44, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
          {backAction || <View />}<ThemeToggle />
        </View>
        <View style={{ flexGrow: 1, justifyContent: keyboardVisible ? 'flex-start' : 'center', paddingVertical: keyboardVisible ? 16 : 32 }}>
          <LogoMark width={48} height={48} />
          <AppText variant="page" weight="bold" style={{ marginTop: 20 }}>{title}</AppText>
          {description && <AppText variant="support" color="muted" style={{ marginTop: 3, marginBottom: 26 }}>{description}</AppText>}
          {children}
          {footer}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
}

export function PageTemplate({ title, description, headerAction, children, footer, scroll = true }) {
  const { colors } = useTheme()
  const content = <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 }}>
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <View style={{ flex: 1 }}><AppText variant="page" weight="bold">{title}</AppText>
        {description && <AppText variant="support" color="muted">{description}</AppText>}</View>
      {headerAction}
    </View>
    <View style={{ marginTop: 18 }}>{children}</View>
  </View>
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
    {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : content}
    {footer}
  </SafeAreaView>
}

export function ListTemplate({ title, description, headerAction, filters, children, footer }) {
  return <PageTemplate title={title} description={description} headerAction={headerAction} footer={footer}>
    {filters && <View style={{ marginBottom: 14 }}>{filters}</View>}
    <View style={{ gap: 9 }}>{children}</View>
  </PageTemplate>
}

export function DetailTemplate({ title, description, headerAction, meta, children, footer }) {
  return <PageTemplate title={title} description={description} headerAction={headerAction} footer={footer}>
    {meta && <View style={{ marginBottom: 14 }}>{meta}</View>}{children}
  </PageTemplate>
}

export function FormTemplate({ title, description, headerAction, children, footer }) {
  return <PageTemplate title={title} description={description} headerAction={headerAction} footer={footer}>
    <View style={{ gap: 16 }}>{children}</View>
  </PageTemplate>
}
