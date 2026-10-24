'use client';

import React from 'react';
import {
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
} from 'lucide-react';
import { ComprobanteListItem } from '@/types/receipt';

interface ReceiptTableProps {
  receipts: ComprobanteListItem[];
  total: number;
  skip: number;
  limit: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onViewDetail: (receiptId: number) => void;
  onSendInvoice?: (receiptId: number) => Promise<void>;
  sendingInvoiceId?: number | null;
}

export default function ReceiptTable({
  receipts,
  total,
  skip,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onSendInvoice,
  sendingInvoiceId,
}: ReceiptTableProps) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + limit, total);

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

  const getStatusBadge = (estado: string, tipoComprobante: string) => {
    if (tipoComprobante === '03' && estado === 'PENDIENTE_ENVIO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
          <Clock className="w-3 h-3 text-blue-500" />
          Pendiente de Resumen Diario
        </span>
      );
    }

    switch (estado) {
      case 'PENDIENTE_ENVIO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3 text-amber-500" />
            Pendiente de envío
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200/60">
            <Clock className="w-3 h-3 text-cyan-500" />
            Enviado (Procesando)
          </span>
        );
      case 'ACEPTADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Aceptado
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3 h-3 text-rose-500" />
            Rechazado
          </span>
        );
      case 'ERROR_ENVIO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Error de envío
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            {estado}
          </span>
        );
    }
  };

  const getTipoBadge = (tipo: string, nombreTipo: string) => {
    if (tipo === '01') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          Factura
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        Boleta
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
              <th className="py-3.5 pr-3 pl-1">Comprobante</th>
              <th className="py-3.5 px-3">Tipo</th>
              <th className="py-3.5 px-3">Venta</th>
              <th className="py-3.5 px-3">Cliente / RUC</th>
              <th className="py-3.5 px-3">Fecha emisión</th>
              <th className="py-3.5 px-3 text-right">Total (S/)</th>
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
                    <span>Cargando comprobantes electrónicos...</span>
                  </div>
                </td>
              </tr>
            ) : receipts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <span className="font-medium text-slate-700">
                      No se encontraron comprobantes
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Genera un nuevo comprobante desde una venta completada.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Comprobante */}
                  <td className="py-3.5 pr-3 pl-1 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {r.numero_comprobante}
                  </td>

                  {/* Tipo */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getTipoBadge(r.tipo_comprobante, r.nombre_tipo)}
                  </td>

                  {/* Venta */}
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {r.numero_venta}
                  </td>

                  {/* Cliente / RUC */}
                  <td className="py-3.5 px-3">
                    <div className="min-w-0 max-w-xs">
                      <p className="font-semibold text-slate-800 truncate leading-tight">
                        {r.cliente_razon_social}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5 leading-tight">
                        RUC: {r.cliente_numero_documento}
                      </p>
                    </div>
                  </td>

                  {/* Fecha emisión */}
                  <td className="py-3.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {formatDate(r.fecha_emision)}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                    S/ {Number(r.total).toFixed(2)}
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(r.estado, r.tipo_comprobante)}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 pl-3 pr-1 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Botón Enviar a SUNAT solo para Facturas ('01') pendientes o con error */}
                      {r.tipo_comprobante === '01' &&
                        (r.estado === 'PENDIENTE_ENVIO' || r.estado === 'ERROR_ENVIO') &&
                        onSendInvoice && (
                          <button
                            type="button"
                            onClick={() => onSendInvoice(r.id)}
                            disabled={sendingInvoiceId === r.id}
                            title="Enviar Factura a SUNAT"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {sendingInvoiceId === r.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                            ) : (
                              <Send className="w-3 h-3 text-blue-600" />
                            )}
                            <span>{r.estado === 'ERROR_ENVIO' ? 'Reintentar' : 'Enviar SUNAT'}</span>
                          </button>
                        )}

                      <button
                        type="button"
                        onClick={() => onViewDetail(r.id)}
                        title="Ver detalle del comprobante"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detalle</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Mostrando <strong className="text-slate-700">{startItem}</strong> a{' '}
            <strong className="text-slate-700">{endItem}</strong> de{' '}
            <strong className="text-slate-700">{total}</strong> comprobantes
          </span>
          <span className="text-slate-300">|</span>
          <label className="flex items-center gap-1.5">
            <span>Mostrar</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="py-1 px-2 border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Página <strong className="text-slate-700">{currentPage}</strong> de{' '}
            <strong className="text-slate-700">{totalPages}</strong>
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
