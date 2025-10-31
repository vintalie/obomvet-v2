// ⚠️ Helper para centralizar leitura/gravação de token e usuário
// Prioriza cookie HttpOnly se existir, fallback para localStorage

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
  return getTokenFromCookie() || getTokenFromLocalStorage();
}

export function getUser(): { id: string; name: string; email: string; tipo: "tutor" | "veterinario" | "clinica" } | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const id = localStorage.getItem('id');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const tipo = localStorage.getItem('tipo') as "tutor" | "veterinario" | "clinica" | null;
    if (id && name && email && tipo) {
      return { id, name, email, tipo };
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function setTokenFallback(token: string) {
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
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; Max-Age=0; path=/;';
    }
  } catch (e) {}
}

export function setUserFallback(data: { id: string | number; name: string; email: string; tipo: "tutor" | "veterinario" | "clinica" }) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('id', data.id.toString());
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', data.email);
      localStorage.setItem('tipo', data.tipo);
    }
  } catch (e) {}
}

export function clearUserFallback() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('id');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('tipo');
    }
  } catch (e) {}
}

export function authHeader(): Record<string, string> | undefined {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : undefined;
}
