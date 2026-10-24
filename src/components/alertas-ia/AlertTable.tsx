'use client';

import React from 'react';
import {
  ShieldAlert,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { AlertResponse, AlertLevel, ReviewStatus } from '@/types/alert';

interface AlertTableProps {
  alerts: AlertResponse[];
  total: number;
  skip: number;
  limit: number;
  loading?: boolean;
  onPageChange: (newSkip: number) => void;
  onSelectAlert: (alertId: number) => void;
  ventasCompletadas?: number;
  ventasRequeridas?: number;
}

export default function AlertTable({
  alerts,
  total,
  skip,
  limit,
  loading = false,
  onPageChange,
  onSelectAlert,
  ventasCompletadas = 0,
  ventasRequeridas = 50,
}: AlertTableProps) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total > 0 ? skip + 1 : 0;
  const endItem = Math.min(skip + limit, total);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatAnomalyPercentile = (score: number | string) => {
    const num = Number(score);
    if (isNaN(num)) return '—';
    // Convert e.g. 0.9700 to 97.0
    const percentile = (num * 100).toFixed(1);
    return `Percentil ${percentile}`;
  };

  const renderLevelBadge = (level: AlertLevel) => {
    switch (level) {
      case 'ALTO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            Nivel Alto
          </span>
        );
      case 'MEDIO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            Nivel Medio
          </span>
        );
      case 'BAJO':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            Nivel Bajo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {level}
          </span>
        );
    }
  };

  const renderReviewBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3 text-amber-500" />
            Pendiente
          </span>
        );
      case 'CONFIRMADA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmada
          </span>
        );
      case 'FALSO_POSITIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-400" />
            Falso positivo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Contenedor de la Tabla con Scroll Horizontal Responsivo */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold select-none">
              <th className="py-3.5 px-3 whitespace-nowrap">Fecha</th>
              <th className="py-3.5 px-3 whitespace-nowrap">Venta</th>
              <th className="py-3.5 px-3">Cliente</th>
              <th className="py-3.5 px-3 text-center whitespace-nowrap">Nivel</th>
              <th className="py-3.5 px-3 whitespace-nowrap">
                <div className="inline-flex items-center gap-1">
                  <span>Percentil de atipicidad</span>
                  <div
                    className="group relative cursor-pointer"
                    title="Indica la posición relativa de esta operación frente al comportamiento histórico aprendido. No representa probabilidad de fraude."
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>
              </th>
              <th className="py-3.5 px-3 text-center whitespace-nowrap">Revisión</th>
              <th className="py-3.5 px-3 text-center whitespace-nowrap">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-normal text-slate-700">
            {loading ? (
              // Esqueletos de Carga
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-4 px-3">
                    <div className="h-4 w-28 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="h-5 w-20 bg-slate-100 rounded-md"></div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="h-4 w-40 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="h-5 w-20 bg-slate-100 rounded-full mx-auto"></div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="h-5 w-24 bg-slate-100 rounded-full mx-auto"></div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="h-7 w-20 bg-slate-100 rounded-lg mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : alerts.length === 0 ? (
              // Estado Vacío Informativo Real
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">
                      No existen alertas registradas
                    </h4>
                  </div>
                </td>
              </tr>
            ) : (
              // Filas Reales de Alertas
              alerts.map((alerta) => (
                <tr
                  key={alerta.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Fecha */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                    {formatDate(alerta.created_at)}
                  </td>

                  {/* Número de Venta */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                      {alerta.numero_venta || 'Venta no disponible'}
                    </span>
                  </td>

                  {/* Cliente / Razón Social */}
                  <td className="py-3.5 px-3">
                    <div
                      className="font-medium text-slate-800 text-xs truncate max-w-xs"
                      title={alerta.cliente_razon_social || 'Cliente no disponible'}
                    >
                      {alerta.cliente_razon_social || 'Cliente no disponible'}
                    </div>
                  </td>

                  {/* Nivel de Alerta */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {renderLevelBadge(alerta.nivel_alerta)}
                  </td>

                  {/* Anomaly Score / Percentil */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">
                        {formatAnomalyPercentile(alerta.puntaje_anomalia)}
                      </span>
                    </div>
                  </td>

                  {/* Estado de Revisión */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {renderReviewBadge(alerta.estado_revision)}
                  </td>

                  {/* Acción: Ver Detalle */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectAlert(alerta.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                      title="Ver detalle y explicación de la alerta"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Detalle</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{startItem}</span> -{' '}
            <span className="font-semibold text-slate-700">{endItem}</span> de{' '}
            <span className="font-semibold text-slate-700">{total}</span> alertas
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, skip - limit))}
              disabled={skip === 0 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <span className="text-xs font-semibold text-slate-700 px-2">
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(skip + limit)}
              disabled={skip + limit >= total || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
