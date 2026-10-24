export interface RangoFechasInfo {
  fecha_desde: string;
  fecha_hasta: string;
  dias_totales: number;
}

export interface VentasResumen {
  cantidad: number;
  ingresos: number | string;
}

// Alias de retrocompatibilidad
export type VentasHoyResumen = VentasResumen;

export interface ComprobantesResumen {
  total: number;
  aceptados: number;
  pendientes: number;
  rechazados: number;
}

export interface AlertasIAResumen {
  total: number;
  pendientes: number;
  nivel_alto: number;
  bajo: number;
  medio: number;
  alto: number;
}

export interface VentaDiaEvolucion {
  fecha: string;
  dia: string;
  total: number | string;
  cantidad: number;
}

export interface ComprobanteEstadoItem {
  estado: string;
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface AlertaNivelItem {
  nivel: 'ALTO' | 'MEDIO' | 'BAJO' | string;
  cantidad: number;
}

export interface AlertaRecienteItem {
  id: number;
  numero_venta?: string | null;
  cliente_razon_social?: string | null;
  nivel_alerta: 'ALTO' | 'MEDIO' | 'BAJO' | string;
  estado_revision: string;
  descripcion: string;
  created_at: string;
}

export interface VentaRecienteItem {
  id: number;
  numero_venta: string;
  cliente_razon_social?: string | null;
  fecha: string;
  total: number | string;
  estado: string;
}

export interface DashboardResumenResponse {
  rango_fechas: RangoFechasInfo;
  ventas: VentasResumen;
  ventas_hoy: VentasResumen;
  comprobantes: ComprobantesResumen;
  alertas_ia: AlertasIAResumen;
  evolucion_ventas: VentaDiaEvolucion[];
  comprobantes_distribucion: ComprobanteEstadoItem[];
  alertas_por_nivel: AlertaNivelItem[];
  alertas_recientes: AlertaRecienteItem[];
  ventas_recientes: VentaRecienteItem[];
}
