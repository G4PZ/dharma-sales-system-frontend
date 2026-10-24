'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, User, Phone, MapPin, CheckCircle2, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Cliente } from '@/types/client';
import { fetchClients } from '@/services/clientService';

interface SaleClientSelectorProps {
  selectedClient: Cliente | null;
  onSelectClient: (client: Cliente | null) => void;
  disabled?: boolean;
}

export default function SaleClientSelector({
  selectedClient,
  onSelectClient,
  disabled = false,
}: SaleClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Cargar clientes activos cuando hay término de búsqueda o al abrir
  useEffect(() => {
    let ignore = false;

    async function searchActiveClients() {
      // Si ya hay un cliente seleccionado y no se está buscando activamente, no llamar
      if (selectedClient && !searchTerm.trim()) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchClients({
          search: debouncedTerm.trim() || undefined,
          estado: 'activo',
          limit: 15,
        });

        if (!ignore) {
          setClients(response.items);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Error al buscar clientes';
          setError(msg);
          setLoading(false);
        }
      }
    }

    if (isOpen || debouncedTerm.trim()) {
      searchActiveClients();
    }

    return () => {
      ignore = true;
    };
  }, [debouncedTerm, isOpen, selectedClient, searchTerm]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Cliente) => {
    onSelectClient(client);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onSelectClient(null);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cliente de la Venta
            </h3>
            <p className="text-xs text-slate-500">
              Selecciona una empresa cliente activa registrada en el sistema
            </p>
          </div>
        </div>

        {selectedClient && !disabled && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#2563EB] bg-slate-50 hover:bg-blue-50/80 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cambiar cliente</span>
          </button>
        )}
      </div>

      {/* Vista de Cliente Seleccionado */}
      {selectedClient ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 via-slate-50/60 to-white border border-blue-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2563EB] text-white">
                RUC: {selectedClient.numero_documento}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Cliente Activo
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              {selectedClient.razon_social}
            </h4>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-1">
              {selectedClient.nombre_contacto && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {selectedClient.nombre_contacto}
                </span>
              )}
              {selectedClient.telefono && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedClient.telefono}
                </span>
              )}
              {(selectedClient.direccion || selectedClient.ciudad) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {[selectedClient.direccion, selectedClient.ciudad].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Tipo
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {selectedClient.tipo_cliente || 'Empresa Jurídica'}
            </span>
          </div>
        </div>
      ) : (
        /* Buscador de Clientes */
        <div ref={wrapperRef} className="relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              disabled={disabled}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Buscar por RUC (11 dígitos) o Razón Social..."
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {loading && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2563EB] animate-spin" />
            )}
          </div>

          {/* Menú flotante de resultados */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl z-30 divide-y divide-slate-100 animate-in fade-in-50 duration-150">
              {error && (
                <div className="p-3 text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {loading && clients.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                  <span>Buscando clientes activos...</span>
                </div>
              )}

              {!loading && clients.length === 0 && (
                <div className="p-5 text-center text-xs text-slate-500">
                  No se encontraron empresas clientes activas con ese criterio.
                </div>
              )}

              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelect(client)}
                  className="w-full text-left p-3.5 hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md group-hover:bg-blue-100/70">
                        RUC: {client.numero_documento}
                      </span>
                      {client.ciudad && (
                        <span className="text-[11px] text-slate-400">
                          • {client.ciudad}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                      {client.razon_social}
                    </div>
                    {client.nombre_contacto && (
                      <div className="text-[11px] text-slate-500">
                        Contacto: {client.nombre_contacto}
                      </div>
                    )}
                  </div>

                  <Building2 className="w-4 h-4 text-slate-300 group-hover:text-[#2563EB] shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
