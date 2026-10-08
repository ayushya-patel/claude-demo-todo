import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createServer } from '../scripts/serve.mjs';

let server;
let port;

before(async () => {
  server = createServer();
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  port = server.address().port;
});

after(async () => {
  await new Promise((done) => server.close(done));
});

// fetch normalises `..` away, so traversal needs a raw request line.
function rawGet(path) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves /index.html as HTML', async () => {
  const res = await fetch(`http://127.0.0.1:${port}/index.html`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/html/);
});

test('serves / as index.html', async () => {
  const res = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/html/);
});

test('serves css and js with their content types', async () => {
  const css = await fetch(`http://127.0.0.1:${port}/styles.css`);
  assert.equal(css.status, 200);
  assert.match(css.headers.get('content-type'), /^text\/css/);
  const js = await fetch(`http://127.0.0.1:${port}/todo.js`);
  assert.equal(js.status, 200);
  assert.match(js.headers.get('content-type'), /^text\/javascript/);
});

test('a .. traversal request is 404', async () => {
  assert.equal(await rawGet('/../package.json'), 404);
  assert.equal(await rawGet('/%2e%2e/package.json'), 404);
});

test('unknown paths and bad encodings are 404', async () => {
  assert.equal(await rawGet('/missing.html'), 404);
  assert.equal(await rawGet('/%00'), 404);
  assert.equal(await rawGet('/%E0%A4%A'), 404);
});
