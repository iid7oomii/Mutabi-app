import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native'
import { Activity, AlertCircle, ChevronLeft, Circle, CircleCheck, Clock3, Heart, Repeat2, Target } from 'lucide-react-native'
import { useTheme } from './ThemeProvider'

const font = (weight, ready) => ready ? ({
  regular: 'PlexArabic-Regular',
  medium: 'PlexArabic-Medium',
  semibold: 'PlexArabic-SemiBold',
  bold: 'PlexArabic-Bold',
}[weight] || 'PlexArabic-Regular') : undefined

export function AppText({ children, variant = 'body', weight = 'regular', color = 'text', style, ...props }) {
  const theme = useTheme()
  const size = theme.type[variant] || theme.type.body
  return <Text style={[{
    color: theme.colors[color] || color,
    fontFamily: font(weight, theme.fontsReady),
    fontSize: size,
    lineHeight: Math.round(size * 1.6),
    textAlign: 'right',
  }, style]} {...props}>{children}</Text>
}

export function ActionButton({ title, variant = 'primary', icon: Icon, loading = false, disabled, onPress, style }) {
  const { colors, radius } = useTheme()
  const primary = variant === 'primary'
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [{
      minHeight: 44, borderRadius: radius.button, paddingHorizontal: 16,
      flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7,
      backgroundColor: primary ? colors.orange : variant === 'secondary' ? colors.surface : 'transparent',
      borderWidth: variant === 'secondary' ? 1 : 0, borderColor: colors.border,
      opacity: disabled || loading ? .55 : pressed ? .78 : 1,
    }, style]}
  >
    {loading ? <ActivityIndicator color={primary ? colors.orangeOn : colors.blue} /> : <>
      <AppText weight="semibold" variant="support" color={primary ? 'orangeOn' : variant === 'quiet' ? 'orangeText' : 'blue'}>{title}</AppText>
      {Icon && <Icon size={18} color={primary ? colors.orangeOn : colors.blue} strokeWidth={2} />}
    </>}
  </Pressable>
}

export function SurfaceCard({ children, style }) {
  const { colors, radius } = useTheme()
  return <View style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.card }, style]}>{children}</View>
}

export function TextField({ label, icon: Icon, trailing, error, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize = 'none' }) {
  const { colors, mode } = useTheme()
  return <View style={{ gap: 6 }}>
    <AppText variant="support" weight="semibold">{label}</AppText>
    <View style={{ minHeight: 48, flexDirection: 'row-reverse', alignItems: 'center', gap: 9, paddingHorizontal: 12,
      backgroundColor: colors.surface, borderWidth: 1, borderColor: error ? colors.error : colors.border, borderRadius: 11 }}>
      {Icon && <Icon size={18} color={colors.blue} strokeWidth={2} />}
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={colors.muted} secureTextEntry={secureTextEntry} keyboardType={keyboardType}
        autoCapitalize={autoCapitalize} keyboardAppearance={mode} style={{ flex: 1, minWidth: 0, color: colors.text, fontFamily: 'PlexArabic-Regular',
          fontSize: 14, textAlign: 'right', paddingVertical: 8 }} />
      {trailing}
    </View>
    {error ? <AppText variant="support" color="error" accessibilityRole="alert">{error}</AppText> : null}
  </View>
}

export function SectionHeading({ title, action }) {
  return <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 20, marginBottom: 9 }}>
    <AppText variant="section" weight="bold">{title}</AppText>{action}
  </View>
}

export function EmptyState({ icon: Icon = Target, title, description, action }) {
  const { colors } = useTheme()
  return <SurfaceCard style={{ padding: 20, alignItems: 'center', gap: 6 }}>
    <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.blueSoft,
      alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
      <Icon size={22} color={colors.blue} strokeWidth={2} />
    </View>
    <AppText variant="card" weight="bold" style={{ textAlign: 'center' }}>{title}</AppText>
    <AppText variant="support" color="muted" style={{ textAlign: 'center' }}>{description}</AppText>
    {action}
  </SurfaceCard>
}

