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
    BCRYPT_SALT: string;
    CLIENT_URL: string;
    DOMAIN_NAME: string;
    EMAIL_HOST: string;
    EMAIL_USERNAME: string;
    EMAIL_PASSWORD: string;
    FROM_EMAIL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    VAPID_PRIVATE_KEY: string;
    VAPID_PUBLIC_KEY: string;
  }
}