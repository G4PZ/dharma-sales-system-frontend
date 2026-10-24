'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { SaleAnalysisResponse } from '@/types/alert';
import { analyzeSaleManually } from '@/services/alertService';

interface ManualAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisCompleted: () => void;
}

export default function ManualAnalysisModal({
  isOpen,
  onClose,
  onAnalysisCompleted,
}: ManualAnalysisModalProps) {
  const [saleNumberInput, setSaleNumberInput] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<SaleAnalysisResponse | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = saleNumberInput.trim().toUpperCase();
    if (!cleanNum) {
      setErrorMessage('Por favor ingrese un número de venta válido (ej. V-000127).');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setInfoMessage(null);
    setErrorMessage(null);

    try {
      const data = await analyzeSaleManually(cleanNum);
      setResult(data);
      const displayNum = data.numero_venta || cleanNum;

      if (data.nivel_alerta === 'NORMAL') {
        setInfoMessage(
          `La venta ${displayNum} se encuentra dentro del comportamiento esperado y no generó una alerta.`
        );
      } else {
        // Alerta generada: actualiza KPIs y tabla de alertas en la vista principal
        onAnalysisCompleted();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al analizar la operación';

      // 409: motor no disponible o no entrenado (informativo, no error crítico)
      if (
        msg.includes('Isolation Forest') ||
        msg.includes('409') ||
        msg.includes('activo') ||
        msg.includes('entrenado') ||
        msg.includes('disponible')
      ) {
        setInfoMessage(msg);
      } else {
        // 404 u otros errores
        setErrorMessage(msg);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClose = () => {
    setSaleNumberInput('');
    setResult(null);
    setInfoMessage(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Análisis Manual de Venta
              </h3>
              <p className="text-xs text-slate-500">
                Inspección puntual de operaciones mediante el Motor Inteligente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              Número de venta:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={saleNumberInput}
                  onChange={(e) => setSaleNumberInput(e.target.value)}
                  placeholder="Ej. V-000127"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing || !saleNumberInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Analizar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mensajes Informativos (Modelo no disponible 409 o Comportamiento Normal) */}
          {infoMessage && (
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Resultado de la evaluación:</span>
                <p className="leading-relaxed font-normal">{infoMessage}</p>
              </div>
            </div>
          )}

          {/* Mensajes de Error (Venta inexistente 404 u otros) */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200/60 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Atención:</span>
                <p className="leading-relaxed font-normal">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Resultado si generó Alerta */}
          {result && result.nivel_alerta !== 'NORMAL' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Venta analizada</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {result.numero_venta || saleNumberInput.trim().toUpperCase()}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    result.nivel_alerta === 'ALTO'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : result.nivel_alerta === 'MEDIO'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  Nivel {result.nivel_alerta}
                </span>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-slate-200/70">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>Percentil de atipicidad:</span>
                    <span
                      title="Indica la posición relativa de esta operación frente al comportamiento histórico aprendido. No representa probabilidad de fraude."
                      className="cursor-help text-slate-400 hover:text-slate-600 text-[11px]"
                    >
                      ⓘ
                    </span>
                  </span>
                  <strong className="text-slate-900 font-bold">
                    Percentil {(result.puntaje_anomalia * 100).toFixed(1)}
                  </strong>
                </div>
                <p className="text-[10px] text-slate-500">
                  Indica la posición relativa de esta operación frente al comportamiento histórico aprendido. No representa probabilidad de fraude.
                </p>
                {result.descripcion && (
                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">
                    {result.descripcion.replace(/\.?\s*Evaluado bajo el contexto comercial 'Perfil \d+'\.?/gi, '.').trim()}
                  </p>
                )}
              </div>

              {/* Confirmación de registro */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium">
                  {result.ya_analizada
                    ? 'La alerta ya se encontraba previamente registrada en el sistema.'
                    : 'Alerta registrada exitosamente en el sistema. KPIs y tabla actualizados.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
