import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bell } from 'lucide-react-native'
import LogoMark from '../../assets/logo-mark.svg'
import { useTheme } from './design-system/ThemeProvider'
import { AppText } from './design-system/components'

export default function Header({ clinicName, onBellPress }) {
  const insets = useSafeAreaInsets()
  const { colors, icon } = useTheme()
  return <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: insets.top + 10, paddingBottom: 10, paddingHorizontal: 20, backgroundColor: colors.canvas }}>
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 9 }}>
      <LogoMark width={34} height={34} />
      <View>
        <AppText variant="support" weight="bold">متابع</AppText>
        <AppText variant="tiny" color="muted">{clinicName || 'متابعة التمارين المنزلية'}</AppText>
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="الإشعارات" onPress={onBellPress}
      style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.border,
        backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Bell size={icon.action} color={colors.text} strokeWidth={icon.stroke} />
    </Pressable>
  </View>
}
