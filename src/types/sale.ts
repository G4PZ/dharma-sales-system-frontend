export interface SaleItemCreate {
  producto_id: number;
  cantidad: number;
}

export interface SaleCreate {
  cliente_id: number;
  productos: SaleItemCreate[];
}

export interface SaleClientSummary {
  id: number;
  numero_documento: string;
  razon_social: string;
}

export interface SaleClientDetail {
  id: number;
  numero_documento: string;
  razon_social: string;
  nombre_contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
}

export interface SaleDetailResponse {
  id: number;
  producto_id: number;
  codigo_producto: string;
  nombre_producto: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;
}

export interface SaleListItemResponse {
  id: number;
  numero_venta: string;
  cliente: SaleClientSummary;
  fecha: string;
  cantidad_items: number;
  subtotal: number | string;
  igv: number | string;
  total: number | string;
  estado: string;
}

export interface SaleListResponse {
  items: SaleListItemResponse[];
  total: number;
  skip: number;
  limit: number;
}

export interface SaleResponse {
  id: number;
  numero_venta: string;
  cliente_id: number;
  cliente: SaleClientDetail;
  detalles: SaleDetailResponse[];
  subtotal: number | string;
  igv: number | string;
  total: number | string;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface TopProductStats {
  nombre: string | null;
  unidades: number;
}

export interface SaleStatsResponse {
  ventas_mes: number;
  monto_mes: number | string;
  producto_mas_vendido: TopProductStats;
  unidades_mes: number;
}

