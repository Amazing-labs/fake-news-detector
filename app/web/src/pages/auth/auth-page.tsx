import { Link } from '@tanstack/react-router'
import { AuthForm } from '../../features/auth/auth-form'
import { useAppSession } from '../../entities/session/model'
import { isFrontendAuthBypassEnabled } from '../../shared/session/frontend-auth-bypass'
import {
  DataList,
  EmptyState,
} from '../../shared/ui/primitives'

export function AuthPage() {
  const { session, isPending, refetch } = useAppSession()
  const frontendBypassEnabled = isFrontendAuthBypassEnabled()

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-white/20 pb-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Fake News Detector
              </h1>
              <p className="max-w-3xl text-lg text-white/90 drop-shadow">
                Plateforme collaborative de fact-checking pour lutter contre la désinformation
              </p>
            </div>
          </div>
          
          {isPending ? (
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
              <EmptyState
                title="Session en cours de chargement"
                description="Le frontend attend le retour de Better Auth avant d'afficher une interface de connexion ou de travail."
              />
            </div>
          ) : session ? (
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-indigo-900">Session active</h2>
                  <p className="text-base text-indigo-700">
                    La connexion est prete. L'utilisateur garde la meme UI d'authentification mais voit ensuite les ecrans autorises par son role metier.
                  </p>
                </div>
                <DataList
                  items={[
                    { label: 'Nom', value: session.user.name },
                    { label: 'Email', value: session.user.email },
                    { label: 'ID acteur', value: session.user.actorId ?? 'N/A' },
                    { label: 'Role', value: session.user.actorRole ?? 'N/A' },
                    { label: 'Statut', value: session.user.actorStatus ?? 'N/A' },
                  ]}
                />
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link 
                    className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    to="/reports"
                  >
                    📰 Signalements
                  </Link>
                  <Link 
                    className="rounded-lg bg-emerald-600 px-6 py-3 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    to="/citizen"
                  >
                    👤 Espace citoyen
                  </Link>
                  <Link 
                    className="rounded-lg bg-amber-600 px-6 py-3 text-white font-bold hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    to="/journalist"
                  >
                    📝 Espace journaliste
                  </Link>
                  <Link 
                    className="rounded-lg bg-rose-600 px-6 py-3 text-white font-bold hover:bg-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    to="/investigations"
                  >
                    🔍 Enquetes
                  </Link>
                  <Link 
                    className="rounded-lg bg-purple-600 px-6 py-3 text-white font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    to="/profile"
                  >
                    👤 Profil
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
              <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
                <AuthForm
                  onSuccess={() => {
                    void refetch()
                  }}
                />
              </div>

              <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-indigo-900">Connexion unique</h2>
                    <p className="text-base text-indigo-700">
                      Tout le monde passe par la meme interface de connexion ou d'inscription. Ce sont ensuite la session et le role metier lie via AuthLink qui determinent les ecrans accessibles.
                    </p>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed">
                    Un citoyen cree son compte directement. Un journaliste ou un
                    directeur doit d'abord etre provisionne cote metier, puis son
                    compte Better Auth est relie a cet acteur.
                  </p>
                  {frontendBypassEnabled ? (
                    <p className="text-base text-slate-700 leading-relaxed">
                      Des comptes de bypass frontend sont aussi disponibles dans ce
                      formulaire pour maquetter les interfaces sans passer par le
                      serveur.
                    </p>
                  ) : null}
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 shadow-lg border-2 border-indigo-200 hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">👥</div>
                      <h3 className="font-bold text-indigo-900 text-lg">Citoyens</h3>
                      <p className="text-sm text-indigo-700">Soumettent des rapports</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">📰</div>
                      <h3 className="font-bold text-emerald-900 text-lg">Journalistes</h3>
                      <p className="text-sm text-emerald-700">Mènent les enquêtes</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg border-2 border-amber-200 hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">👔</div>
                      <h3 className="font-bold text-amber-900 text-lg">Directeurs</h3>
                      <p className="text-sm text-amber-700">Valident les publications</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 p-6 shadow-lg border-2 border-rose-200 hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">🔍</div>
                      <h3 className="font-bold text-rose-900 text-lg">Vigies</h3>
                      <p className="text-sm text-rose-700">Contribuent aux preuves</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
