/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_API_V1: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}