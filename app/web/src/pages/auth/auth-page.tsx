import { VeriFactAuthPage } from '../verifact-design/verifact-design-page'

export function AuthPage(props: { initialMode?: 'sign-in' | 'sign-up' }) {
  return <VeriFactAuthPage initialMode={props.initialMode} />
}
