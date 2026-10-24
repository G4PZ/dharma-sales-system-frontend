export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  precio: number | string;
  stock: number;
  stock_minimo: number;
  unidad_medida: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductoCreate {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoria: string;
  precio: number;
  stock_minimo: number;
  unidad_medida: string;
  is_active?: boolean;
}

export interface ProductoUpdate {
  descripcion?: string | null;
  categoria?: string;
  precio?: number;
  stock_minimo?: number;
  unidad_medida?: string;
}

export interface EntradaStock {
  id: number;
  producto_id: number;
  cantidad: number;
  costo_unitario: number | string;
  fecha_ingreso: string;
  observaciones?: string | null;
  created_at: string;
}

export interface EntradaStockCreate {
  cantidad: number;
  costo_unitario: number;
  nuevo_precio_venta?: number | null;
  observaciones?: string | null;
  fecha_ingreso?: string | null;
}

export interface EntradaStockListResponse {
  items: EntradaStock[];
  total: number;
  skip: number;
  limit: number;
}

export interface HistorialPrecio {
  id: number;
  producto_id: number;
  precio_anterior: number | string;
  precio_nuevo: number | string;
  motivo: string;
  fecha_cambio: string;
  created_at: string;
}

export interface HistorialPrecioListResponse {
  items: HistorialPrecio[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductListResponse {
  items: Producto[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductAlertItem {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  stock_minimo: number;
  unidad_medida: string;
}

export interface ProductStats {
  productos_activos: number;
  stock_bajo_count: number;
  categorias_count: number;
  valor_inventario: number | string;
  alertas_stock: ProductAlertItem[];
}

export interface ProductFiltersState {
  search: string;
  categoria: string;
  nivel_stock: string;
  estado: string;
  page: number;
  pageSize: number;
}
