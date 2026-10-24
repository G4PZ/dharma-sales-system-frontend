'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Plus, Loader2, AlertCircle, Check } from 'lucide-react';
import { Producto } from '@/types/product';
import { fetchProducts } from '@/services/productService';

interface SaleProductSelectorProps {
  onAddProduct: (product: Producto, cantidad?: number) => void;
  existingProductIds: number[];
  disabled?: boolean;
}

export default function SaleProductSelector({
  onAddProduct,
  existingProductIds,
  disabled = false,
}: SaleProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [products, setProducts] = useState<Producto[]>([]);
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

  // Cargar productos activos
  useEffect(() => {
    let ignore = false;

    async function searchActiveProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchProducts({
          search: debouncedTerm.trim() || undefined,
          estado: 'activo',
          limit: 15,
        });

        if (!ignore) {
          setProducts(response.items);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Error al buscar productos';
          setError(msg);
          setLoading(false);
        }
      }
    }

    if (isOpen || debouncedTerm.trim()) {
      searchActiveProducts();
    }

    return () => {
      ignore = true;
    };
  }, [debouncedTerm, isOpen]);

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

  const handleSelectProduct = (product: Producto) => {
    if (product.stock <= 0) return;
    onAddProduct(product, 1);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Buscar y Agregar Productos
            </h3>
            <p className="text-xs text-slate-500">
              Busca por código o nombre del catálogo activo con stock disponible
            </p>
          </div>
        </div>
      </div>

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
            placeholder="Buscar por código (ej. PAP-001) o nombre del producto..."
            className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {loading && (
            <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2563EB] animate-spin" />
          )}
        </div>

        {/* Dropdown de productos */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl z-30 divide-y divide-slate-100 animate-in fade-in-50 duration-150">
            {error && (
              <div className="p-3 text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading && products.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Buscando en el inventario...</span>
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="p-5 text-center text-xs text-slate-500">
                No se encontraron productos activos con ese criterio.
              </div>
            )}

            {products.map((product) => {
              const isAlreadyAdded = existingProductIds.includes(product.id);
              const isOutOfStock = product.stock <= 0;
              const formattedPrice = Number(product.precio || 0).toFixed(2);

              return (
                <div
                  key={product.id}
                  className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    isOutOfStock
                      ? 'bg-slate-50/60 opacity-60'
                      : 'hover:bg-blue-50/60 cursor-pointer'
                  }`}
                  onClick={() => !isOutOfStock && handleSelectProduct(product)}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">
                        {product.codigo}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {product.categoria}
                      </span>
                      {isAlreadyAdded && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Check className="w-3 h-3" />
                          En lista
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {product.nombre}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>
                        Stock disp.:{' '}
                        <strong
                          className={
                            isOutOfStock
                              ? 'text-rose-600 font-bold'
                              : product.stock <= product.stock_minimo
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-700 font-bold'
                          }
                        >
                          {product.stock} {product.unidad_medida}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Precio ref.
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        S/ {formattedPrice}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProduct(product);
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAlreadyAdded ? 'Añadir +' : 'Agregar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
