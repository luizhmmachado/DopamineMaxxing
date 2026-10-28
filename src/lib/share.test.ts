import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildShareText, buildWhatsAppUrl } from './share-utils';

const basePost = {
  network: 'instagram' as const,
  originalUrl: 'https://www.instagram.com/',
  caption: 'Um post de teste com acentuação e detalhes.',
  author: {
    id: 'author-1',
    name: 'Lia Prado',
    handle: '@liaprado',
  },
};

test('monta texto de compartilhamento com autor, rede e link', () => {
  const text = buildShareText(basePost);
  assert.match(text, /@liaprado/);
  assert.match(text, /Instagram/);
  assert.match(text, /Um post de teste/);
  assert.match(text, /https:\/\/www\.instagram\.com\//);
});

test('trunca legendas longas', () => {
  const text = buildShareText({ ...basePost, caption: 'a'.repeat(400) });
  assert.ok(text.includes('…'));
  assert.ok(text.length < 400);
});

test('gera URL do WhatsApp codificada', () => {
  const url = buildWhatsAppUrl('Olá mundo & cia');
  assert.equal(url, 'https://wa.me/?text=Ol%C3%A1%20mundo%20%26%20cia');
});
