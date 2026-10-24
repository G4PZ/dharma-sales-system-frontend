'use client';

import React from 'react';
import { Package, TriangleAlert, LayoutGrid, Coins, ChevronRight, ArrowUp } from 'lucide-react';
import { ProductStats } from '@/types/product';

interface ProductStatsCardsProps {
  stats: ProductStats | null;
  loading?: boolean;
  onFilterLowStock?: () => void;
}

export default function ProductStatsCards({
  stats,
  loading = false,
  onFilterLowStock,
}: ProductStatsCardsProps) {
  const activos = stats?.productos_activos ?? 0;
  const stockBajo = stats?.stock_bajo_count ?? 0;
  const categorias = stats?.categorias_count ?? 0;
  const valorInventario = stats?.valor_inventario
    ? Number(stats.valor_inventario).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    : '0.00';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Productos Activos */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Productos activos</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : activos}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-xs">
          <span className="inline-flex items-center text-emerald-600 font-semibold">
            <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
            +12%
          </span>
          <span className="text-slate-400 font-normal">vs. mes anterior</span>
        </div>
      </div>

      {/* 2. Stock Bajo */}
      <div
        onClick={onFilterLowStock}
        className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Stock bajo</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : stockBajo}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <TriangleAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center text-rose-500 font-semibold">
              <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
              +{stockBajo}
            </span>
            <span className="text-slate-400 font-normal">vs. mes anterior</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* 3. Categorías */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Categorías</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : categorias}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-slate-400 font-normal">Clasificaciones de productos</span>

        </div>
      </div>

      {/* 4. Valor de Inventario */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Valor de inventario</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : `S/ ${valorInventario}`}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center text-emerald-600 font-semibold">
              <ArrowUp className="w-3.5 h-3.5 mr-0.5" />
              +8%
            </span>
            <span className="text-slate-400 font-normal">vs. mes anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
}
