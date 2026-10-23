import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Activity, ChartNoAxesColumn, House, UserRound } from 'lucide-react-native'
import { useTheme } from './design-system/ThemeProvider'
import { AppText } from './design-system/components'

const tabs = [
  { key: 'Home', label: 'الرئيسية', Icon: House },
  { key: 'Therapy', label: 'التمارين', Icon: Activity },
  { key: 'Progress', label: 'التقدم', Icon: ChartNoAxesColumn },
  { key: 'Profile', label: 'الملف', Icon: UserRound },
]

export default function BottomTabBar({ active, onTabPress }) {
  const insets = useSafeAreaInsets()
  const { colors, icon } = useTheme()

  return <View style={{ flexDirection: 'row-reverse', paddingTop: 7, paddingBottom: Math.max(insets.bottom, 9),
    paddingHorizontal: 8, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
    {tabs.map(({ key, label, Icon }) => {
      const selected = active === key
      const color = selected ? colors.blue : colors.muted
      return <Pressable key={key} accessibilityRole="tab" accessibilityLabel={label}
        accessibilityState={{ selected }} onPress={() => onTabPress(key)}
        style={{ flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Icon size={icon.nav} color={color} strokeWidth={icon.stroke} />
        <AppText variant="tiny" weight={selected ? 'bold' : 'regular'} color={color}
          style={{ textAlign: 'center' }}>{label}</AppText>
      </Pressable>
    })}
  </View>
}
