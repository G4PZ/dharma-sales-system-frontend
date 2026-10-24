'use client';

import React from 'react';
import {
  ChevronRight,
  TriangleAlert,
  BarChart3,
  FileText,
  SprayCan,
  Layers,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { ProductAlertItem } from '@/types/product';

interface LowStockAlertsWidgetProps {
  alerts: ProductAlertItem[];
  onViewAllAlerts: () => void;
  onSelectItem?: (id: number) => void;
}

export default function LowStockAlertsWidget({
  alerts,
  onViewAllAlerts,
  onSelectItem,
}: LowStockAlertsWidgetProps) {
  const getItemIcon = (categoria: string) => {
    const cat = categoria.toLowerCase();
    if (cat.includes('seguridad') || cat.includes('higiene')) {
      return <ShieldCheck className="w-4 h-4 text-blue-500" />;
    }
    if (cat.includes('papel') || cat.includes('celulosa')) {
      return <Layers className="w-4 h-4 text-amber-500" />;
    }
    if (cat.includes('limpieza') || cat.includes('desinfección')) {
      return <SprayCan className="w-4 h-4 text-teal-500" />;
    }
    return <Package className="w-4 h-4 text-slate-500" />;
  };

  const handleGenerateReport = () => {
    // Generación o descarga sencilla de reporte en CSV con los productos
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/productos`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Alertas de Stock Bajo Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-800">
              Alertas de stock bajo
            </h3>
          </div>
          <button
            type="button"
            onClick={onViewAllAlerts}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        <div className="divide-y divide-slate-50 pt-1">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No hay productos con stock crítico en este momento.
            </div>
          ) : (
            alerts.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem && onSelectItem(item.id)}
                className="py-3 flex items-center justify-between group hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center shrink-0">
                    {getItemIcon(item.categoria)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                      {item.nombre}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">
                      {item.codigo}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      Stock actual:{' '}
                      <span className="font-bold text-rose-600">
                        {item.stock} {item.unidad_medida}.
                      </span>{' '}
                      <span className="text-slate-400">
                        Mínimo: {item.stock_minimo} {item.unidad_medida}.
                      </span>
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
