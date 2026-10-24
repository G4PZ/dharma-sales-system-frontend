'use client';

import React from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Brain, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { AlertaNivelItem } from '@/types/dashboard';

interface AlertsLevelChartProps {
  data?: AlertaNivelItem[];
  total?: number;
  isLoading?: boolean;
}

const LEVEL_CONFIG: Record<
  string,
  { label: string; color: string; bgClass: string; textClass: string; borderClass: string }
> = {
  ALTO: {
    label: 'Alto',
    color: '#EF4444',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-100',
  },
  MEDIO: {
    label: 'Medio',
    color: '#F59E0B',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-100',
  },
  BAJO: {
    label: 'Bajo',
    color: '#3B82F6',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-100',
  },
};

export default function AlertsLevelChart({
  data = [],
  total = 0,
  isLoading = false,
}: AlertsLevelChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalAlertas = total || data.reduce((acc, item) => acc + item.cantidad, 0);

  // Ordenar fijo: ALTO, MEDIO, BAJO
  const sortedData = React.useMemo(() => {
    const order = ['ALTO', 'MEDIO', 'BAJO'];
    return [...data].sort((a, b) => order.indexOf(a.nivel) - order.indexOf(b.nivel));
  }, [data]);

  const maxCantidad = React.useMemo(() => {
    const max = Math.max(...sortedData.map((d) => d.cantidad), 0);
    return max > 0 ? max + 1 : 5;
  }, [sortedData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-bold text-slate-800">
              Alertas IA por nivel
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Severidad analítica determinada por Isolation Forest y K-Means
          </p>
        </div>

        <Link
          href="/alertas-ia"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-0.5 transition-colors"
        >
          Ver módulo
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading || !mounted ? (
        <div className="h-[220px] flex items-center justify-center bg-slate-50/60 rounded-xl animate-pulse">
          <span className="text-xs text-slate-400 font-medium">
            Cargando niveles de alerta...
          </span>
        </div>
      ) : totalAlertas === 0 ? (
        <div className="h-[220px] flex flex-col items-center justify-center text-center p-4">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Sin anomalías detectadas
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
            Las operaciones analizadas se encuentran dentro de los parámetros habituales de venta.
          </p>
        </div>
      ) : (
        <div className="space-y-4 my-auto py-1">
          {/* Chart Canvas Area */}
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  domain={[0, maxCantidad]}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="nivel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  width={55}
                  tickFormatter={(val) => LEVEL_CONFIG[val]?.label || val}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as AlertaNivelItem;
                      const conf = LEVEL_CONFIG[item.nivel];
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-800">
                          <p className="font-semibold text-white">
                            Nivel {conf?.label || item.nivel}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {item.cantidad} {item.cantidad === 1 ? 'alerta' : 'alertas'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} barSize={22}>
                  {sortedData.map((entry) => {
                    const color = LEVEL_CONFIG[entry.nivel]?.color || '#64748B';
                    return <Cell key={`cell-${entry.nivel}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tarjetas resumen de severidad */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
            {sortedData.map((item) => {
              const conf = LEVEL_CONFIG[item.nivel] || {
                label: item.nivel,
                bgClass: 'bg-slate-50',
                textClass: 'text-slate-700',
                borderClass: 'border-slate-100',
              };
              return (
                <div
                  key={item.nivel}
                  className={`p-2 rounded-xl border ${conf.bgClass} ${conf.borderClass} text-center`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${conf.textClass}`}>
                    {conf.label}
                  </span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {item.cantidad}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
