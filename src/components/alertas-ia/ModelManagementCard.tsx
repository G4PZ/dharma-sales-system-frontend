'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ChevronDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  ModelsStatusResponse,
  ModelsReadinessResponse,
} from '@/types/alert';

interface ModelManagementCardProps {
  status: ModelsStatusResponse | null;
  readiness: ModelsReadinessResponse | null;
  loading?: boolean;
  trainingIF?: boolean;
  trainingKM?: boolean;
  onTrainIF: () => void;
  onTrainKM: () => void;
  onTrainAll?: () => void;
  onRefresh?: () => void;
}

export default function ModelManagementCard({
  status,
  readiness,
  loading = false,
  trainingIF = false,
  trainingKM = false,
  onTrainIF,
  onTrainKM,
  onTrainAll,
  onRefresh,
}: ModelManagementCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const ifStatus = status?.isolation_forest;
  const kmStatus = status?.kmeans;

  const ifReadiness = readiness?.isolation_forest;
  const kmReadiness = readiness?.kmeans;

  const isBothActive = Boolean(ifStatus?.disponible && kmStatus?.disponible);
  const isTraining = trainingIF || trainingKM;

  const ventasUtilizadas = ifStatus?.total_muestras ?? 0;
  const clientesAnalizados = kmStatus?.total_muestras ?? 0;

  const ventasRegistradas = ifReadiness?.ventas_completadas ?? 0;
  const ventasRequeridas = ifReadiness?.ventas_minimas_requeridas ?? 50;
  const clientesElegibles = kmReadiness?.clientes_elegibles ?? 0;
  const clientesRequeridos = kmReadiness?.clientes_minimos_requeridos ?? 15;

  const puedeActualizarOperaciones = Boolean(ifReadiness?.puede_entrenar);
  const puedeActualizarClientes = Boolean(kmReadiness?.puede_entrenar);
  const puedeActualizarTodo = puedeActualizarOperaciones || puedeActualizarClientes;

  // Manejador de click fuera del dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 space-y-4">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Motor inteligente
              </h3>
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              ) : isBothActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Aún no disponible
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detección de operaciones inusuales y análisis de patrones de comportamiento.
            </p>
          </div>
        </div>

        {/* Acciones Administrativas Discretas */}
        <div className="flex items-center gap-2 self-start sm:self-auto relative" ref={menuRef}>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading || isTraining}
              className="p-2 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Actualizar estado del motor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isTraining}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                <span>Actualizando análisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Actualizar análisis</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Menú Desplegable Secundario */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Acciones Administrativas
                </p>
              </div>

              {/* Opción 1: Actualizar Todo */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (onTrainAll) {
                    onTrainAll();
                  } else {
                    if (puedeActualizarOperaciones) onTrainIF();
                    if (puedeActualizarClientes) onTrainKM();
                  }
                }}
                disabled={!puedeActualizarTodo || isTraining}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex flex-col disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Actualizar todo el análisis
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Reentrena operaciones y patrones de clientes
                </span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {/* Opción 2: Solo Operaciones */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onTrainIF();
                }}
                disabled={!puedeActualizarOperaciones || trainingIF}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex flex-col disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="font-semibold text-slate-800">
                  Actualizar detección de operaciones
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  {ventasRegistradas} de {ventasRequeridas} ventas disponibles
                </span>
              </button>

              {/* Opción 3: Solo Clientes */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onTrainKM();
                }}
                disabled={!puedeActualizarClientes || trainingKM}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex flex-col disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="font-semibold text-slate-800">
                  Actualizar patrones de clientes
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  {clientesElegibles} de {clientesRequeridos} clientes con historial
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cuerpo del Componente */}
      {isBothActive ? (
        /* ESTADO ACTIVO: Compacto y Ejecutivo */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Métrica 1: Ventas Utilizadas */}
          <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-4 flex items-start gap-3.5 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {ventasUtilizadas.toLocaleString('es-PE')} ventas utilizadas
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Historial analizado para detectar operaciones inusuales.
              </p>
            </div>
          </div>

          {/* Métrica 2: Clientes Analizados */}
          <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-4 flex items-start gap-3.5 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {clientesAnalizados.toLocaleString('es-PE')} clientes analizados
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Base utilizada para identificar patrones de comportamiento.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ESTADO NO ENTRENADO / EN PREPARACIÓN */
        <div className="space-y-3 pt-1">
          <p className="text-xs text-slate-600 leading-relaxed">
            El análisis inteligente se habilitará cuando exista suficiente historial de ventas y clientes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ventas necesarias */}
            <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {ventasRegistradas} de {ventasRequeridas} ventas necesarias
                </span>
                <span className="text-[11px] text-slate-500">
                  Historial de operaciones
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    puedeActualizarOperaciones ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (ventasRegistradas / ventasRequeridas) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Historial analizado para detectar operaciones inusuales
              </p>
            </div>

            {/* Clientes necesarios */}
            <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {clientesElegibles} de {clientesRequeridos} clientes necesarios
                </span>
                <span className="text-[11px] text-slate-500">
                  Patrones de comportamiento
                </span>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    puedeActualizarClientes ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (clientesElegibles / clientesRequeridos) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Requiere clientes con al menos 2 compras registradas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
