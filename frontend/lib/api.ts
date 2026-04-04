// Use relative path /api for same-domain deployment (Vercel)
// Or use absolute URL for local development
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001');

interface RequestOptions {
  userId?: string;
  headers?: Record<string, string>;
}

export async function apiCall(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
  options?: RequestOptions
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.userId) {
    headers['x-user-id'] = options.userId;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API error');
  }

  return response.json();
}

export async function getHealth() {
  return apiCall('/health');
}

export async function getUsers(userId: string) {
  return apiCall('/users', 'GET', undefined, { userId });
}

export async function createUser(name: string, email: string, role: string, status: string) {
  return apiCall('/users', 'POST', { name, email, role, status });
}

export async function getRecords(userId: string, skip = 0, limit = 10) {
  return apiCall(`/records?skip=${skip}&limit=${limit}`, 'GET', undefined, { userId });
}

export async function createRecord(userId: string, amount: number, type: string, category: string, date: string, notes?: string) {
  return apiCall('/records', 'POST', { amount, type, category, date, notes }, { userId });
}

export async function getDashboard(userId: string) {
  return apiCall('/dashboard', 'GET', undefined, { userId });
}
