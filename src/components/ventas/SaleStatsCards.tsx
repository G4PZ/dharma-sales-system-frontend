'use client';

import React from 'react';
import { ShoppingBag, DollarSign, Award, Package, Loader2 } from 'lucide-react';
import { SaleStatsResponse } from '@/types/sale';

interface SaleStatsCardsProps {
  stats: SaleStatsResponse | null;
  loading?: boolean;
}

export default function SaleStatsCards({
  stats,
  loading = false,
}: SaleStatsCardsProps) {
  const ventasMes = stats?.ventas_mes ?? 0;
  const montoMes = Number(stats?.monto_mes ?? 0);
  const productoMasVendidoNombre = stats?.producto_mas_vendido?.nombre || null;
  const productoMasVendidoUnidades = stats?.producto_mas_vendido?.unidades ?? 0;
  const unidadesMes = stats?.unidades_mes ?? 0;

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Ventas del mes */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Ventas del mes</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                ventasMes.toLocaleString('es-PE')
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
            Este mes
          </span>
          <span className="text-slate-400 font-normal">Operaciones completadas</span>
        </div>
      </div>

      {/* 2. Monto vendido del mes */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Monto vendido del mes</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                formatCurrency(montoMes)
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
            Soles (PEN)
          </span>
          <span className="text-slate-400 font-normal">Facturación mensual</span>
        </div>
      </div>

      {/* 3. Producto más vendido del mes */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-slate-500">Producto más vendido</p>
            <div className="mt-1.5">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : productoMasVendidoNombre ? (
                <p
                  className="text-lg font-bold text-slate-900 tracking-tight truncate max-w-[190px]"
                  title={productoMasVendidoNombre}
                >
                  {productoMasVendidoNombre}
                </p>
              ) : (
                <p className="text-lg font-medium text-slate-400 tracking-tight">
                  Sin ventas
                </p>
              )}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
            {loading ? '...' : `${productoMasVendidoUnidades} und.`}
          </span>
          <span className="text-slate-400 font-normal">Mayor demanda del mes</span>
        </div>
      </div>

      {/* 4. Unidades vendidas del mes */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Unidades vendidas del mes</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                unidadesMes.toLocaleString('es-PE')
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
            Inventario
          </span>
          <span className="text-slate-400 font-normal">Unidades en el mes</span>
        </div>
      </div>
    </div>
  );
}

