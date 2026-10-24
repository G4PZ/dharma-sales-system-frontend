import {
  Cliente,
  ClienteCreate,
  ClienteUpdate,
  ClientListResponse,
  ClientStats,
} from '@/types/client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchClients(params: {
  search?: string;
  estado?: string;
  skip?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ClientListResponse> {
  const query = new URLSearchParams();

  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.estado && params.estado !== 'todos') {
    query.append('estado', params.estado);
  }
  if (params.skip !== undefined) query.append('skip', params.skip.toString());
  if (params.limit !== undefined) query.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/clientes${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: params.signal,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener la lista de clientes');
  }

  return response.json();
}

export async function fetchClientStats(): Promise<ClientStats> {
  const url = `${API_BASE_URL}/api/clientes/stats`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener estadísticas de clientes');
  }

  return response.json();
}

export async function fetchClientById(id: number): Promise<Cliente> {
  const url = `${API_BASE_URL}/api/clientes/${id}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener los datos del cliente');
  }

  return response.json();
}

export async function createClient(data: ClienteCreate): Promise<Cliente> {
  const url = `${API_BASE_URL}/api/clientes`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al registrar el cliente');
  }

  return response.json();
}

export async function updateClient(
  id: number,
  data: ClienteUpdate
): Promise<Cliente> {
  const url = `${API_BASE_URL}/api/clientes/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al actualizar el cliente');
  }

  return response.json();
}

export async function toggleClientStatus(id: number): Promise<Cliente> {
  const url = `${API_BASE_URL}/api/clientes/${id}/toggle-status`;
  const response = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al cambiar estado del cliente');
  }

  return response.json();
}
