'use client';

import React, { useState } from 'react';
import { X, Loader2, Building2, MapPin, Lock } from 'lucide-react';
import { Cliente, ClienteCreate, ClienteUpdate } from '@/types/client';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClienteCreate | ClienteUpdate) => Promise<void>;
  clientToEdit?: Cliente | null;
}

function ClientModalForm({
  onClose,
  onSubmit,
  clientToEdit,
}: {
  onClose: () => void;
  onSubmit: (data: ClienteCreate | ClienteUpdate) => Promise<void>;
  clientToEdit?: Cliente | null;
}) {
  const isEditing = Boolean(clientToEdit);

  const [numeroDocumento, setNumeroDocumento] = useState(
    clientToEdit?.numero_documento || ''
  );
  const [razonSocial, setRazonSocial] = useState(
    clientToEdit?.razon_social || ''
  );
  const [nombreContacto, setNombreContacto] = useState(
    clientToEdit?.nombre_contacto || ''
  );
  const [telefono, setTelefono] = useState(clientToEdit?.telefono || '');
  const [email, setEmail] = useState(clientToEdit?.email || '');
  const [direccion, setDireccion] = useState(clientToEdit?.direccion || '');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar entrada de RUC solo numérica hasta 11 dígitos cuando no esté en modo edición
  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) return;
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 11);
    setNumeroDocumento(rawVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);

      if (isEditing) {
        // En edición solo se envían los datos de contacto y dirección (RUC y Razón Social son inmutables)
        await onSubmit({
          nombre_contacto: nombreContacto.trim() || null,
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          direccion: direccion.trim() || null,
        } as ClienteUpdate);
      } else {
        // En nuevo registro se validan estrictamente RUC y Razón Social
        const rucTrim = numeroDocumento.trim();
        if (!rucTrim) {
          setError('El número de RUC es obligatorio.');
          setIsSubmitting(false);
          return;
        }

        if (!/^\d{11}$/.test(rucTrim)) {
          setError('El RUC debe tener exactamente 11 dígitos numéricos.');
          setIsSubmitting(false);
          return;
        }

        if (!razonSocial.trim()) {
          setError('La razón social de la empresa es obligatoria.');
          setIsSubmitting(false);
          return;
        }

        await onSubmit({
          numero_documento: rucTrim,
          razon_social: razonSocial.trim(),
          nombre_contacto: nombreContacto.trim() || null,
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          direccion: direccion.trim() || null,
        } as ClienteCreate);
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al guardar la empresa.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Encabezado del Modal */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
            </h3>
            <p className="text-xs text-slate-500 leading-tight mt-0.5">
              {isEditing
                ? 'Actualiza la información de contacto y fiscal de la empresa'
                : 'Registra una nueva empresa cliente en Trujillo'}
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium animate-in fade-in-50">
            {error}
          </div>
        )}

        {/* Fila 1: RUC y Persona de Contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                RUC {!isEditing && '*'}
              </label>
              {isEditing && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Solo lectura
                </span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={numeroDocumento}
              onChange={handleRucChange}
              placeholder="20XXXXXXXXX (11 dígitos)"
              maxLength={11}
              readOnly={isEditing}
              disabled={isEditing}
              className={`w-full px-3 py-2 rounded-xl font-mono focus:outline-none transition-colors ${
                isEditing
                  ? 'bg-slate-100 border border-slate-200/80 text-slate-500 cursor-not-allowed select-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              required={!isEditing}
            />
            {!isEditing && (
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {numeroDocumento.length}/11 dígitos ingresados
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Persona de Contacto
            </label>
            <input
              type="text"
              value={nombreContacto}
              onChange={(e) => setNombreContacto(e.target.value)}
              placeholder="Ej: Ing. Carlos Morales"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fila 2: Razón Social */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-semibold text-slate-700">
              Razón Social {!isEditing && '*'}
            </label>
            {isEditing && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Lock className="w-3 h-3 text-slate-400" />
                Solo lectura
              </span>
            )}
          </div>
          <input
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            placeholder="Ej: DISTRIBUIDORA INDUSTRIAL DEL NORTE S.A.C."
            readOnly={isEditing}
            disabled={isEditing}
            className={`w-full px-3 py-2 rounded-xl focus:outline-none transition-colors ${
              isEditing
                ? 'bg-slate-100 border border-slate-200/80 text-slate-500 font-medium cursor-not-allowed select-none'
                : 'bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
            required={!isEditing}
          />
        </div>

        {/* Fila 3: Teléfono y Correo Electrónico */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Teléfono / Celular
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 987 654 321"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@empresa.pe"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fila 4: Dirección Fiscal y Ciudad fija Trujillo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Dirección Fiscal / Entrega
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. Mansiche 1420, Urb. Santa Inés"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ciudad (Sede fija)
            </label>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 font-medium cursor-not-allowed select-none">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Trujillo</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditing ? 'Guardar Cambios' : 'Registrar Empresa'}</span>
          </button>
        </div>
      </form>
    </>
  );
}

export default function ClientModal({
  isOpen,
  onClose,
  onSubmit,
  clientToEdit,
}: ClientModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <ClientModalForm
          key={clientToEdit?.id ?? 'new'}
          onClose={onClose}
          onSubmit={onSubmit}
          clientToEdit={clientToEdit}
        />
      </div>
    </div>
  );
}
