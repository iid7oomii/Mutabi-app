import { Moon, Sun } from 'lucide-react'
import logo from '../assets/logo-mark.svg'
import { useTheme } from './ThemeContext'

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  const Icon = mode === 'light' ? Moon : Sun
  return <button type="button" className="mt-theme-toggle" onClick={toggleMode}
    aria-label={mode === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}>
    <Icon size={18} strokeWidth={2} aria-hidden="true" />
  </button>
}

export function AuthTemplate({ title, description, children, backAction, footer }) {
  return <main className="mt-auth">
    <div className="mt-auth__top">{backAction}<ThemeToggle /></div>
    <div className="mt-auth__inner">
      <div className="mt-auth__brand"><img src={logo} alt="" /><strong>متابع</strong><small>متابعة التمارين المنزلية</small></div>
      <div className="mt-auth__panel"><h1>{title}</h1>{description && <p className="mt-auth__description">{description}</p>}{children}</div>
      {footer}
    </div>
  </main>
}

export function PageTemplate({ title, description, eyebrow, actions, sidebar, children }) {
  return <div className="mt-page">
    {sidebar && <aside className="mt-page__sidebar">{sidebar}</aside>}
    <main className="mt-page__main">
      <header className="mt-page__header">
        <div>{eyebrow && <small>{eyebrow}</small>}<h1>{title}</h1>{description && <p>{description}</p>}</div>
        <div className="mt-page__actions">{actions}<ThemeToggle /></div>
      </header>
      {children}
    </main>
  </div>
}

export function ListTemplate({ title, description, actions, sidebar, filters, children }) {
  return <PageTemplate title={title} description={description} actions={actions} sidebar={sidebar}>
    {filters && <div className="mt-list__filters">{filters}</div>}
    <div className="mt-list__content">{children}</div>
  </PageTemplate>
}

export function DetailTemplate({ title, description, actions, sidebar, meta, children }) {
  return <PageTemplate title={title} description={description} actions={actions} sidebar={sidebar}>
    {meta && <div className="mt-detail__meta">{meta}</div>}
    <div className="mt-detail__content">{children}</div>
  </PageTemplate>
}

export function FormTemplate({ title, description, actions, sidebar, onSubmit, children, footer }) {
  return <PageTemplate title={title} description={description} actions={actions} sidebar={sidebar}>
    <form className="mt-form" onSubmit={onSubmit}>{children}{footer && <div className="mt-form__footer">{footer}</div>}</form>
  </PageTemplate>
}
