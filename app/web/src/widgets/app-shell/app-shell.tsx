import type { ReactNode } from 'react'
import type { AppSession } from '@lib/auth-client'

export function AppShell(props: {
  session: AppSession | null | undefined
  isPending: boolean
  children: ReactNode
}) {
  return <>{props.children}</>
}
