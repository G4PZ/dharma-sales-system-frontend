'use client';

import React from 'react';
import {
  ShoppingCart,
  CircleDollarSign,
  FileText,
  TriangleAlert,
  AlertCircle,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import ReceiptsPieChart from '@/components/dashboard/ReceiptsPieChart';
import AlertsLevelChart from '@/components/dashboard/AlertsLevelChart';
import RecentSalesTable from '@/components/dashboard/RecentSalesTable';
import AlertsList from '@/components/dashboard/AlertsList';
import { fetchDashboardSummary } from '@/services/dashboardService';
import { DashboardResumenResponse } from '@/types/dashboard';

// Funciones utilitarias para cálculo de fechas en zona horaria local
function getInitialDates(): { desde: string; hasta: string } {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 6);

  const formatISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    desde: formatISO(past),
    hasta: formatISO(now),
  };
}

function formatDateDisplay(iso: string): string {
  try {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const initialDates = React.useMemo(() => getInitialDates(), []);
  const [fechaDesde, setFechaDesde] = React.useState<string>(initialDates.desde);
  const [fechaHasta, setFechaHasta] = React.useState<string>(initialDates.hasta);
  const [dateError, setDateError] = React.useState<string | null>(null);

  const [summary, setSummary] = React.useState<DashboardResumenResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Validación del rango de fechas
  React.useEffect(() => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setDateError("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.");
    } else {
      setDateError(null);
    }
  }, [fechaDesde, fechaHasta]);

  // Carga reactiva de datos reales de Business Intelligence desde FastAPI
  const loadDashboardData = React.useCallback(
    async (desde?: string, hasta?: string) => {
      if (desde && hasta && desde > hasta) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchDashboardSummary(desde, hasta);
        setSummary(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Error al conectar con el servidor de Dharma';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Carga inicial y recálculo automático cuando cambian las fechas (si son válidas)
  React.useEffect(() => {
    if (!dateError) {
      loadDashboardData(fechaDesde, fechaHasta);
    }
  }, [fechaDesde, fechaHasta, dateError, loadDashboardData]);


  // Formato monetario peruano (S/ X,XXX.XX)
  const formatSoles = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '—';
    const num = Number(value);
    if (isNaN(num)) return '—';
    return `S/ ${num.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const rangoTextoFormateado = summary?.rango_fechas
    ? `${formatDateDisplay(summary.rango_fechas.fecha_desde)} → ${formatDateDisplay(
        summary.rango_fechas.fecha_hasta
      )}`
    : `${formatDateDisplay(fechaDesde)} → ${formatDateDisplay(fechaHasta)}`;

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle + Date Range Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Dharma
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Resumen analítico de la operación comercial
          </p>
        </div>

        {/* Global Date Range Filter (Mismo estilo que Ventas) */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto bg-white/70 p-1.5 rounded-2xl border border-slate-200/60 shadow-2xs">
          {/* Input Fecha Desde */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Desde
            </span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="text-xs bg-transparent border-0 text-slate-700 font-medium focus:outline-none cursor-pointer py-1.5"
            />
          </div>

          {/* Input Fecha Hasta */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hasta
            </span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="text-xs bg-transparent border-0 text-slate-700 font-medium focus:outline-none cursor-pointer py-1.5"
            />
          </div>

        </div>
      </div>

      {/* Alerta de Error de Validación de Fechas */}
      {dateError && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{dateError}</span>
        </div>
      )}

      {/* Error Banner de Servidor con Reintento */}
      {error && !dateError && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Error al cargar datos del dashboard</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadDashboardData(fechaDesde, fechaHasta)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* KPI Cards Grid — Afectados completamente por el rango */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* KPI 1 — Ventas */}
        <StatCard
          title="Ventas"
          value={
            isLoading
              ? '...'
              : summary
              ? `${summary.ventas.cantidad} ${
                  summary.ventas.cantidad === 1 ? 'venta' : 'ventas'
                }`
              : '—'
          }
          subtitle={`Operaciones registradas`}
          icon={ShoppingCart}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />

        {/* KPI 2 — Ingresos */}
        <StatCard
          title="Ingresos"
          value={isLoading ? '...' : summary ? formatSoles(summary.ventas.ingresos) : '—'}
          subtitle={`Ventas completadas`}
          icon={CircleDollarSign}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
        />

        {/* KPI 3 — Comprobantes */}
        <StatCard
          title="Comprobantes"
          value={
            isLoading
              ? '...'
              : summary
              ? `${summary.comprobantes.total} emitidos`
              : '—'
          }
          breakdown={
            summary ? (
              <div className="flex items-center gap-2 text-[11px] font-medium flex-wrap">
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {summary.comprobantes.aceptados} aceptados
                </span>
                <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                  {summary.comprobantes.pendientes} pendientes
                </span>
                {summary.comprobantes.rechazados > 0 && (
                  <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                    {summary.comprobantes.rechazados} rechazados
                  </span>
                )}
              </div>
            ) : null
          }
          subtitle="Emitidos en el período"
          icon={FileText}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
        />

        {/* KPI 4 — Alertas IA */}
        <StatCard
          title="Alertas IA"
          value={
            isLoading
              ? '...'
              : summary
              ? `${summary.alertas_ia.total} en total`
              : '—'
          }
          breakdown={
            summary ? (
              <div className="flex items-center gap-2 text-[11px] font-medium flex-wrap">
                <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                  {summary.alertas_ia.pendientes} pendientes
                </span>
                <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                  {summary.alertas_ia.nivel_alto} nivel ALTO
                </span>
              </div>
            ) : null
          }
          subtitle="Detectadas en el período"
          icon={TriangleAlert}
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-500"
        />
      </div>

      {/* Visualización 1 — Evolución de ventas dentro del rango */}
      <div className="w-full">
        <SalesChart
          data={summary?.evolucion_ventas}
          rangoTexto={rangoTextoFormateado}
          isLoading={isLoading}
        />
      </div>

      {/* Visualización 2 & 3: Estado de comprobantes y Alertas IA por nivel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReceiptsPieChart
          data={summary?.comprobantes_distribucion}
          total={summary?.comprobantes.total}
          isLoading={isLoading}
        />

        <AlertsLevelChart
          data={summary?.alertas_por_nivel}
          total={summary?.alertas_ia.total}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Section: Ventas recientes & Alertas recientes (Filtradas por el rango) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSalesTable
          sales={summary?.ventas_recientes}
          isLoading={isLoading}
        />

        <AlertsList
          alerts={summary?.alertas_recientes}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
