'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { AlertStatsResponse } from '@/types/alert';

interface AlertStatsCardsProps {
  stats: AlertStatsResponse | null;
  loading?: boolean;
}

export default function AlertStatsCards({
  stats,
  loading = false,
}: AlertStatsCardsProps) {
  const pendientes = stats?.pendientes ?? 0;
  const alto = stats?.alto ?? 0;
  const medio = stats?.medio ?? 0;
  const bajo = stats?.bajo ?? 0;
  const total = stats?.total ?? 0;
  const confirmadas = stats?.confirmadas ?? 0;
  const falsosPositivos = stats?.falsos_positivos ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Alertas Pendientes */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Alertas Pendientes</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                pendientes.toLocaleString('es-PE')
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
            Por revisar
          </span>
          <span className="text-slate-400 font-normal">
            {total} alertas generadas en total
          </span>
        </div>
      </div>

      {/* 2. Nivel Alto */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Nivel Alto</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                alto.toLocaleString('es-PE')
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px]">
            Alta atipicidad
          </span>
          <span className="text-slate-400 font-normal">Percentil 99 o superior</span>
        </div>
      </div>

      {/* 3. Nivel Medio */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Nivel Medio</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                medio.toLocaleString('es-PE')
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
            Moderado
          </span>
          <span className="text-slate-400 font-normal">Percentil 95 a menor de 99</span>
        </div>
      </div>

      {/* 4. Nivel Bajo & Feedback */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Nivel Bajo</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                bajo.toLocaleString('es-PE')
              )}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
              Informativo
            </span>
            <span className="text-slate-400 font-normal">Percentil 90 a menor de 95</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {confirmadas}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <XCircle className="w-3.5 h-3.5" />
              {falsosPositivos} descartadas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
