import { VeriFactAuthPage } from '../verifact-design/verifact-design-page'
import type { AuthModeType } from '@entities/session/model'

export function AuthPage(props: { mode: AuthModeType; resetToken?: string }) {
  return <VeriFactAuthPage {...props} />
}
