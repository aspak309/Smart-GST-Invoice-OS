"use client";

// app/(dashboard)/invoices/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FilePlus2,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import type { Invoice } from "@/types";

import {
  STORAGE_KEYS,
  getCollection,
  removeItem,
} from "@/lib/storage";

import { formatCurrency } from "@/lib/format-utils";

/* =====================================================
   TYPES
===================================================== */

type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

type FilterStatus =
  | "all"
  | InvoiceStatus;

/* =====================================================
   HELPERS
===================================================== */

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatDate(
  value?: string
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getInvoiceCustomerName(
  invoice: Invoice
): string {
  const item = invoice as Invoice & {
    customerName?: string;
    customer?: {
      name?: string;
    };
  };

  if (item.customerName) {
    return item.customerName;
  }

  if (item.customer?.name) {
    return item.customer.name;
  }

  return "Walk-in Customer";
}

function getInvoiceNumber(
  invoice: Invoice
): string {
  const item = invoice as Invoice & {
    invoiceNumber?: string;
    number?: string;
  };

  return (
    item.invoiceNumber ||
    item.number ||
    invoice.id.slice(0, 8).toUpperCase()
  );
}

function getInvoiceTotal(
  invoice: Invoice
): number {
  const item = invoice as Invoice & {
    grandTotal?: number;
    total?: number;
    totalAmount?: number;
  };

  return safeNumber(
    item.grandTotal ??
      item.total ??
      item.totalAmount ??
      0
  );
}

function normalizeStatus(
  value: unknown
): InvoiceStatus {
  const status =
    String(value || "").toLowerCase();

  if (
    status === "draft" ||
    status === "sent" ||
    status === "paid" ||
    status === "overdue" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "draft";
}

/* =====================================================
   PAGE
===================================================== */

export default function InvoicesPage() {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("all");

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  /* =============================================
     LOAD INVOICES
  ============================================= */

  function loadInvoices() {
    try {
      const data =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      setInvoices(
        [...data].sort((a, b) => {
          const dateA = new Date(
            a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        })
      );
    } catch (error) {
      console.error(
        "Failed to load invoices:",
        error
      );

      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  /* =============================================
     STATS
  ============================================= */

  const stats = useMemo(() => {
    const totalInvoices =
      invoices.length;

    const paidInvoices =
      invoices.filter(
        (invoice) =>
          normalizeStatus(
            invoice.status
          ) === "paid"
      );

    const pendingInvoices =
      invoices.filter((invoice) => {
        const status =
          normalizeStatus(
            invoice.status
          );

        return (
          status === "sent" ||
          status === "overdue"
        );
      });

    const overdueInvoices =
      invoices.filter(
        (invoice) =>
          normalizeStatus(
            invoice.status
          ) === "overdue"
      );

    return {
      totalInvoices,

      paidAmount:
        paidInvoices.reduce(
          (sum, invoice) =>
            sum +
            getInvoiceTotal(invoice),
          0
        ),

      pendingAmount:
        pendingInvoices.reduce(
          (sum, invoice) =>
            sum +
            getInvoiceTotal(invoice),
          0
        ),

      overdueAmount:
        overdueInvoices.reduce(
          (sum, invoice) =>
            sum +
            getInvoiceTotal(invoice),
          0
        ),
    };
  }, [invoices]);

  /* =============================================
     FILTERED INVOICES
  ============================================= */

  const filteredInvoices =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return invoices.filter(
        (invoice) => {
          const status =
            normalizeStatus(
              invoice.status
            );

          const invoiceNumber =
            getInvoiceNumber(
              invoice
            ).toLowerCase();

          const customerName =
            getInvoiceCustomerName(
              invoice
            ).toLowerCase();

          const matchesSearch =
            !query ||
            invoiceNumber.includes(query) ||
            customerName.includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      invoices,
      search,
      statusFilter,
    ]);

  /* =============================================
     DELETE
  ============================================= */

  function handleDelete(
    invoice: Invoice
  ) {
    const invoiceNumber =
      getInvoiceNumber(invoice);

    const confirmed = window.confirm(
      `Delete invoice ${invoiceNumber}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      removeItem(
        STORAGE_KEYS.INVOICES,
        invoice.id
      );

      setInvoices((previous) =>
        previous.filter(
          (item) =>
            item.id !== invoice.id
        )
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Failed to delete invoice:",
        error
      );

      alert(
        "Unable to delete invoice."
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            SALES & BILLING
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Invoices
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create, manage and track all your
            customer invoices.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="
            inline-flex h-11 items-center
            justify-center gap-2 rounded-xl
            bg-blue-600 px-5 text-sm
            font-semibold text-white
            shadow-sm transition-all
            hover:bg-blue-700 hover:shadow-md
          "
        >
          <Plus size={18} />
          Create Invoice
        </Link>
      </div>

      {/* =========================================
          STATS
      ========================================= */}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FileText size={20} />}
          label="Total Invoices"
          value={stats.totalInvoices.toString()}
          description="All invoices created"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Amount Received"
          value={formatCurrency(
            stats.paidAmount
          )}
          description="Paid invoices"
          tone="success"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          label="Pending Amount"
          value={formatCurrency(
            stats.pendingAmount
          )}
          description="Awaiting payment"
          tone="warning"
        />

        <StatCard
          icon={<XCircle size={20} />}
          label="Overdue Amount"
          value={formatCurrency(
            stats.overdueAmount
          )}
          description="Requires follow-up"
          tone="danger"
        />
      </div>

      {/* =========================================
          MAIN TABLE CARD
      ========================================= */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2 text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search invoice or customer..."
              className="
                h-11 w-full rounded-xl
                border border-slate-200
                bg-white pl-10 pr-4 text-sm
                outline-none transition-all
                placeholder:text-slate-400
                focus:border-blue-500
                focus:ring-4 focus:ring-blue-50
              "
            />
          </div>

          {/* FILTERS */}

          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <FilterButton
              active={
                statusFilter === "all"
              }
              label="All"
              onClick={() =>
                setStatusFilter("all")
              }
            />

            <FilterButton
              active={
                statusFilter === "draft"
              }
              label="Draft"
              onClick={() =>
                setStatusFilter("draft")
              }
            />

            <FilterButton
              active={
                statusFilter === "sent"
              }
              label="Sent"
              onClick={() =>
                setStatusFilter("sent")
              }
            />

            <FilterButton
              active={
                statusFilter === "paid"
              }
              label="Paid"
              onClick={() =>
                setStatusFilter("paid")
              }
            />

            <FilterButton
              active={
                statusFilter === "overdue"
              }
              label="Overdue"
              onClick={() =>
                setStatusFilter("overdue")
              }
            />
          </div>
        </div>

        {/* TABLE HEADER */}

        <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_1fr_0.9fr_44px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
          <span>Invoice</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
          <span />
        </div>

        {/* LOADING */}

        {loading ? (
          <InvoiceSkeleton />
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            hasSearch={
              Boolean(search) ||
              statusFilter !== "all"
            }
            onReset={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          />
        ) : (
          <div>
            {filteredInvoices.map(
              (invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  openMenu={
                    openMenuId === invoice.id
                  }
                  onMenuToggle={() =>
                    setOpenMenuId(
                      openMenuId === invoice.id
                        ? null
                        : invoice.id
                    )
                  }
                  onDelete={() =>
                    handleDelete(invoice)
                  }
                />
              )
            )}
          </div>
        )}

        {/* FOOTER */}

        {!loading &&
          filteredInvoices.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500">
                Showing{" "}
                <strong className="text-slate-700">
                  {
                    filteredInvoices.length
                  }
                </strong>{" "}
                of{" "}
                <strong className="text-slate-700">
                  {invoices.length}
                </strong>{" "}
                invoices
              </p>

              <p className="font-semibold text-slate-700">
                Total:{" "}
                {formatCurrency(
                  filteredInvoices.reduce(
                    (sum, invoice) =>
                      sum +
                      getInvoiceTotal(
                        invoice
                      ),
                    0
                  )
                )}
              </p>
            </div>
          )}
      </section>
    </div>
  );
}

/* =====================================================
   INVOICE ROW
===================================================== */

function InvoiceRow({
  invoice,
  openMenu,
  onMenuToggle,
  onDelete,
}: {
  invoice: Invoice;
  openMenu: boolean;
  onMenuToggle: () => void;
  onDelete: () => void;
}) {
  const invoiceNumber =
    getInvoiceNumber(invoice);

  const customerName =
    getInvoiceCustomerName(invoice);

  const total =
    getInvoiceTotal(invoice);

  const status =
    normalizeStatus(invoice.status);

  const issueDate =
    (invoice as Invoice & {
      invoiceDate?: string;
      date?: string;
    }).invoiceDate ||
    (invoice as Invoice & {
      date?: string;
    }).date ||
    invoice.createdAt;

  return (
    <div
      className="
        group relative border-b border-slate-100
        last:border-b-0 transition-colors
        hover:bg-slate-50/70
      "
    >
      {/* DESKTOP */}

      <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_1fr_0.9fr_44px] items-center gap-4 px-5 py-4 lg:grid">

        {/* INVOICE */}

        <Link
          href={`/invoices/${invoice.id}`}
          className="min-w-0"
        >
          <p className="truncate text-sm font-bold text-slate-800 group-hover:text-blue-600">
            {invoiceNumber}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            GST Invoice
          </p>
        </Link>

        {/* CUSTOMER */}

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            {customerName}
          </p>
        </div>

        {/* DATE */}

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={15} />
          {formatDate(issueDate)}
        </div>

        {/* AMOUNT */}

        <p className="text-sm font-bold text-slate-800">
          {formatCurrency(total)}
        </p>

        {/* STATUS */}

        <div>
          <StatusBadge status={status} />
        </div>

        {/* ACTION */}

        <ActionMenu
          invoiceId={invoice.id}
          open={openMenu}
          onToggle={onMenuToggle}
          onDelete={onDelete}
        />
      </div>

      {/* MOBILE */}

      <div className="p-4 lg:hidden">
        <div className="flex items-start justify-between gap-3">

          <Link
            href={`/invoices/${invoice.id}`}
            className="min-w-0 flex-1"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {invoiceNumber}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {customerName}
                </p>
              </div>
            </div>
          </Link>

          <ActionMenu
            invoiceId={invoice.id}
            open={openMenu}
            onToggle={onMenuToggle}
            onDelete={onDelete}
          />
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">
              {formatDate(issueDate)}
            </p>

            <p className="mt-1 text-base font-bold text-slate-800">
              {formatCurrency(total)}
            </p>
          </div>

          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ACTION MENU
===================================================== */

function ActionMenu({
  invoiceId,
  open,
  onToggle,
  onDelete,
}: {
  invoiceId: string;
  open: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Invoice actions"
        className="
          flex h-9 w-9 items-center
          justify-center rounded-lg
          text-slate-400 transition-colors
          hover:bg-slate-100 hover:text-slate-700
        "
      >
        <MoreHorizontal size={19} />
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-11 z-30
            w-44 overflow-hidden rounded-xl
            border border-slate-200 bg-white
            py-1 shadow-xl
          "
        >
          <Link
            href={`/invoices/${invoiceId}`}
            className="
              flex items-center gap-2 px-4 py-2.5
              text-sm text-slate-600 hover:bg-slate-50
            "
          >
            <ArrowUpRight size={15} />
            View Invoice
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="
              flex w-full items-center gap-2
              px-4 py-2.5 text-left text-sm
              text-red-600 hover:bg-red-50
            "
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  const config = {
    draft: {
      label: "Draft",
      className:
        "bg-slate-100 text-slate-600",
    },

    sent: {
      label: "Sent",
      className:
        "bg-blue-50 text-blue-600",
    },

    paid: {
      label: "Paid",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    overdue: {
      label: "Overdue",
      className:
        "bg-red-50 text-red-600",
    },

    cancelled: {
      label: "Cancelled",
      className:
        "bg-slate-100 text-slate-500",
    },
  }[status];

  return (
    <span
      className={`
        inline-flex items-center rounded-full
        px-2.5 py-1 text-[11px]
        font-bold ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}

/* =====================================================
   FILTER BUTTON
===================================================== */

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        h-9 shrink-0 rounded-lg px-3
        text-xs font-semibold transition-all
        ${
          active
            ? "bg-blue-600 text-white"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      {label}
    </button>
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
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default:
      "bg-blue-50 text-blue-600",

    success:
      "bg-emerald-50 text-emerald-600",

    warning:
      "bg-amber-50 text-amber-600",

    danger:
      "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`
            flex h-10 w-10 items-center
            justify-center rounded-xl
            ${styles[tone]}
          `}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  hasSearch,
  onReset,
}: {
  hasSearch: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FilePlus2 size={29} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-800">
        {hasSearch
          ? "No matching invoices"
          : "No invoices yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {hasSearch
          ? "Try changing your search or filter."
          : "Create your first GST invoice and start tracking your business sales."}
      </p>

      {hasSearch ? (
        <button
          type="button"
          onClick={onReset}
          className="
            mt-5 rounded-xl border border-slate-200
            px-4 py-2.5 text-sm font-semibold
            text-slate-600 hover:bg-slate-50
          "
        >
          Reset Filters
        </button>
      ) : (
        <Link
          href="/invoices/new"
          className="
            mt-5 inline-flex items-center gap-2
            rounded-xl bg-blue-600 px-5 py-2.5
            text-sm font-semibold text-white
          "
        >
          <Plus size={17} />
          Create First Invoice
        </Link>
      )}
    </div>
  );
}

/* =====================================================
   SKELETON
===================================================== */

function InvoiceSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="
            flex items-center justify-between
            border-b border-slate-100 px-5 py-5
          "
        >
          <div className="h-10 w-40 rounded bg-slate-100" />
          <div className="hidden h-5 w-32 rounded bg-slate-100 lg:block" />
          <div className="hidden h-5 w-24 rounded bg-slate-100 lg:block" />
          <div className="h-5 w-24 rounded bg-slate-100" />
          <div className="h-7 w-16 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
         }
