export interface ComprobanteListItem {
  id: number;
  venta_id: number;
  numero_venta: string;
  cliente_numero_documento: string;
  cliente_razon_social: string;
  tipo_comprobante: string;
  nombre_tipo: string;
  serie: string;
  correlativo: number;
  numero_comprobante: string;
  total: number | string;
  fecha_emision: string;
  estado: string;
  created_at: string;
}

export interface ComprobanteListResponse {
  items: ComprobanteListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface ReceiptCreate {
  venta_id: number;
  tipo_comprobante: '01' | '03' | string;
}

export interface ReceiptClient {
  id: number;
  numero_documento: string;
  razon_social: string;
  direccion: string | null;
  email: string | null;
  telefono: string | null;
}

export interface ReceiptItem {
  id: number;
  producto_id: number;
  codigo_producto: string;
  nombre_producto: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;
}

export interface ReceiptSunatResponse {
  id: number;
  codigo: string | null;
  estado: string | null;
  descripcion: string | null;
  observaciones: unknown;
  ticket: string | null;
  fecha_respuesta: string | null;
  created_at: string;
}

export interface ComprobanteDetail {
  id: number;
  venta_id: number;
  tipo_comprobante: string;
  nombre_tipo: string;
  serie: string;
  correlativo: number;
  numero_comprobante: string;
  fecha_emision: string;
  estado: string;
  created_at: string;
  updated_at: string;
  venta: {
    id: number;
    numero_venta: string;
    subtotal: number | string;
    igv: number | string;
    total: number | string;
    created_at: string;
  };
  cliente: ReceiptClient;
  detalles: ReceiptItem[];
  respuestas_sunat: ReceiptSunatResponse[];
  resumen_diario?: {
    id: number;
    identificador: string;
    fecha_resumen: string;
    estado: string;
    ticket: string | null;
    codigo_respuesta: string | null;
    descripcion_respuesta: string | null;
    observaciones: unknown;
    fecha_envio: string | null;
    fecha_respuesta: string | null;
  } | null;
}

export interface ReceiptStats {
  total_comprobantes: number;
  facturas_count: number;
  boletas_count: number;
  pendientes_envio: number;
}

export interface AvailableSale {
  id: number;
  numero_venta: string;
  cliente_id: number;
  cliente_numero_documento: string;
  cliente_razon_social: string;
  subtotal: number | string;
  igv: number | string;
  total: number | string;
  created_at: string;
}

export interface AvailableSalesResponse {
  items: AvailableSale[];
  total: number;
  skip: number;
  limit: number;
}

export interface DailySummaryReceiptItem {
  id: number;
  comprobante_id: number;
  numero_comprobante: string;
  tipo_comprobante: string;
  serie: string;
  correlativo: number;
  numero_venta: string;
  cliente_numero_documento: string;
  cliente_razon_social: string;
  total: number | string;
  fecha_emision: string;
  estado: string;
}

export interface DailySummaryListItem {
  id: number;
  identificador: string;
  fecha_documentos: string;
  fecha_resumen: string;
  correlativo: number;
  estado: string;
  ticket: string | null;
  codigo_respuesta: string | null;
  descripcion_respuesta: string | null;
  total_boletas: number;
  monto_total: number | string;
  fecha_envio: string | null;
  fecha_respuesta: string | null;
  created_at: string;
}

export interface DailySummaryDetail {
  id: number;
  identificador: string;
  fecha_documentos: string;
  fecha_resumen: string;
  correlativo: number;
  estado: string;
  ticket: string | null;
  codigo_respuesta: string | null;
  descripcion_respuesta: string | null;
  observaciones: unknown;
  xml_file: string | null;
  cdr_file: string | null;
  fecha_envio: string | null;
  fecha_respuesta: string | null;
  created_at: string;
  updated_at: string;
  total_boletas: number;
  monto_total: number | string;
  boletas: DailySummaryReceiptItem[];
}

export interface DailySummaryListResponse {
  items: DailySummaryListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface PendingBoletasGroup {
  fecha: string;
  cantidad_boletas: number;
  monto_total: number | string;
  boletas: DailySummaryReceiptItem[];
}

export interface PendingBoletasResponse {
  grupos: PendingBoletasGroup[];
  total_pendientes: number;
}

