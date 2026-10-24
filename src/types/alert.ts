export interface AlertSaleSummary {
  id: number;
  numero_venta: string;
  total: number | string;
  created_at: string;
}

export interface AlertClientSummary {
  id: number;
  numero_documento: string;
  razon_social: string;
}

export interface AlertModelSummary {
  id: number;
  tipo_modelo: string;
  version: string;
}

export interface ContributingFactor {
  factor: string;
  descripcion: string;
  valor_actual?: number | string | null;
  valor_referencia?: number | string | null;
  ratio?: number | null;
  [key: string]: unknown;
}

export type AlertLevel = 'BAJO' | 'MEDIO' | 'ALTO';
export type ReviewStatus = 'PENDIENTE' | 'CONFIRMADA' | 'FALSO_POSITIVO';

export interface AlertResponse {
  id: number;
  venta_id: number;
  numero_venta?: string | null;
  cliente_id: number;
  cliente_razon_social?: string | null;
  modelo_isolation_forest_id: number;
  modelo_kmeans_id?: number | null;
  puntaje_anomalia: number | string;
  nivel_alerta: AlertLevel;
  cluster_perfil_id?: number | null;
  perfil_nombre?: string | null;
  descripcion: string;
  estado_revision: ReviewStatus;
  revisado_por?: string | null;
  fecha_revision?: string | null;
  created_at: string;
}

export interface AlertDetailResponse extends AlertResponse {
  factores_contribuyentes: ContributingFactor[];
  retroalimentacion_notas?: string | null;
  venta?: AlertSaleSummary | null;
  cliente?: AlertClientSummary | null;
  modelo_isolation_forest?: AlertModelSummary | null;
  modelo_kmeans?: AlertModelSummary | null;
}

export interface AlertListResponse {
  items: AlertResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface AlertStatsResponse {
  total: number;
  pendientes: number;
  confirmadas: number;
  falsos_positivos: number;
  bajo: number;
  medio: number;
  alto: number;
}

export interface ModelAvailabilityInfo {
  disponible: boolean;
  estado: string;
  version?: string | null;
  fecha_entrenamiento?: string | null;
  total_muestras: number;
  mensaje?: string | null;
}

export interface ModelsStatusResponse {
  isolation_forest: ModelAvailabilityInfo;
  kmeans: ModelAvailabilityInfo;
}

export interface KMeansReadiness {
  clientes_totales: number;
  clientes_elegibles: number;
  compras_minimas_por_cliente: number;
  clientes_minimos_requeridos: number;
  puede_entrenar: boolean;
  porcentaje_progreso: number;
}

export interface IsolationForestReadiness {
  ventas_completadas: number;
  ventas_minimas_requeridas: number;
  puede_entrenar: boolean;
  porcentaje_progreso: number;
}

export interface ModelsReadinessResponse {
  kmeans: KMeansReadiness;
  isolation_forest: IsolationForestReadiness;
}

export interface TrainingExecutionResponse {
  status: string;
  modelo_id: number;
  version: string;
  total_muestras: number;
  ruta_artefacto: string;
  metricas: Record<string, unknown>;
  resumen_modelo: Record<string, unknown>;
}

export interface SaleAnalysisResponse {
  venta_id: number;
  numero_venta?: string;
  cliente_id: number;
  nivel_alerta: 'NORMAL' | AlertLevel;
  puntaje_anomalia: number;
  raw_anomaly_score: number;
  alerta_generada: boolean;
  alerta_id?: number | null;
  ya_analizada: boolean;
  modelo_isolation_forest_id: number;
  modelo_isolation_forest_version: string;
  modelo_kmeans_id?: number | null;
  modelo_kmeans_version?: string | null;
  cluster_perfil_id?: number | null;
  perfil_nombre?: string | null;
  descripcion: string;
  factores_contribuyentes: ContributingFactor[];
}

export interface AlertFeedbackPayload {
  estado_revision: 'CONFIRMADA' | 'FALSO_POSITIVO';
  retroalimentacion_notas?: string;
}
