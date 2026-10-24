'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Loader2,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Send,
  Eye,
  Info,
} from 'lucide-react';
import {
  DailySummaryDetail,
  DailySummaryListItem,
  PendingBoletasGroup,
} from '@/types/receipt';
import {
  checkDailySummaryTicket,
  createDailySummary,
  fetchDailySummaries,
  fetchDailySummaryDetail,
  fetchPendingBoletasByDate,
  sendExistingDailySummary,
} from '@/services/receiptService';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummaryUpdated?: () => void;
}

export default function DailySummaryModal({
  isOpen,
  onClose,
  onSummaryUpdated,
}: DailySummaryModalProps) {
  const [activeTab, setActiveTab] = useState<'generar' | 'historial'>('generar');

  // Estados para Generar Resumen
  const [groups, setGroups] = useState<PendingBoletasGroup[]>([]);
  const [selectedFecha, setSelectedFecha] = useState<string>('');
  const [loadingPending, setLoadingPending] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Estados para Historial
  const [summaries, setSummaries] = useState<DailySummaryListItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);

  // Detalle de un resumen en modal interno o vista
  const [detailModalItem, setDetailModalItem] = useState<DailySummaryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Feedback Toast interno
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  };

  const loadPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const res = await fetchPendingBoletasByDate();
      setGroups(res.grupos);
      if (res.grupos.length > 0 && !selectedFecha) {
        setSelectedFecha(res.grupos[0].fecha);
      } else if (res.grupos.length === 0) {
        setSelectedFecha('');
      }
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Error al cargar boletas pendientes.');
    } finally {
      setLoadingPending(false);
    }
  }, [selectedFecha]);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetchDailySummaries({ skip: 0, limit: 50 });
      setSummaries(res.items);
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Error al cargar historial de resúmenes.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'generar') {
      loadPending();
    } else {
      loadHistory();
    }
  }, [isOpen, activeTab, loadPending, loadHistory]);

  if (!isOpen) return null;

  const currentGroup = groups.find((g) => g.fecha === selectedFecha);

  const handleGenerateSummary = async () => {
    if (!selectedFecha) return;
    setIsGenerating(true);
    setFeedback(null);

    try {
      const res = await createDailySummary(selectedFecha);
      showFeedback(
        'success',
        `Resumen Diario ${res.identificador} generado con éxito (${res.total_boletas} boletas). Modo local: XML firmado correctamente.`
      );
      if (onSummaryUpdated) onSummaryUpdated();
      // Recargar pendientes
      await loadPending();
      // Cambiar a historial para visualizarlo
      setActiveTab('historial');
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Error al generar el Resumen Diario.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendExisting = async (summaryId: number) => {
    setActionInProgressId(summaryId);
    try {
      const res = await sendExistingDailySummary(summaryId);
      showFeedback('success', `Resumen ${res.identificador} enviado correctamente. Estado: ${res.estado}`);
      await loadHistory();
      if (onSummaryUpdated) onSummaryUpdated();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Error al enviar el Resumen.');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleCheckTicket = async (summaryId: number) => {
    setActionInProgressId(summaryId);
    try {
      const res = await checkDailySummaryTicket(summaryId);
      showFeedback(
        'success',
        `Consulta finalizada para ${res.identificador}. Estado SUNAT: ${res.estado} (${res.descripcion_respuesta || ''})`
      );
      await loadHistory();
      if (onSummaryUpdated) onSummaryUpdated();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Error al consultar ticket.');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleViewDetail = async (summaryId: number) => {
    setLoadingDetail(true);
    try {
      const res = await fetchDailySummaryDetail(summaryId);
      setDetailModalItem(res);
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : 'Error al obtener detalle del resumen.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'GENERADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Generado (Local)
          </span>
        );
      case 'ENVIADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Send className="w-3 h-3 text-cyan-500" />
            Enviado (Ticket)
          </span>
        );
      case 'EN_PROCESO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
            En Proceso
          </span>
        );
      case 'ACEPTADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Aceptado
          </span>
        );
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Resumen Diario de Boletas (RC)
              </h3>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">
                Generación, firma y transmisión por fecha de emisión según normativa SUNAT
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

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('generar')}
            className={`pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'generar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Generar Nuevo Resumen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`pb-3 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'historial'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Historial de Resúmenes
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'generar' ? (
            loadingPending ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Buscando boletas pendientes de envío...</span>
              </div>
            ) : groups.length === 0 ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <p className="font-semibold text-slate-800 text-sm">
                  No hay boletas pendientes de Resumen Diario
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Todas las boletas electrónicas emitidas ya se encuentran agrupadas en un Resumen Diario.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selector de fecha */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Selecciona la fecha de emisión a resumir (America/Lima):
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedFecha}
                          onChange={(e) => setSelectedFecha(e.target.value)}
                          className="py-1.5 px-3 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          {groups.map((g) => (
                            <option key={g.fecha} value={g.fecha}>
                              {g.fecha} ({g.cantidad_boletas} boletas pendientes)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={loadPending}
                          title="Actualizar lista"
                          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {currentGroup && (
                      <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200/80">
                        <div>
                          <p className="text-[11px] text-slate-400">Boletas en lote</p>
                          <p className="text-sm font-bold text-slate-900">
                            {currentGroup.cantidad_boletas}
                            {currentGroup.cantidad_boletas > 500 && (
                              <span className="text-[11px] text-amber-600 font-normal ml-1">
                                (Máx. 500 por lote)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                          <p className="text-[11px] text-slate-400">Total acumulado</p>
                          <p className="text-sm font-bold text-blue-700">
                            S/ {Number(currentGroup.monto_total).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Normativa SUNAT: Un Resumen Diario solo puede contener boletas de la misma fecha de generación y hasta un máximo de 500 comprobantes por resumen.
                    </span>
                  </div>
                </div>

                {/* Listado de boletas del grupo */}
                {currentGroup && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      Boletas que conformarán el Resumen ({currentGroup.boletas.slice(0, 500).length} de {currentGroup.cantidad_boletas})
                    </h4>
                    <div className="border border-slate-200/80 rounded-xl overflow-x-auto max-h-60">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                            <th className="py-2.5 px-3">Comprobante</th>
                            <th className="py-2.5 px-3">Venta</th>
                            <th className="py-2.5 px-3">Cliente / RUC</th>
                            <th className="py-2.5 px-3 text-right">Total (S/)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {currentGroup.boletas.slice(0, 500).map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                {b.numero_comprobante}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                                {b.numero_venta}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-medium text-slate-800">
                                  {b.cliente_razon_social}
                                </span>{' '}
                                <span className="text-[11px] text-slate-400">
                                  ({b.cliente_numero_documento})
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                S/ {Number(b.total).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Botón de Generación */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating || !selectedFecha}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                    <span>Generar Resumen Diario</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Tab: Historial de Resúmenes */
            loadingHistory ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Cargando historial de resúmenes...</span>
              </div>
            ) : summaries.length === 0 ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Calendar className="w-10 h-10 text-slate-300" />
                <p className="font-semibold text-slate-700 text-sm">
                  No hay Resúmenes Diarios registrados
                </p>
                <p className="text-[11px] text-slate-400">
                  Genera el primer resumen desde la pestaña anterior.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200/80 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                      <th className="py-3 px-3">Identificador</th>
                      <th className="py-3 px-3">Fecha Docs</th>
                      <th className="py-3 px-3">Fecha Resumen</th>
                      <th className="py-3 px-3 text-center">Boletas</th>
                      <th className="py-3 px-3 text-right">Total (S/)</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                      <th className="py-3 px-3">Ticket SUNAT</th>
                      <th className="py-3 px-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {summaries.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {s.identificador}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {s.fecha_documentos}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {s.fecha_resumen}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          {s.total_boletas}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          S/ {Number(s.monto_total).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {getStatusBadge(s.estado)}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {s.ticket || <span className="text-slate-300 italic">Sin ticket</span>}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Ver detalle */}
                            <button
                              type="button"
                              onClick={() => handleViewDetail(s.id)}
                              title="Ver boletas del resumen"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Reintentar / Enviar */}
                            {(s.estado === 'GENERADO' || s.estado === 'ERROR_ENVIO') && (
                              <button
                                type="button"
                                onClick={() => handleSendExisting(s.id)}
                                disabled={actionInProgressId === s.id}
                                title="Enviar este resumen a SUNAT"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-semibold border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {actionInProgressId === s.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                <span>Enviar</span>
                              </button>
                            )}

                            {/* Consultar Ticket */}
                            {s.ticket && s.estado !== 'ACEPTADO' && s.estado !== 'RECHAZADO' && (
                              <button
                                type="button"
                                onClick={() => handleCheckTicket(s.id)}
                                disabled={actionInProgressId === s.id}
                                title="Consultar estado de ticket ante SUNAT"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md text-[11px] font-semibold border border-cyan-200 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {actionInProgressId === s.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3 h-3" />
                                )}
                                <span>Consultar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Modal de Detalle de Boletas del Resumen (Interno) */}
        {detailModalItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {detailModalItem.identificador}
                  </h4>
                  {getStatusBadge(detailModalItem.estado)}
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModalItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <div>
                    <span className="text-slate-400 text-[10px]">Fecha Documentos</span>
                    <p className="font-semibold text-slate-800">{detailModalItem.fecha_documentos}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Fecha Resumen</span>
                    <p className="font-semibold text-slate-800">{detailModalItem.fecha_resumen}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Total Boletas</span>
                    <p className="font-bold text-slate-900">{detailModalItem.total_boletas}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Monto Acumulado</span>
                    <p className="font-bold text-blue-700">S/ {Number(detailModalItem.monto_total).toFixed(2)}</p>
                  </div>
                </div>

                {detailModalItem.ticket && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                    <p className="text-[11px] font-mono text-slate-700">
                      Ticket: <strong>{detailModalItem.ticket}</strong>
                    </p>
                    {detailModalItem.descripcion_respuesta && (
                      <p className="text-[11px] text-slate-600">{detailModalItem.descripcion_respuesta}</p>
                    )}
                  </div>
                )}

                <div>
                  <h5 className="font-semibold text-slate-800 mb-1.5">Boletas incluidas</h5>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-slate-500 font-semibold">
                        <tr>
                          <th className="py-2 px-3">Comprobante</th>
                          <th className="py-2 px-3">Venta</th>
                          <th className="py-2 px-3">Cliente</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {detailModalItem.boletas.map((b) => (
                          <tr key={b.id}>
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">{b.numero_comprobante}</td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{b.numero_venta}</td>
                            <td className="py-2 px-3 truncate max-w-xs">{b.cliente_razon_social}</td>
                            <td className="py-2 px-3 text-right font-bold">S/ {Number(b.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-end px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setDetailModalItem(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
