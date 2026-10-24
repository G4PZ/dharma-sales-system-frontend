'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import SaleClientSelector from '@/components/ventas/SaleClientSelector';
import SaleProductSelector from '@/components/ventas/SaleProductSelector';
import SaleItemsTable, { CartItem } from '@/components/ventas/SaleItemsTable';
import SaleSummaryCard from '@/components/ventas/SaleSummaryCard';
import ConfirmSaleModal from '@/components/ventas/ConfirmSaleModal';
import { Cliente } from '@/types/client';
import { Producto } from '@/types/product';
import { SaleCreate } from '@/types/sale';
import { createSale } from '@/services/saleService';
import { fetchProducts } from '@/services/productService';

export default function NuevaVentaPage() {
  const router = useRouter();

  // Estados de la venta temporal
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Estados de interfaz y confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Notificación Toast autolimpiable
  const showToast = useCallback((type: 'success' | 'error', text: string, duration = 4000) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  // Agregar producto a la lista temporal
  const handleAddProduct = (product: Producto, cantidad: number = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.producto.id === product.id);

      if (existingIndex > -1) {
        // El producto ya existe en la orden: actualizar cantidad sin duplicar línea
        const existingItem = prevItems[existingIndex];
        const newQuantity = existingItem.cantidad + cantidad;

        if (newQuantity > product.stock) {
          showToast(
            'error',
            `No se puede agregar más: el stock disponible de '${product.nombre}' es ${product.stock}.`
          );
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          producto: product, // actualizar datos frescos del producto
          cantidad: newQuantity,
        };
        showToast('success', `Se incrementó la cantidad de '${product.nombre}' a ${newQuantity}.`);
        return updated;
      } else {
        // Nuevo producto en la venta
        if (cantidad > product.stock) {
          showToast(
            'error',
            `Stock insuficiente: el stock disponible de '${product.nombre}' es ${product.stock}.`
          );
          return prevItems;
        }
        showToast('success', `'${product.nombre}' agregado a la venta.`);
        return [...prevItems, { producto: product, cantidad }];
      }
    });
  };

  // Modificar cantidad de un producto
  const handleUpdateQuantity = (productoId: number, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.producto.id === productoId) {
          const clampedQty = Math.max(1, Math.min(newQuantity, item.producto.stock));
          if (newQuantity > item.producto.stock) {
            showToast(
              'error',
              `La cantidad no puede superar el stock disponible (${item.producto.stock}).`
            );
          }
          return { ...item, cantidad: clampedQty };
        }
        return item;
      })
    );
  };

  // Eliminar producto de la lista
  const handleRemoveItem = (productoId: number) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find((i) => i.producto.id === productoId);
      if (removedItem) {
        showToast('success', `'${removedItem.producto.nombre}' removido de la venta.`);
      }
      return prevItems.filter((item) => item.producto.id !== productoId);
    });
  };

  // Cálculos visuales informativos en frontend
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.producto.precio) || 0;
      return acc + price * item.cantidad;
    }, 0);
  }, [cartItems]);

  const igv = useMemo(() => {
    return Math.round(subtotal * 0.18 * 100) / 100;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.round((subtotal + igv) * 100) / 100;
  }, [subtotal, igv]);

  // Refrescar inventario conocido tras un rechazo del servidor
  const refreshCartProductsStock = async () => {
    try {
      const updated = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const res = await fetchProducts({
              search: item.producto.codigo,
              estado: 'activo',
            });
            const fresh = res.items.find((p) => p.id === item.producto.id);
            if (fresh) {
              return {
                ...item,
                producto: fresh,
                cantidad: Math.min(item.cantidad, Math.max(1, fresh.stock)),
              };
            }
          } catch {
            // si falla un producto individual, se conserva el ítem actual
          }
          return item;
        })
      );
      setCartItems(updated);
    } catch {
      // Ignorar errores menores de refresco
    }
  };

  // Confirmar y registrar la venta
  const handleConfirmSale = async () => {
    if (!selectedClient) {
      showToast('error', 'Debe seleccionar una empresa cliente activa.');
      setIsConfirmModalOpen(false);
      return;
    }

    if (cartItems.length === 0) {
      showToast('error', 'Debe agregar al menos un producto a la venta.');
      setIsConfirmModalOpen(false);
      return;
    }

    // Prevenir dobles envíos si ya está procesando o fue exitoso
    if (isSubmitting || isSuccess) {
      return;
    }

    setIsSubmitting(true);

    // Estructurar exactamente el payload SaleCreate esperado por FastAPI
    const payload: SaleCreate = {
      cliente_id: selectedClient.id,
      productos: cartItems.map((item) => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
      })),
    };

    try {
      const result = await createSale(payload);

      // Bloquear envíos adicionales
      setIsSuccess(true);
      setIsConfirmModalOpen(false);

      // Mostrar notificación de éxito con el correlativo real generado por el backend
      showToast(
        'success',
        `¡Venta registrada con éxito! Correlativo: ${result.numero_venta}. Redirigiendo a Ventas...`,
        5000
      );

      // Limpiar estado temporal de la venta
      setSelectedClient(null);
      setCartItems([]);

      // Redirigir automáticamente a /ventas tras breve pausa para visualización del feedback
      setTimeout(() => {
        router.push('/ventas');
      }, 1800);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);

      const errorMessage =
        err instanceof Error ? err.message : 'Error inesperado al procesar la venta en el servidor.';

      showToast('error', errorMessage, 6000);

      // Si fue rechazo por stock u otra inconsistencia, refrescar existencias conservando carrito y cliente
      if (errorMessage.toLowerCase().includes('stock') || errorMessage.toLowerCase().includes('disponible')) {
        await refreshCartProductsStock();
      }
    }
  };

  // Fecha localizada
  const formattedToday = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const capitalizedDate =
    formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1);

  return (
    <div className="space-y-6">
      {/* Toast de Notificaciones */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 max-w-md ${
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

      {/* Cabecera de Página con Navegación de Regreso */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/ventas"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2563EB] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Ventas</span>
            </Link>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Nueva Venta
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-medium text-slate-700">{capitalizedDate}</span>{' '}
            | Emisión de orden comercial • Dharma E.I.R.L.
          </p>
        </div>
      </div>

      {/* Grid Principal: Área de Trabajo (8 cols) + Panel de Resumen (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Selección del Cliente */}
          <SaleClientSelector
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            disabled={isSubmitting || isSuccess}
          />

          {/* 2. Búsqueda y Selección de Productos */}
          <SaleProductSelector
            onAddProduct={handleAddProduct}
            existingProductIds={cartItems.map((item) => item.producto.id)}
            disabled={isSubmitting || isSuccess}
          />

          {/* 3. Tabla de Productos Seleccionados */}
          <SaleItemsTable
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            disabled={isSubmitting || isSuccess}
          />
        </div>

        {/* Columna Lateral: Resumen Financiero y Envío */}
        <div className="lg:col-span-4">
          <SaleSummaryCard
            selectedClient={selectedClient}
            items={cartItems}
            subtotal={subtotal}
            igv={igv}
            total={total}
            onOpenConfirmation={() => setIsConfirmModalOpen(true)}
            disabled={isSubmitting || isSuccess}
          />
        </div>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmSaleModal
        isOpen={isConfirmModalOpen}
        client={selectedClient}
        totalItems={cartItems.length}
        totalAmount={total}
        isSubmitting={isSubmitting}
        onCancel={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSale}
      />
    </div>
  );
}
