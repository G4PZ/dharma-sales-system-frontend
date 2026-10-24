'use client';

import React, { useState } from 'react';
import {
  Pencil,
  Power,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  SprayCan,
  Loader2,
  PackagePlus,
} from 'lucide-react';
import { Producto } from '@/types/product';

interface ProductTableProps {
  products: Producto[];
  total: number;
  skip: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEdit: (product: Producto) => void;
  onToggleStatus: (product: Producto) => void;
  onStockEntry: (product: Producto) => void;
}

export default function ProductTable({
  products,
  total,
  skip,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  onEdit,
  onToggleStatus,
  onStockEntry,
}: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Helpers para selección múltiple visual
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Cálculo de paginación
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + limit, total);

  // Selector de ícono temático según categoría
  const getCategoryIcon = (categoria: string) => {
    const cat = categoria.toLowerCase();
    if (cat.includes('limpieza') || cat.includes('desinfección')) {
      return <SprayCan className="w-4 h-4 text-blue-500" />;
    }
    if (cat.includes('papel') || cat.includes('celulosa')) {
      return <Layers className="w-4 h-4 text-amber-500" />;
    }
    if (cat.includes('seguridad') || cat.includes('higiene')) {
      return <ShieldCheck className="w-4 h-4 text-teal-500" />;
    }
    if (cat.includes('bolsa') || cat.includes('embalaje')) {
      return <Package className="w-4 h-4 text-slate-500" />;
    }
    return <Sparkles className="w-4 h-4 text-indigo-500" />;
  };

  // Estilo de la píldora de Stock
  const getStockBadge = (stock: number, stockMinimo: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-lg text-xs font-semibold bg-rose-100 text-rose-700">
          0
        </span>
      );
    }
    if (stock <= stockMinimo) {
      return (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600">
          {stock}
        </span>
      );
    }
    if (stock <= stockMinimo * 2) {
      return (
        <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-600">
          {stock}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600">
        {stock}
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Contenedor con Scroll Horizontal Responsivo */}
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
                  aria-label="Seleccionar todos los productos"
                />
              </th>
              <th className="py-3.5 px-3">Código ↕</th>
              <th className="py-3.5 px-3">Nombre del producto ↑</th>
              <th className="py-3.5 px-3">Categoría ↑</th>
              <th className="py-3.5 px-3 text-center">Stock ↕</th>
              <th className="py-3.5 px-3 text-right">Precio (S/) ↕</th>
              <th className="py-3.5 px-4 text-center">Estado ↕</th>
              <th className="py-3.5 pl-3 pr-1 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-normal text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Cargando catálogo de productos...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <span className="font-medium text-slate-700">
                      No se encontraron productos
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Intenta modificar los filtros de búsqueda.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 pr-3 pl-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(product.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label={`Seleccionar ${product.nombre}`}
                      />
                    </td>

                    {/* Código */}
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {product.codigo}
                    </td>

                    {/* Nombre y presentación */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center shrink-0">
                          {getCategoryIcon(product.categoria)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate leading-tight">
                            {product.nombre}
                          </p>
                          {product.descripcion && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">
                              {product.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {product.categoria}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {getStockBadge(product.stock, product.stock_minimo)}
                    </td>

                    {/* Precio */}
                    <td className="py-3.5 px-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                      {Number(product.precio).toFixed(2)}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {product.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 pl-3 pr-1 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Botón Registrar Ingreso */}
                        <button
                          type="button"
                          onClick={() => onStockEntry(product)}
                          title="Registrar Ingreso de Stock"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Editar */}
                        <button
                          type="button"
                          onClick={() => onEdit(product)}
                          title="Editar producto"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Activar / Desactivar */}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(product)}
                          title={
                            product.is_active
                              ? 'Desactivar producto'
                              : 'Activar producto'
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            product.is_active
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

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-3 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Mostrando{' '}
          <span className="font-semibold text-slate-800">{startItem}</span> -{' '}
          <span className="font-semibold text-slate-800">{endItem}</span> de{' '}
          <span className="font-semibold text-slate-800">{total}</span> productos
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de registros por página */}
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-xs"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>

          {/* Botones de navegación */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

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

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
