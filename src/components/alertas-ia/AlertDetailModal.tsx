'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldAlert,
  Calendar,
  Building2,
  DollarSign,
  Binary,
  Layers,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AlertDetailResponse, ContributingFactor } from '@/types/alert';
import { fetchAlertDetail, submitAlertFeedback } from '@/services/alertService';

interface AlertDetailModalProps {
  isOpen: boolean;
  alertId: number | null;
  onClose: () => void;
  onFeedbackSaved: () => void;
}

export default function AlertDetailModal({
  isOpen,
  alertId,
  onClose,
  onFeedbackSaved,
}: AlertDetailModalProps) {
  const [alert, setAlert] = useState<AlertDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback form state
  const [notes, setNotes] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || alertId === null) {
      setAlert(null);
      setError(null);
      setNotes('');
      setFeedbackSuccess(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setNotes('');
    setFeedbackSuccess(null);

    async function loadAlert() {
      try {
        const data = await fetchAlertDetail(alertId as number);
        if (isMounted) {
          setAlert(data);
          if (data.retroalimentacion_notas) {
            setNotes(data.retroalimentacion_notas);
          }
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al consultar el detalle de la alerta'
          );
          setLoading(false);
        }
      }
    }

    loadAlert();

    return () => {
      isMounted = false;
    };
  }, [isOpen, alertId]);

  if (!isOpen) return null;

  const handleFeedback = async (status: 'CONFIRMADA' | 'FALSO_POSITIVO') => {
    if (!alertId) return;
    try {
      setSubmittingFeedback(true);
      setError(null);
      const updated = await submitAlertFeedback(alertId, {
        estado_revision: status,
        retroalimentacion_notas: notes.trim() || undefined,
      });
      setAlert(updated);
      setFeedbackSuccess(
        status === 'CONFIRMADA'
          ? 'Alerta confirmada como operación inusual.'
          : 'Alerta registrada como falso positivo.'
      );
      onFeedbackSaved();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al registrar la retroalimentación'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number | string | undefined | null) => {
    if (val === undefined || val === null) return '—';
    const num = Number(val);
    if (isNaN(num)) return `S/ ${val}`;
    return `S/ ${num.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentile = (score: number | string) => {
    const num = Number(score);
    if (isNaN(num)) return '—';
    return (num * 100).toFixed(1);
  };

  const renderFactorHuman = (factor: ContributingFactor, index: number) => {
    let factorName = factor.factor || `factor_${index + 1}`;
    let desc = factor.descripcion || JSON.stringify(factor);
    let isContextualProfile = false;

    // Humanizar factor contextual K-Means sin exponer número de cluster (Perfil N)
    if (
      factor.factor === 'perfil_contextual_cliente' ||
      /perfil\s*\d+/i.test(String(factor.valor_actual || '')) ||
      /perfil\s*\d+/i.test(desc)
    ) {
      factorName = 'Comportamiento del cliente';
      desc = 'El comportamiento histórico del cliente fue considerado durante la evaluación.';
      isContextualProfile = true;
    } else {
      factorName = factorName.replace(/_/g, ' ');
    }

    return (
      <div
        key={`factor-${index}`}
        className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs space-y-1.5"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-800 capitalize flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {factorName}
          </span>
          {!isContextualProfile && factor.ratio !== undefined && factor.ratio !== null && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
              Ratio {factor.ratio}x
            </span>
          )}
        </div>
        <p className="text-slate-600 leading-relaxed font-normal">{desc}</p>
        {!isContextualProfile && (factor.valor_actual !== undefined || factor.valor_referencia !== undefined) && (
          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
            {factor.valor_actual !== undefined && (
              <span>
                Valor actual:{' '}
                <strong className="text-slate-600">{String(factor.valor_actual)}</strong>
              </span>
            )}
            {factor.valor_referencia !== undefined && (
              <span>
                Referencia:{' '}
                <strong className="text-slate-600">{String(factor.valor_referencia)}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Detalle de la Alerta
                </h3>
                {alert && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      alert.nivel_alerta === 'ALTO'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : alert.nivel_alerta === 'MEDIO'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    Nivel {alert.nivel_alerta}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Análisis no supervisado de operación y factores observados
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

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">
                Cargando detalle de la alerta...
              </p>
            </div>
          ) : error && !alert ? (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200/60 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : alert ? (
            <>
              {/* Notificación de éxito si guardó feedback */}
              {feedbackSuccess && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              {/* 1. Resumen Ejecutivo (Venta, Cliente, Nivel, Percentil) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Venta */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Venta
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {alert.numero_venta || alert.venta?.numero_venta || 'Venta no disponible'}
                    </span>
                    {alert.venta?.total && (
                      <span className="font-bold text-slate-900">
                        {formatCurrency(alert.venta.total)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Fecha: {formatDate(alert.venta?.created_at || alert.created_at)}
                  </span>
                </div>

                {/* Cliente */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Cliente
                  </span>
                  <span
                    className="font-bold text-slate-900 block truncate text-sm"
                    title={alert.cliente_razon_social || alert.cliente?.razon_social || 'Cliente no disponible'}
                  >
                    {alert.cliente_razon_social || alert.cliente?.razon_social || 'Cliente no disponible'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    RUC / Doc: {alert.cliente?.numero_documento || '—'}
                  </span>
                </div>

                {/* Nivel de alerta */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Nivel de alerta
                  </span>
                  <div className="pt-0.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        alert.nivel_alerta === 'ALTO'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          : alert.nivel_alerta === 'MEDIO'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      Nivel {alert.nivel_alerta}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block pt-0.5">
                    Evaluación de atipicidad operativa
                  </span>
                </div>

                {/* Percentil de atipicidad */}
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">
                      Percentil de atipicidad
                    </span>
                    <div
                      className="group relative cursor-pointer"
                      title="Indica la posición relativa de esta operación frente al comportamiento histórico aprendido. No representa probabilidad de fraude."
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-950">
                    {formatPercentile(alert.puntaje_anomalia)}
                  </p>
                  <p className="text-[11px] text-blue-700/80 leading-tight">
                    Indica la posición relativa de esta operación frente al comportamiento histórico aprendido. No representa probabilidad de fraude.
                  </p>
                </div>
              </div>

              {/* 2. Descripción */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Descripción
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed font-normal">
                  {alert.descripcion
                    .replace(/\.?\s*Evaluado bajo el contexto comercial 'Perfil \d+'\.?/gi, '.')
                    .trim()}
                </div>
              </div>

              {/* 3. Factores Observados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Factores Observados
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {Array.isArray(alert.factores_contribuyentes)
                      ? `${alert.factores_contribuyentes.length} variables observadas`
                      : 'Sin desglose'}
                  </span>
                </div>

                {Array.isArray(alert.factores_contribuyentes) &&
                alert.factores_contribuyentes.length > 0 ? (
                  <div className="space-y-2">
                    {alert.factores_contribuyentes.map((factor, idx) =>
                      renderFactorHuman(factor, idx)
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No se registraron factores específicos adicionales.
                  </p>
                )}
              </div>

              {/* 4. Trazabilidad de Modelos */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <span className="font-semibold text-slate-600 block">
                  Trazabilidad de Modelos
                </span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    Detección de Operaciones:{' '}
                    <strong>
                      {alert.modelo_isolation_forest?.version || 'Activo'}
                    </strong>
                  </span>
                  <span>
                    Patrones de Clientes:{' '}
                    <strong>
                      {alert.modelo_kmeans?.version || (alert.modelo_kmeans_id ? 'Activo' : 'No aplicó')}
                    </strong>
                  </span>
                </div>
              </div>

              {/* 5. Sección de Retroalimentación Humana */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    Revisión Humana
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      alert.estado_revision === 'CONFIRMADA'
                        ? 'bg-emerald-50 text-emerald-700'
                        : alert.estado_revision === 'FALSO_POSITIVO'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {alert.estado_revision === 'CONFIRMADA'
                      ? 'Confirmada'
                      : alert.estado_revision === 'FALSO_POSITIVO'
                      ? 'Falso positivo'
                      : 'Pendiente de revisión'}
                  </span>
                </div>

                {alert.estado_revision === 'PENDIENTE' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">
                        Notas de revisión (opcional):
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Observaciones justificativas de la decisión..."
                        rows={2}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleFeedback('CONFIRMADA')}
                        disabled={submittingFeedback}
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {submittingFeedback ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Confirmar operación inusual</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFeedback('FALSO_POSITIVO')}
                        disabled={submittingFeedback}
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {submittingFeedback ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>Marcar como falso positivo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Revisado por:{' '}
                        <strong className="text-slate-600">{alert.revisado_por || 'Sistema'}</strong>
                      </span>
                      <span>{formatDate(alert.fecha_revision)}</span>
                    </div>
                    {alert.retroalimentacion_notas && (
                      <p className="pt-1 text-slate-700 italic">
                        &quot;{alert.retroalimentacion_notas}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
