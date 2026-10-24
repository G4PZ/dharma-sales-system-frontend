import { DashboardResumenResponse } from '@/types/dashboard';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Consulta el resumen integral de Business Intelligence para el Dashboard Dharma:
 * - Parámetros opcionales fecha_desde y fecha_hasta (YYYY-MM-DD).
 * - Si no se especifican, el backend aplica por defecto los últimos 7 días.
 * - Todos los indicadores, series temporales y feeds se calculan usando dicho rango.
 */
export async function fetchDashboardSummary(
  fechaDesde?: string,
  fechaHasta?: string,
  signal?: AbortSignal
): Promise<DashboardResumenResponse> {
  const query = new URLSearchParams();
  if (fechaDesde && fechaDesde.trim()) {
    query.append('fecha_desde', fechaDesde.trim());
  }
  if (fechaHasta && fechaHasta.trim()) {
    query.append('fecha_hasta', fechaHasta.trim());
  }

  const url = `${API_BASE_URL}/api/dashboard/resumen${
    query.toString() ? `?${query.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    signal,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || 'Error al obtener el resumen del Dashboard Dharma'
    );
  }

  return response.json();
}
