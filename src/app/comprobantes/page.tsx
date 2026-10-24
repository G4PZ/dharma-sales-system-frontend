'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { CheckCircle2, AlertCircle, Plus, FileSpreadsheet } from 'lucide-react';
import ReceiptStatsCards from '@/components/comprobantes/ReceiptStatsCards';
import ReceiptFilters from '@/components/comprobantes/ReceiptFilters';
import ReceiptTable from '@/components/comprobantes/ReceiptTable';
import CreateReceiptModal from '@/components/comprobantes/CreateReceiptModal';
import ReceiptDetailModal from '@/components/comprobantes/ReceiptDetailModal';
import DailySummaryModal from '@/components/comprobantes/DailySummaryModal';
import {
  ComprobanteListItem,
  ReceiptStats,
} from '@/types/receipt';
import {
  fetchReceipts,
  fetchReceiptStats,
  sendInvoiceToSunat,
} from '@/services/receiptService';

function ComprobantesContent() {
  // Estados de datos
  const [receipts, setReceipts] = useState<ComprobanteListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [stats, setStats] = useState<ReceiptStats | null>(null);

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
  const [tipo, setTipo] = useState<string>('todos');
  const [estado, setEstado] = useState<string>('todos');
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [detailReceiptId, setDetailReceiptId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<number | null>(null);

  // Notificación Toast
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setSkip(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Carga asíncrona de datos
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [receiptsRes, statsRes] = await Promise.all([
          fetchReceipts({
            search: debouncedSearch,
            tipo,
            estado,
            skip,
            limit,
          }),
          fetchReceiptStats(),
        ]);

        if (!ignore) {
          setReceipts(receiptsRes.items);
          setTotal(receiptsRes.total);
          setStats(statsRes);
          setLoading(false);
          setStatsLoading(false);
        }
      } catch (error: unknown) {
        if (!ignore) {
          const msg =
            error instanceof Error ? error.message : 'Error al cargar comprobantes';
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
  }, [debouncedSearch, tipo, estado, skip, limit, refreshTrigger, showToast]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setTipo('todos');
    setEstado('todos');
    setSkip(0);
  };

  const handlePageChange = (newPage: number) => {
    setSkip((newPage - 1) * limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setSkip(0);
  };

  const handleOpenDetail = (receiptId: number) => {
    setDetailReceiptId(receiptId);
    setIsDetailModalOpen(true);
  };

  const handleReceiptCreated = (msg: string) => {
    showToast('success', msg);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSendInvoice = async (receiptId: number) => {
    setSendingInvoiceId(receiptId);
    try {
      const res = await sendInvoiceToSunat(receiptId);
      showToast(
        res.success ? 'success' : 'error',
        res.mensaje || (res.success ? 'Factura procesada con éxito' : 'Rechazo al emitir factura')
      );
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error al enviar factura a SUNAT');
    } finally {
      setSendingInvoiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
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
      <div className="flex justify-end gap-2.5">
        {/* Botón Resumen Diario de Boletas */}
        <button
          type="button"
          onClick={() => setIsSummaryModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span>Resumen Diario de Boletas</span>
        </button>

        {/* Botón Generar Comprobante */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Comprobante</span>
        </button>
      </div>

      {/* Tarjetas KPI Superiores */}
      <ReceiptStatsCards stats={stats} loading={statsLoading} />

      {/* Panel Principal: Filtros y Tabla */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 space-y-4">
        <ReceiptFilters
          search={search}
          tipo={tipo}
          estado={estado}
          onSearchChange={setSearch}
          onTipoChange={(val) => {
            setTipo(val);
            setSkip(0);
          }}
          onEstadoChange={(val) => {
            setEstado(val);
            setSkip(0);
          }}
          onResetFilters={handleResetFilters}
        />

        <ReceiptTable
          receipts={receipts}
          total={total}
          skip={skip}
          limit={limit}
          loading={loading}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onViewDetail={handleOpenDetail}
          onSendInvoice={handleSendInvoice}
          sendingInvoiceId={sendingInvoiceId}
        />
      </div>

      {/* Modal Emitir Comprobante */}
      <CreateReceiptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleReceiptCreated}
      />

      {/* Modal Resumen Diario de Boletas */}
      <DailySummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onSummaryUpdated={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Modal Detalle de Comprobante */}
      <ReceiptDetailModal
        receiptId={detailReceiptId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailReceiptId(null);
        }}
        onInvoiceSent={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}

export default function ComprobantesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Cargando comprobantes...
        </div>
      }
    >
      <ComprobantesContent />
    </Suspense>
  );
}
