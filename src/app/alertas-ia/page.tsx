'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert,
} from 'lucide-react';
import {
  AlertResponse,
  AlertStatsResponse,
  ModelsStatusResponse,
  ModelsReadinessResponse,
} from '@/types/alert';
import {
  fetchAlerts,
  fetchAlertStats,
  fetchModelsStatus,
  fetchModelsReadiness,
  trainKMeans,
  trainIsolationForest,
} from '@/services/alertService';
import AlertStatsCards from '@/components/alertas-ia/AlertStatsCards';
import ModelManagementCard from '@/components/alertas-ia/ModelManagementCard';
import AlertFilters from '@/components/alertas-ia/AlertFilters';
import AlertTable from '@/components/alertas-ia/AlertTable';
import AlertDetailModal from '@/components/alertas-ia/AlertDetailModal';
import ManualAnalysisModal from '@/components/alertas-ia/ManualAnalysisModal';

const PAGE_SIZE = 10;

export default function AlertasIAPage() {
  // Estado de Datos
  const [stats, setStats] = useState<AlertStatsResponse | null>(null);
  const [modelsStatus, setModelsStatus] = useState<ModelsStatusResponse | null>(null);
  const [modelsReadiness, setModelsReadiness] = useState<ModelsReadinessResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [totalAlerts, setTotalAlerts] = useState<number>(0);

  // Filtros y Paginación
  const [skip, setSkip] = useState<number>(0);
  const [nivel, setNivel] = useState<string>('TODOS');
  const [estadoRevision, setEstadoRevision] = useState<string>('TODOS');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Estados de Carga
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(true);
  const [trainingIF, setTrainingIF] = useState<boolean>(false);
  const [trainingKM, setTrainingKM] = useState<boolean>(false);

  // Modales
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isManualAnalysisOpen, setIsManualAnalysisOpen] = useState<boolean>(false);

  // Notificaciones / Banners
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showBanner = (type: 'success' | 'info' | 'error', text: string) => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setBannerMessage({ type, text });
    bannerTimeoutRef.current = setTimeout(() => {
      setBannerMessage(null);
    }, 6000);
  };

  // Carga de Estadísticas
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await fetchAlertStats();
      setStats(data);
    } catch {
      // Dejar en null si hay error de red
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Carga de Modelos y Preparación
  const loadModels = useCallback(async () => {
    try {
      setLoadingModels(true);
      const [statusData, readinessData] = await Promise.all([
        fetchModelsStatus(),
        fetchModelsReadiness(),
      ]);
      setModelsStatus(statusData);
      setModelsReadiness(readinessData);
    } catch {
      // Silencioso o mantener previo
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // Carga de Alertas
  const loadAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      const data = await fetchAlerts({
        skip,
        limit: PAGE_SIZE,
        nivel: nivel !== 'TODOS' ? nivel : undefined,
        estado_revision: estadoRevision !== 'TODOS' ? estadoRevision : undefined,
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
      });
      setAlerts(data.items);
      setTotalAlerts(data.total);
    } catch (err: unknown) {
      showBanner(
        'error',
        err instanceof Error ? err.message : 'Error al consultar las alertas'
      );
      setAlerts([]);
      setTotalAlerts(0);
    } finally {
      setLoadingAlerts(false);
    }
  }, [skip, nivel, estadoRevision, fechaInicio, fechaFin]);

  // Carga inicial
  useEffect(() => {
    loadStats();
    loadModels();
  }, [loadStats, loadModels]);

  // Carga de alertas dependiente de filtros y paginación
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Handlers de Filtros
  const handleNivelChange = (val: string) => {
    setNivel(val);
    setSkip(0);
  };

  const handleEstadoRevisionChange = (val: string) => {
    setEstadoRevision(val);
    setSkip(0);
  };

  const handleFechaInicioChange = (val: string) => {
    setFechaInicio(val);
    setSkip(0);
  };

  const handleFechaFinChange = (val: string) => {
    setFechaFin(val);
    setSkip(0);
  };

  const handleResetFilters = () => {
    setNivel('TODOS');
    setEstadoRevision('TODOS');
    setFechaInicio('');
    setFechaFin('');
    setSkip(0);
  };

  // Refrescar Todo
  const handleRefreshAll = () => {
    loadStats();
    loadModels();
    loadAlerts();
    showBanner('info', 'Datos del Motor IA actualizados.');
  };

  // Actualización de Detección de Operaciones
  const handleTrainIF = async () => {
    try {
      setTrainingIF(true);
      const res = await trainIsolationForest();
      showBanner(
        'success',
        `Detección de operaciones inusuales actualizada exitosamente con ${res.total_muestras} ventas.`
      );
      await loadModels();
    } catch (err: unknown) {
      showBanner(
        'info',
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la detección de operaciones.'
      );
    } finally {
      setTrainingIF(false);
    }
  };

  // Actualización de Patrones de Clientes
  const handleTrainKM = async () => {
    try {
      setTrainingKM(true);
      const res = await trainKMeans();
      showBanner(
        'success',
        `Patrones de clientes actualizados exitosamente con ${res.total_muestras} clientes.`
      );
      await loadModels();
    } catch (err: unknown) {
      showBanner(
        'info',
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar los patrones de clientes.'
      );
    } finally {
      setTrainingKM(false);
    }
  };

  // Actualización Completa del Motor Inteligente
  const handleTrainAll = async () => {
    if (modelsReadiness?.isolation_forest.puede_entrenar) {
      await handleTrainIF();
    }
    if (modelsReadiness?.kmeans.puede_entrenar) {
      await handleTrainKM();
    }
  };

  // Selección de Alerta para Ver Detalle
  const handleSelectAlert = (id: number) => {
    setSelectedAlertId(id);
    setIsDetailModalOpen(true);
  };

  // Feedback Guardado en Modal
  const handleFeedbackSaved = () => {
    loadStats();
    loadAlerts();
  };

  // Análisis Manual Completado
  const handleManualAnalysisCompleted = () => {
    loadStats();
    loadAlerts();
    showBanner('success', 'Análisis manual completado. Alerta registrada.');
  };

  return (
    <div className="space-y-6">
      {/* Notificación Flotante / Banner */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2 duration-200 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : bannerMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : bannerMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span className="font-medium">{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Alertas IA
            </h2>
            {stats && stats.pendientes > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {stats.pendientes} pendientes
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Detección de operaciones inusuales, análisis de patrones de clientes y revisión de alertas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Botón Refrescar */}
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={loadingStats || loadingModels || loadingAlerts}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Actualizar todos los datos"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${
                loadingStats || loadingModels || loadingAlerts ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Botón Analizar Venta Manualmente */}
          <button
            type="button"
            onClick={() => setIsManualAnalysisOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Analizar Venta</span>
          </button>
        </div>
      </div>

      {/* 1. Panel Superior de Estadísticas */}
      <AlertStatsCards stats={stats} loading={loadingStats} />

      {/* 2. Sección Estado y Administración del Motor Inteligente */}
      <ModelManagementCard
        status={modelsStatus}
        readiness={modelsReadiness}
        loading={loadingModels}
        trainingIF={trainingIF}
        trainingKM={trainingKM}
        onTrainIF={handleTrainIF}
        onTrainKM={handleTrainKM}
        onTrainAll={handleTrainAll}
        onRefresh={loadModels}
      />

      {/* 3. Panel Principal: Filtros y Tabla de Alertas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 space-y-4">
        {/* Cabecera y Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Registro de Alertas
            </h3>
            <p className="text-xs text-slate-500">
              Operaciones identificadas como inusuales por el análisis inteligente
            </p>
          </div>

          <AlertFilters
            nivel={nivel}
            estadoRevision={estadoRevision}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onNivelChange={handleNivelChange}
            onEstadoRevisionChange={handleEstadoRevisionChange}
            onFechaInicioChange={handleFechaInicioChange}
            onFechaFinChange={handleFechaFinChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Tabla de Alertas */}
        <AlertTable
          alerts={alerts}
          total={totalAlerts}
          skip={skip}
          limit={PAGE_SIZE}
          loading={loadingAlerts}
          onPageChange={(newSkip) => setSkip(newSkip)}
          onSelectAlert={handleSelectAlert}
          ventasCompletadas={modelsReadiness?.isolation_forest.ventas_completadas ?? 0}
          ventasRequeridas={modelsReadiness?.isolation_forest.ventas_minimas_requeridas ?? 50}
        />
      </div>

      {/* Modal de Detalle y Feedback */}
      <AlertDetailModal
        isOpen={isDetailModalOpen}
        alertId={selectedAlertId}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAlertId(null);
        }}
        onFeedbackSaved={handleFeedbackSaved}
      />

      {/* Modal de Análisis Manual Secundario */}
      <ManualAnalysisModal
        isOpen={isManualAnalysisOpen}
        onClose={() => setIsManualAnalysisOpen(false)}
        onAnalysisCompleted={handleManualAnalysisCompleted}
      />
    </div>
  );
}
