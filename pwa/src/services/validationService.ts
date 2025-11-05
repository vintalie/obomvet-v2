// services/validationService.ts
export function isValidCPF(cpf: string) {
  return cpf.length === 11 && /^\d+$/.test(cpf);
}

export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}
