'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface ReceiptFiltersProps {
  search: string;
  tipo: string;
  estado: string;
  onSearchChange: (val: string) => void;
  onTipoChange: (val: string) => void;
  onEstadoChange: (val: string) => void;
  onResetFilters: () => void;
}

export default function ReceiptFilters({
  search,
  tipo,
  estado,
  onSearchChange,
  onTipoChange,
  onEstadoChange,
  onResetFilters,
}: ReceiptFiltersProps) {
  const isFiltered =
    search.trim() !== '' ||
    (tipo !== 'todos' && tipo !== '') ||
    (estado !== 'todos' && estado !== '');

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
      {/* Buscador */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por serie (F001, B001), N° venta, RUC o razón social..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Selectores de Filtro */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Tipo de Comprobante */}
        <select
          value={tipo}
          onChange={(e) => onTipoChange(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          <option value="todos">Todos los tipos</option>
          <option value="01">Facturas (01 - F001)</option>
          <option value="03">Boletas (03 - B001)</option>
        </select>

        {/* Estado */}
        <select
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          <option value="todos">Todos los estados</option>
          <option value="PENDIENTE_ENVIO">Pendiente de envío</option>
          <option value="ENVIADO">Enviado</option>
          <option value="ACEPTADO">Aceptado</option>
          <option value="RECHAZADO">Rechazado</option>
        </select>

        {/* Botón Restablecer */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
}
