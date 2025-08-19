// src/env.d.ts
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;

    readonly VITE_LOCAL_STORAGE_KEY_PREFIX: string;

    readonly VITE_USER_INFO_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}