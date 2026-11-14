/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PREFIX: string;
  readonly VITE_CLIENT_ACCESS_KEY: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_DEFAULT_UPI_VPA: string;
  readonly VITE_DEFAULT_ORGANIZER_PHONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
