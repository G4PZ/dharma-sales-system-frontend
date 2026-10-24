'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { VentaRecienteItem } from '@/types/dashboard';
import { SaleListItemResponse } from '@/types/sale';
import { fetchSales } from '@/services/saleService';

type SaleItem = VentaRecienteItem | SaleListItemResponse;

interface RecentSalesTableProps {
  sales?: SaleItem[];
  isLoading?: boolean;
}

export default function RecentSalesTable({
  sales: initialSales,
  isLoading: initialLoading,
}: RecentSalesTableProps) {
  const [sales, setSales] = React.useState<SaleItem[]>(initialSales || []);
  const [loading, setLoading] = React.useState<boolean>(
    initialLoading !== undefined ? initialLoading : !initialSales
  );

  React.useEffect(() => {
    if (initialSales !== undefined) {
      setSales(initialSales);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchSales({ limit: 5 })
      .then((res) => {
        if (isMounted) {
          setSales(res.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSales([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialSales]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = Number(val || 0);
    return `S/ ${num.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getClientName = (item: SaleItem) => {
    if ('cliente_razon_social' in item && item.cliente_razon_social) {
      return item.cliente_razon_social;
    }
    if ('cliente' in item && item.cliente && item.cliente.razon_social) {
      return item.cliente.razon_social;
    }
    return 'Cliente';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Ventas recientes</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operaciones comerciales registradas en el período
          </p>
        </div>

        <Link
          href="/ventas"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
        >
          Ver todas
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 my-auto py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 bg-slate-50 rounded-lg animate-pulse w-full border border-slate-100/60"
            />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="my-auto py-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Sin ventas en el rango
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            No se registran operaciones comerciales dentro del período seleccionado.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-3 pr-4">N° Venta</th>
                <th className="pb-3 px-4">Fecha</th>
                <th className="pb-3 px-4">Cliente</th>
                <th className="pb-3 px-4 text-right">Total</th>
                <th className="pb-3 pl-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-normal text-slate-700">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pr-4 font-semibold text-blue-600 whitespace-nowrap">
                    {sale.numero_venta}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(sale.fecha)}
                  </td>
                  <td
                    className="py-3.5 px-4 font-medium text-slate-900 truncate max-w-[160px]"
                    title={getClientName(sale)}
                  >
                    {getClientName(sale)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap text-right">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                    {sale.estado === 'COMPLETADA' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completada
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {sale.estado}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
