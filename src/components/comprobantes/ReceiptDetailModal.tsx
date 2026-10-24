'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  FileText,
  Clock,
  Building2,
  Receipt,
  AlertCircle,
  ShieldAlert,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { ComprobanteDetail } from '@/types/receipt';
import { fetchReceiptDetail, sendInvoiceToSunat } from '@/services/receiptService';

interface ReceiptDetailModalProps {
  receiptId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onInvoiceSent?: () => void;
}

export default function ReceiptDetailModal({
  receiptId,
  isOpen,
  onClose,
  onInvoiceSent,
}: ReceiptDetailModalProps) {
  const [detail, setDetail] = useState<ComprobanteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !receiptId) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    fetchReceiptDetail(receiptId)
      .then((data) => setDetail(data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar detalle del comprobante');
      })
      .finally(() => setLoading(false));
  }, [isOpen, receiptId]);

  if (!isOpen) return null;

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

  const handleSendInvoice = async () => {
    if (!detail) return;
    setIsSending(true);
    setFeedback(null);

    try {
      const res = await sendInvoiceToSunat(detail.id);
      setFeedback({
        type: res.success ? 'success' : 'error',
        message: res.mensaje || (res.success ? 'Factura procesada correctamente.' : 'Error al enviar factura.'),
      });
      // Refrescar detalle
      const updated = await fetchReceiptDetail(detail.id);
      setDetail(updated);
      if (onInvoiceSent) onInvoiceSent();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al despachar factura.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderStatusBadge = (estado: string, tipo: string) => {
    if (tipo === '03' && estado === 'PENDIENTE_ENVIO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-500" />
          Pendiente de Resumen Diario
        </span>
      );
    }
    switch (estado) {
      case 'ACEPTADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Aceptado
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Clock className="w-3 h-3 text-cyan-500" />
            Enviado (Procesando)
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            Rechazado
          </span>
        );
      case 'ERROR_ENVIO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Error de envío
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Pendiente de envío
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {detail ? detail.numero_comprobante : 'Cargando comprobante...'}
                </h3>
                {detail && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {detail.nombre_tipo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">
                Comprobante de pago electrónico de Dharma E.I.R.L.
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Cargando detalle del comprobante...</span>
            </div>
          ) : error || !detail ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error || 'No se pudo obtener la información.'}</span>
            </div>
          ) : (
            <>
              {/* Feedback Banner */}
              {feedback && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 font-medium ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Badge de Estado y Metadatos */}
              <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Estado:</span>
                  {renderStatusBadge(detail.estado, detail.tipo_comprobante)}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Fecha emisión:{' '}
                  <strong className="text-slate-800">
                    {formatDate(detail.fecha_emision)}
                  </strong>
                </div>
              </div>

              {/* Grid 2 Columnas: Cliente Receptor y Venta Asociada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Datos del Cliente */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Datos del Cliente Receptor</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm leading-tight">
                    {detail.cliente.razon_social}
                  </p>
                  <p className="font-mono text-slate-600">
                    RUC: {detail.cliente.numero_documento}
                  </p>
                  {detail.cliente.direccion && (
                    <p className="text-slate-500 text-[11px]">
                      {detail.cliente.direccion}
                    </p>
                  )}
                </div>

                {/* Datos de la Venta */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>Referencia de Venta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Número de Venta:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {detail.venta.numero_venta}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Fecha de Registro:</span>
                    <span className="text-slate-700">
                      {formatDate(detail.venta.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Origen de ítems:</span>
                    <span className="text-slate-700">Precios históricos inmutables</span>
                  </div>
                </div>
              </div>

              {/* Tabla de Productos Facturados */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">
                  Detalle de Productos Facturados
                </h4>
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-3 text-center">Cant.</th>
                        <th className="py-2.5 px-3 text-right">P. Unit. (Sin IGV)</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {detail.detalles.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {d.codigo_producto}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {d.nombre_producto}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold">
                            {d.cantidad} {d.unidad_medida}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            S/ {Number(d.precio_unitario).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            S/ {Number(d.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Desglose de Totales */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Op. Gravadas:</span>
                    <span className="font-medium">
                      S/ {Number(detail.venta.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>I.G.V. (18%):</span>
                    <span className="font-medium">
                      S/ {Number(detail.venta.igv).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-900 text-sm font-bold">
                    <span>Importe Total:</span>
                    <span className="text-blue-700">
                      S/ {Number(detail.venta.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección Integración SUNAT */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">
                  Estado y Trazabilidad SUNAT
                </h4>

                {/* Tratamiento de Boleta ('03') */}
                {detail.tipo_comprobante === '03' ? (
                  detail.resumen_diario ? (
                    <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-slate-900">
                            Procesada mediante {detail.resumen_diario.identificador}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          {detail.resumen_diario.estado}
                        </span>
                      </div>
                      {detail.resumen_diario.ticket && (
                        <p className="text-[11px] text-slate-700 font-mono">
                          Ticket SUNAT: <strong className="text-slate-900">{detail.resumen_diario.ticket}</strong>
                        </p>
                      )}
                      {detail.resumen_diario.descripcion_respuesta && (
                        <p className="text-[11px] text-slate-600">
                          Respuesta: {detail.resumen_diario.descripcion_respuesta}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Fecha del resumen: {detail.resumen_diario.fecha_resumen}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3 text-slate-600">
                      <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          Pendiente de Resumen Diario
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Esta boleta aún no ha sido agrupada en ningún Resumen Diario. Diríjase a la sección de Resumen Diario de Boletas para incluirla.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  /* Tratamiento de Factura ('01') */
                  detail.respuestas_sunat && detail.respuestas_sunat.length > 0 ? (
                    <div className="space-y-2">
                      {detail.respuestas_sunat.map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-800">
                              {r.estado} - Código {r.codigo}
                            </p>
                            {r.fecha_respuesta && (
                              <span className="text-[10px] text-slate-400">
                                {formatDate(r.fecha_respuesta)}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-[11px]">{r.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                      <div className="flex items-start gap-3 text-slate-600">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">
                            Pendiente de Envío a SUNAT
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            Factura lista para ser despachada al microservicio PHP/Greenter. En modo local se generará y firmará el XML UBL 2.1.
                          </p>
                        </div>
                      </div>
                      {(detail.estado === 'PENDIENTE_ENVIO' || detail.estado === 'ERROR_ENVIO') && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSendInvoice}
                            disabled={isSending}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            {isSending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{detail.estado === 'ERROR_ENVIO' ? 'Reintentar Envío' : 'Enviar Factura a SUNAT'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
