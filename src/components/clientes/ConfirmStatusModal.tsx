'use client';

import React, { useState } from 'react';
import { Power, Loader2 } from 'lucide-react';
import { Cliente } from '@/types/client';

interface ConfirmStatusModalProps {
  isOpen: boolean;
  client: Cliente | null;
  onClose: () => void;
  onConfirm: (client: Cliente) => Promise<void>;
}

export default function ConfirmStatusModal({
  isOpen,
  client,
  onClose,
  onConfirm,
}: ConfirmStatusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !client) return null;

  const willDeactivate = client.is_active;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(client);
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
        {/* Icono central de acción */}
        <div
          className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-xs border ${
            willDeactivate
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}
        >
          <Power className="w-6 h-6" />
        </div>

        {/* Título obligatorio */}
        <h3 className="text-base font-bold text-slate-900 mt-4 leading-tight">
          ¿Está seguro de realizar esta acción?
        </h3>

        {/* Detalle contextual */}
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {willDeactivate ? (
            <>
              La empresa{' '}
              <span className="font-semibold text-slate-800">
                &ldquo;{client.razon_social}&rdquo;
              </span>{' '}
              será pausada y no estará habilitada para nuevas compras ni operaciones.
            </>
          ) : (
            <>
              La empresa{' '}
              <span className="font-semibold text-slate-800">
                &ldquo;{client.razon_social}&rdquo;
              </span>{' '}
              será activada y quedará habilitada para registrar ventas y facturación.
            </>
          )}
        </p>

        {/* Botones de acción */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-1/2 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`w-1/2 flex items-center justify-center gap-1.5 px-4 py-2 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer ${
              willDeactivate
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#2563EB] hover:bg-blue-700'
            }`}
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
