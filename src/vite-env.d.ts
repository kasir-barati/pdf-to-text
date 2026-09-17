/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAX_FILE_SIZE_MB?: string;
  readonly VITE_MAX_PAGE_COUNT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
