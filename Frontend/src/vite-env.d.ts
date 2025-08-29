/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST: string; // Your backend base URL
  // Add more environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
