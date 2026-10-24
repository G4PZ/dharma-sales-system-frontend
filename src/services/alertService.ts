import {
  AlertListResponse,
  AlertStatsResponse,
  AlertDetailResponse,
  ModelsStatusResponse,
  ModelsReadinessResponse,
  TrainingExecutionResponse,
  SaleAnalysisResponse,
  AlertFeedbackPayload,
} from '@/types/alert';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AlertQueryParams {
  skip?: number;
  limit?: number;
  nivel?: string;
  estado_revision?: string;
  cliente_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  signal?: AbortSignal;
}

/**
 * Consulta la lista paginada y filtrada de alertas IA.
 */
export async function fetchAlerts(
  params: AlertQueryParams = {}
): Promise<AlertListResponse> {
  const query = new URLSearchParams();

  if (params.skip !== undefined) query.append('skip', params.skip.toString());
  if (params.limit !== undefined) query.append('limit', params.limit.toString());
  if (params.nivel && params.nivel !== 'TODOS') query.append('nivel', params.nivel);
  if (params.estado_revision && params.estado_revision !== 'TODOS') {
    query.append('estado_revision', params.estado_revision);
  }
  if (params.cliente_id) query.append('cliente_id', params.cliente_id.toString());
  if (params.fecha_inicio) query.append('fecha_inicio', params.fecha_inicio);
  if (params.fecha_fin) query.append('fecha_fin', params.fecha_fin);

  const url = `${API_BASE_URL}/api/alertas${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store',
    signal: params.signal,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener la lista de alertas');
  }

  return response.json();
}

/**
 * Consulta las estadísticas agregadas de alertas.
 */
export async function fetchAlertStats(): Promise<AlertStatsResponse> {
  const url = `${API_BASE_URL}/api/alertas/stats`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener estadísticas de alertas');
  }

  return response.json();
}

/**
 * Consulta el estado y disponibilidad actual de los modelos ML.
 */
export async function fetchModelsStatus(): Promise<ModelsStatusResponse> {
  const url = `${API_BASE_URL}/api/alertas/modelos/estado`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al consultar disponibilidad de modelos');
  }

  return response.json();
}

/**
 * Consulta el progreso y preparación para entrenamiento de modelos (guard requirements).
 */
export async function fetchModelsReadiness(): Promise<ModelsReadinessResponse> {
  const url = `${API_BASE_URL}/api/alertas/modelos/preparacion`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al consultar preparación de modelos');
  }

  return response.json();
}

/**
 * Consulta el detalle completo de una alerta específica incluyendo factores explicables.
 */
export async function fetchAlertDetail(id: number): Promise<AlertDetailResponse> {
  const url = `${API_BASE_URL}/api/alertas/${id}`;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al obtener el detalle de la alerta');
  }

  return response.json();
}

/**
 * Registra retroalimentación humana sobre una alerta (CONFIRMADA o FALSO_POSITIVO).
 */
export async function submitAlertFeedback(
  id: number,
  payload: AlertFeedbackPayload
): Promise<AlertDetailResponse> {
  const url = `${API_BASE_URL}/api/alertas/${id}/feedback`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al registrar retroalimentación de alerta');
  }

  return response.json();
}

/**
 * Ejecuta el entrenamiento manual de K-Means (segmentación contextual de clientes).
 */
export async function trainKMeans(): Promise<TrainingExecutionResponse> {
  const url = `${API_BASE_URL}/api/alertas/modelos/entrenar/kmeans`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al entrenar modelo K-Means');
  }

  return response.json();
}

/**
 * Ejecuta el entrenamiento manual de Isolation Forest (detección de ventas inusuales).
 */
export async function trainIsolationForest(): Promise<TrainingExecutionResponse> {
  const url = `${API_BASE_URL}/api/alertas/modelos/entrenar/isolation-forest`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al entrenar modelo Isolation Forest');
  }

  return response.json();
}

/**
 * Analiza manualmente una operación de venta existente mediante el motor IA por su número correlativo.
 */
export async function analyzeSaleManually(
  numeroVenta: string
): Promise<SaleAnalysisResponse> {
  const cleanNumber = numeroVenta.trim().toUpperCase();
  const url = `${API_BASE_URL}/api/alertas/analizar/numero/${encodeURIComponent(cleanNumber)}`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al analizar la venta');
  }

  return response.json();
}

/**
 * Endpoint de compatibilidad técnica para analizar directamente por venta_id interno.
 */
export async function analyzeSaleById(
  ventaId: number
): Promise<SaleAnalysisResponse> {
  const url = `${API_BASE_URL}/api/alertas/analizar/${ventaId}`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al analizar la venta');
  }

  return response.json();
}
