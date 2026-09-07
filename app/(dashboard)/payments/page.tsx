"use client";

// app/(dashboard)/payments/page.tsx

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Loader2,
  Search,
  Wallet,
} from "lucide-react";

import {
  STORAGE_KEYS,
  getCollection,
} from "@/lib/storage";

/* =====================================================
   TYPES
===================================================== */

interface Invoice {
  id: string;
  invoiceNumber?: string;

  customerName?: string;

  invoiceDate?: string;
  dueDate?: string;

  grandTotal?: number;
  paidAmount?: number;

  status?:
    | "paid"
    | "unpaid"
    | "partial"
    | "overdue";
}

/* =====================================================
   HELPERS
===================================================== */

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPaymentStatus(invoice: Invoice) {
  const total = safeNumber(
    invoice.grandTotal
  );

  const paid = safeNumber(
    invoice.paidAmount
  );

  if (total > 0 && paid >= total) {
    return "paid";
  }

  if (paid > 0) {
    return "partial";
  }

  if (invoice.dueDate) {
    const dueDate = new Date(
      invoice.dueDate
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return "overdue";
    }
  }

  return "unpaid";
}

function getInvoiceNumber(invoice: Invoice) {
  return (
    invoice.invoiceNumber ||
    `INV-${invoice.id.slice(0, 8).toUpperCase()}`
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function PaymentsPage() {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "all" | "paid" | "partial" | "unpaid" | "overdue"
    >("all");

  /* =============================================
     LOAD INVOICES
  ============================================= */

  useEffect(() => {
    try {
      const data =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      setInvoices(data);
    } catch (error) {
      console.error(
        "Failed to load payments:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =============================================
     SUMMARY
  ============================================= */

  const summary = useMemo(() => {
    let totalSales = 0;
    let totalReceived = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    invoices.forEach((invoice) => {
      const total = safeNumber(
        invoice.grandTotal
      );

      const paid = safeNumber(
        invoice.paidAmount
      );

      const pending = Math.max(
        total - paid,
        0
      );

      totalSales += total;
      totalReceived += paid;
      totalPending += pending;

      if (
        getPaymentStatus(invoice) ===
        "overdue"
      ) {
        totalOverdue += pending;
      }
    });

    return {
      totalSales,
      totalReceived,
      totalPending,
      totalOverdue,
    };
  }, [invoices]);

  /* =============================================
     FILTERED DATA
  ============================================= */

  const filteredInvoices = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status =
        getPaymentStatus(invoice);

      const matchesSearch =
        !query ||
        getInvoiceNumber(invoice)
          .toLowerCase()
          .includes(query) ||
        (invoice.customerName || "")
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [invoices, search, filter]);

  /* =============================================
     LOADING
  ============================================= */

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

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl pb-12">

      {/* HEADER */}

      <div className="mb-7">

        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Payments
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track received, pending and overdue
          invoice payments.
        </p>

      </div>

      {/* =============================================
         SUMMARY CARDS
      ============================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<IndianRupee size={20} />}
          label="Total Invoice Value"
          value={formatCurrency(
            summary.totalSales
          )}
          description="All invoices"
          variant="blue"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Amount Received"
          value={formatCurrency(
            summary.totalReceived
          )}
          description="Payments collected"
          variant="green"
        />

        <StatCard
          icon={<Wallet size={20} />}
          label="Pending Amount"
          value={formatCurrency(
            summary.totalPending
          )}
          description="Yet to receive"
          variant="orange"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          label="Overdue Amount"
          value={formatCurrency(
            summary.totalOverdue
          )}
          description="Past due date"
          variant="red"
        />

      </div>

      {/* =============================================
         PAYMENT PROGRESS
      ============================================= */}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="font-bold text-slate-800">
              Collection Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overall payment collection status.
            </p>
          </div>

          <p className="text-sm font-bold text-blue-600">
            {summary.totalSales > 0
              ? `${(
                  (summary.totalReceived /
                    summary.totalSales) *
                  100
                ).toFixed(1)}% Collected`
              : "0% Collected"}
          </p>

        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${
                summary.totalSales > 0
                  ? Math.min(
                      (summary.totalReceived /
                        summary.totalSales) *
                        100,
                      100
                    )
                  : 0
              }%`,
            }}
          />

        </div>

        <div className="mt-4 flex justify-between text-xs text-slate-500">

          <span>
            Received{" "}
            <strong className="text-slate-700">
              {formatCurrency(
                summary.totalReceived
              )}
            </strong>
          </span>

          <span>
            Pending{" "}
            <strong className="text-slate-700">
              {formatCurrency(
                summary.totalPending
              )}
            </strong>
          </span>

        </div>
      </section>

      {/* =============================================
         SEARCH + FILTER
      ============================================= */}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-200 p-5 sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="font-bold text-slate-800">
                Payment Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredInvoices.length} invoice
                {filteredInvoices.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search invoice or customer..."
                  className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-64"
                />

              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as typeof filter
                  )
                }
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 outline-none"
              >
                <option value="all">
                  All Status
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="partial">
                  Partial
                </option>

                <option value="unpaid">
                  Unpaid
                </option>

                <option value="overdue">
                  Overdue
                </option>
              </select>

            </div>
          </div>
        </div>

        {/* TABLE */}

        {filteredInvoices.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CreditCard size={25} />
            </div>

            <h3 className="mt-4 font-bold text-slate-700">
              No payment records found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create invoices to start tracking
              payments.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead className="bg-slate-50">

                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Invoice
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Due Date
                  </th>

                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total
                  </th>

                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Received
                  </th>

                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pending
                  </th>

                  <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4" />

                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map(
                  (invoice) => {
                    const total =
                      safeNumber(
                        invoice.grandTotal
                      );

                    const paid =
                      safeNumber(
                        invoice.paidAmount
                      );

                    const pending =
                      Math.max(
                        total - paid,
                        0
                      );

                    const status =
                      getPaymentStatus(
                        invoice
                      );

                    return (
                      <tr
                        key={invoice.id}
                        className="border-t border-slate-100 hover:bg-slate-50/70"
                      >

                        <td className="px-6 py-5">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {getInvoiceNumber(
                              invoice
                            )}
                          </Link>
                        </td>

                        <td className="px-4 py-5">

                          <p className="font-medium text-slate-700">
                            {invoice.customerName ||
                              "Customer"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Invoice:{" "}
                            {formatDate(
                              invoice.invoiceDate
                            )}
                          </p>

                        </td>

                        <td className="px-4 py-5 text-sm text-slate-600">
                          {formatDate(
                            invoice.dueDate
                          )}
                        </td>

                        <td className="px-4 py-5 text-right font-semibold text-slate-700">
                          {formatCurrency(total)}
                        </td>

                        <td className="px-4 py-5 text-right font-semibold text-emerald-600">
                          {formatCurrency(paid)}
                        </td>

                        <td className="px-4 py-5 text-right font-semibold text-orange-600">
                          {formatCurrency(
                            pending
                          )}
                        </td>

                        <td className="px-4 py-5 text-center">
                          <StatusBadge
                            status={status}
                          />
                        </td>

                        <td className="px-6 py-5 text-right">

                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            View
                            <ArrowUpRight
                              size={14}
                            />
                          </Link>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>
          </div>
        )}

      </section>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  variant:
    | "blue"
    | "green"
    | "orange"
    | "red";
}) {
  const styles = {
    blue: {
      box: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
    },
    green: {
      box: "bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
    },
    orange: {
      box: "bg-orange-50",
      icon: "bg-orange-100 text-orange-600",
    },
    red: {
      box: "bg-red-50",
      icon: "bg-red-100 text-red-600",
    },
  };

  return (
    <div
      className={`rounded-2xl p-5 ${styles[variant].box}`}
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[variant].icon}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    paid:
      "bg-emerald-50 text-emerald-700",
    partial:
      "bg-blue-50 text-blue-700",
    unpaid:
      "bg-orange-50 text-orange-700",
    overdue:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status] ||
        styles.unpaid
      }`}
    >
      {status}
    </span>
  );
                          }
