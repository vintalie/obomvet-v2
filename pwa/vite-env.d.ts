interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // adicione aqui outras variáveis .env se tiver mais
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}