import {
  AvailableSalesResponse,
  ComprobanteDetail,
  ComprobanteListResponse,
  ReceiptCreate,
  ReceiptStats,
} from '@/types/receipt';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchReceipts(params: {
  search?: string;
  tipo?: string;
  estado?: string;
  skip?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ComprobanteListResponse> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.tipo && params.tipo !== 'todos') query.append('tipo', params.tipo);
  if (params.estado && params.estado !== 'todos') query.append('estado', params.estado);
  if (params.skip !== undefined) query.append('skip', params.skip.toString());
  if (params.limit !== undefined) query.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/comprobantes${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: params.signal,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener la lista de comprobantes');
  }

  return response.json();
}

export async function fetchReceiptStats(): Promise<ReceiptStats> {
  const url = `${API_BASE_URL}/api/comprobantes/stats`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener estadísticas de comprobantes');
  }

  return response.json();
}

export async function fetchAvailableSales(params?: {
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<AvailableSalesResponse> {
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.append('search', params.search.trim());
  if (params?.skip !== undefined) query.append('skip', params.skip.toString());
  if (params?.limit !== undefined) query.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/comprobantes/ventas-disponibles${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener ventas disponibles');
  }

  return response.json();
}

export async function fetchReceiptDetail(id: number): Promise<ComprobanteDetail> {
  const url = `${API_BASE_URL}/api/comprobantes/${id}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener el detalle del comprobante');
  }

  return response.json();
}

export async function createReceipt(data: ReceiptCreate): Promise<ComprobanteDetail> {
  const url = `${API_BASE_URL}/api/comprobantes`;
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
    throw new Error(errorData.detail || 'Error al emitir el comprobante');
  }

  return response.json();
}

export async function sendInvoiceToSunat(receiptId: number): Promise<{
  success: boolean;
  comprobante_id: number;
  numero_comprobante: string;
  estado: string;
  enviado_sunat: boolean;
  mensaje: string;
  xml_file?: string;
  cdr_file?: string;
  codigo?: string;
  descripcion?: string;
}> {
  const url = `${API_BASE_URL}/api/comprobantes/${receiptId}/enviar-sunat`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al enviar la factura al microservicio SUNAT');
  }

  return response.json();
}

export async function fetchPendingBoletasByDate(): Promise<import('@/types/receipt').PendingBoletasResponse> {
  const url = `${API_BASE_URL}/api/comprobantes/boletas-pendientes-resumen`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener boletas pendientes');
  }

  return response.json();
}

export async function createDailySummary(fechaDocumentos: string): Promise<import('@/types/receipt').DailySummaryDetail> {
  const url = `${API_BASE_URL}/api/comprobantes/resumenes-diarios`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fecha_documentos: fechaDocumentos }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al generar el Resumen Diario');
  }

  return response.json();
}

export async function fetchDailySummaries(params?: {
  skip?: number;
  limit?: number;
}): Promise<import('@/types/receipt').DailySummaryListResponse> {
  const query = new URLSearchParams();
  if (params?.skip !== undefined) query.append('skip', params.skip.toString());
  if (params?.limit !== undefined) query.append('limit', params.limit.toString());

  const url = `${API_BASE_URL}/api/comprobantes/resumenes-diarios${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al listar los Resúmenes Diarios');
  }

  return response.json();
}

export async function fetchDailySummaryDetail(summaryId: number): Promise<import('@/types/receipt').DailySummaryDetail> {
  const url = `${API_BASE_URL}/api/comprobantes/resumenes-diarios/${summaryId}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener el detalle del Resumen Diario');
  }

  return response.json();
}

export async function sendExistingDailySummary(summaryId: number): Promise<import('@/types/receipt').DailySummaryDetail> {
  const url = `${API_BASE_URL}/api/comprobantes/resumenes-diarios/${summaryId}/enviar`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al enviar el Resumen Diario');
  }

  return response.json();
}

export async function checkDailySummaryTicket(summaryId: number): Promise<import('@/types/receipt').DailySummaryDetail> {
  const url = `${API_BASE_URL}/api/comprobantes/resumenes-diarios/${summaryId}/consultar`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al consultar el ticket ante SUNAT');
  }

  return response.json();
}

