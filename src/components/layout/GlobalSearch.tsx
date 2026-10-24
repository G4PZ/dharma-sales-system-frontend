'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, Package, Building2, User, CornerDownLeft } from 'lucide-react';
import { Producto } from '@/types/product';
import { Cliente } from '@/types/client';
import { fetchProducts } from '@/services/productService';
import { fetchClients } from '@/services/clientService';

type SearchResultItem =
  | { type: 'product'; item: Producto }
  | { type: 'client'; item: Cliente };

interface GlobalSearchProps {
  className?: string;
  onCloseMobile?: () => void;
}

export default function GlobalSearch({ className = '', onCloseMobile }: GlobalSearchProps) {
  const router = useRouter();

  // Estados de entrada y visualización
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Producto[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Referencias para control de clics fuera y cancelación de peticiones
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestQueryRef = useRef<string>('');

  // Lista aplanada de resultados para navegación por teclado
  const flatResults: SearchResultItem[] = [
    ...products.map((p) => ({ type: 'product' as const, item: p })),
    ...clients.map((c) => ({ type: 'client' as const, item: c })),
  ];

  // Cerrar dropdown al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Búsqueda con debounce de 300 ms y protección contra condiciones de carrera
  useEffect(() => {
    const trimmed = query.trim();
    latestQueryRef.current = trimmed;

    // Si tiene menos de 2 caracteres, cancelar peticiones y resetear
    if (trimmed.length < 2) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setProducts([]);
      setClients([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setSelectedIndex(-1);

    const timer = setTimeout(async () => {
      // Cancelar petición anterior si aún está en curso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const [productsRes, clientsRes] = await Promise.all([
          fetchProducts({ search: trimmed, limit: 5, signal: controller.signal }),
          fetchClients({ search: trimmed, limit: 5, signal: controller.signal }),
        ]);

        // Asegurarse de que esta respuesta coincida con la consulta más reciente
        if (latestQueryRef.current === trimmed && !controller.signal.aborted) {
          setProducts(productsRes.items.slice(0, 5));
          setClients(clientsRes.items.slice(0, 5));
          setIsLoading(false);
        }
      } catch (err: unknown) {
        // Ignorar errores de cancelación intencional
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (latestQueryRef.current === trimmed) {
          setProducts([]);
          setClients([]);
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Manejar selección de un elemento
  const handleSelectItem = useCallback((result: SearchResultItem) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();

    if (result.type === 'product') {
      router.push(`/productos?search=${encodeURIComponent(result.item.codigo)}`);
    } else {
      router.push(`/clientes?search=${encodeURIComponent(result.item.numero_documento)}`);
    }
  }, [router, onCloseMobile]);

  // Manejar teclado: flechas, Enter y Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || flatResults.length === 0) {
      if (e.key === 'Enter' && query.trim().length >= 2) {
        // Si presiona enter sin dropdown abierto, navegar a productos con el término
        setIsOpen(false);
        if (onCloseMobile) onCloseMobile();
        router.push(`/productos?search=${encodeURIComponent(query.trim())}`);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatResults.length) {
        handleSelectItem(flatResults[selectedIndex]);
      } else if (flatResults.length > 0) {
        // Seleccionar el primer resultado por defecto
        handleSelectItem(flatResults[0]);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setProducts([]);
    setClients([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const hasResults = products.length > 0 || clients.length > 0;
  const noResults = !isLoading && query.trim().length >= 2 && !hasResults;

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* Campo de búsqueda */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos, clientes..."
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
          className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100/80 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
        />

        {/* Indicador de carga o botón de limpiar */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown de resultados flotante */}
      {isOpen && query.trim().length >= 2 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Estado de carga inicial */}
          {isLoading && !hasResults && (
            <div className="px-5 py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-xs font-medium text-slate-600">Buscando productos y clientes...</p>
            </div>
          )}

          {/* Estado sin resultados */}
          {noResults && (
            <div className="px-5 py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                No se encontraron resultados para &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400">
                Prueba con otro código SKU, nombre de producto o RUC
              </p>
            </div>
          )}

          {/* Lista de resultados agrupados */}
          {hasResults && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {/* Grupo: Productos */}
              {products.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1.5 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      Productos
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
                    </span>
                  </div>

                  <ul className="py-1">
                    {products.map((prod, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <li key={`prod-${prod.id}`}>
                          <button
                            type="button"
                            onClick={() => handleSelectItem({ type: 'product', item: prod })}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/80 text-blue-950 border-l-2 border-blue-600 pl-3'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <Package className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-800 truncate">
                                  {prod.nombre}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                  <span className="font-mono font-medium px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-200/60">
                                    {prod.codigo}
                                  </span>
                                  <span className="truncate text-slate-400">•</span>
                                  <span className="truncate text-slate-600">{prod.categoria}</span>
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <CornerDownLeft className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Grupo: Clientes */}
              {clients.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1.5 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Clientes
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {clients.length} {clients.length === 1 ? 'resultado' : 'resultados'}
                    </span>
                  </div>

                  <ul className="py-1">
                    {clients.map((client, idx) => {
                      const absoluteIdx = products.length + idx;
                      const isSelected = selectedIndex === absoluteIdx;
                      return (
                        <li key={`client-${client.id}`}>
                          <button
                            type="button"
                            onClick={() => handleSelectItem({ type: 'client', item: client })}
                            onMouseEnter={() => setSelectedIndex(absoluteIdx)}
                            className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/80 text-blue-950 border-l-2 border-blue-600 pl-3'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-800 truncate">
                                  {client.razon_social}
                                </div>
                                <div className="flex items-center flex-wrap gap-2 mt-0.5 text-[11px] text-slate-500">
                                  <span className="font-mono font-medium px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-200/60">
                                    RUC: {client.numero_documento}
                                  </span>
                                  {client.nombre_contacto && (
                                    <>
                                      <span className="text-slate-400">•</span>
                                      <span className="flex items-center gap-1 text-slate-600 truncate">
                                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                                        {client.nombre_contacto}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <CornerDownLeft className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Barra inferior con atajos de teclado */}
          {hasResults && (
            <div className="px-3.5 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <span>
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px] text-slate-600">↑</kbd>{' '}
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px] text-slate-600">↓</kbd> navegar
                </span>
                <span>•</span>
                <span>
                  <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px] text-slate-600">Enter</kbd> seleccionar
                </span>
              </div>
              <span>
                <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[9px] text-slate-600">ESC</kbd> cerrar
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
