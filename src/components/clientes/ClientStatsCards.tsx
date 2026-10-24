'use client';

import React from 'react';
import { Users, UserPlus, Building2, UserX } from 'lucide-react';
import { ClientStats } from '@/types/client';

interface ClientStatsCardsProps {
  stats: ClientStats | null;
  loading?: boolean;
  onFilterStatus?: (status: string) => void;
}

export default function ClientStatsCards({
  stats,
  loading = false,
  onFilterStatus,
}: ClientStatsCardsProps) {
  const activos = stats?.clientes_activos ?? 0;
  const nuevos = stats?.nuevos_este_mes ?? 0;
  const empresas = stats?.empresas_count ?? 0;
  const inactivos = stats?.clientes_inactivos ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Clientes Activos */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('activo')}
        className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Clientes activos</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : activos}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
            Activos
          </span>
          <span className="text-slate-400 font-normal">Habilitados para ventas</span>
        </div>
      </div>

      {/* 2. Nuevos este mes */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Nuevos este mes</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : nuevos}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
            Mes actual
          </span>
          <span className="text-slate-400 font-normal">Nuevas incorporaciones</span>
        </div>
      </div>

      {/* 3. Empresas Registradas */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Empresas registradas</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : empresas}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[11px]">
            Corporativo
          </span>
          <span className="text-slate-400 font-normal">Personas jurídicas</span>
        </div>
      </div>

      {/* 4. Clientes Inactivos */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('inactivo')}
        className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Clientes inactivos</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : inactivos}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserX className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-xs">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px]">
            Pausa
          </span>
          <span className="text-slate-400 font-normal">Desactivados temporalmente</span>
        </div>
      </div>
    </div>
  );
}
