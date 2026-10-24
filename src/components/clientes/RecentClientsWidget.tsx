'use client';

import React from 'react';
import { Users, Building2, ChevronRight } from 'lucide-react';
import { Cliente } from '@/types/client';

interface RecentClientsWidgetProps {
  recentClients: Cliente[];
  onSelectClient?: (client: Cliente) => void;
  onViewAll?: () => void;
}

export default function RecentClientsWidget({
  recentClients,
  onSelectClient,
  onViewAll,
}: RecentClientsWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Últimos registrados
          </h3>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Ver todos →
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-50 pt-1">
        {recentClients.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No hay registros recientes aún.
          </div>
        ) : (
          recentClients.slice(0, 6).map((client, index) => {
            return (
              <div
                key={client.id}
                onClick={() => onSelectClient && onSelectClient(client)}
                className="py-3 flex items-center justify-between group hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Badge de orden o avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : index === 1
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : index === 2
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                      {client.razon_social}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">
                      RUC: {client.numero_documento}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      Trujillo •{' '}
                      <span
                        className={
                          client.is_active
                            ? 'text-emerald-600 font-medium'
                            : 'text-rose-500 font-medium'
                        }
                      >
                        {client.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
