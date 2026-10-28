interface ErrorLike {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'E-mail ou senha inválidos.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar.'],
  [/user already registered/i, 'Este e-mail já está cadastrado.'],
  [/password should be at least/i, 'A senha precisa ter pelo menos 8 caracteres.'],
  [/duplicate key.*username|profiles_username_key/i, 'Este nome de usuário já está em uso.'],
  [/duplicate key/i, 'Este item já existe.'],
  [/row-level security/i, 'Você não tem permissão para esta ação.'],
  [/jwt expired/i, 'Sua sessão expirou. Entre novamente.'],
  [/network request failed|failed to fetch/i, 'Sem conexão. Verifique sua internet e tente novamente.'],
  [/rate limit|too many requests/i, 'Muitas tentativas. Aguarde um instante.'],
  [/not authenticated/i, 'Sua sessão expirou. Entre novamente.'],
];

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  const candidate = error as ErrorLike | null;
  const raw = candidate?.message ?? candidate?.details ?? '';
  for (const [pattern, message] of MESSAGES) {
    if (pattern.test(raw)) {
      return message;
    }
  }
  if (raw) {
    return raw;
  }
  return 'Algo deu errado. Tente novamente.';
}
