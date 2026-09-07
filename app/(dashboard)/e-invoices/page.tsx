"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  Search,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Loader2,
  Hash,
} from "lucide-react";

const STORAGE_KEY = "smart_gst_e_invoices";

type EInvoiceStatus = "Generated" | "Pending" | "Cancelled";

interface EInvoice {
  id: string;
  invoiceNumber: string;
  irn?: string;
  customerName: string;
  customerGstin?: string;
  date: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: EInvoiceStatus;
  createdAt?: string;
}

export default function EInvoicesPage() {
  const [invoices, setInvoices] = useState<EInvoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setInvoices(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load E-Invoices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return invoices;

    return invoices.filter((invoice) =>
      [
        invoice.invoiceNumber,
        invoice.irn,
        invoice.customerName,
        invoice.customerGstin,
        invoice.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [invoices, search]);

  const stats = useMemo(() => {
    return {
      total: invoices.length,

      generated: invoices.filter(
        (invoice) => invoice.status === "Generated"
      ).length,

      pending: invoices.filter(
        (invoice) => invoice.status === "Pending"
      ).length,

      totalValue: invoices.reduce(
        (sum, invoice) =>
          sum + (Number(invoice.totalAmount) || 0),
        0
      ),
    };
  }, [invoices]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-blue-600"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl pb-12">
      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FileCheck2 size={23} />
            </span>
            E-Invoices
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Create and manage GST compliant electronic invoice records.
          </p>
        </div>

        <Link
          href="/e-invoices/new"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create E-Invoice
        </Link>
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total E-Invoices"
          value={String(stats.total)}
          icon={<FileCheck2 size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          label="Generated"
          value={String(stats.generated)}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          label="Pending"
          value={String(stats.pending)}
          icon={<Clock3 size={20} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          label="Total Invoice Value"
          value={formatCurrency(stats.totalValue)}
          icon={<IndianRupee size={20} />}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* LIST */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              All E-Invoices
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage your electronic invoice records.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search E-Invoices..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileCheck2 size={28} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-700">
              {invoices.length === 0
                ? "No E-Invoices yet"
                : "No matching E-Invoices"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              {invoices.length === 0
                ? "Create your first E-Invoice and keep your GST invoice records organized."
                : "Try changing your search term."}
            </p>

            {invoices.length === 0 && (
              <Link
                href="/e-invoices/new"
                className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Create E-Invoice
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Invoice
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      IRN
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID: {invoice.id}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {invoice.customerName}
                        </p>

                        {invoice.customerGstin && (
                          <p className="mt-1 text-xs text-slate-400">
                            {invoice.customerGstin}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(invoice.date)}
                      </td>

                      <td className="max-w-[200px] px-6 py-4">
                        {invoice.irn ? (
                          <span className="block truncate font-mono text-xs text-slate-500">
                            {invoice.irn}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not Generated
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-800">
                          {formatCurrency(invoice.totalAmount)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          GST: {formatCurrency(invoice.gstAmount)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-700">
                        {invoice.invoiceNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {invoice.customerName}
                      </p>
                    </div>

                    <StatusBadge status={invoice.status} />
                  </div>

                  {invoice.irn && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <Hash
                        size={14}
                        className="text-slate-400"
                      />

                      <span className="truncate font-mono text-xs text-slate-500">
                        {invoice.irn}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(invoice.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatCurrency(invoice.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredInvoices.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:px-6">
            Showing {filteredInvoices.length} of {invoices.length} E-Invoices
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: EInvoiceStatus;
}) {
  const styles: Record<EInvoiceStatus, string> = {
    Generated: "bg-emerald-50 text-emerald-600",
    Pending: "bg-amber-50 text-amber-600",
    Cancelled: "bg-rose-50 text-rose-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
      }
