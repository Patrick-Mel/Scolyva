const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('scolyva_access_token') : null;
  const schoolId = typeof window !== 'undefined' ? localStorage.getItem('scolyva_school_id') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (schoolId) {
    headers['X-School-ID'] = schoolId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 402 || response.status === 403) {
      if (data.detail && data.detail.includes('lecture seule')) {
        throw new Error("READ_ONLY_EXPIRED: " + data.detail);
      }
    }
    throw new Error(data.message || data.error || data.detail || 'Une erreur est survenue.');
  }

  return data;
}
