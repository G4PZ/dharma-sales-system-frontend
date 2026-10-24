'use client';

import React from 'react';
import { ShoppingCart, X, Loader2, AlertCircle } from 'lucide-react';
import { Cliente } from '@/types/client';

interface ConfirmSaleModalProps {
  isOpen: boolean;
  client: Cliente | null;
  totalItems: number;
  totalAmount: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmSaleModal({
  isOpen,
  client,
  totalItems,
  totalAmount,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmSaleModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Confirmación de Venta
              </h3>
              <p className="text-[11px] text-slate-500">
                Verifica antes de procesar en el servidor
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-semibold text-slate-800">
            ¿Está seguro de registrar esta venta?
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-semibold text-slate-900 text-right truncate max-w-[220px]">
                {client?.razon_social || 'No seleccionado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">RUC:</span>
              <span className="font-mono font-medium text-slate-700">
                {client?.numero_documento || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Líneas de productos:</span>
              <span className="font-semibold text-slate-900">{totalItems}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200/60 items-baseline">
              <span className="text-slate-600 font-medium">Total estimado:</span>
              <span className="text-base font-bold text-[#2563EB]">
                S/ {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-500">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Al confirmar, se descontará automáticamente el inventario en PostgreSQL
              y se generará un número correlativo único no modificable.
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando venta...</span>
              </>
            ) : (
              <span>Confirmar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
