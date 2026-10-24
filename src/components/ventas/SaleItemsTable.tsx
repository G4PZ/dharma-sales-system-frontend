'use client';

import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Producto } from '@/types/product';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface SaleItemsTableProps {
  items: CartItem[];
  onUpdateQuantity: (productoId: number, cantidad: number) => void;
  onRemoveItem: (productoId: number) => void;
  disabled?: boolean;
}

export default function SaleItemsTable({
  items,
  onUpdateQuantity,
  onRemoveItem,
  disabled = false,
}: SaleItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          No hay productos seleccionados
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Utiliza el buscador superior para agregar productos del inventario a esta orden de venta.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Detalle de Productos ({items.length})
            </h3>
            <p className="text-xs text-slate-500">
              Verifica y ajusta las cantidades de los productos que formarán parte de la venta
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Producto</th>
              <th className="py-3 px-4 text-right">Precio Unit. (S/)</th>
              <th className="py-3 px-4 text-center">Stock Disp.</th>
              <th className="py-3 px-4 text-center min-w-[140px]">Cantidad</th>
              <th className="py-3 px-4 text-right">Subtotal (S/)</th>
              <th className="py-3 px-4 text-center w-12">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {items.map(({ producto, cantidad }) => {
              const unitPrice = Number(producto.precio || 0);
              const lineSubtotal = unitPrice * cantidad;
              const hasStockIssue = cantidad > producto.stock;

              return (
                <tr
                  key={producto.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    hasStockIssue ? 'bg-rose-50/40' : ''
                  }`}
                >
                  {/* Código */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                    {producto.codigo}
                  </td>

                  {/* Nombre y categoría */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 max-w-xs sm:max-w-sm truncate">
                      {producto.nombre}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {producto.categoria} • {producto.unidad_medida}
                    </div>
                    {hasStockIssue && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Cantidad supera el stock disponible ({producto.stock})</span>
                      </div>
                    )}
                  </td>

                  {/* Precio Unitario */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-800 whitespace-nowrap">
                    S/ {unitPrice.toFixed(2)}
                  </td>

                  {/* Stock Disponible */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        producto.stock <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : producto.stock <= producto.stock_minimo
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {producto.stock} {producto.unidad_medida}
                    </span>
                  </td>

                  {/* Controles de Cantidad */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        disabled={disabled || cantidad <= 1}
                        onClick={() => onUpdateQuantity(producto.id, cantidad - 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Disminuir"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={producto.stock}
                        disabled={disabled}
                        value={cantidad}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            onUpdateQuantity(producto.id, Math.max(1, val));
                          }
                        }}
                        className="w-14 text-center py-1 text-xs font-bold text-slate-900 focus:outline-none focus:bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button
                        type="button"
                        disabled={disabled || cantidad >= producto.stock}
                        onClick={() => onUpdateQuantity(producto.id, cantidad + 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={cantidad >= producto.stock ? 'Stock máximo alcanzado' : 'Aumentar'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Subtotal Línea */}
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    S/ {lineSubtotal.toFixed(2)}
                  </td>

                  {/* Acción Eliminar */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onRemoveItem(producto.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Quitar producto de la venta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
