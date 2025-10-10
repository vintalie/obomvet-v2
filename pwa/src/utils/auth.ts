// auth.ts - helper para centralizar leitura/gravação de token
// ⚠️ IDEAL: tokens de sessão devem ser enviados como cookies HttpOnly pelo backend.
// Este helper oferece uma transição segura: prioriza cookie 'token' se existir, caso contrário usa localStorage.
// Depois de migrar para cookies HttpOnly, remova o uso de localStorage neste arquivo.

export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + 'token' + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getTokenFromLocalStorage(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('token');
  } catch (e) {
    return null;
  }
}

export function getToken(): string | null {
  // Prioriza cookie (backend HttpOnly preferred), fallback para localStorage (legacy)
  return getTokenFromCookie() || getTokenFromLocalStorage();
}

export function setTokenFallback(token: string) {
  // ⚠️ Apenas fallback: ao migrar para cookies HttpOnly, o backend deve setar o cookie.
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
    }
  } catch (e) {}
}

export function clearTokenFallback() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
    // limpa cookie "token" (não remove HttpOnly cookie)
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; Max-Age=0; path=/;';
    }
  } catch (e) {}
}

export function authHeader(): Record<string, string> | undefined {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : undefined;
}

