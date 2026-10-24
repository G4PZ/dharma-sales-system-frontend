'use client';

import React from 'react';
import { ShoppingCart, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Cliente } from '@/types/client';
import { CartItem } from './SaleItemsTable';

interface SaleSummaryCardProps {
  selectedClient: Cliente | null;
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  onOpenConfirmation: () => void;
  disabled?: boolean;
}

export default function SaleSummaryCard({
  selectedClient,
  items,
  subtotal,
  igv,
  total,
  onOpenConfirmation,
  disabled = false,
}: SaleSummaryCardProps) {
  const totalUnits = items.reduce((sum, item) => sum + item.cantidad, 0);

  // Validaciones
  const hasClient = Boolean(selectedClient);
  const hasItems = items.length > 0;
  const hasZeroQuantity = items.some((item) => item.cantidad <= 0);
  const hasStockExceeded = items.some((item) => item.cantidad > item.producto.stock);

  const canSubmit = hasClient && hasItems && !hasZeroQuantity && !hasStockExceeded && !disabled;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 sm:p-6 space-y-5 sticky top-24">
      {/* Título de Resumen */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900">
          Resumen de la Venta
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Cálculos preliminares de la operación comercial
        </p>
      </div>

      {/* Desglose de Ítems */}
      <div className="space-y-2 text-xs text-slate-600">
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-500">Líneas de productos:</span>
          <span className="font-semibold text-slate-800">{items.length}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-500">Unidades totales:</span>
          <span className="font-semibold text-slate-800">{totalUnits} und</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2.5">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold text-slate-800">
            S/ {subtotal.toFixed(2)}
          </span>
        </div>

        {/* IGV 18% */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-600">IGV (18%)</span>
          <span className="font-semibold text-slate-800">
            S/ {igv.toFixed(2)}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
          <span className="text-sm font-bold text-slate-900">Total a Pagar</span>
          <span className="text-xl font-extrabold text-[#2563EB] tracking-tight">
            S/ {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Checklist de Validación */}
      <div className="space-y-1.5 pt-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${hasClient ? 'text-emerald-700' : 'text-slate-400'}`}>
          <CheckCircle className={`w-3.5 h-3.5 ${hasClient ? 'text-emerald-600' : 'text-slate-300'}`} />
          <span>Cliente seleccionado {selectedClient ? `(${selectedClient.razon_social})` : ''}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasItems ? 'text-emerald-700' : 'text-slate-400'}`}>
          <CheckCircle className={`w-3.5 h-3.5 ${hasItems ? 'text-emerald-600' : 'text-slate-300'}`} />
          <span>Al menos un producto en la lista</span>
        </div>
        {hasStockExceeded && (
          <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Hay cantidades que superan el stock</span>
          </div>
        )}
      </div>

      {/* Botón Registrar Venta */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={onOpenConfirmation}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
      >
        <ShoppingCart className="w-4 h-4" />
        <span>Registrar venta</span>
      </button>
    </div>
  );
}
