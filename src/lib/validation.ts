const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const DATE_BR_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const DATE_ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const MIN_AGE = 18;
export const MAX_AGE = 120;
export const MAX_COMMENT_LENGTH = 1000;
export const PRIVACY_POLICY_VERSION = '2026-10-28';

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function passwordError(password: string): string | null {
  if (password.length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Use pelo menos uma letra e um número.';
  }
  return null;
}

export function normalizeUsername(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
}

export function usernameError(username: string): string | null {
  if (!username) {
    return 'Escolha um nome de usuário.';
  }
  if (!USERNAME_RE.test(username)) {
    return 'Use de 3 a 30 caracteres: letras minúsculas, números ou _.';
  }
  return null;
}

export function parseBirthDate(input: string): Date | null {
  const trimmed = input.trim();
  let year: number | undefined;
  let month: number | undefined;
  let day: number | undefined;

  const br = DATE_BR_RE.exec(trimmed);
  if (br) {
    day = Number(br[1]);
    month = Number(br[2]);
    year = Number(br[3]);
  } else {
    const iso = DATE_ISO_RE.exec(trimmed);
    if (iso) {
      year = Number(iso[1]);
      month = Number(iso[2]);
      day = Number(iso[3]);
    }
  }

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toBrDate(isoDate: string): string {
  const match = DATE_ISO_RE.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function ageFrom(date: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - date.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < date.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export function birthDateError(input: string, now: Date = new Date()): string | null {
  const date = parseBirthDate(input);
  if (!date) {
    return 'Informe uma data válida no formato DD/MM/AAAA.';
  }
  if (date.getTime() > now.getTime()) {
    return 'A data de nascimento não pode estar no futuro.';
  }
  const age = ageFrom(date, now);
  if (age < MIN_AGE) {
    return 'É necessário ter 18 anos ou mais para usar o DopamineMaxxing.';
  }
  if (age > MAX_AGE) {
    return 'Verifique a data de nascimento informada.';
  }
  return null;
}

export function displayNameError(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return 'Informe um nome com pelo menos 2 caracteres.';
  }
  if (trimmed.length > 80) {
    return 'O nome pode ter no máximo 80 caracteres.';
  }
  return null;
}

export function commentError(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) {
    return 'Escreva um comentário.';
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return `O comentário pode ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`;
  }
  return null;
}

export function sanitizeComment(body: string): string {
  return body.trim().replace(/\s{3,}/g, '  ').slice(0, MAX_COMMENT_LENGTH);
}
