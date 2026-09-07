"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  IndianRupee,
  Loader2,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  STORAGE_KEYS,
  getCollection,
} from "@/lib/storage";

/* =====================================================
   TYPES
===================================================== */

interface InvoiceItem {
  name?: string;
  gstRate?: number;
  quantity?: number;
  rate?: number;
  taxableAmount?: number;
  gstAmount?: number;
  total?: number;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  invoiceDate?: string;
  grandTotal?: number;
  taxableAmount?: number;
  totalTax?: number;
  paidAmount?: number;
  status?: string;
  items?: InvoiceItem[];
}

interface PurchaseItem {
  name?: string;
  gstRate?: number;
  quantity?: number;
  rate?: number;
  taxableAmount?: number;
  gstAmount?: number;
  total?: number;
}

interface Purchase {
  id: string;
  purchaseNumber?: string;
  supplierId?: string;
  supplierName?: string;
  purchaseDate?: string;
  grandTotal?: number;
  taxableAmount?: number;
  totalTax?: number;
  paidAmount?: number;
  status?: string;
  items?: PurchaseItem[];
}

/* =====================================================
   HELPERS
===================================================== */

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
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

function getMonthKey(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] =
    monthKey.split("-").map(Number);

  if (!year || !month) return monthKey;

  return new Date(
    year,
    month - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "short",
  });
}

function getItemTax(item: InvoiceItem | PurchaseItem) {
  if (typeof item.gstAmount === "number") {
    return item.gstAmount;
  }

  const taxable =
    typeof item.taxableAmount === "number"
      ? item.taxableAmount
      : safeNumber(item.quantity) *
        safeNumber(item.rate);

  return taxable * (safeNumber(item.gstRate) / 100);
}

/* =====================================================
   PAGE
===================================================== */

