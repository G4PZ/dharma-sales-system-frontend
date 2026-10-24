'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Receipt,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  User,
} from 'lucide-react';
import { SaleResponse } from '@/types/sale';
import { fetchSaleById } from '@/services/saleService';

interface SaleDetailModalProps {
  isOpen: boolean;
  saleId: number | null;
  onClose: () => void;
}

export default function SaleDetailModal({
  isOpen,
  saleId,
  onClose,
}: SaleDetailModalProps) {
  const [sale, setSale] = useState<SaleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || saleId === null) {
      setSale(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadSaleDetail() {
      try {
        const data = await fetchSaleById(saleId as number);
        if (isMounted) {
          setSale(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al consultar el detalle de la venta'
          );
          setLoading(false);
        }
      }
    }

    loadSaleDetail();

    return () => {
      isMounted = false;
    };
  }, [isOpen, saleId]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Operación {sale?.numero_venta || '...'}
                </h3>
                {sale && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {sale.estado}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Consulta y trazabilidad histórica de venta registrada
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-600">
                Cargando detalle de la operación...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">No se pudo cargar la venta</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          ) : sale ? (
            <>
              {/* Sección 1: Datos de la Operación y Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tarjeta de Operación */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-200/60">
                    <Receipt className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Datos de la Operación</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Número de Venta:</span>
                      <span className="font-mono font-bold text-blue-700">
                        {sale.numero_venta}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fecha y hora:</span>
                      <span className="font-medium text-slate-800">
                        {formatDateTime(sale.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estado comercial:</span>
                      <span className="font-semibold text-emerald-700">
                        {sale.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Cliente */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pb-1 border-b border-slate-200/60">
                    <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Información del Cliente</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-slate-500 shrink-0">Razón Social:</span>
                      <span className="font-semibold text-slate-900 text-right truncate" title={sale.cliente.razon_social}>
                        {sale.cliente.razon_social}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RUC / Documento:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {sale.cliente.numero_documento}
                      </span>
                    </div>
                    {sale.cliente.nombre_contacto && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contacto:</span>
                        <span className="text-slate-700">
                          {sale.cliente.nombre_contacto}
                        </span>
                      </div>
                    )}
                    {sale.cliente.telefono && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Teléfono:</span>
                        <span className="text-slate-700">
                          {sale.cliente.telefono}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 2: Desglose de Productos (Precios Unitarios Históricos) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Productos Despachados</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Precios unitarios históricos fijados en la orden
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3 whitespace-nowrap">Código</th>
                        <th className="py-2.5 px-3">Producto</th>
                        <th className="py-2.5 px-3 text-center whitespace-nowrap">Cantidad</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Precio Unitario</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Subtotal Línea</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {sale.detalles.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-600">
                            {item.codigo_producto}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {item.nombre_producto}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className="font-semibold text-slate-800">
                              {item.cantidad}
                            </span>{' '}
                            <span className="text-slate-400 text-[11px]">
                              {item.unidad_medida}
                            </span>
                          </td>
                          {/* Precio unitario histórico guardado en detalle_ventas */}
                          <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-slate-600">
                            {formatCurrency(item.precio_unitario)}
                          </td>
                          {/* Subtotal de línea histórico guardado en detalle_ventas */}
                          <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-semibold text-slate-800">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección 3: Resumen Financiero */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(sale.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>IGV (18%):</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(sale.igv)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
                    <span className="text-xs font-bold uppercase tracking-wider">Total:</span>
                    <span className="text-lg font-bold text-[#2563EB]">
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer del Modal (Solo Lectura) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-slate-400">
            Registro de solo lectura. Las operaciones confirmadas son inmutables.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
