'use client';

import React from 'react';
import { Filter, RotateCcw, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';

interface AlertFiltersProps {
  nivel: string;
  estadoRevision: string;
  fechaInicio: string;
  fechaFin: string;
  onNivelChange: (val: string) => void;
  onEstadoRevisionChange: (val: string) => void;
  onFechaInicioChange: (val: string) => void;
  onFechaFinChange: (val: string) => void;
  onReset: () => void;
}

export default function AlertFilters({
  nivel,
  estadoRevision,
  fechaInicio,
  fechaFin,
  onNivelChange,
  onEstadoRevisionChange,
  onFechaInicioChange,
  onFechaFinChange,
  onReset,
}: AlertFiltersProps) {
  const hasActiveFilters =
    nivel !== 'TODOS' ||
    estadoRevision !== 'TODOS' ||
    fechaInicio !== '' ||
    fechaFin !== '';

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
      {/* 1. Selector de Nivel */}
      <div className="w-full sm:w-44 shrink-0">
        <select
          value={nivel}
          onChange={(e) => onNivelChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="TODOS">Nivel: Todos</option>
          <option value="ALTO">Nivel: Alto</option>
          <option value="MEDIO">Nivel: Medio</option>
          <option value="BAJO">Nivel: Bajo</option>
        </select>
      </div>

      {/* 2. Selector de Estado de Revisión */}
      <div className="w-full sm:w-48 shrink-0">
        <select
          value={estadoRevision}
          onChange={(e) => onEstadoRevisionChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="TODOS">Revisión: Todas</option>
          <option value="PENDIENTE">Estado: Pendiente</option>
          <option value="CONFIRMADA">Estado: Confirmada</option>
          <option value="FALSO_POSITIVO">Estado: Falso Positivo</option>
        </select>
      </div>

      {/* 3. Filtro Fecha Desde */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Desde
        </span>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => onFechaInicioChange(e.target.value)}
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
          value={fechaFin}
          onChange={(e) => onFechaFinChange(e.target.value)}
          className="text-xs bg-transparent border-0 text-slate-700 font-medium focus:outline-none cursor-pointer py-1.5"
        />
      </div>

      {/* 5. Botón Reset */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer shrink-0"
          title="Limpiar filtros"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Limpiar filtros</span>
        </button>
      )}
    </div>
  );
}
