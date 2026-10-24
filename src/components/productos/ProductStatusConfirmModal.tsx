'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Producto } from '@/types/product';

interface ProductStatusConfirmModalProps {
  isOpen: boolean;
  product: Producto | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ProductStatusConfirmModal({
  isOpen,
  product,
  isLoading,
  onConfirm,
  onCancel,
}: ProductStatusConfirmModalProps) {
  if (!isOpen || !product) return null;

  const isDeactivating = product.is_active;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Encabezado con botón de cerrar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="w-8" />
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="px-6 pb-6 text-center">
          {/* Icono de advertencia o activación */}
          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3.5 border ${
              isDeactivating
                ? 'bg-amber-50 text-amber-600 border-amber-200/80'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
            }`}
          >
            {isDeactivating ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          {/* Título Principal Requerido */}
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            ¿Está seguro de realizar esta acción?
          </h3>

          {/* Mensaje Secundario con el Producto y la Acción */}
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {isDeactivating ? (
              <>
                Se desactivará el producto{' '}
                <span className="font-semibold text-slate-900">
                  {product.nombre}
                </span>
                .
              </>
            ) : (
              <>
                Se activará el producto{' '}
                <span className="font-semibold text-slate-900">
                  {product.nombre}
                </span>
                .
              </>
            )}
          </p>

          {/* Resumen del producto */}
          <div className="mt-3.5 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-left text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Código SKU:</span>
              <span className="font-semibold text-slate-700 font-mono">
                {product.codigo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Categoría:</span>
              <span className="text-slate-700">{product.categoria}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Estado resultante:</span>
              <span
                className={`font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                  isDeactivating
                    ? 'bg-rose-50 text-rose-700 border border-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}
              >
                {isDeactivating ? 'Inactivo' : 'Activo'}
              </span>
            </div>
          </div>

          {/* Botones Cancelar y Confirmar */}
          <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                isDeactivating
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#2563EB] hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Confirmar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
