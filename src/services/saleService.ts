import {
  SaleCreate,
  SaleResponse,
  SaleListResponse,
  SaleStatsResponse,
} from '@/types/sale';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function createSale(data: SaleCreate): Promise<SaleResponse> {
  const url = `${API_BASE_URL}/api/ventas`;
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
    throw new Error(errorData.detail || 'Error al registrar la venta');
  }

  return response.json();
}

export async function fetchSales(params: {
  search?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  skip?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<SaleListResponse> {
  const query = new URLSearchParams();

  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.estado && params.estado !== 'todos') {
    query.append('estado', params.estado);
  }
  if (params.fecha_desde) query.append('fecha_desde', params.fecha_desde);
  if (params.fecha_hasta) query.append('fecha_hasta', params.fecha_hasta);
  if (params.skip !== undefined) query.append('skip', params.skip.toString());
  if (params.limit !== undefined) query.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/ventas${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: params.signal,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener la lista de ventas');
  }

  return response.json();
}

export async function fetchSaleStats(): Promise<SaleStatsResponse> {
  const url = `${API_BASE_URL}/api/ventas/stats`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener estadísticas de ventas');
  }

  return response.json();
}

export async function fetchSaleById(id: number): Promise<SaleResponse> {
  const url = `${API_BASE_URL}/api/ventas/${id}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener el detalle de la venta');
  }

  return response.json();
}