export function Message({ tone = 'info', children }) {
  const { colors } = useTheme()
  return <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, padding: 11,
    borderRadius: 11, backgroundColor: tone === 'error' ? colors.orangeSoft : colors.blueSoft }}>
    {tone === 'error' && <AlertCircle size={18} color={colors.error} />}
    <AppText variant="support" color={tone === 'error' ? 'error' : 'text'} style={{ flex: 1 }}>{children}</AppText>
  </View>
}

export function GoalCard({ title, status, remaining, endDate, criteria, onPress }) {
  const { colors } = useTheme()
  const completed = status === 'completed'
  const awaiting = status === 'awaiting_review'
  const statusLabel = completed ? 'مكتمل' : awaiting ? 'بانتظار مراجعة الأخصائي' : status === 'closed' ? 'مغلق' : remaining || 'قيد المتابعة'
  const Icon = completed ? CircleCheck : awaiting ? Clock3 : Circle
  const body = <SurfaceCard style={{ padding: 13, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
    <Icon size={22} color={colors.blue} strokeWidth={2} />
    <View style={{ flex: 1 }}><AppText variant="support" weight="semibold">{title}</AppText>{criteria && <AppText variant="tiny" color="muted">{criteria}</AppText>}{endDate && <AppText variant="tiny" color="muted">{endDate}</AppText>}</View>
    <AppText variant="tiny" color="blue">{statusLabel}</AppText>
    {onPress && <ChevronLeft size={18} color={colors.muted} />}
  </SurfaceCard>
  return onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`${title}، ${statusLabel}`} onPress={onPress}>{body}</Pressable> : body
}

const exerciseStatus = {
  next: 'التالي',
  completed: 'مكتمل',
  later: 'لاحقًا',
  partial: 'جزئي',
}

export function StatusBadge({ status }) {
  const { colors } = useTheme()
  const warm = status === 'partial'
  const quiet = status === 'later' || status === 'completed'
  return <View style={{ alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99,
    backgroundColor: warm ? colors.orangeSoft : quiet ? colors.canvas : colors.blueSoft }}>
    <AppText variant="tiny" weight="semibold" color={warm ? 'orangeText' : quiet ? 'muted' : 'blue'}>
      {exerciseStatus[status] || status}
    </AppText>
  </View>
}

export function ExerciseCard({ title, category, minutes, repetitions, status = 'next', onStart }) {
  const { colors } = useTheme()
  return <SurfaceCard style={{ padding: 16, borderRightWidth: 3, borderRightColor: colors.blue, gap: 7 }}>
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
      <StatusBadge status={status} />
      {category ? <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
        <Activity size={15} color={colors.muted} />
        <AppText variant="tiny" color="muted">{category}</AppText>
      </View> : null}
    </View>
    <AppText variant="card" weight="bold">{title}</AppText>
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
      {minutes != null && <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
        <Clock3 size={15} color={colors.muted} /><AppText variant="tiny" color="muted">{minutes} دقائق</AppText>
      </View>}
      {repetitions != null && <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
        <Repeat2 size={15} color={colors.muted} /><AppText variant="tiny" color="muted">{repetitions} تكرارات</AppText>
      </View>}
    </View>
    {status === 'next' && onStart && <ActionButton title="بدء التمرين" onPress={onStart} style={{ marginTop: 8 }} />}
  </SurfaceCard>
}

export function CareNote({ specialist, children }) {
  const { colors } = useTheme()
  return <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8,
    padding: 13, borderRadius: 14, backgroundColor: colors.blueSoft }}>
    <Heart size={18} color={colors.blue} strokeWidth={2} />
    <View style={{ flex: 1 }}><AppText variant="tiny" weight="bold">{specialist}</AppText>
      <AppText variant="tiny">{children}</AppText></View>
  </View>
}
