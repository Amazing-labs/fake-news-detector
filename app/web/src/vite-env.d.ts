/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_BASE_URL: string
  readonly VITE_BETTER_AUTH_ALLOW_PRODUCTION_BYPASS?: 'true' | 'false'
  readonly VITE_BETTER_AUTH_DISABLE?: 'true' | 'false'
  readonly VITE_SERVER_PROXY_TARGET: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_STORAGE_BUCKET: string
  readonly VITE_SUPABASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
