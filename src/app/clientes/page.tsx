'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import ClientStatsCards from '@/components/clientes/ClientStatsCards';
import ClientFilters from '@/components/clientes/ClientFilters';
import ClientTable from '@/components/clientes/ClientTable';
import ClientModal from '@/components/clientes/ClientModal';
import RecentClientsWidget from '@/components/clientes/RecentClientsWidget';
import ConfirmStatusModal from '@/components/clientes/ConfirmStatusModal';
import {
  Cliente,
  ClienteCreate,
  ClienteUpdate,
  ClientStats,
} from '@/types/client';
import {
  fetchClients,
  fetchClientStats,
  createClient,
  updateClient,
  toggleClientStatus,
} from '@/services/clientService';

function ClientesContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search');
  // Estados de datos
  const [clients, setClients] = useState<Cliente[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [stats, setStats] = useState<ClientStats | null>(null);

  // Estados de carga y feedback
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Estados de filtros y paginación
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [estado, setEstado] = useState<string>('todos');
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Estado del modal de formulario
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<Cliente | null>(null);

  // Estado del modal de confirmación de activación / desactivación
  const [clientToToggle, setClientToToggle] = useState<Cliente | null>(null);

  // Toast notification
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setSkip(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sincronizar parámetro search de la URL
  useEffect(() => {
    if (urlSearch !== null) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
      setSkip(0);
    }
  }, [urlSearch]);

  // Carga de datos
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [clientsRes, statsRes] = await Promise.all([
          fetchClients({
            search: debouncedSearch,
            estado,
            skip,
            limit,
          }),
          fetchClientStats(),
        ]);

        if (!ignore) {
          setClients(clientsRes.items);
          setTotal(clientsRes.total);
          setStats(statsRes);
          setLoading(false);
          setStatsLoading(false);
        }
      } catch (error: unknown) {
        if (!ignore) {
          const msg =
            error instanceof Error ? error.message : 'Error al cargar clientes';
          showToast('error', msg);
          setLoading(false);
          setStatsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [
    debouncedSearch,
    estado,
    skip,
    limit,
    refreshTrigger,
    showToast,
  ]);

  // Reset de filtros
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setEstado('todos');
    setSkip(0);
  };

  // Manejadores de paginación
  const handlePageChange = (newPage: number) => {
    setSkip((newPage - 1) * limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setSkip(0);
  };

  // Modal de creación / edición
  const handleOpenNewModal = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Cliente) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (
    data: ClienteCreate | ClienteUpdate
  ): Promise<void> => {
    if (clientToEdit) {
      await updateClient(clientToEdit.id, data as ClienteUpdate);
      showToast('success', `Empresa '${clientToEdit.razon_social}' actualizada con éxito.`);
    } else {
      const newClient = data as ClienteCreate;
      await createClient(newClient);
      showToast('success', `Empresa '${newClient.razon_social}' registrada con éxito.`);
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  // Abrir modal de confirmación antes de activar o desactivar
  const handleToggleStatus = (client: Cliente) => {
    setClientToToggle(client);
  };

  // Confirmar y ejecutar activación / desactivación
  const handleConfirmToggleStatus = async (client: Cliente) => {
    try {
      const updated = await toggleClientStatus(client.id);
      const newStatusText = updated.is_active ? 'activada' : 'desactivada';
      showToast(
        'success',
        `Empresa '${client.razon_social}' ${newStatusText} con éxito.`
      );
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Error al cambiar estado de la empresa';
      showToast('error', msg);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificación Toast */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Acciones Superiores */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva empresa</span>
        </button>
      </div>

      {/* 4 Tarjetas KPI Superiores */}
      <ClientStatsCards
        stats={stats}
        loading={statsLoading}
        onFilterStatus={(st) => {
          setEstado(st);
          setSkip(0);
        }}
      />

      {/* Grid Principal: Columna de Tabla (Col 8/9) + Columna Lateral (Col 4/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Principal: Filtros y Tabla */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6">
            {/* Filtros y Búsqueda */}
            <ClientFilters
              search={search}
              estado={estado}
              onSearchChange={setSearch}
              onEstadoChange={(val) => {
                setEstado(val);
                setSkip(0);
              }}
              onResetFilters={handleResetFilters}
            />

            {/* Tabla de Clientes */}
            <div className="mt-6">
              <ClientTable
                clients={clients}
                total={total}
                skip={skip}
                limit={limit}
                loading={loading}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onEdit={handleOpenEditModal}
                onToggleStatus={handleToggleStatus}
              />
            </div>
          </div>
        </div>

        {/* Columna Lateral Derecha */}
        <div className="lg:col-span-4 xl:col-span-3">
          {/* Widget de Clientes Recientes */}
          <RecentClientsWidget
            recentClients={stats?.ultimos_clientes || []}
            onSelectClient={handleOpenEditModal}
            onViewAll={handleResetFilters}
          />
        </div>
      </div>

      {/* Modal de Registro / Edición */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      {/* Modal de Confirmación para Activar / Desactivar */}
      <ConfirmStatusModal
        isOpen={Boolean(clientToToggle)}
        client={clientToToggle}
        onClose={() => setClientToToggle(null)}
        onConfirm={handleConfirmToggleStatus}
      />
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Cargando directorio de clientes...
        </div>
      }
    >
      <ClientesContent />
    </Suspense>
  );
}
