'use client';

import React from 'react';
import { FileText, FileCheck, Receipt, Clock } from 'lucide-react';
import { ReceiptStats } from '@/types/receipt';

interface ReceiptStatsCardsProps {
  stats: ReceiptStats | null;
  loading?: boolean;
}

export default function ReceiptStatsCards({
  stats,
  loading = false,
}: ReceiptStatsCardsProps) {
  const total = stats?.total_comprobantes ?? 0;
  const facturas = stats?.facturas_count ?? 0;
  const boletas = stats?.boletas_count ?? 0;
  const pendientes = stats?.pendientes_envio ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Comprobantes */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total comprobantes</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : total}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-xs text-slate-400">
          <span>Facturación electrónica local</span>
        </div>
      </div>

      {/* 2. Facturas Emitidas */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Facturas (F001)</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : facturas}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-xs text-slate-400">
          <span>Tipo 01 tributario</span>
        </div>
      </div>

      {/* 3. Boletas Emitidas */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Boletas (B001)</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {loading ? '...' : boletas}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-xs text-slate-400">
          <span>Tipo 03 tributario</span>
        </div>
      </div>

      {/* 4. Pendientes de Envío */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pendientes de envío</p>
            <p className="text-2xl font-bold text-amber-600 tracking-tight mt-1.5">
              {loading ? '...' : pendientes}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 text-xs text-amber-700 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
          <span>Por enviar a SUNAT</span>
        </div>
      </div>
    </div>
  );
}
