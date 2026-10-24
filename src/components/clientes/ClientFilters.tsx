'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface ClientFiltersProps {
  search: string;
  estado: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onResetFilters: () => void;
}

export default function ClientFilters({
  search,
  estado,
  onSearchChange,
  onEstadoChange,
  onResetFilters,
}: ClientFiltersProps) {
  const hasActiveFilters = search.trim() !== '' || estado !== 'todos';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Input de Búsqueda Principal */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por RUC, razón social, contacto o correo..."
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

      {/* Selector de Estado */}
      <div className="w-full sm:w-48 shrink-0">
        <select
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="todos">Estado: Todos</option>
          <option value="activo">Estado: Activos</option>
          <option value="inactivo">Estado: Inactivos</option>
        </select>
      </div>

      {/* Botón Limpiar Filtros */}
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
  );
}
