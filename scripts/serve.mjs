import { createServer as createHttpServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function resolveInside(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) {
    return null;
  }
  const target = resolve(SRC_DIR, '.' + (decoded === '/' ? '/index.html' : decoded));
  return target.startsWith(SRC_DIR + sep) ? target : null;
}

export function createServer() {
  return createHttpServer(async (req, res) => {
    let pathname;
    try {
      ({ pathname } = new URL(req.url, 'http://localhost'));
    } catch {
      notFound(res);
      return;
    }
    const file = resolveInside(pathname);
    if (!file) {
      notFound(res);
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      });
      res.end(body);
    } catch {
      notFound(res);
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = 8080;
  createServer().listen(port, '127.0.0.1', () => {
    process.stdout.write(`Serving src/ at http://localhost:${port}\n`);
  });
}
