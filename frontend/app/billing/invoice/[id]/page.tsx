'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface InvoiceData {
  profile: {
    plan: string;
    creditsUsed: number;
    creditsTotal: number;
    renewsOn?: string;
  };
  invoice: {
    id: string;
    date: string;
    amount: string;
    plan: string;
    status: string;
    paymentMethod: string;
  };
}

export default function InvoiceReceiptPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/billing/invoice/${params.id}`);
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        const msg = err.response?.data?.detail || 'Failed to fetch invoice details.';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [params.id]);

  // Handle opening print dialog
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider text-zinc-400">Generating invoice sheet...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4 font-sans px-4 text-center">
        <span className="text-red-500 text-5xl">⚠️</span>
        <h1 className="text-xl font-bold">Invoice Not Found</h1>
        <p className="text-sm text-zinc-400 max-w-xs">{error || 'The requested invoice was not found in the transaction log database.'}</p>
        <button 
          onClick={() => window.close()}
          className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-full transition-all cursor-pointer"
        >
          Close Window
        </button>
      </div>
    );
  }

  const { invoice } = data;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans py-10 px-4 md:px-0 print:bg-white print:py-0 print:text-black">
      {/* Action buttons banner (Hidden when printing) */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center no-print">
        <button 
          onClick={() => window.close()}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer"
        >
          ← Back to Workspace
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-full shadow-md shadow-purple-500/10 cursor-pointer"
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet */}
      <div className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-3xl p-8 md:p-12 shadow-sm print:border-0 print:shadow-none print:p-0 print:rounded-none">
        {/* Brand Header */}
        <div className="flex justify-between items-start border-b border-zinc-100 pb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-purple-600 font-sans">Curate AI</h1>
            <p className="text-xs text-zinc-400 mt-1">Creator Workspace Platform</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
              {invoice.status}
            </span>
            <p className="text-[10px] text-zinc-400 mt-2.5 font-mono uppercase tracking-wider">Receipt No: {invoice.id}</p>
          </div>
        </div>

        {/* Invoice Metadata Row */}
        <div className="grid grid-cols-2 gap-8 py-8 text-xs border-b border-zinc-100">
          <div>
            <h4 className="font-bold text-zinc-400 uppercase tracking-wider mb-2">Billed To</h4>
            <p className="font-bold text-zinc-800">Anisha Sahu</p>
            <p className="text-zinc-500 mt-0.5">anisha.980sahu@gmail.com</p>
            <p className="text-zinc-400 mt-1">Creator Account #10024</p>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-zinc-400 uppercase tracking-wider mb-2">Invoice Details</h4>
            <p className="text-zinc-500">Date issued: <strong className="text-zinc-800">{invoice.date}</strong></p>
            <p className="text-zinc-500 mt-1">Method: <strong className="text-zinc-800">{invoice.paymentMethod}</strong></p>
            <p className="text-zinc-500 mt-1">Due State: <strong className="text-green-600">Paid / Closed</strong></p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-8">
          <h4 className="font-bold text-zinc-400 uppercase tracking-wider mb-4 text-xs">Service Summary</h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider pb-2">
                <th className="pb-3 text-left">Description</th>
                <th className="pb-3 text-center w-16">Qty</th>
                <th className="pb-3 text-right w-24">Rate</th>
                <th className="pb-3 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100 text-zinc-800">
                <td className="py-4">
                  <p className="font-bold">{invoice.plan}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Automated credit allocation for creator workspaces.</p>
                </td>
                <td className="py-4 text-center font-mono">1</td>
                <td className="py-4 text-right font-mono font-semibold">{invoice.amount}</td>
                <td className="py-4 text-right font-mono font-semibold">{invoice.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pricing totals */}
        <div className="flex justify-between items-start border-t border-zinc-100 pt-8 text-xs">
          <p className="text-zinc-400 max-w-xs leading-relaxed">
            Payment has been successfully charged through secure card protocols. No outstanding balance is due.
          </p>
          <div className="w-64 space-y-2 text-right">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono">{invoice.amount}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Tax (0.00%)</span>
              <span className="font-mono">$0.00</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-bold text-zinc-800">
              <span>Amount Paid</span>
              <span className="font-mono text-purple-600">{invoice.amount}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 mt-12 pt-8 text-center text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
          ✨ Thank you for creating with Curate AI!
        </div>
      </div>
      
      {/* Styles for print styling overrides */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
