import { useEffect, useState } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem('verifact-theme') !== 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem('verifact-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return { isDark, setIsDark }
}
