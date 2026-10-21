import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowRight } from 'lucide-react-native'
import { useTheme } from './design-system/ThemeProvider'
import { AppText } from './design-system/components'

export default function ScreenHeader({ title, onBack, action }) {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  return <View style={{ paddingTop: insets.top + 10, paddingBottom: 13, paddingHorizontal: 20,
    backgroundColor: colors.canvas, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="رجوع" onPress={onBack}
      style={{ width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
        backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      <ArrowRight size={18} color={colors.text} />
    </Pressable>
    <AppText variant="card" weight="semibold" style={{ flex: 1 }}>{title}</AppText>
    {action}
  </View>
}
