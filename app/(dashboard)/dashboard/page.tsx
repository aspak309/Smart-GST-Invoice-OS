"use client";

// app/(dashboard)/dashboard/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  FilePlus2,
  IndianRupee,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Users,
  Wallet,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import type {
  Invoice,
  Purchase,
} from "@/types";

import {
  STORAGE_KEYS,
  getCollection,
} from "@/lib/storage";

import {
  formatCompactCurrency,
  formatCurrency,
  formatReadableDate,
  formatStatus,
} from "@/lib/format-utils";

import {
  calculateSalesGSTSummary,
  calculatePurchaseGSTSummary,
  calculateReportNetGST,
} from "@/lib/report-utils";

/* =====================================================
   TYPES
===================================================== */

interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  receivables: number;
  payables: number;
  invoiceCount: number;
  purchaseCount: number;
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

function calculateDashboardStats(
  invoices: Invoice[],
  purchases: Purchase[]
): DashboardStats {
  const validInvoices = invoices.filter(
    (invoice) =>
      invoice.status !== "draft" &&
      invoice.status !== "cancelled"
  );

  const validPurchases = purchases.filter(
    (purchase) =>
      purchase.status !== "draft" &&
      purchase.status !== "cancelled"
  );

  return {
    totalSales: validInvoices.reduce(
      (total, invoice) =>
        total +
        safeNumber(invoice.totals?.grandTotal),
      0
    ),

    totalPurchases: validPurchases.reduce(
      (total, purchase) =>
        total +
        safeNumber(purchase.totals?.grandTotal),
      0
    ),

    receivables: validInvoices.reduce(
      (total, invoice) =>
        total +
        safeNumber(invoice.pendingAmount),
      0
    ),

    payables: validPurchases.reduce(
      (total, purchase) =>
        total +
        safeNumber(purchase.pendingAmount),
      0
    ),

    invoiceCount: validInvoices.length,
    purchaseCount: validPurchases.length,
  };
}

