/** Backend local por defecto; sobreescribe con NEXT_PUBLIC_API_URL en .env.local */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
