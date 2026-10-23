import { Activity, AlertCircle, ChevronLeft, Circle, CircleCheck, Clock3, Heart, Repeat2, Target } from 'lucide-react'

export function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...props }) {
  return <button className={`mt-button mt-button--${variant} ${className}`} disabled={disabled || loading} {...props}>
    {loading ? 'جارٍ الانتظار…' : children}
  </button>
}

export function TextField({ id, label, icon: Icon, trailing, error, className = '', ...props }) {
  return <div className={`mt-field ${className}`}>
    <label htmlFor={id}>{label}</label>
    <div className={`mt-field__box ${error ? 'mt-field__box--error' : ''}`}>
      {Icon && <Icon size={18} strokeWidth={2} aria-hidden="true" />}
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {trailing}
    </div>
    {error && <p className="mt-field__error" id={`${id}-error`} role="alert">{error}</p>}
  </div>
}

export function Card({ children, className = '', ...props }) {
  return <div className={`mt-card ${className}`} {...props}>{children}</div>
}

export function SectionHeading({ title, action }) {
  return <div className="mt-section-heading"><h2>{title}</h2>{action}</div>
}

export function EmptyState({ icon: Icon = Target, title, description, action }) {
  return <Card className="mt-empty">
    <span className="mt-empty__icon"><Icon size={22} strokeWidth={2} aria-hidden="true" /></span>
    <h3>{title}</h3><p>{description}</p>{action}
  </Card>
}

export function Message({ tone = 'info', children }) {
  return <div className={`mt-message mt-message--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
    {tone === 'error' && <AlertCircle size={18} aria-hidden="true" />}
    <span>{children}</span>
  </div>
}

export function GoalCard({ title, status, remaining, endDate, criteria, onOpen }) {
  const completed = status === 'completed'
  const awaiting = status === 'awaiting_review'
  const statusLabel = completed ? 'مكتمل' : awaiting ? 'بانتظار مراجعة الأخصائي' : status === 'closed' ? 'مغلق' : remaining || 'قيد المتابعة'
  const Icon = completed ? CircleCheck : awaiting ? Clock3 : Circle
  const content = <>
    <span className={`mt-goal__icon ${completed ? 'mt-goal__icon--done' : ''}`}><Icon size={20} strokeWidth={2} aria-hidden="true" /></span>
    <span className="mt-goal__content"><strong>{title}</strong>{criteria && <small>{criteria}</small>}{endDate && <small>{endDate}</small>}</span>
    <span className="mt-goal__status">{statusLabel}</span>
    {onOpen && <ChevronLeft size={18} aria-hidden="true" />}
  </>
  return onOpen
    ? <button type="button" className="mt-card mt-goal mt-goal--button" onClick={onOpen} aria-label={`${title}، ${statusLabel}`}>{content}</button>
    : <Card className="mt-goal">{content}</Card>
}

const exerciseStatus = {
  next: 'التالي',
  completed: 'مكتمل',
  later: 'لاحقًا',
  partial: 'جزئي',
}

export function StatusBadge({ status, children }) {
  return <span className={`mt-badge mt-badge--${status}`}>{children || exerciseStatus[status] || status}</span>
}

export function ExerciseCard({ title, category, minutes, repetitions, status = 'next', onStart }) {
  return <Card className="mt-exercise">
    <div className="mt-exercise__top"><StatusBadge status={status} />{category && <small><Activity size={15} aria-hidden="true" /> {category}</small>}</div>
    <h3>{title}</h3>
    <div className="mt-exercise__meta">
      {minutes != null && <span><Clock3 size={15} aria-hidden="true" /> {minutes} دقائق</span>}
      {repetitions != null && <span><Repeat2 size={15} aria-hidden="true" /> {repetitions} تكرارات</span>}
    </div>
    {status === 'next' && onStart && <Button type="button" onClick={onStart}>بدء التمرين</Button>}
  </Card>
}

export function CareNote({ specialist, children }) {
  return <div className="mt-care-note"><Heart size={18} strokeWidth={2} aria-hidden="true" />
    <div><strong>{specialist}</strong><p>{children}</p></div>
  </div>
}