export default function ReportsPage() {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [period, setPeriod] =
    useState<
      "this-month" |
      "last-month" |
      "this-year" |
      "all"
    >("this-month");

  /* =============================================
     LOAD
  ============================================= */

  useEffect(() => {
    try {
      const invoiceData =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      const purchaseKey =
        (STORAGE_KEYS as any).PURCHASES ||
        "smart_gst_purchases";

      const purchaseData =
        getCollection<Purchase>(
          purchaseKey
        );

      setInvoices(invoiceData);
      setPurchases(purchaseData);
    } catch (error) {
      console.error(
        "Failed to load reports:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =============================================
     DATE FILTER
  ============================================= */

  const periodRange = useMemo(() => {
    const now = new Date();

    if (period === "all") {
      return {
        start: null,
        end: null,
      };
    }

    if (period === "this-year") {
      return {
        start: new Date(
          now.getFullYear(),
          0,
          1
        ),
        end: now,
      };
    }

    if (period === "last-month") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );

      return { start, end };
    }

    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    return {
      start,
      end: now,
    };
  }, [period]);

  function isInRange(value?: string) {
    if (!periodRange.start || !periodRange.end) {
      return true;
    }

    if (!value) return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return (
      date >= periodRange.start &&
      date <= periodRange.end
    );
  }

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        isInRange(invoice.invoiceDate)
      ),
    [invoices, periodRange]
  );

  const filteredPurchases = useMemo(
    () =>
      purchases.filter((purchase) =>
        isInRange(purchase.purchaseDate)
      ),
    [purchases, periodRange]
  );

  /* =============================================
     MAIN SUMMARY
  ============================================= */

  const summary = useMemo(() => {
    let sales = 0;
    let purchasesTotal = 0;
    let received = 0;
    let pending = 0;
    let salesTax = 0;
    let purchaseTax = 0;

    filteredInvoices.forEach((invoice) => {
      const total = safeNumber(
        invoice.grandTotal
      );

      const paid = safeNumber(
        invoice.paidAmount
      );

      sales += total;
      received += paid;
      pending += Math.max(
        total - paid,
        0
      );

      if (
        typeof invoice.totalTax ===
        "number"
      ) {
        salesTax += invoice.totalTax;
      } else {
        salesTax +=
          invoice.items?.reduce(
            (sum, item) =>
              sum + getItemTax(item),
            0
          ) || 0;
      }
    });

    filteredPurchases.forEach(
      (purchase) => {
        const total = safeNumber(
          purchase.grandTotal
        );

        purchasesTotal += total;

        if (
          typeof purchase.totalTax ===
          "number"
        ) {
          purchaseTax +=
            purchase.totalTax;
        } else {
          purchaseTax +=
            purchase.items?.reduce(
              (sum, item) =>
                sum + getItemTax(item),
              0
            ) || 0;
        }
      }
    );

    const grossProfit =
      sales - purchasesTotal;

    const netGST =
      salesTax - purchaseTax;

    return {
      sales,
      purchasesTotal,
      received,
      pending,
      salesTax,
      purchaseTax,
      grossProfit,
      netGST,
    };
  }, [filteredInvoices, filteredPurchases]);

  /* =============================================
     MONTHLY DATA
  ============================================= */

  const monthlyData = useMemo(() => {
    const buckets = new Map<
      string,
      {
        sales: number;
        purchases: number;
      }
    >();

    [...invoices].forEach((invoice) => {
      if (!invoice.invoiceDate) return;

      const key = getMonthKey(
        invoice.invoiceDate
      );

      if (!key) return;

      const existing =
        buckets.get(key) || {
          sales: 0,
          purchases: 0,
        };

      existing.sales += safeNumber(
        invoice.grandTotal
      );

      buckets.set(key, existing);
    });

    [...purchases].forEach((purchase) => {
      if (!purchase.purchaseDate) return;

      const key = getMonthKey(
        purchase.purchaseDate
      );

      if (!key) return;

      const existing =
        buckets.get(key) || {
          sales: 0,
          purchases: 0,
        };

      existing.purchases += safeNumber(
        purchase.grandTotal
      );

      buckets.set(key, existing);
    });

    return Array.from(buckets.entries())
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .slice(-6)
      .map(([month, values]) => ({
        month,
        label: getMonthLabel(month),
        ...values,
      }));
  }, [invoices, purchases]);

  /* =============================================
     TOP CUSTOMERS
  ============================================= */

  const topCustomers = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        amount: number;
        count: number;
      }
    >();

    filteredInvoices.forEach((invoice) => {
      const name =
        invoice.customerName ||
        "Unknown Customer";

      const existing =
        map.get(name) || {
          name,
          amount: 0,
          count: 0,
        };

      existing.amount += safeNumber(
        invoice.grandTotal
      );

      existing.count += 1;

      map.set(name, existing);
    });

    return Array.from(map.values())
      .sort((a, b) =>
        b.amount - a.amount
      )
      .slice(0, 5);
  }, [filteredInvoices]);

  /* =============================================
     GST SLAB REPORT
  ============================================= */

  const gstSlabs = useMemo(() => {
    const map = new Map<
      number,
      {
        rate: number;
        taxable: number;
        tax: number;
      }
    >();

    filteredInvoices.forEach((invoice) => {
      (invoice.items || []).forEach(
        (item) => {
          const rate =
            safeNumber(item.gstRate);

          const taxable =
            typeof item.taxableAmount ===
            "number"
              ? item.taxableAmount
              : safeNumber(item.quantity) *
                safeNumber(item.rate);

          const tax =
            getItemTax(item);

          const existing =
            map.get(rate) || {
              rate,
              taxable: 0,
              tax: 0,
            };

          existing.taxable += taxable;
          existing.tax += tax;

          map.set(rate, existing);
        }
      );
    });

    return Array.from(map.values()).sort(
      (a, b) => a.rate - b.rate
    );
  }, [filteredInvoices]);

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

      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Business, sales, purchase and GST
            insights in one place.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) =>
            setPeriod(
              event.target.value as typeof period
            )
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="this-month">
            This Month
          </option>

          <option value="last-month">
            Last Month
          </option>

          <option value="this-year">
            This Year
          </option>

          <option value="all">
            All Time
          </option>
        </select>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<TrendingUp size={20} />}
          label="Sales"
          value={formatCurrency(summary.sales)}
          description={`${filteredInvoices.length} invoice(s)`}
          variant="blue"
        />

        <StatCard
          icon={<ShoppingCart size={20} />}
          label="Purchases"
          value={formatCurrency(
            summary.purchasesTotal
          )}
          description={`${filteredPurchases.length} purchase(s)`}
          variant="purple"
        />

        <StatCard
          icon={<IndianRupee size={20} />}
          label="Gross Profit"
          value={formatCurrency(
            summary.grossProfit
          )}
          description="Sales minus purchases"
          variant={
            summary.grossProfit >= 0
              ? "green"
              : "red"
          }
        />

        <StatCard
          icon={<FileText size={20} />}
          label="Net GST"
          value={formatCurrency(
            summary.netGST
          )}
          description="Output GST minus input GST"
          variant="orange"
        />

      </div>

      {/* SECONDARY SUMMARY */}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">

        <MiniCard
          label="Amount Received"
          value={formatCurrency(
            summary.received
          )}
          icon={<IndianRupee size={18} />}
        />

        <MiniCard
          label="Receivables Pending"
          value={formatCurrency(
            summary.pending
          )}
          icon={<TrendingUp size={18} />}
        />

        <MiniCard
          label="Purchase GST / Input Tax"
          value={formatCurrency(
            summary.purchaseTax
          )}
          icon={<TrendingDown size={18} />}
        />

      </div>

      {/* SALES VS PURCHASES */}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

        <div className="flex items-start justify-between">

          <div>
            <h2 className="font-bold text-slate-800">
              Sales vs Purchases
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent monthly performance.
            </p>
          </div>

          <BarChart3
            size={20}
            className="text-slate-400"
          />

        </div>

        {monthlyData.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-slate-400">
            No transaction data available.
          </div>
        ) : (
          <div className="mt-8 space-y-5">

            {monthlyData.map((item) => {

              const maxValue = Math.max(
                item.sales,
                item.purchases,
                1
              );

              return (
                <div key={item.month}>

                  <div className="mb-2 flex items-center justify-between text-xs">

                    <span className="font-bold text-slate-600">
                      {item.label}
                    </span>

                    <span className="text-slate-400">
                      Sales{" "}
                      {formatCurrency(
                        item.sales
                      )}
                    </span>

                  </div>

                  <div className="space-y-2">

                    <div className="flex items-center gap-3">

                      <span className="w-16 text-[10px] font-semibold text-slate-400">
                        Sales
                      </span>

                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${
                              (item.sales /
                                maxValue) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <span className="w-16 text-[10px] font-semibold text-slate-400">
                        Purchase
                      </span>

                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-violet-400"
                          style={{
                            width: `${
                              (item.purchases /
                                maxValue) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* TOP CUSTOMERS */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Top Customers
                </h2>

                <p className="text-xs text-slate-500">
                  Highest invoice value
                </p>
              </div>

            </div>

          </div>

          {topCustomers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No customer sales data.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {topCustomers.map(
                (customer, index) => (
                  <div
                    key={customer.name}
                    className="flex items-center justify-between gap-4 p-5"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-700">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {customer.count} invoice
                          {customer.count !== 1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                    </div>

                    <p className="shrink-0 font-bold text-slate-800">
                      {formatCurrency(
                        customer.amount
                      )}
                    </p>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* GST SLABS */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-6">

            <h2 className="font-bold text-slate-800">
              GST Slab Report
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Taxable value and GST collected.
            </p>

          </div>

          {gstSlabs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No GST data available.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      GST Rate
                    </th>

                    <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Taxable
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      GST
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {gstSlabs.map((slab) => (
                    <tr
                      key={slab.rate}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5 font-semibold text-slate-700">
                        {slab.rate}%
                      </td>

                      <td className="px-4 py-5 text-right text-sm text-slate-600">
                        {formatCurrency(
                          slab.taxable
                        )}
                      </td>

                      <td className="px-6 py-5 text-right font-semibold text-blue-600">
                        {formatCurrency(
                          slab.tax
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {/* GST SUMMARY */}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">

        <div className="flex items-start justify-between">

          <div>
            <h2 className="font-bold text-slate-800">
              GST Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Output and input tax overview.
            </p>
          </div>

          <FileText
            size={20}
            className="text-slate-400"
          />

        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <GSTBox
            label="Output GST"
            value={formatCurrency(
              summary.salesTax
            )}
            description="GST collected from customers"
            variant="blue"
          />

          <GSTBox
            label="Input GST"
            value={formatCurrency(
              summary.purchaseTax
            )}
            description="GST paid on purchases"
            variant="purple"
          />

          <GSTBox
            label="Net GST"
            value={formatCurrency(
              summary.netGST
            )}
            description={
              summary.netGST >= 0
                ? "Net payable"
                : "Input credit exceeds output"
            }
            variant={
              summary.netGST >= 0
                ? "orange"
                : "green"
            }
          />

        </div>

      </section>

      {/* FOOT NOTE */}

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-500">
        <BarChart3 size={15} />
        Reports are calculated from the invoice and
        purchase records currently stored in the app.
      </div>

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
    | "purple"
    | "green"
    | "orange"
    | "red";
}) {
  const styles = {
    blue: {
      box: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
    },
    purple: {
      box: "bg-violet-50",
      icon: "bg-violet-100 text-violet-600",
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
      <div className="flex items-start justify-between gap-4">

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
   MINI CARD
===================================================== */

function MiniCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <div className="text-slate-400">
          {icon}
        </div>

      </div>

      <p className="mt-2 text-lg font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   GST BOX
===================================================== */

function GSTBox({
  label,
  value,
  description,
  variant,
}: {
  label: string;
  value: string;
  description: string;
  variant: "blue" | "purple" | "orange" | "green";
}) {
  const styles = {
    blue:
      "border-blue-100 bg-blue-50",
    purple:
      "border-violet-100 bg-violet-50",
    orange:
      "border-orange-100 bg-orange-50",
    green:
      "border-emerald-100 bg-emerald-50",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${styles[variant]}`}
    >
      <p className="text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-800">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
    }
