import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'
import './theme.css'

const STORAGE_KEY = 'mutabi-theme'

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode) } catch { /* storage is optional */ }
  }, [mode])

  const value = useMemo(() => ({
    mode,
    setMode,
    toggleMode: () => setMode(current => current === 'light' ? 'dark' : 'light'),
  }), [mode])

  return (
    <ThemeContext.Provider value={value}>
      <div className="mutabi-theme" data-mutabi-theme={mode} dir="rtl">{children}</div>
    </ThemeContext.Provider>
  )
}

