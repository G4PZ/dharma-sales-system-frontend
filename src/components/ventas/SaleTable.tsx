'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Receipt,
  Building2,
  Calendar,
  Layers,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { SaleListItemResponse } from '@/types/sale';

interface SaleTableProps {
  sales: SaleListItemResponse[];
  total: number;
  skip: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onViewDetail: (saleId: number) => void;
}

export default function SaleTable({
  sales,
  total,
  skip,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  onViewDetail,
}: SaleTableProps) {
  const [targetPage, setTargetPage] = useState<string>('');

  // Cálculos de paginación
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + limit, total);

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(targetPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setTargetPage('');
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return `S/ ${val}`;
    return `S/ ${num.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="flex flex-col">
      {/* Encabezado del Listado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Operaciones de Venta
            </h3>
            <p className="text-[11px] text-slate-400">
              Historial certificado y trazabilidad comercial
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Mostrando{' '}
          <span className="font-semibold text-slate-700">{startItem}</span> -{' '}
          <span className="font-semibold text-slate-700">{endItem}</span> de{' '}
          <span className="font-semibold text-slate-700">{total}</span> operaciones
        </span>
      </div>

      {/* Contenedor de la Tabla con Scroll Horizontal */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold select-none">
              <th className="py-3.5 px-3 whitespace-nowrap">N° Venta</th>
              <th className="py-3.5 px-3 whitespace-nowrap">Fecha y Hora</th>
              <th className="py-3.5 px-3">Cliente / Razón Social</th>
              <th className="py-3.5 px-3 whitespace-nowrap">RUC</th>
              <th className="py-3.5 px-3 text-center whitespace-nowrap">Líneas</th>
              <th className="py-3.5 px-3 text-right whitespace-nowrap">Subtotal</th>
              <th className="py-3.5 px-3 text-right whitespace-nowrap">IGV</th>
              <th className="py-3.5 px-3 text-right whitespace-nowrap">Total</th>
              <th className="py-3.5 px-3 text-center whitespace-nowrap">Estado</th>
              <th className="py-3.5 px-3 text-center whitespace-nowrap">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-normal text-slate-700">
            {loading ? (
              // Esqueletos de Carga
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-4 px-3">
                    <div className="h-6 w-20 bg-slate-100 rounded-md"></div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="h-4 w-28 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="h-4 w-40 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="h-4 w-12 bg-slate-100 rounded mx-auto"></div>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="h-4 w-16 bg-slate-100 rounded ml-auto"></div>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="h-4 w-14 bg-slate-100 rounded ml-auto"></div>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="h-6 w-20 bg-slate-100 rounded-full mx-auto"></div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="h-7 w-20 bg-slate-100 rounded-lg mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : sales.length === 0 ? (
              // Estado Vacío
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      No se encontraron operaciones de venta
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      No hay registros que coincidan con los criterios de búsqueda o filtros seleccionados.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Filas de Datos
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* N° Venta */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50/80 px-2 py-1 rounded-md border border-blue-100/60 inline-flex items-center gap-1">
                      {sale.numero_venta}
                    </span>
                  </td>

                  {/* Fecha y Hora */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDateTime(sale.fecha)}</span>
                    </div>
                  </td>

                  {/* Cliente / Razón Social */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 max-w-xs truncate" title={sale.cliente.razon_social}>
                        {sale.cliente.razon_social}
                      </span>
                    </div>
                  </td>

                  {/* RUC */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-slate-600">
                      {sale.cliente.numero_documento}
                    </span>
                  </td>

                  {/* Líneas de productos (cantidad_items) */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {sale.cantidad_items}{' '}
                      {sale.cantidad_items === 1 ? 'ítem' : 'ítems'}
                    </span>
                  </td>

                  {/* Subtotal */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-600">
                    {formatCurrency(sale.subtotal)}
                  </td>

                  {/* IGV */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-600">
                    {formatCurrency(sale.igv)}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <span className="font-bold text-slate-900">
                      {formatCurrency(sale.total)}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {sale.estado}
                    </span>
                  </td>

                  {/* Acción Ver Detalle */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetail(sale.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/60 transition-colors text-xs font-semibold cursor-pointer"
                      title="Ver detalle de la venta"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver detalle</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginador Inferior */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
        {/* Selector de límite por página */}
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>por página</span>
        </div>

        {/* Controles de Navegación */}
        <div className="flex items-center gap-1">
          {/* Primera página */}
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(1)}
            title="Primera página"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Página anterior */}
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
            title="Página anterior"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Botones numéricos */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(0, 5)
            .map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  p === currentPage
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

          {totalPages > 5 && (
            <>
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className={`w-7 h-7 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  totalPages === currentPage
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Página siguiente */}
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => onPageChange(currentPage + 1)}
            title="Página siguiente"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Última página */}
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => onPageChange(totalPages)}
            title="Última página"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Salto directo a página */}
        <form onSubmit={handleJumpToPage} className="flex items-center gap-1.5">
          <span>Ir a página</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={targetPage}
            onChange={(e) => setTargetPage(e.target.value)}
            placeholder={String(currentPage)}
            className="w-12 px-2 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span>de {totalPages}</span>
        </form>
      </div>
    </div>
  );
}
