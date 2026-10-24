'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { FileCheck, FileClock, FileX, FileText } from 'lucide-react';
import { ComprobanteEstadoItem } from '@/types/dashboard';

interface ReceiptsPieChartProps {
  data?: ComprobanteEstadoItem[];
  total?: number;
  isLoading?: boolean;
}

const COLOR_MAP: Record<string, { hex: string; dot: string; icon: React.ElementType; textColor: string }> = {
  ACEPTADO: {
    hex: '#10B981',
    dot: 'bg-emerald-500',
    icon: FileCheck,
    textColor: 'text-emerald-700',
  },
  PENDIENTE_ENVIO: {
    hex: '#F59E0B',
    dot: 'bg-amber-500',
    icon: FileClock,
    textColor: 'text-amber-700',
  },
  RECHAZADO: {
    hex: '#EF4444',
    dot: 'bg-rose-500',
    icon: FileX,
    textColor: 'text-rose-700',
  },
};

export default function ReceiptsPieChart({
  data = [],
  total = 0,
  isLoading = false,
}: ReceiptsPieChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalComprobantes = total || data.reduce((acc, item) => acc + item.cantidad, 0);

  // Filtrar ítems para el gráfico (solo los que tengan cantidad > 0 para el render del pastel)
  const chartData = React.useMemo(() => {
    return data.filter((item) => item.cantidad > 0);
  }, [data]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h3 className="text-base font-bold text-slate-800">
            Estado de comprobantes
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Distribución de facturas y boletas electrónicas
        </p>
      </div>

      {isLoading || !mounted ? (
        <div className="h-[220px] flex items-center justify-center bg-slate-50/60 rounded-xl animate-pulse">
          <span className="text-xs text-slate-400 font-medium">
            Cargando estados de comprobantes...
          </span>
        </div>
      ) : totalComprobantes === 0 ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-center p-4">
          <FileText className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">
            Sin comprobantes emitidos
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Los comprobantes electrónicos emitidos aparecerán clasificados aquí.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-2">
          {/* Dona Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as ComprobanteEstadoItem;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-800">
                          <p className="font-semibold text-white">{item.nombre}</p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {item.cantidad} ({item.porcentaje}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData.length > 0 ? chartData : [{ nombre: 'Sin datos', cantidad: 1, porcentaje: 100, estado: 'NONE' }]}
                  dataKey="cantidad"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((entry) => {
                    const color = COLOR_MAP[entry.estado]?.hex || '#94A3B8';
                    return <Cell key={`cell-${entry.estado}`} fill={color} />;
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centro de la Dona */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 leading-tight">
                {totalComprobantes}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Comprobantes
              </span>
            </div>
          </div>

          {/* Desglose / Leyenda */}
          <div className="w-full sm:w-auto flex-1 space-y-2.5">
            {data.map((item) => {
              const meta = COLOR_MAP[item.estado] || {
                dot: 'bg-slate-400',
                textColor: 'text-slate-700',
              };
              return (
                <div
                  key={item.estado}
                  className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                    <span className="font-medium text-slate-700 truncate">
                      {item.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-900">
                      {item.cantidad}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium w-12 text-right">
                      ({item.porcentaje}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
