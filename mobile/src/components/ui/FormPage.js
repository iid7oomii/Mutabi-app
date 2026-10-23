import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import ScreenHeader from './ScreenHeader'
import { AppText } from './design-system/components'
import { useTheme } from './design-system/ThemeProvider'

export default function FormPage({ title, description, children }) {
  const navigation = useNavigation()
  const { colors } = useTheme()
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <ScreenHeader title={title} onBack={() => navigation.goBack()} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40, gap: 18 }}>
        <View><AppText variant="page" weight="bold">{title}</AppText>{description && <AppText variant="support" color="muted">{description}</AppText>}</View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
}

export function FormInput({ label, value, onChangeText, placeholder, keyboardType, multiline, secureTextEntry, trailing, hint }) {
  const { colors, fontsReady, mode } = useTheme()
  return <View style={{ gap: 6 }}><AppText variant="support" weight="semibold">{label}</AppText>
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.surface,
      flexDirection: 'row-reverse', alignItems: multiline ? 'flex-start' : 'center', paddingHorizontal: 12 }}>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={colors.muted} keyboardType={keyboardType} multiline={multiline}
        secureTextEntry={secureTextEntry} autoCapitalize="none" keyboardAppearance={mode}
        style={{ flex: 1, minHeight: multiline ? 84 : 46, textAlign: 'right', textAlignVertical: multiline ? 'top' : 'center',
          color: colors.text, fontSize: 14, fontFamily: fontsReady ? 'PlexArabic-Regular' : undefined, paddingVertical: 9 }} />
      {trailing}
    </View>{hint && <AppText variant="tiny" color="muted">{hint}</AppText>}
  </View>
}
