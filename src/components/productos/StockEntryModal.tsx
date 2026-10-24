'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  PackagePlus,
  History,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  Producto,
  EntradaStock,
  HistorialPrecio,
  EntradaStockCreate,
} from '@/types/product';
import {
  createStockEntry,
  fetchStockEntries,
  fetchPriceHistory,
} from '@/services/productService';

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialProduct?: Producto | null;
  allProducts?: Producto[];
}

type TabType = 'registrar' | 'entradas' | 'precios';

export default function StockEntryModal({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
  allProducts = [],
}: StockEntryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('registrar');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialProduct?.id ?? null
  );

  // Form State
  const [cantidad, setCantidad] = useState<string>('');
  const [costoUnitario, setCostoUnitario] = useState<string>('');
  const [nuevoPrecioVenta, setNuevoPrecioVenta] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // History State
  const [stockEntries, setStockEntries] = useState<EntradaStock[]>([]);
  const [priceHistory, setPriceHistory] = useState<HistorialPrecio[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Sincronizar producto seleccionado si cambia la propiedad inicial
  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
    } else if (allProducts.length > 0 && selectedProductId === null) {
      setSelectedProductId(allProducts[0].id);
    }
  }, [initialProduct, allProducts, selectedProductId]);

  const selectedProduct =
    (initialProduct && initialProduct.id === selectedProductId
      ? initialProduct
      : allProducts.find((p) => p.id === selectedProductId)) || null;

  // Cargar historiales cuando se cambia a pestaña de historial o cambia producto
  useEffect(() => {
    if (!selectedProductId || !isOpen) return;

    if (activeTab === 'entradas') {
      setLoadingHistory(true);
      fetchStockEntries(selectedProductId)
        .then((res) => setStockEntries(res.items))
        .catch(() => setStockEntries([]))
        .finally(() => setLoadingHistory(false));
    } else if (activeTab === 'precios') {
      setLoadingHistory(true);
      fetchPriceHistory(selectedProductId)
        .then((res) => setPriceHistory(res.items))
        .catch(() => setPriceHistory([]))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeTab, selectedProductId, isOpen]);

  if (!isOpen) return null;

  // Cálculos reactivos de inversión
  const parsedCantidad = parseInt(cantidad, 10);
  const parsedCosto = parseFloat(costoUnitario);
  const parsedNuevoPrecio = nuevoPrecioVenta ? parseFloat(nuevoPrecioVenta) : null;
  const inversionTotal =
    !isNaN(parsedCantidad) && parsedCantidad > 0 && !isNaN(parsedCosto) && parsedCosto >= 0
      ? (parsedCantidad * parsedCosto).toFixed(2)
      : '0.00';

  const currentPriceNum = selectedProduct ? Number(selectedProduct.precio) : 0;
  const hasPriceChange =
    parsedNuevoPrecio !== null &&
    !isNaN(parsedNuevoPrecio) &&
    parsedNuevoPrecio !== currentPriceNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedProductId) {
      setFormError('Por favor selecciona un producto.');
      return;
    }

    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      setFormError('La cantidad debe ser un número entero mayor a 0.');
      return;
    }

    if (isNaN(parsedCosto) || parsedCosto < 0) {
      setFormError('El costo unitario debe ser mayor o igual a 0.00.');
      return;
    }

    if (
      nuevoPrecioVenta.trim() !== '' &&
      (parsedNuevoPrecio === null || isNaN(parsedNuevoPrecio) || parsedNuevoPrecio < 0)
    ) {
      setFormError('Si defines un nuevo precio de venta, debe ser mayor o igual a 0.00.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: EntradaStockCreate = {
        cantidad: parsedCantidad,
        costo_unitario: parsedCosto,
        nuevo_precio_venta:
          nuevoPrecioVenta.trim() !== '' ? parsedNuevoPrecio : null,
        observaciones: observaciones.trim() || null,
      };

      await createStockEntry(selectedProductId, payload);

      const productName = selectedProduct ? selectedProduct.nombre : 'Producto';
      onSuccess(`Ingreso de ${parsedCantidad} unidades registrado con éxito para '${productName}'.`);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Error inesperado al registrar el ingreso.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Registrar Ingreso de Stock
              </h3>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">
                Reposición de mercadería y actualización de precio comercial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('registrar')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'registrar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Registrar Ingreso</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('entradas')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'entradas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial Reposiciones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('precios')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'precios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Historial Precios</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Selector de Producto si se abrió desde el encabezado general */}
          {!initialProduct && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seleccionar Producto *
              </label>
              <select
                value={selectedProductId ?? ''}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.codigo}] {p.nombre} (Stock actual: {p.stock})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ficha Resumen del Producto Seleccionado */}
          {selectedProduct && (
            <div className="p-3 mb-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {selectedProduct.codigo}
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedProduct.nombre}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Unidad: <span className="font-medium text-slate-600">{selectedProduct.unidad_medida}</span> | Categoría: <span className="font-medium text-slate-600">{selectedProduct.categoria}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium">Stock Actual</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedProduct.stock}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium">Precio Venta</span>
                  <span className="font-bold text-blue-600 text-sm">
                    S/ {Number(selectedProduct.precio).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 1: FORMULARIO DE REGISTRO */}
          {/* ========================================================================= */}
          {activeTab === 'registrar' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Cantidad recibida y Costo unitario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cantidad Recibida (Unidades) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 15"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Costo Unitario Proveedor (S/) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costoUnitario}
                    onChange={(e) => setCostoUnitario(e.target.value)}
                    placeholder="Ej: 3.20"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Inversión total calculada */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block font-semibold text-slate-700">
                    Inversión Total de la Reposición
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Cálculo: {parsedCantidad || 0} unid. × S/ {parsedCosto ? parsedCosto.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-blue-700">
                    S/ {inversionTotal}
                  </span>
                </div>
              </div>

              {/* Nuevo precio de venta comercial opcional */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Nuevo Precio de Venta Comercial (S/)
                  </label>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    Opcional
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoPrecioVenta}
                  onChange={(e) => setNuevoPrecioVenta(e.target.value)}
                  placeholder={
                    selectedProduct
                      ? `Vigente: S/ ${Number(selectedProduct.precio).toFixed(2)}`
                      : '0.00'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {hasPriceChange && (
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">
                    Todo el stock disponible se venderá posteriormente a S/ {parsedNuevoPrecio?.toFixed(2)} (se generará historial de precio).
                  </p>
                )}
              </div>

              {/* Observaciones / Documento Proveedor */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observaciones / N° Documento Proveedor
                </label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Factura F001-985 / Proveedor Distribuidora Norte"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProductId}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirmando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Ingreso</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 2: HISTORIAL DE REPOSICIONES */}
          {/* ========================================================================= */}
          {activeTab === 'entradas' && (
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs">Cargando reposiciones...</span>
                </div>
              ) : stockEntries.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FileText className="w-6 h-6 text-slate-300" />
                  <span className="text-xs font-medium text-slate-600">
                    No hay reposiciones registradas
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Los ingresos de mercadería para este producto aparecerán aquí.
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold sticky top-0">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3 text-center">Cantidad</th>
                        <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                        <th className="py-2.5 px-3 text-right">Inversión</th>
                        <th className="py-2.5 px-3">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {stockEntries.map((entry) => {
                        const totalCost = (
                          entry.cantidad * Number(entry.costo_unitario)
                        ).toFixed(2);
                        return (
                          <tr key={entry.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                              {formatDate(entry.fecha_ingreso)}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                +{entry.cantidad}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-medium text-slate-600">
                              S/ {Number(entry.costo_unitario).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-800">
                              S/ {totalCost}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[160px] truncate" title={entry.observaciones || ''}>
                              {entry.observaciones || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 3: HISTORIAL DE PRECIOS */}
          {/* ========================================================================= */}
          {activeTab === 'precios' && (
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs">Cargando historial de precios...</span>
                </div>
              ) : priceHistory.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <TrendingUp className="w-6 h-6 text-slate-300" />
                  <span className="text-xs font-medium text-slate-600">
                    Sin cambios de precio registrados
                  </span>
                  <span className="text-[11px] text-slate-400">
                    El producto ha conservado su precio comercial sin modificaciones.
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold sticky top-0">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3 text-right">Precio Anterior</th>
                        <th className="py-2.5 px-3 text-right">Precio Nuevo</th>
                        <th className="py-2.5 px-3">Motivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                      {priceHistory.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                            {formatDate(h.fecha_cambio)}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-400 line-through">
                            S/ {Number(h.precio_anterior).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-emerald-600">
                            S/ {Number(h.precio_nuevo).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {h.motivo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
