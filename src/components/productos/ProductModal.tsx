'use client';

import React, { useState } from 'react';
import { X, Loader2, PackagePlus, CheckCircle2 } from 'lucide-react';
import { Producto, ProductoCreate, ProductoUpdate } from '@/types/product';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoCreate | ProductoUpdate) => Promise<void>;
  productToEdit?: Producto | null;
  existingCategories?: string[];
}

function ProductModalForm({
  onClose,
  onSubmit,
  productToEdit,
  existingCategories = [],
}: {
  onClose: () => void;
  onSubmit: (data: ProductoCreate | ProductoUpdate) => Promise<void>;
  productToEdit?: Producto | null;
  existingCategories?: string[];
}) {
  const isEditing = Boolean(productToEdit);

  const [codigo, setCodigo] = useState(productToEdit?.codigo || '');
  const [nombre, setNombre] = useState(productToEdit?.nombre || '');
  const [descripcion, setDescripcion] = useState(productToEdit?.descripcion || '');
  const [categoria, setCategoria] = useState(
    productToEdit?.categoria || existingCategories[0] || 'Limpieza y Desinfección'
  );
  const [precio, setPrecio] = useState(
    productToEdit?.precio !== undefined ? String(productToEdit.precio) : ''
  );
  const [stockMinimo, setStockMinimo] = useState(
    productToEdit?.stock_minimo !== undefined ? String(productToEdit.stock_minimo) : '10'
  );
  const [unidadMedida, setUnidadMedida] = useState(productToEdit?.unidad_medida || 'und');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEditing) {
      if (!codigo.trim()) {
        setError('El código de producto es obligatorio.');
        return;
      }
      if (!nombre.trim()) {
        setError('El nombre del producto es obligatorio.');
        return;
      }
    }

    if (!categoria.trim()) {
      setError('La categoría es obligatoria.');
      return;
    }
    const numPrecio = parseFloat(precio);
    if (isNaN(numPrecio) || numPrecio < 0) {
      setError('Ingresa un precio válido mayor o igual a 0.');
      return;
    }
    const numStockMin = parseInt(stockMinimo, 10);
    if (isNaN(numStockMin) || numStockMin < 0) {
      setError('Ingresa un stock mínimo válido mayor o igual a 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        // En modo edición solo se actualizan campos comerciales permitidos (sin stock)
        await onSubmit({
          descripcion: descripcion.trim() || null,
          categoria: categoria.trim(),
          precio: numPrecio,
          stock_minimo: numStockMin,
          unidad_medida: unidadMedida.trim() || 'und',
        });
      } else {
        // En modo creación se crea el producto con stock inicial 0 en backend (sin enviar stock)
        await onSubmit({
          codigo: codigo.trim(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          categoria: categoria.trim(),
          precio: numPrecio,
          stock_minimo: numStockMin,
          unidad_medida: unidadMedida.trim() || 'und',
          is_active: true,
        });
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al guardar el producto.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">
              {isEditing
                ? 'Modifica los datos del artículo seleccionado'
                : 'Registra un nuevo artículo en el catálogo de inventario'}
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

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Código y Categoría */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Código SKU / Producto {isEditing ? '' : '*'}
              </label>
              {isEditing && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  Solo lectura
                </span>
              )}
            </div>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: P001-0011"
              readOnly={isEditing}
              disabled={isEditing}
              className={`w-full px-3 py-2 rounded-xl text-slate-800 transition-colors ${
                isEditing
                  ? 'bg-slate-100/80 border border-slate-200 text-slate-500 cursor-not-allowed select-none'
                  : 'bg-slate-50 border border-slate-200/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              required={!isEditing}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Categoría *
            </label>
            <input
              type="text"
              list="categories-list"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej: Papel y Celulosa"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
            <datalist id="categories-list">
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-semibold text-slate-700">
              Nombre del producto {isEditing ? '' : '*'}
            </label>
            {isEditing && (
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Solo lectura
              </span>
            )}
          </div>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Jabón Líquido Antibacterial"
            readOnly={isEditing}
            disabled={isEditing}
            className={`w-full px-3 py-2 rounded-xl text-slate-800 transition-colors ${
              isEditing
                ? 'bg-slate-100/80 border border-slate-200 text-slate-500 cursor-not-allowed select-none'
                : 'bg-slate-50 border border-slate-200/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
            required={!isEditing}
          />
        </div>

        {/* Descripción / Presentación */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Presentación / Descripción
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Galón x 3.8 L, Doble hoja x 40 m"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Precio y Unidad de Medida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Precio de Venta (S/) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Unidad de Medida
            </label>
            <select
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="und">und (Unidad)</option>
              <option value="galón">galón (Galón)</option>
              <option value="rollo">rollo (Rollo)</option>
              <option value="caja">caja (Caja)</option>
              <option value="paquete">paquete (Paquete)</option>
            </select>
          </div>
        </div>

        {/* Stock actual (Solo lectura) y Stock Mínimo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                {isEditing ? 'Stock Actual' : 'Stock Inicial'}
              </label>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Solo lectura
              </span>
            </div>
            <div className="w-full px-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-600 font-medium select-none flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                {isEditing ? (productToEdit?.stock ?? 0) : 0}
              </span>
              <span className="text-[10px] text-slate-400">
                {isEditing ? 'Modificable vía Ingresos' : 'Se registra con reposición'}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Stock Mínimo (Alerta) *
            </label>
            <input
              type="number"
              min="0"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>
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
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Actualizar Producto' : 'Guardar Producto'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  existingCategories = [],
}: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <ProductModalForm
          key={productToEdit?.id ?? 'new-product-modal'}
          onClose={onClose}
          onSubmit={onSubmit}
          productToEdit={productToEdit}
          existingCategories={existingCategories}
        />
      </div>
    </div>
  );
}
