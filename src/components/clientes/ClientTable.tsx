'use client';

import React, { useState } from 'react';
import {
  Pencil,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Building2,
  User,
  Loader2,
} from 'lucide-react';
import { Cliente } from '@/types/client';

interface ClientTableProps {
  clients: Cliente[];
  total: number;
  skip: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEdit: (client: Cliente) => void;
  onToggleStatus: (client: Cliente) => void;
}

export default function ClientTable({
  clients,
  total,
  skip,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  onEdit,
  onToggleStatus,
}: ClientTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [targetPage, setTargetPage] = useState<string>('');

  const allSelected =
    clients.length > 0 && clients.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clients.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Paginación
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

  return (
    <div className="flex flex-col">
      {/* Encabezado del Listado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Listado de Clientes
          </h3>
        </div>

        <span className="text-xs text-slate-500">
          Mostrando{' '}
          <span className="font-semibold text-slate-700">{startItem}</span> -{' '}
          <span className="font-semibold text-slate-700">{endItem}</span> de{' '}
          <span className="font-semibold text-slate-700">{total}</span> clientes
        </span>
      </div>

      {/* Contenedor de la Tabla con Scroll Horizontal */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold select-none">
              <th className="py-3.5 pr-3 pl-1 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  aria-label="Seleccionar todos los clientes"
                />
              </th>
              <th className="py-3.5 px-3 whitespace-nowrap">RUC</th>
              <th className="py-3.5 px-3">Nombre / Razón Social</th>
              <th className="py-3.5 px-3">Contacto</th>
              <th className="py-3.5 px-3">Teléfono</th>
              <th className="py-3.5 px-3">Correo</th>
              <th className="py-3.5 px-4 text-center">Estado</th>
              <th className="py-3.5 pl-3 pr-1 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-normal text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Cargando directorio de empresas...</span>
                  </div>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-slate-300" />
                    <span className="font-medium text-slate-700">
                      No se encontraron empresas
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Intenta ajustar los términos de búsqueda o filtros.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const isSelected = selectedIds.includes(client.id);

                return (
                  <tr
                    key={client.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 pr-3 pl-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(client.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label={`Seleccionar ${client.razon_social}`}
                      />
                    </td>

                    {/* RUC */}
                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {client.numero_documento}
                    </td>

                    {/* Razón Social */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50/80 text-blue-600 border-blue-100">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate leading-tight">
                            {client.razon_social}
                          </p>
                          {client.direccion && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">
                              {client.direccion} • Trujillo
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {client.nombre_contacto || '-'}
                    </td>

                    {/* Teléfono */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      {client.telefono || '-'}
                    </td>

                    {/* Correo */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {client.email ? (
                        <span className="text-slate-600 hover:text-blue-600 transition-colors">
                          {client.email}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {client.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 pl-3 pr-1 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => onEdit(client)}
                          title="Editar información de cliente"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Activar / Desactivar */}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(client)}
                          title={
                            client.is_active
                              ? 'Desactivar cliente'
                              : 'Activar cliente'
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            client.is_active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-3 border-t border-slate-100 text-xs text-slate-500">
        {/* Selector de límite */}
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-xs"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>por página</span>
        </div>

        {/* Botones de navegación numérica */}
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

          {/* Botones de números */}
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
