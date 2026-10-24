'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Leaf, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GoogleCredentialResponse } from '@/types/auth';

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      shape?: string;
      theme?: string;
      text?: string;
      size?: string;
      logo_alignment?: string;
      width?: number;
    }
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogleToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response || !response.credential) {
        setErrorMessage('No se recibió una credencial válida de Google.');
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        await loginWithGoogleToken(response.credential);
        router.push('/');
        router.refresh();
      } catch (err: unknown) {
        setIsSubmitting(false);
        const message =
          err instanceof Error
            ? err.message
            : 'Error al autenticar. Por favor verifica tus permisos o intenta nuevamente.';
        setErrorMessage(message);
      }
    },
    [loginWithGoogleToken, router]
  );

  const renderGoogleButton = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.google?.accounts?.id &&
      googleBtnContainerRef.current &&
      clientId
    ) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Limpiar el contenedor antes de renderizar para evitar duplicados
        googleBtnContainerRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'continue_with',
          size: 'large',
          logo_alignment: 'left',
          width: 320,
        });
      } catch (e) {
        console.error('Error inicializando Google Identity Services:', e);
      }
    }
  }, [clientId, handleCredentialResponse]);

  useEffect(() => {
    if (scriptLoaded) {
      renderGoogleButton();
    }
  }, [scriptLoaded, renderGoogleButton]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-radial-[at_top_right] from-slate-900 via-[#0B192C] to-[#060e18] text-slate-100 relative overflow-hidden select-none">
        {/* Glow ambient background effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Login Card */}
        <div className="w-full max-w-md min-w-0 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40 relative z-10 flex flex-col items-center text-center overflow-hidden">
          
          {/* Logo Badge */}
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/20 text-blue-400 mb-6 shadow-inner ring-4 ring-blue-500/5">
            <Leaf className="w-8 h-8 fill-current" />
          </div>

          {/* Titles */}
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dharma Sales System
          </h1>
          <p className="text-xs text-blue-400 font-medium tracking-wide mt-1 uppercase">
            Dharma E.I.R.L.
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            Plataforma corporativa de gestión comercial, clientes e inventario.
          </p>

          <div className="w-full my-6 border-t border-white/10" />

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="w-full max-w-full min-w-0 mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3 text-left animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 leading-snug font-medium break-words">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Google Sign-In Action Area */}
          <div className="w-full max-w-[320px] min-w-0 flex flex-col items-center justify-center min-h-[44px] relative mx-auto">
            {/* Estado de carga ocupando exactamente las mismas dimensiones y posición del botón */}
            {isSubmitting && (
              <div className="w-full max-w-full min-w-0 h-[44px] flex items-center justify-center gap-2.5 px-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-slate-200 text-sm font-medium shadow-sm animate-in fade-in duration-150 overflow-hidden">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                <span className="truncate min-w-0 font-medium">Verificando credenciales...</span>
              </div>
            )}

            {/* Contenedor del botón de Google */}
            <div
              ref={googleBtnContainerRef}
              className={`w-full max-w-full min-w-0 flex items-center justify-center min-h-[44px] overflow-hidden ${
                isSubmitting ? 'hidden' : 'flex'
              }`}
            />

            {!scriptLoaded && !clientId && !isSubmitting && (
              <p className="text-xs text-slate-500 mt-2">
                Cargando servicio de autenticación...
              </p>
            )}
          </div>

          {/* Security & Whitelist Notice */}
          <div className="mt-8 pt-6 border-t border-white/10 w-full max-w-full min-w-0 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400/80 shrink-0" />
            <span>Acceso restringido a personal autorizado</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-4 text-center text-[11px] text-slate-500">
          Dharma E.I.R.L. &bull; Calidad que llega más lejos &bull; © {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
}
