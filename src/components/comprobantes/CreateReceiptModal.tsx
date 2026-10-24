'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  FileText,
  FileCheck,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AvailableSale } from '@/types/receipt';
import {
  fetchAvailableSales,
  createReceipt,
} from '@/services/receiptService';

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function CreateReceiptModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateReceiptModalProps) {
  const [availableSales, setAvailableSales] = useState<AvailableSale[]>([]);
  const [loadingSales, setLoadingSales] = useState<boolean>(true);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [tipoComprobante, setTipoComprobante] = useState<'01' | '03'>('01');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar ventas disponibles al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setSelectedSaleId(null);
    setTipoComprobante('01');
    setLoadingSales(true);

    fetchAvailableSales({ limit: 100 })
      .then((res) => {
        setAvailableSales(res.items);
        if (res.items.length > 0) {
          setSelectedSaleId(res.items[0].id);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar ventas disponibles');
      })
      .finally(() => setLoadingSales(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedSale = availableSales.find((s) => s.id === selectedSaleId) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSaleId) {
      setError('Debes seleccionar una venta completada para emitir el comprobante.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createReceipt({
        venta_id: selectedSaleId,
        tipo_comprobante: tipoComprobante,
      });

      onSuccess(
        `Comprobante ${res.numero_comprobante} (${res.nombre_tipo}) generado con éxito para la venta ${res.venta.numero_venta}.`
      );
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al emitir el comprobante.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Generar Comprobante de Pago
              </h3>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">
                Emisión de Factura o Boleta para ventas completadas sin comprobante
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Selección de Venta Disponible */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Seleccionar Venta Disponibe *
            </label>
            {loadingSales ? (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Cargando ventas completadas sin comprobante...</span>
              </div>
            ) : availableSales.length === 0 ? (
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>No hay ventas pendientes de comprobante en este momento.</span>
              </div>
            ) : (
              <select
                value={selectedSaleId ?? ''}
                onChange={(e) => setSelectedSaleId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                required
              >
                {availableSales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.numero_venta} — {s.cliente_razon_social} (RUC: {s.cliente_numero_documento}) — S/ {Number(s.total).toFixed(2)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Ficha Resumen de la Venta Seleccionada */}
          {selectedSale && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedSale.numero_venta}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(selectedSale.created_at)}
                </span>
              </div>

              <div>
                <p className="font-semibold text-slate-800 leading-tight">
                  {selectedSale.cliente_razon_social}
                </p>
                <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                  RUC: {selectedSale.cliente_numero_documento}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                <div>
                  <span className="block text-[10px] text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-700">
                    S/ {Number(selectedSale.subtotal).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">IGV (18%)</span>
                  <span className="font-medium text-slate-700">
                    S/ {Number(selectedSale.igv).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Total</span>
                  <span className="font-bold text-slate-900">
                    S/ {Number(selectedSale.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Selección de Tipo de Comprobante */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Tipo de Comprobante Electrónico *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Opción Factura */}
              <label
                className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  tipoComprobante === '01'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="tipo_comprobante"
                  value="01"
                  checked={tipoComprobante === '01'}
                  onChange={() => setTipoComprobante('01')}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tipoComprobante === '01'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900">Factura</span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    Serie: F001 (01)
                  </span>
                </div>
              </label>

              {/* Opción Boleta */}
              <label
                className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  tipoComprobante === '03'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="tipo_comprobante"
                  value="03"
                  checked={tipoComprobante === '03'}
                  onChange={() => setTipoComprobante('03')}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tipoComprobante === '03'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900">Boleta</span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    Serie: B001 (03)
                  </span>
                </div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              El correlativo será asignado de forma secuencial y automática por el sistema ({tipoComprobante === '01' ? 'F001' : 'B001'}-XXXXXXXX).
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSaleId || availableSales.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Emitiendo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generar Comprobante</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
