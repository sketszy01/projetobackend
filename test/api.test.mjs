import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';

// Fake PostgREST HTTP server: exercises Express -> Controller -> Model -> Supabase SDK.
// It is NOT PostgreSQL and does not prove the SQL or a real Supabase connection.
const tables = { categories: [], products: [] };
let failDatabase = false;
const backend = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const send = (status, data) => { res.statusCode = status; res.end(JSON.stringify(data)); };
  if (failDatabase) return send(500, { code: 'XX000', message: 'simulated failure' });
  const url = new URL(req.url, 'http://localhost');
  const table = url.pathname.split('/').pop();
  if (!tables[table]) return send(404, {});
  let rows = tables[table];
  const id = url.searchParams.get('id')?.replace(/^eq\./, '');
  if (id) rows = rows.filter(row => row.id === id);
  if (url.searchParams.has('or')) rows = rows.filter(row => row.name.includes('Pizza'));
  let body = '';
  for await (const chunk of req) body += chunk;
  if (req.method === 'POST' || req.method === 'PATCH') {
    const data = JSON.parse(body);
    if (table === 'products' && (req.method === 'POST' || rows.length > 0) && !tables.categories.some(row => row.id === data.categoryId)) {
      return send(409, { code: '23503', message: 'simulated FK violation' });
    }
    if (req.method === 'POST') { const row = { ...data, id: randomUUID() }; tables[table].push(row); rows = [row]; }
    else rows.forEach(row => Object.assign(row, data));
  }
  if (req.method === 'DELETE') {
    if (table === 'categories' && tables.products.some(row => rows.some(cat => cat.id === row.categoryId))) {
      return send(409, { code: '23503', message: 'simulated FK violation' });
    }
    tables[table] = tables[table].filter(row => !rows.includes(row));
  }
  const single = req.headers.accept?.includes('application/vnd.pgrst.object+json');
  if (single && rows.length === 0) return send(406, { code: 'PGRST116', details: 'The result contains 0 rows' });
  send(req.method === 'POST' ? 201 : 200, single ? rows[0] : rows);
});
backend.listen(0, '127.0.0.1'); await once(backend, 'listening');
process.env.SUPABASE_URL = `http://127.0.0.1:${backend.address().port}`;
process.env.SUPABASE_SECRET_KEY = 'local-test-placeholder-not-a-secret';
const { default: app } = await import('../dist/app.js');
const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
after(async () => {
  await Promise.all([new Promise(resolve => server.close(resolve)), new Promise(resolve => backend.close(resolve))]);
});
async function request(method, path, body, expected = 200) {
  const response = await fetch(base + path, { method, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  assert.match(response.headers.get('content-type'), /application\/json/);
  return data;
}
const category = { name: 'Pizzas', description: 'Pizzas artesanais', icon: '🍕', display_order: 1, active: true };
const product = { categoryId: randomUUID(), name: 'Margherita', description: 'Tomate e queijo', price: 35.9, image: '', available: true, active: true };

test('health, unknown route, UUID, search and JSON validation', async () => {
  await request('GET', '/'); await request('GET', '/missing', undefined, 404);
  for (const route of ['categories', 'products']) {
    for (const method of ['GET', 'PUT', 'DELETE']) await request(method, `/${route}/invalid`, undefined, 400);
    for (const body of [undefined, null, [], {}, 'text']) await request('POST', `/${route}`, body, 400);
  }
  for (const query of ['', '?keyword=%20', '?keyword=a&keyword=b', '?keyword=a%2Cb']) await request('GET', '/categories/search' + query, undefined, 400);
  const malformed = await fetch(base + '/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(malformed.status, 400); assert.equal((await malformed.json()).message, 'JSON inválido.');
});

test('required fields, types, numeric constraints and unknown properties', async () => {
  for (const [route, valid] of [['categories', category], ['products', product]]) {
    for (const key of Object.keys(valid)) {
      const missing = { ...valid }; delete missing[key];
      for (const method of ['POST', 'PUT']) {
        const path = '/' + route + (method === 'PUT' ? '/' + randomUUID() : '');
        await request(method, path, missing, 400);
        await request(method, path, { ...valid, [key]: null }, 400);
        await request(method, path, { ...valid, [key]: typeof valid[key] === 'string' ? 1 : 'invalid' }, 400);
      }
    }
    await request('POST', '/' + route, { ...valid, id: randomUUID() }, 400);
    await request('POST', '/' + route, { ...valid, name: '   ' }, 400);
    await request('POST', '/' + route, { ...valid, description: '' }, 400);
  }
  for (const price of [0, -1, '35.90']) await request('POST', '/products', { ...product, price }, 400);
  for (const display_order of [-1, 1.5, 2147483648]) await request('POST', '/categories', { ...category, display_order }, 400);
});

test('full CRUD through HTTP and Supabase SDK, with simulated FK errors', async () => {
  assert.deepEqual(await request('GET', '/categories'), []);
  assert.deepEqual(await request('GET', '/products'), []);
  const cat = await request('POST', '/categories', category, 201);
  assert.match(cat.id, /^[a-f0-9-]{36}$/);
  assert.equal((await request('GET', '/categories/' + cat.id)).name, category.name);
  assert.equal((await request('GET', '/categories/search?keyword=Pizza')).length, 1);
  await request('PUT', '/categories/' + cat.id, { ...category, name: 'Pizzas atualizadas' });
  const prod = await request('POST', '/products', { ...product, categoryId: cat.id }, 201);
  assert.equal((await request('GET', '/products/' + prod.id)).categoryId, cat.id);
  assert.equal((await request('GET', '/products')).length, 1);
  assert.equal((await request('PUT', '/products/' + prod.id, { ...product, categoryId: cat.id, price: 42 })).price, 42);
  await request('DELETE', '/categories/' + cat.id, undefined, 409);
  await request('POST', '/products', product, 409);
  await request('PUT', '/products/' + prod.id, product, 409);
  await request('DELETE', '/products/' + prod.id);
  await request('DELETE', '/categories/' + cat.id);
  for (const [route, data] of [['categories', category], ['products', product]]) {
    const id = randomUUID();
    await request('GET', `/${route}/${id}`, undefined, 404);
    await request('PUT', `/${route}/${id}`, { ...data, ...(route === 'products' ? { categoryId: cat.id } : {}) }, 404);
    await request('DELETE', `/${route}/${id}`, undefined, 404);
  }
});

test('unexpected database failure returns 500, not 404', async () => {
  failDatabase = true;
  try {
    for (const [route, body] of [['categories', category], ['products', product]]) {
      for (const [method, path, data] of [['GET', `/${route}`], ['GET', `/${route}/${randomUUID()}`], ['POST', `/${route}`, body], ['PUT', `/${route}/${randomUUID()}`, body], ['DELETE', `/${route}/${randomUUID()}`]]) {
        const result = await request(method, path, data, 500);
        assert.ok(!JSON.stringify(result).includes('simulated'));
      }
    }
  } finally { failDatabase = false; }
});
