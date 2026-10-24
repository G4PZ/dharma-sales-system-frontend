'use client';

import React from 'react';
import Link from 'next/link';
import {
  TriangleAlert,
  AlertCircle,
  Info,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { AlertaRecienteItem } from '@/types/dashboard';

interface AlertsListProps {
  alerts?: AlertaRecienteItem[];
  isLoading?: boolean;
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch {
    return 'Reciente';
  }
}

export default function AlertsList({
  alerts = [],
  isLoading = false,
}: AlertsListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Alertas recientes
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Eventos anómalos detectados por el motor de IA
          </p>
        </div>

        <Link
          href="/alertas-ia"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
        >
          Ver todas
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3 my-auto py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 animate-pulse"
            >
              <div className="flex items-center gap-3.5 w-full">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-1/3 bg-slate-200 rounded" />
                  <div className="h-2.5 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="my-auto py-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Todo en orden
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            No se han registrado anomalías en las operaciones de venta analizadas.
          </p>
        </div>
      ) : (
        <div className="space-y-3 my-auto py-1">
          {alerts.map((item) => {
            const isAlto = item.nivel_alerta === 'ALTO';
            const isMedio = item.nivel_alerta === 'MEDIO';

            const Icon = isAlto ? TriangleAlert : isMedio ? AlertCircle : Info;
            const iconBg = isAlto
              ? 'bg-rose-50'
              : isMedio
              ? 'bg-amber-50'
              : 'bg-blue-50';
            const iconColor = isAlto
              ? 'text-rose-500'
              : isMedio
              ? 'text-amber-500'
              : 'text-blue-500';

            const badgeBg = isAlto
              ? 'bg-rose-100/70 text-rose-700 border-rose-200'
              : isMedio
              ? 'bg-amber-100/70 text-amber-700 border-amber-200'
              : 'bg-blue-100/70 text-blue-700 border-blue-200';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50/90 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                        {item.numero_venta
                          ? `Venta ${item.numero_venta}`
                          : `Alerta #${item.id}`}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none ${badgeBg}`}
                      >
                        {item.nivel_alerta}
                      </span>
                    </div>
                    <p
                      className="text-[11px] text-slate-500 truncate mt-0.5"
                      title={item.descripcion}
                    >
                      {item.descripcion}
                    </p>
                    {item.cliente_razon_social && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.cliente_razon_social}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">
                    {formatTimeAgo(item.created_at)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase mt-0.5 inline-block ${
                      item.estado_revision === 'CONFIRMADA'
                        ? 'text-emerald-600'
                        : item.estado_revision === 'FALSO_POSITIVO'
                        ? 'text-slate-400'
                        : 'text-amber-600'
                    }`}
                  >
                    {item.estado_revision}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
