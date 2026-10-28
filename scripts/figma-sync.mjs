import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

try {
  process.loadEnvFile?.();
} catch {
  // .env é opcional; variáveis podem vir do shell.
}

const token = process.env.FIGMA_TOKEN?.trim();
const fileKey = process.env.FIGMA_FILE_KEY?.trim();
const nodeId = process.env.FIGMA_NODE_ID?.trim();
const scale = Number(process.env.FIGMA_SCALE ?? 2);
const outDir = path.resolve(process.env.FIGMA_OUT_DIR ?? 'figma-export');

if (!token || !fileKey) {
  console.error('[figma-sync] Defina FIGMA_TOKEN e FIGMA_FILE_KEY.');
  process.exit(1);
}

if (!Number.isFinite(scale) || scale <= 0 || scale > 4) {
  console.error('[figma-sync] FIGMA_SCALE deve ser um número entre 0 e 4.');
  process.exit(1);
}

const API = 'https://api.figma.com/v1';
const headers = { 'X-Figma-Token': token };

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, label, attempt = 1) {
  const response = await fetch(url, { headers });
  if ((response.status === 429 || response.status >= 500) && attempt < 3) {
    const retryAfter = Number(response.headers.get('retry-after') ?? 0);
    await delay(retryAfter > 0 ? retryAfter * 1000 : attempt * 1500);
    return requestJson(url, label, attempt + 1);
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${label}: HTTP ${response.status} ${body.slice(0, 300)}`);
  }
  return response.json();
}

async function download(url, attempt = 1) {
  const response = await fetch(url);
  if ((response.status === 429 || response.status >= 500) && attempt < 3) {
    await delay(attempt * 1500);
    return download(url, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`download: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function slug(value) {
  const normalized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return normalized || 'frame';
}

function walk(node, visitor, parent = null) {
  if (!node || typeof node !== 'object') {
    return;
  }
  visitor(node, parent);
  for (const child of node.children ?? []) {
    walk(child, visitor, node);
  }
}

function findNode(root, id) {
  let found = null;
  walk(root, (node) => {
    if (!found && node.id === id) {
      found = node;
    }
  });
  return found;
}

function collectFrames(document) {
  if (nodeId) {
    const node = findNode(document, nodeId);
    return node ? [node] : [];
  }

  const frames = [];
  for (const canvas of document.children ?? []) {
    if (canvas.type !== 'CANVAS') {
      continue;
    }
    for (const child of canvas.children ?? []) {
      if (['FRAME', 'COMPONENT', 'SECTION'].includes(child.type) && child.visible !== false) {
        frames.push(child);
      }
    }
  }
  return frames;
}

function colorToHex(color) {
  const channel = (value) =>
    Math.max(0, Math.min(255, Math.round(Number(value ?? 0) * 255)))
      .toString(16)
      .padStart(2, '0');
  const alpha = Number(color.a ?? 1);
  const suffix = alpha < 1 ? channel(alpha) : '';
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}${suffix}`.toUpperCase();
}

function extractTokens(document) {
  const colors = new Set();
  const textStyles = new Map();
  const effects = new Set();

  walk(document, (node) => {
    for (const paint of [...(node.fills ?? []), ...(node.strokes ?? [])]) {
      if (paint?.type === 'SOLID' && paint.visible !== false && paint.color) {
        colors.add(colorToHex(paint.color));
      }
    }
    if (node.type === 'TEXT' && node.style) {
      const style = node.style;
      const key = [
        style.fontFamily ?? '',
        style.fontWeight ?? '',
        style.fontSize ?? '',
        style.lineHeightPx ?? '',
        style.letterSpacing ?? '',
      ].join('|');
      textStyles.set(key, {
        fontFamily: style.fontFamily ?? null,
        fontWeight: style.fontWeight ?? null,
        fontSize: style.fontSize ?? null,
        lineHeightPx: style.lineHeightPx ?? null,
        letterSpacing: style.letterSpacing ?? null,
        textCase: style.textCase ?? null,
      });
    }
    for (const effect of node.effects ?? []) {
      if (effect?.type) {
        effects.add(effect.type);
      }
    }
  });

  return {
    colors: [...colors].sort(),
    textStyles: [...textStyles.values()],
    effects: [...effects].sort(),
  };
}

function chunk(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function main() {
  const file = await requestJson(
    `${API}/files/${encodeURIComponent(fileKey)}`,
    'arquivo',
  );
  const frames = collectFrames(file.document);

  if (frames.length === 0) {
    throw new Error(
      nodeId
        ? `Nenhum nó encontrado para FIGMA_NODE_ID=${nodeId}.`
        : 'Nenhum frame encontrado no documento.',
    );
  }

  const framesDir = path.join(outDir, 'frames');
  await mkdir(framesDir, { recursive: true });

  const images = {};
  for (const ids of chunk(frames.map((frame) => frame.id), 40)) {
    const url = new URL(`${API}/images/${encodeURIComponent(fileKey)}`);
    url.searchParams.set('ids', ids.join(','));
    url.searchParams.set('format', 'png');
    url.searchParams.set('scale', String(scale));
    const result = await requestJson(url.toString(), 'imagens');
    if (result.err) {
      throw new Error(`imagens: ${result.err}`);
    }
    Object.assign(images, result.images ?? {});
  }

  const frameManifest = [];
  for (const [index, frame] of frames.entries()) {
    const imageUrl = images[frame.id];
    const entry = {
      id: frame.id,
      name: frame.name,
      type: frame.type,
      width: frame.absoluteBoundingBox?.width ?? null,
      height: frame.absoluteBoundingBox?.height ?? null,
      x: frame.absoluteBoundingBox?.x ?? null,
      y: frame.absoluteBoundingBox?.y ?? null,
      image: null,
    };

    if (imageUrl) {
      const filename = `${String(index + 1).padStart(2, '0')}-${slug(frame.name)}-${frame.id.replace(/:/g, '-')}.png`;
      const buffer = await download(imageUrl);
      await writeFile(path.join(framesDir, filename), buffer);
      entry.image = `frames/${filename}`;
    } else {
      console.warn(`[figma-sync] Sem imagem para ${frame.name} (${frame.id}).`);
    }

    frameManifest.push(entry);
  }

  const tokens = extractTokens(file.document);
  const manifest = {
    generatedAt: new Date().toISOString(),
    fileKey,
    fileName: file.name ?? null,
    lastModified: file.lastModified ?? null,
    version: file.version ?? null,
    nodeId: nodeId ?? null,
    scale,
    frames: frameManifest,
    tokens,
  };

  await writeFile(path.join(outDir, 'file.json'), JSON.stringify(file, null, 2));
  await writeFile(path.join(outDir, 'tokens.json'), JSON.stringify(tokens, null, 2));
  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(
    `[figma-sync] ${frameManifest.length} frame(s) exportado(s) para ${path.relative(process.cwd(), outDir)}.`,
  );
}

main().catch((error) => {
  console.error(`[figma-sync] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
