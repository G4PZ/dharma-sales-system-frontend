'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Plus, PackagePlus } from 'lucide-react';
import ProductStatsCards from '@/components/productos/ProductStatsCards';
import ProductFilters from '@/components/productos/ProductFilters';
import ProductTable from '@/components/productos/ProductTable';
import ProductModal from '@/components/productos/ProductModal';
import ProductStatusConfirmModal from '@/components/productos/ProductStatusConfirmModal';
import StockEntryModal from '@/components/productos/StockEntryModal';
import LowStockAlertsWidget from '@/components/productos/LowStockAlertsWidget';
import {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  ProductStats,
} from '@/types/product';
import {
  fetchProducts,
  fetchProductStats,
  createProduct,
  updateProduct,
  toggleProductStatus,
} from '@/services/productService';

function ProductosContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search');
  // Estados de datos
  const [products, setProducts] = useState<Producto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [stats, setStats] = useState<ProductStats | null>(null);

  // Estados de carga y feedback
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Estados de filtros y paginación
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('todas');
  const [nivelStock, setNivelStock] = useState<string>('todos');
  const [estado, setEstado] = useState<string>('todos');
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Estado del modal de creación / edición
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Producto | null>(null);

  // Estado del modal de reposición / entradas de stock
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [productForStock, setProductForStock] = useState<Producto | null>(null);

  // Estado del modal de confirmación de activación / desactivación
  const [productToToggle, setProductToToggle] = useState<Producto | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

  // Manejador de notificaciones Toast
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Debounce para búsqueda textual
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setSkip(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sincronizar parámetro search de la URL
  useEffect(() => {
    if (urlSearch !== null) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
      setSkip(0);
    }
  }, [urlSearch]);

  // Carga asíncrona de datos
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [productsRes, statsRes] = await Promise.all([
          fetchProducts({
            search: debouncedSearch,
            categoria,
            estado,
            nivel_stock: nivelStock,
            skip,
            limit,
          }),
          fetchProductStats(),
        ]);

        if (!ignore) {
          setProducts(productsRes.items);
          setTotal(productsRes.total);
          setStats(statsRes);
          setLoading(false);
          setStatsLoading(false);
        }
      } catch (error: unknown) {
        if (!ignore) {
          const msg =
            error instanceof Error ? error.message : 'Error al cargar productos';
          showToast('error', msg);
          setLoading(false);
          setStatsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, categoria, estado, nivelStock, skip, limit, refreshTrigger, showToast]);

  // Manejadores de filtros
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategoria('todas');
    setNivelStock('todos');
    setEstado('todos');
    setSkip(0);
  };

  const handleFilterLowStockFromKpi = () => {
    setNivelStock('bajo');
    setSkip(0);
  };

  // Manejadores de paginación
  const handlePageChange = (newPage: number) => {
    setSkip((newPage - 1) * limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setSkip(0);
  };

  // Manejadores del modal de producto
  const handleOpenNewModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Producto) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  // Manejadores de entradas de stock
  const handleOpenStockModalFromRow = (product: Producto) => {
    setProductForStock(product);
    setIsStockModalOpen(true);
  };

  const handleOpenStockModalFromHeader = () => {
    setProductForStock(null);
    setIsStockModalOpen(true);
  };

  const handleStockEntrySuccess = (msg: string) => {
    showToast('success', msg);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSaveProduct = async (
    data: ProductoCreate | ProductoUpdate
  ): Promise<void> => {
    if (productToEdit) {
      await updateProduct(productToEdit.id, data as ProductoUpdate);
      showToast('success', `Producto '${productToEdit.nombre}' actualizado con éxito.`);
    } else {
      await createProduct(data as ProductoCreate);
      showToast('success', `Producto '${(data as ProductoCreate).nombre}' registrado con éxito.`);
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  // Manejador de confirmación para activar / desactivar
  const handleRequestToggleStatus = (product: Producto) => {
    setProductToToggle(product);
    setIsConfirmModalOpen(true);
  };

  const handleCancelToggleStatus = () => {
    setIsConfirmModalOpen(false);
    setProductToToggle(null);
  };

  const handleConfirmToggleStatus = async () => {
    if (!productToToggle) return;

    try {
      setIsTogglingStatus(true);
      const updated = await toggleProductStatus(productToToggle.id);
      const newStatusText = updated.is_active ? 'activado' : 'desactivado';
      showToast('success', `Producto '${productToToggle.nombre}' ${newStatusText}.`);
      setRefreshTrigger((prev) => prev + 1);
      setIsConfirmModalOpen(false);
      setProductToToggle(null);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Error al cambiar estado del producto';
      showToast('error', msg);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Categorías disponibles
  const availableCategories = Array.from(
    new Set([
      'Papel y Celulosa',
      'Limpieza y Desinfección',
      'Seguridad e Higiene',
      'Bolsas y Embalajes',
      'Utensilios de Limpieza',
      'Equipamiento',
      ...products.map((p) => p.categoria),
    ])
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Acciones Superiores */}
      <div className="flex justify-end gap-2.5">
        {/* Botón Registrar Ingreso */}
        <button
          type="button"
          onClick={handleOpenStockModalFromHeader}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <PackagePlus className="w-4 h-4 text-blue-600" />
          <span>Registrar Ingreso</span>
        </button>

        {/* Botón Nuevo Producto */}
        <button
          type="button"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo producto</span>
        </button>
      </div>

      {/* 4 Tarjetas KPI Superiores */}
      <ProductStatsCards
        stats={stats}
        loading={statsLoading}
        onFilterLowStock={handleFilterLowStockFromKpi}
      />

      {/* Grid Principal: Columna de Productos (72%) + Panel Lateral (28%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Tabla y Controles */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6">
            {/* Filtros y Búsqueda */}
            <ProductFilters
              search={search}
              categoria={categoria}
              nivelStock={nivelStock}
              estado={estado}
              onSearchChange={setSearch}
              onCategoriaChange={(val) => {
                setCategoria(val);
                setSkip(0);
              }}
              onNivelStockChange={(val) => {
                setNivelStock(val);
                setSkip(0);
              }}
              onEstadoChange={(val) => {
                setEstado(val);
                setSkip(0);
              }}
              onResetFilters={handleResetFilters}
              categoriesList={availableCategories}
            />

            {/* Tabla de Productos */}
            <div className="mt-4">
              <ProductTable
                products={products}
                total={total}
                skip={skip}
                limit={limit}
                loading={loading}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onEdit={handleOpenEditModal}
                onToggleStatus={handleRequestToggleStatus}
                onStockEntry={handleOpenStockModalFromRow}
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Alertas de Stock y Reportes */}
        <div className="lg:col-span-4 xl:col-span-3">
          <LowStockAlertsWidget
            alerts={stats?.alertas_stock || []}
            onViewAllAlerts={handleFilterLowStockFromKpi}
            onSelectItem={(id) => {
              const prod = products.find((p) => p.id === id);
              if (prod) handleOpenEditModal(prod);
            }}
          />
        </div>
      </div>

      {/* Modal de Registro / Edición de Producto */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        productToEdit={productToEdit}
        existingCategories={availableCategories}
      />

      {/* Modal de Reposición / Entradas de Stock */}
      <StockEntryModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSuccess={handleStockEntrySuccess}
        initialProduct={productForStock}
        allProducts={products}
      />

      {/* Modal de Confirmación de Activación / Desactivación */}
      <ProductStatusConfirmModal
        isOpen={isConfirmModalOpen}
        product={productToToggle}
        isLoading={isTogglingStatus}
        onConfirm={handleConfirmToggleStatus}
        onCancel={handleCancelToggleStatus}
      />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Cargando catálogo de productos...
        </div>
      }
    >
      <ProductosContent />
    </Suspense>
  );
}
