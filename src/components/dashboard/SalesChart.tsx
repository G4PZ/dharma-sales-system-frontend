'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { VentaDiaEvolucion } from '@/types/dashboard';

interface SalesChartProps {
  data?: VentaDiaEvolucion[];
  rangoTexto?: string;
  isLoading?: boolean;
}

export default function SalesChart({
  data = [],
  rangoTexto,
  isLoading = false,
}: SalesChartProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalPeriodo = React.useMemo(() => {
    return data.reduce((acc, item) => acc + Number(item.total || 0), 0);
  }, [data]);

  const totalVentasCount = React.useMemo(() => {
    return data.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  }, [data]);

  const maxVal = React.useMemo(() => {
    const max = Math.max(...data.map((d) => Number(d.total || 0)), 0);
    return max > 0 ? max * 1.15 : 1000;
  }, [data]);

  // Formateador monetario peruano
  const formatSoles = (val: number) => {
    return `S/ ${val.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Cálculo de intervalo para evitar saturación del eje X en rangos amplios
  const xInterval = React.useMemo(() => {
    if (data.length <= 14) return 0;
    if (data.length <= 31) return 1;
    if (data.length <= 60) return 3;
    return Math.floor(data.length / 10);
  }, [data.length]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-800">
              Evolución de ventas
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3" />
              {rangoTexto || 'Período seleccionado'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ingresos generados por ventas completadas dentro del rango
          </p>
        </div>

        {/* Resumen numérico */}
        <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-100 px-3.5 py-2 rounded-xl text-right self-start sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total ventas
            </span>
            <span className="text-sm font-bold text-slate-900">
              {formatSoles(totalPeriodo)}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Operaciones
            </span>
            <span className="text-sm font-bold text-blue-600">
              {totalVentasCount} {totalVentasCount === 1 ? 'venta' : 'ventas'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-[240px] relative">
        {isLoading || !mounted ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-50/60 rounded-xl animate-pulse">
            <span className="text-xs text-slate-400 font-medium">
              Cargando métricas de ventas...
            </span>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
            <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">
              Sin datos de ventas en este período
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Las operaciones completadas en este rango se reflejarán automáticamente aquí.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="dia"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                dy={8}
                interval={xInterval}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                domain={[0, maxVal]}
                tickFormatter={(val) =>
                  val === 0 ? '0' : `S/ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                }
                width={55}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as VentaDiaEvolucion;
                    const valorNum = Number(item.total || 0);
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-xl px-3.5 py-2.5 shadow-xl border border-slate-800">
                        <p className="font-semibold text-slate-300 text-[11px]">
                          {item.dia} ({item.fecha})
                        </p>
                        <p className="text-sm font-bold text-white mt-1">
                          {formatSoles(valorNum)}
                        </p>
                        <p className="text-[11px] text-blue-300 mt-0.5 font-medium">
                          {item.cantidad} {item.cantidad === 1 ? 'venta' : 'ventas'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                radius={[6, 6, 0, 0]}
                maxBarSize={data.length > 20 ? 18 : 38}
              >
                {data.map((entry, index) => {
                  const isLatest = index === data.length - 1;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isLatest ? '#2563EB' : '#93C5FD'}
                      className="transition-all duration-300 hover:opacity-85"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
