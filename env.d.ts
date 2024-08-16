declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    AUTH_SECRET: string;
    JWT_EXP: string;
    JWT_REFRESH_EXP: string;
    COOKIE_SECRET: string;
    DB_URL: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }
}