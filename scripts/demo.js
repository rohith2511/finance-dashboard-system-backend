/*
End-to-end demo script for the Finance Dashboard Backend.

Usage:
  npm run demo

Notes:
- Starts no servers. Ensure MongoDB + API are already running.
- Bootstrap mode: if the DB has 0 users, POST /users will create the first admin without x-user-id.
- Non-bootstrap mode: set ADMIN_ID env var to an existing admin user's id.

Env:
- BASE_URL (default: http://127.0.0.1:3001)
- ADMIN_ID (required if not in bootstrap mode)
*/

const DEFAULT_BASE_URL = 'http://127.0.0.1:3001';

function requireOk(res, bodyText) {
  if (!res.ok) {
    const msg = bodyText?.trim() ? bodyText.trim() : `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
}

async function http(method, url, { headers, json } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {})
    },
    body: json ? JSON.stringify(json) : undefined
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { res, data, text };
}

function pickId(userCreateResponse) {
  // API returns { data: { id: '...' } } for users
  return userCreateResponse?.data?.id;
}

async function main() {
  const baseUrl = process.env.BASE_URL || DEFAULT_BASE_URL;
  const runId = Date.now();

  console.log(`Base URL: ${baseUrl}`);

  // 1) Health
  {
    const { res, data, text } = await http('GET', `${baseUrl}/health`);
    requireOk(res, text);
    console.log('Health:', data);
  }

  // 2) Admin bootstrap (or reuse existing)
  let adminId = process.env.ADMIN_ID;
  if (!adminId) {
    const { res, data, text } = await http('POST', `${baseUrl}/users`, {
      json: {
        name: 'Admin',
        email: `admin+${runId}@example.com`,
        role: 'admin',
        status: 'active'
      }
    });

    if (res.ok) {
      adminId = pickId(data);
      console.log('Bootstrapped admin:', data);
    } else {
      // likely non-bootstrap mode
      console.log('Bootstrap admin failed (expected if DB already has users).');
      console.log('Response:', text);
      throw new Error('Set ADMIN_ID env var to an existing admin user id, then re-run: ADMIN_ID=<id> npm run demo');
    }
  }

  const adminHeaders = { 'x-user-id': adminId };

  // 3) Create analyst + viewer (admin-only)
  const analystEmail = `analyst+${runId}@example.com`;
  const viewerEmail = `viewer+${runId}@example.com`;

  const { data: analyst } = await http('POST', `${baseUrl}/users`, {
    headers: adminHeaders,
    json: { name: 'Analyst', email: analystEmail, role: 'analyst', status: 'active' }
  }).then(({ res, data, text }) => {
    requireOk(res, text);
    return { data };
  });

  const { data: viewer } = await http('POST', `${baseUrl}/users`, {
    headers: adminHeaders,
    json: { name: 'Viewer', email: viewerEmail, role: 'viewer', status: 'active' }
  }).then(({ res, data, text }) => {
    requireOk(res, text);
    return { data };
  });

  const analystId = pickId(analyst);
  const viewerId = pickId(viewer);

  console.log('Created analyst:', analyst);
  console.log('Created viewer:', viewer);

  // 4) Admin creates two records
  {
    const r1 = await http('POST', `${baseUrl}/records`, {
      headers: adminHeaders,
      json: { amount: 2500, type: 'income', category: 'Salary', date: '2026-04-01', notes: 'April salary' }
    });
    requireOk(r1.res, r1.text);

    const r2 = await http('POST', `${baseUrl}/records`, {
      headers: adminHeaders,
      json: { amount: 120, type: 'expense', category: 'Groceries', date: '2026-04-02', notes: 'Food' }
    });
    requireOk(r2.res, r2.text);

    console.log('Created records (admin).');
  }

  // 5) Viewer: can list records, but cannot create records
  {
    const viewerHeaders = { 'x-user-id': viewerId };

    const list = await http('GET', `${baseUrl}/records?limit=5`, { headers: viewerHeaders });
    requireOk(list.res, list.text);
    console.log('Viewer list records: OK');

    const create = await http('POST', `${baseUrl}/records`, {
      headers: viewerHeaders,
      json: { amount: 1, type: 'expense', category: 'Test', date: '2026-04-03', notes: 'should fail' }
    });

    console.log(`Viewer create record status: ${create.res.status} (expected 403)`);
  }

  // 6) Analyst: dashboard summary OK
  {
    const analystHeaders = { 'x-user-id': analystId };
    const summary = await http('GET', `${baseUrl}/dashboard/summary?recentLimit=3`, { headers: analystHeaders });
    requireOk(summary.res, summary.text);
    console.log('Analyst dashboard summary:', summary.data);
  }

  // 7) Viewer: dashboard should be forbidden
  {
    const viewerHeaders = { 'x-user-id': viewerId };
    const summary = await http('GET', `${baseUrl}/dashboard/summary?recentLimit=3`, { headers: viewerHeaders });
    console.log(`Viewer dashboard status: ${summary.res.status} (expected 403)`);
  }

  console.log('\nDemo complete.');
  console.log(`Admin ID: ${adminId}`);
  console.log(`Analyst ID: ${analystId}`);
  console.log(`Viewer ID: ${viewerId}`);
}

main().catch((err) => {
  console.error('\nDemo failed:', err.message);
  process.exitCode = 1;
});
