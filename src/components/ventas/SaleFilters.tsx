'use client';

import React from 'react';
import { Search, RotateCcw, AlertCircle, Calendar } from 'lucide-react';

interface SaleFiltersProps {
  search: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  dateError?: string | null;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onResetFilters: () => void;
}

export default function SaleFilters({
  search,
  estado,
  fechaDesde,
  fechaHasta,
  dateError,
  onSearchChange,
  onEstadoChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onResetFilters,
}: SaleFiltersProps) {
  const hasActiveFilters =
    search.trim() !== '' ||
    estado !== 'todos' ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  return (
    <div className="space-y-2">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* 1. Input de Búsqueda Principal */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por N° de venta, RUC o razón social..."
            className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. Selector de Estado */}
        <div className="w-full sm:w-44 shrink-0">
          <select
            value={estado}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="todos">Estado: Todos</option>
            <option value="COMPLETADA">Estado: Completada</option>
          </select>
        </div>

        {/* 3. Filtro Fecha Desde */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Desde
          </span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
            className="text-xs bg-transparent border-0 text-slate-700 font-medium focus:outline-none cursor-pointer py-1.5"
          />
        </div>

        {/* 4. Filtro Fecha Hasta */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Hasta
          </span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
            className="text-xs bg-transparent border-0 text-slate-700 font-medium focus:outline-none cursor-pointer py-1.5"
          />
        </div>

        {/* 5. Botón Limpiar Filtros */}
        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Limpiar</span>
        </button>
      </div>

      {/* Advertencia de error de rango de fechas si fecha_desde > fecha_hasta */}
      {dateError && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{dateError}</span>
        </div>
      )}
    </div>
  );
}
