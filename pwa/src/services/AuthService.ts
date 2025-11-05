// services/authService.ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function registerUser(payload: any) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 422 && data.errors) {
      const firstError = Object.values(data.errors).flat()[0];
      throw new Error(firstError);
    } else {
      throw new Error(data.error || "Erro no cadastro");
    }
  }

  return data;
}
