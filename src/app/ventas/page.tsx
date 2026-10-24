'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import SaleStatsCards from '@/components/ventas/SaleStatsCards';
import SaleFilters from '@/components/ventas/SaleFilters';
import SaleTable from '@/components/ventas/SaleTable';
import SaleDetailModal from '@/components/ventas/SaleDetailModal';
import { SaleListItemResponse, SaleStatsResponse } from '@/types/sale';
import { fetchSales, fetchSaleStats } from '@/services/saleService';

function VentasContent() {
  // Estados de datos
  const [sales, setSales] = useState<SaleListItemResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [stats, setStats] = useState<SaleStatsResponse | null>(null);

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
  const [estado, setEstado] = useState<string>('todos');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  // Estado del modal de detalle
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Notificaciones Toast
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Debounce para búsqueda textual (300 ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setSkip(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Validación de rango de fechas
  useEffect(() => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setDateError("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.");
    } else {
      setDateError(null);
    }
  }, [fechaDesde, fechaHasta]);

  // Carga asíncrona de datos desde FastAPI
  useEffect(() => {
    // Si el rango de fechas es inválido, no consultar el backend hasta corregir
    if (dateError) {
      return;
    }

    let ignore = false;
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      try {
        const [salesRes, statsRes] = await Promise.all([
          fetchSales({
            search: debouncedSearch,
            estado,
            fecha_desde: fechaDesde || undefined,
            fecha_hasta: fechaHasta || undefined,
            skip,
            limit,
            signal: controller.signal,
          }),
          fetchSaleStats(),
        ]);

        if (!ignore) {
          setSales(salesRes.items);
          setTotal(salesRes.total);
          setStats(statsRes);
          setLoading(false);
          setStatsLoading(false);
        }
      } catch (error: unknown) {
        if (!ignore) {
          // No mostrar error si la petición fue cancelada por debounce o nuevo filtro
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          const msg =
            error instanceof Error ? error.message : 'Error al cargar ventas';
          showToast('error', msg);
          setLoading(false);
          setStatsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [debouncedSearch, estado, fechaDesde, fechaHasta, dateError, skip, limit, showToast]);

  // Manejadores de filtros
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setEstado('todos');
    setFechaDesde('');
    setFechaHasta('');
    setDateError(null);
    setSkip(0);
  };

  const handleEstadoChange = (val: string) => {
    setEstado(val);
    setSkip(0);
  };

  const handleFechaDesdeChange = (val: string) => {
    setFechaDesde(val);
    setSkip(0);
  };

  const handleFechaHastaChange = (val: string) => {
    setFechaHasta(val);
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

  // Apertura de modal de detalle
  const handleOpenDetail = (saleId: number) => {
    setSelectedSaleId(saleId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedSaleId(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast de Notificaciones */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 max-w-md ${toastMessage.type === 'success'
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

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Gestión de Ventas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro, pedidos y operaciones comerciales de Dharma E.I.R.L.
          </p>
        </div>

        <Link
          href="/ventas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span> Nueva venta</span>
        </Link>
      </div>

      {/* Tarjetas KPI de Estadísticas Reales */}
      <SaleStatsCards stats={stats} loading={statsLoading} />

      {/* Card Base Principal: Filtros y Tabla Paginada */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
        {/* Barra de Filtros */}
        <SaleFilters
          search={search}
          estado={estado}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          dateError={dateError}
          onSearchChange={setSearch}
          onEstadoChange={handleEstadoChange}
          onFechaDesdeChange={handleFechaDesdeChange}
          onFechaHastaChange={handleFechaHastaChange}
          onResetFilters={handleResetFilters}
        />

        {/* Tabla de Operaciones de Venta */}
        <SaleTable
          sales={sales}
          total={total}
          skip={skip}
          limit={limit}
          loading={loading}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onViewDetail={handleOpenDetail}
        />
      </div>

      {/* Modal de Detalle de Venta (Solo Lectura) */}
      <SaleDetailModal
        isOpen={isDetailModalOpen}
        saleId={selectedSaleId}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

export default function VentasPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Cargando módulo de ventas...
        </div>
      }
    >
      <VentasContent />
    </Suspense>
  );
}
