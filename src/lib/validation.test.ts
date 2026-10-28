import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ageFrom,
  birthDateError,
  commentError,
  displayNameError,
  isValidEmail,
  normalizeUsername,
  parseBirthDate,
  passwordError,
  toBrDate,
  toIsoDate,
  usernameError,
} from './validation';

const NOW = new Date('2026-10-28T12:00:00.000Z');

test('valida e-mails', () => {
  assert.equal(isValidEmail('voce@exemplo.com'), true);
  assert.equal(isValidEmail('voce+tag@exemplo.com.br'), true);
  assert.equal(isValidEmail('sem-arroba.com'), false);
  assert.equal(isValidEmail('a@b'), false);
});

test('valida senha', () => {
  assert.equal(passwordError('12345678'), 'Use pelo menos uma letra e um número.');
  assert.equal(passwordError('abcdefgh'), 'Use pelo menos uma letra e um número.');
  assert.equal(passwordError('abc12345'), null);
});

test('normaliza e valida username', () => {
  assert.equal(normalizeUsername('  João da Silva! '), 'joao_da_silva');
  assert.equal(usernameError('joao_da_silva'), null);
  assert.equal(usernameError('ab'), 'Use de 3 a 30 caracteres: letras minúsculas, números ou _.');
  assert.equal(usernameError('João'), 'Use de 3 a 30 caracteres: letras minúsculas, números ou _.');
});

test('interpreta datas em BR e ISO', () => {
  const br = parseBirthDate('29/02/2000');
  assert.ok(br);
  if (!br) throw new Error('data inválida');
  assert.equal(toIsoDate(br), '2000-02-29');
  assert.equal(toBrDate('2000-02-29'), '29/02/2000');
  assert.equal(parseBirthDate('31/02/2000'), null);
  assert.equal(parseBirthDate('2000-13-01'), null);
});

test('calcula idade e aplica o piso de 18 anos', () => {
  const date = new Date('2008-10-29T00:00:00.000Z');
  assert.equal(ageFrom(date, NOW), 17);
  assert.match(birthDateError('29/10/2008', NOW) ?? '', /18 anos/);
  assert.equal(birthDateError('28/10/2008', NOW), null);
  assert.match(birthDateError('01/01/2030', NOW) ?? '', /futuro/);
  assert.match(birthDateError('data', NOW) ?? '', /DD\/MM\/AAAA/);
});

test('valida nome e comentário', () => {
  assert.equal(displayNameError('Lia'), null);
  assert.equal(displayNameError(' '), 'Informe um nome com pelo menos 2 caracteres.');
  assert.equal(commentError('  '), 'Escreva um comentário.');
  assert.equal(commentError('a'.repeat(1001)), 'O comentário pode ter no máximo 1000 caracteres.');
  assert.equal(commentError('Oi!'), null);
});