/* =====================================================
   DASHBOARD PAGE
===================================================== */

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<
    Invoice[]
  >([]);

  const [purchases, setPurchases] = useState<
    Purchase[]
  >([]);

  const [loading, setLoading] = useState(true);

  /* =============================================
     LOAD DATA
  ============================================= */

  useEffect(() => {
    function loadDashboardData() {
      try {
        const storedInvoices =
          getCollection<Invoice>(
            STORAGE_KEYS.INVOICES
          );

        const storedPurchases =
          getCollection<Purchase>(
            STORAGE_KEYS.PURCHASES
          );

        setInvoices(storedInvoices);
        setPurchases(storedPurchases);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  /* =============================================
     CALCULATIONS
  ============================================= */

  const stats = useMemo(
    () =>
      calculateDashboardStats(
        invoices,
        purchases
      ),
    [invoices, purchases]
  );

  const salesGST = useMemo(
    () =>
      calculateSalesGSTSummary(invoices),
    [invoices]
  );

  const purchaseGST = useMemo(
    () =>
      calculatePurchaseGSTSummary(purchases),
    [purchases]
  );

  const netGST = useMemo(
    () =>
      calculateReportNetGST(
        invoices,
        purchases
      ),
    [invoices, purchases]
  );

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [invoices]);

  const pendingInvoices = useMemo(() => {
    return invoices
      .filter(
        (invoice) =>
          safeNumber(invoice.pendingAmount) > 0
      )
      .sort(
        (a, b) =>
          safeNumber(b.pendingAmount) -
          safeNumber(a.pendingAmount)
      )
      .slice(0, 5);
  }, [invoices]);

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-7">
      {/* =============================================
          PAGE HEADER
      ============================================= */}

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            BUSINESS OVERVIEW
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good morning 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your
            business today.
          </p>
        </div>

        <Link
          href="/sales/invoices/new"
          className="
            inline-flex h-11 items-center
            justify-center gap-2 rounded-xl
            bg-blue-600 px-4
            text-sm font-semibold text-white
            shadow-sm transition-all
            hover:bg-blue-700
            active:scale-[0.98]
          "
        >
          <Plus size={18} />
          Create Invoice
        </Link>
      </section>

      {/* =============================================
          PRIMARY STATS
      ============================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={formatCompactCurrency(
            stats.totalSales
          )}
          subtitle={`${stats.invoiceCount} invoices`}
          icon={<TrendingUp size={21} />}
          trend="up"
        />

        <StatCard
          title="Total Purchases"
          value={formatCompactCurrency(
            stats.totalPurchases
          )}
          subtitle={`${stats.purchaseCount} purchases`}
          icon={<ShoppingCart size={21} />}
          trend="down"
        />

        <StatCard
          title="Receivables"
          value={formatCompactCurrency(
            stats.receivables
          )}
          subtitle="Amount to collect"
          icon={<Wallet size={21} />}
          alert={
            stats.receivables > 0
          }
        />

        <StatCard
          title="GST Payable"
          value={formatCompactCurrency(
            Math.max(0, netGST.netPayable)
          )}
          subtitle={
            netGST.netPayable < 0
              ? "ITC credit available"
              : "Estimated net GST"
          }
          icon={<IndianRupee size={21} />}
        />
      </section>

      {/* =============================================
          QUICK ACTIONS
      ============================================= */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Frequently used business actions
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            title="Create Invoice"
            description="Generate GST invoice"
            href="/sales/invoices/new"
            icon={<FilePlus2 size={21} />}
          />

          <QuickAction
            title="Add Customer"
            description="Create customer profile"
            href="/customers/new"
            icon={<Users size={21} />}
          />

          <QuickAction
            title="Add Product"
            description="Manage products"
            href="/products/new"
            icon={<Package size={21} />}
          />

          <QuickAction
            title="Add Purchase"
            description="Record purchase bill"
            href="/purchases/new"
            icon={<Receipt size={21} />}
          />
        </div>
      </section>

      {/* =============================================
          MAIN CONTENT GRID
      ============================================= */}

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        {/* =========================================
            RECENT INVOICES
        ========================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Invoices
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest sales transactions
              </p>
            </div>

            <Link
              href="/sales/invoices"
              className="
                inline-flex items-center gap-1
                text-sm font-medium text-blue-600
                hover:text-blue-700
              "
            >
              View All
              <ChevronRight size={16} />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <EmptyInvoices />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentInvoices.map(
                (invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* =========================================
            PENDING PAYMENTS
        ========================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock3
                size={19}
                className="text-amber-500"
              />

              <h2 className="font-bold text-slate-900">
                Pending Payments
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Follow up on outstanding invoices
            </p>
          </div>

          {pendingInvoices.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Wallet size={22} />
              </div>

              <p className="font-semibold text-slate-700">
                All caught up!
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No pending customer payments.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingInvoices.map(
                (invoice) => (
                  <PendingInvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                  />
                )
              )}

              <div className="p-4">
                <Link
                  href="/payments/receivables"
                  className="
                    flex w-full items-center
                    justify-center rounded-lg
                    bg-slate-50 px-4 py-2.5
                    text-sm font-semibold
                    text-slate-700
                    transition-colors
                    hover:bg-slate-100
                  "
                >
                  View All Receivables
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =============================================
          GST SUMMARY
      ============================================= */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            GST Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quick tax summary based on recorded
            transactions
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <GSTCard
            title="Output GST"
            value={salesGST.totalTax}
            description="Collected from sales"
            icon={<ArrowUpRight size={19} />}
          />

          <GSTCard
            title="Input Tax Credit"
            value={purchaseGST.totalTax}
            description="Available from purchases"
            icon={<ArrowDownRight size={19} />}
          />

          <GSTCard
            title="Net GST"
            value={Math.abs(netGST.netPayable)}
            description={
              netGST.netPayable >= 0
                ? "Estimated payable"
                : "ITC balance"
            }
            icon={<CalculatorIcon />}
          />

          <GSTCard
            title="Taxable Sales"
            value={salesGST.taxableValue}
            description="Before GST"
            icon={<Receipt size={19} />}
          />
        </div>
      </section>

      {/* =============================================
          BUSINESS HEALTH
      ============================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle
                size={20}
                className="text-blue-600"
              />

              <h2 className="text-lg font-bold text-slate-900">
                Business Snapshot
              </h2>
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Track your sales, purchases and pending
              payments from one place. Keep invoices
              updated to get a more accurate GST overview.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotItem
              label="Invoices"
              value={stats.invoiceCount}
            />

            <SnapshotItem
              label="Purchases"
              value={stats.purchaseCount}
            />

            <SnapshotItem
              label="Receivable"
              value={formatCompactCurrency(
                stats.receivables
              )}
            />

            <SnapshotItem
              label="Payable"
              value={formatCompactCurrency(
                stats.payables
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  alert = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  alert?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`
            flex h-11 w-11 items-center
            justify-center rounded-xl
            ${
              alert
                ? "bg-amber-50 text-amber-600"
                : "bg-blue-50 text-blue-600"
            }
          `}
        >
          {icon}
        </div>

        {trend && (
          <span
            className={`
              flex items-center gap-1
              text-xs font-medium
              ${
                trend === "up"
                  ? "text-emerald-600"
                  : "text-slate-400"
              }
            `}
          >
            {trend === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
          </span>
        )}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/* =====================================================
   QUICK ACTION
===================================================== */

function QuickAction({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group flex items-center gap-4
        rounded-xl border border-slate-200
        bg-white p-4
        transition-all
        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-md
      "
    >
      <div
        className="
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl bg-slate-50
          text-slate-600
          transition-colors
          group-hover:bg-blue-50
          group-hover:text-blue-600
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}

/* =====================================================
   INVOICE ROW
===================================================== */

function InvoiceRow({
  invoice,
}: {
  invoice: Invoice;
}) {
  const customerName =
    invoice.customerSnapshot?.name ||
    "Walk-in Customer";

  return (
    <Link
      href={`/sales/invoices/${invoice.id}`}
      className="
        flex items-center justify-between
        gap-4 px-5 py-4
        transition-colors hover:bg-slate-50
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Receipt size={18} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {invoice.invoiceNumber}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {customerName}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-slate-800">
          {formatCurrency(
            invoice.totals?.grandTotal
          )}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {formatReadableDate(
            invoice.invoiceDate
          )}
        </p>
      </div>
    </Link>
  );
}

/* =====================================================
   PENDING INVOICE ROW
===================================================== */

function PendingInvoiceRow({
  invoice,
}: {
  invoice: Invoice;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {invoice.customerSnapshot?.name ||
              "Customer"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {invoice.invoiceNumber}
          </p>
        </div>

        <span className="shrink-0 text-sm font-bold text-amber-600">
          {formatCurrency(
            invoice.pendingAmount
          )}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className="
            rounded-md bg-amber-50
            px-2 py-1 text-[10px]
            font-semibold uppercase
            tracking-wide text-amber-700
          "
        >
          {formatStatus(invoice.status)}
        </span>

        <Link
          href={`/sales/invoices/${invoice.id}`}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View
        </Link>
      </div>
    </div>
  );
}

/* =====================================================
   GST CARD
===================================================== */

function GSTCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-blue-600">
        {icon}

        <span className="text-sm font-semibold">
          {title}
        </span>
      </div>

      <p className="mt-4 text-xl font-bold text-slate-900">
        {formatCurrency(value)}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   SNAPSHOT ITEM
===================================================== */

function SnapshotItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-[110px] rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   EMPTY INVOICES
===================================================== */

function EmptyInvoices() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Receipt size={25} />
      </div>

      <h3 className="font-semibold text-slate-800">
        No invoices yet
      </h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
        Create your first GST invoice and start
        tracking your sales.
      </p>

      <Link
        href="/sales/invoices/new"
        className="
          mt-5 inline-flex items-center gap-2
          rounded-lg bg-blue-600 px-4 py-2.5
          text-sm font-semibold text-white
          hover:bg-blue-700
        "
      >
        <Plus size={17} />
        Create Invoice
      </Link>
    </div>
  );
}

/* =====================================================
   LOADING SKELETON
===================================================== */

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-7">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-9 w-64 rounded bg-slate-200" />
        <div className="h-4 w-80 rounded bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-[180px] rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[400px] rounded-2xl bg-slate-200" />
        <div className="h-[400px] rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

/* =====================================================
   SMALL CUSTOM ICON
===================================================== */

function CalculatorIcon() {
  return (
    <div className="flex h-[19px] w-[19px] items-center justify-center rounded border-2 border-current text-[10px] font-bold">
      ₹
    </div>
  );
      }
