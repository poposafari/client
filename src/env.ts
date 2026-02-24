// @ts-expect-error import.meta.env is available at Vite build/runtime
const viteEnv: Record<string, string | undefined> = import.meta.env ?? {};

export const VITE_API_BASE_URL = viteEnv.VITE_API_BASE_URL;
export const VITE_SOCKET_SERVER_URL = viteEnv.VITE_SOCKET_SERVER_URL;
