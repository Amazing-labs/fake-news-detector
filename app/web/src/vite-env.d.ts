/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BETTER_AUTH_DISABLE?: 'true' | 'false'
  readonly VITE_AUTH_BASE_URL: string
  readonly VITE_SERVER_PROXY_TARGET: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_STORAGE_BUCKET: string
  readonly VITE_SUPABASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
