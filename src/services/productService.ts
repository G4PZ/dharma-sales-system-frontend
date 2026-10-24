import {
  EntradaStock,
  EntradaStockCreate,
  EntradaStockListResponse,
  HistorialPrecioListResponse,
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductListResponse,
  ProductStats,
} from '@/types/product';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchProducts(params: {
  search?: string;
  categoria?: string;
  estado?: string;
  nivel_stock?: string;
  skip?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();

  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.categoria && params.categoria !== 'todas') {
    query.append('categoria', params.categoria);
  }
  if (params.estado && params.estado !== 'todos') {
    query.append('estado', params.estado);
  }
  if (params.nivel_stock && params.nivel_stock !== 'todos') {
    query.append('nivel_stock', params.nivel_stock);
  }
  if (params.skip !== undefined) query.append('skip', params.skip.toString());
  if (params.limit !== undefined) query.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/productos${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: params.signal,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener la lista de productos');
  }

  return response.json();
}

export async function fetchProductStats(): Promise<ProductStats> {
  const url = `${API_BASE_URL}/api/productos/stats`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener estadísticas');
  }

  return response.json();
}

export async function createProduct(data: ProductoCreate): Promise<Producto> {
  const url = `${API_BASE_URL}/api/productos`;
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
    throw new Error(errorData.detail || 'Error al registrar el producto');
  }

  return response.json();
}

export async function updateProduct(
  id: number,
  data: ProductoUpdate
): Promise<Producto> {
  const url = `${API_BASE_URL}/api/productos/${id}`;
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
    throw new Error(errorData.detail || 'Error al actualizar el producto');
  }

  return response.json();
}

export async function toggleProductStatus(id: number): Promise<Producto> {
  const url = `${API_BASE_URL}/api/productos/${id}/toggle-status`;
  const response = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al cambiar estado del producto');
  }

  return response.json();
}

export async function createStockEntry(
  productId: number,
  data: EntradaStockCreate
): Promise<EntradaStock> {
  const url = `${API_BASE_URL}/api/productos/${productId}/entradas-stock`;
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
    throw new Error(errorData.detail || 'Error al registrar la entrada de stock');
  }

  return response.json();
}

export async function fetchStockEntries(
  productId: number,
  skip: number = 0,
  limit: number = 50
): Promise<EntradaStockListResponse> {
  const url = `${API_BASE_URL}/api/productos/${productId}/entradas-stock?skip=${skip}&limit=${limit}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener el historial de reposiciones');
  }

  return response.json();
}

export async function fetchPriceHistory(
  productId: number,
  skip: number = 0,
  limit: number = 50
): Promise<HistorialPrecioListResponse> {
  const url = `${API_BASE_URL}/api/productos/${productId}/historial-precios?skip=${skip}&limit=${limit}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener el historial de precios');
  }

  return response.json();
}
