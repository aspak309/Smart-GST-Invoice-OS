"use client";

// app/(dashboard)/invoices/[id]/page.tsx

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Download,
  FileText,
  IndianRupee,
  Loader2,
  MapPin,
  MoreVertical,
  Package,
  Phone,
  Printer,
  Save,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

import type {
  Customer,
  Invoice,
} from "@/types";

import {
  STORAGE_KEYS,
  getCollection,
  removeItem,
  updateItem,
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

interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discountPercent?: number;
  gstRate?: number;
  taxableAmount?: number;
  gstAmount?: number;
  total: number;
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

function formatDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function normalizeStatus(
  value: unknown
): InvoiceStatus {
  const status = String(
    value || ""
  ).toLowerCase();

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

function getInvoiceNumber(
  invoice: Invoice
): string {
  const data = invoice as Invoice & {
    invoiceNumber?: string;
    number?: string;
  };

  return (
    data.invoiceNumber ||
    data.number ||
    `INV-${invoice.id.slice(0, 8).toUpperCase()}`
  );
}

function getInvoiceItems(
  invoice: Invoice
): InvoiceItem[] {
  const data = invoice as Invoice & {
    items?: InvoiceItem[];
  };

  return Array.isArray(data.items)
    ? data.items
    : [];
}

/* =====================================================
   PAGE
===================================================== */

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const invoiceId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [invoice, setInvoice] =
    useState<Invoice | null>(null);

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  /* =============================================
     LOAD DATA
  ============================================= */

  useEffect(() => {
    if (!invoiceId) return;

    try {
      const invoices =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      const foundInvoice =
        invoices.find(
          (item) => item.id === invoiceId
        );

      if (!foundInvoice) {
        setInvoice(null);
        setLoading(false);
        return;
      }

      setInvoice(foundInvoice);

      const invoiceData =
        foundInvoice as Invoice & {
          customerId?: string;
        };

      if (invoiceData.customerId) {
        const customers =
          getCollection<Customer>(
            STORAGE_KEYS.CUSTOMERS
          );

        const foundCustomer =
          customers.find(
            (item) =>
              item.id ===
              invoiceData.customerId
          );

        setCustomer(
          foundCustomer || null
        );
      }
    } catch (error) {
      console.error(
        "Failed to load invoice:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  /* =============================================
     DERIVED DATA
  ============================================= */

  const invoiceData = invoice as
    | (Invoice & {
        invoiceNumber?: string;
        customerName?: string;
        customerId?: string;
        invoiceDate?: string;
        dueDate?: string;
        placeOfSupply?: string;
        taxType?: "intra" | "inter";
        subtotal?: number;
        discount?: number;
        taxableAmount?: number;
        cgst?: number;
        sgst?: number;
        igst?: number;
        totalTax?: number;
        grandTotal?: number;
        notes?: string;
        terms?: string;
        updatedAt?: string;
      })
    | null;

  const items = useMemo(() => {
    if (!invoice) return [];

    return getInvoiceItems(invoice);
  }, [invoice]);

  const totals = useMemo(() => {
    if (!invoiceData) {
      return {
        subtotal: 0,
        discount: 0,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
        grandTotal: 0,
      };
    }

    const calculatedSubtotal =
      items.reduce(
        (sum, item) =>
          sum +
          safeNumber(item.quantity) *
            safeNumber(item.rate),
        0
      );

    const calculatedTaxable =
      items.reduce(
        (sum, item) =>
          sum +
          safeNumber(
            item.taxableAmount ??
              item.quantity *
                item.rate
          ),
        0
      );

    const calculatedTax =
      items.reduce(
        (sum, item) =>
          sum +
          safeNumber(item.gstAmount),
        0
      );

    return {
      subtotal: safeNumber(
        invoiceData.subtotal ||
          calculatedSubtotal
      ),

      discount: safeNumber(
        invoiceData.discount
      ),

      taxableAmount: safeNumber(
        invoiceData.taxableAmount ||
          calculatedTaxable
      ),

      cgst: safeNumber(
        invoiceData.cgst
      ),

      sgst: safeNumber(
        invoiceData.sgst
      ),

      igst: safeNumber(
        invoiceData.igst
      ),

      totalTax: safeNumber(
        invoiceData.totalTax ||
          calculatedTax
      ),

      grandTotal: safeNumber(
        invoiceData.grandTotal ||
          calculatedTaxable +
            calculatedTax
      ),
    };
  }, [invoiceData, items]);

  /* =============================================
     STATUS UPDATE
  ============================================= */

  async function updateStatus(
    status: InvoiceStatus
  ) {
    if (!invoice) return;

    setSavingStatus(true);

    try {
      const updatedInvoice = {
        ...invoice,
        status,
        updatedAt:
          new Date().toISOString(),
      };

      updateItem(
        STORAGE_KEYS.INVOICES,
        invoice.id,
        updatedInvoice
      );

      setInvoice(
        updatedInvoice as Invoice
      );

      setShowMenu(false);
    } catch (error) {
      console.error(
        "Failed to update invoice status:",
        error
      );

      alert(
        "Unable to update invoice status."
      );
    } finally {
      setSavingStatus(false);
    }
  }

  /* =============================================
     DELETE
  ============================================= */

  function handleDelete() {
    if (!invoice) return;

    const confirmed = window.confirm(
      `Delete ${getInvoiceNumber(
        invoice
      )}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      removeItem(
        STORAGE_KEYS.INVOICES,
        invoice.id
      );

      router.push("/invoices");
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

  /* =============================================
     PRINT
  ============================================= */

  function handlePrint() {
    window.print();
  }

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return <PageSkeleton />;
  }

  /* =============================================
     NOT FOUND
  ============================================= */

  if (!invoice || !invoiceData) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <CircleAlert size={28} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-800">
          Invoice not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This invoice may have been deleted.
        </p>

        <Link
          href="/invoices"
          className="
            mt-6 inline-flex items-center gap-2
            rounded-xl bg-blue-600 px-5 py-3
            text-sm font-semibold text-white
          "
        >
          <ArrowLeft size={17} />
          Back to Invoices
        </Link>
      </div>
    );
  }

  const status = normalizeStatus(
    invoice.status
  );

  const invoiceNumber =
    getInvoiceNumber(invoice);

  /* =====================================================
     PAGE UI
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl">

      {/* =========================================
          TOP NAVIGATION
      ========================================= */}

      <div className="mb-6 flex items-center justify-between print:hidden">

        <Link
          href="/invoices"
          className="
            inline-flex items-center gap-2
            text-sm font-medium text-slate-500
            transition-colors hover:text-blue-600
          "
        >
          <ArrowLeft size={17} />
          Back to Invoices
        </Link>

        <div className="flex items-center gap-2">

          {/* PRINT */}

          <button
            type="button"
            onClick={handlePrint}
            className="
              flex h-10 items-center gap-2
              rounded-xl border border-slate-200
              px-3 text-sm font-semibold
              text-slate-600 hover:bg-slate-50
            "
          >
            <Printer size={16} />
            <span className="hidden sm:inline">
              Print
            </span>
          </button>

          {/* ACTION MENU */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowMenu(!showMenu)
              }
              className="
                flex h-10 w-10 items-center
                justify-center rounded-xl
                border border-slate-200
                text-slate-600 hover:bg-slate-50
              "
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div
                className="
                  absolute right-0 top-12 z-50
                  w-52 overflow-hidden rounded-xl
                  border border-slate-200 bg-white
                  py-1 shadow-xl
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    updateStatus("draft")
                  }
                  className="menu-button"
                >
                  <FileText size={15} />
                  Mark as Draft
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateStatus("sent")
                  }
                  className="menu-button"
                >
                  <Clock3 size={15} />
                  Mark as Sent
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateStatus("paid")
                  }
                  className="menu-button text-emerald-600"
                >
                  <CheckCircle2 size={15} />
                  Mark as Paid
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleDelete}
                  className="menu-button text-red-600"
                >
                  <Trash2 size={15} />
                  Delete Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {invoiceNumber}
            </h1>

            <StatusBadge status={status} />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Created on{" "}
            {formatDate(
              invoice.createdAt
            )}
          </p>
        </div>

        {status !== "paid" && (
          <button
            type="button"
            disabled={savingStatus}
            onClick={() =>
              updateStatus("paid")
            }
            className="
              inline-flex h-11 items-center
              justify-center gap-2 rounded-xl
              bg-emerald-600 px-5 text-sm
              font-semibold text-white
              shadow-sm hover:bg-emerald-700
              disabled:opacity-60
            "
          >
            {savingStatus ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2 size={17} />
            )}

            Mark as Paid
          </button>
        )}
      </div>

      {/* =========================================
          INVOICE PREVIEW
      ========================================= */}

      <div
        id="invoice-print"
        className="
          overflow-hidden rounded-2xl
          border border-slate-200 bg-white
          shadow-sm print:border-0
          print:shadow-none
        "
      >

        {/* =====================================
            INVOICE TOP
        ===================================== */}

        <div className="border-b border-slate-200 p-6 sm:p-10">

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

            {/* COMPANY */}

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Building2 size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Smart GST
                  </h2>

                  <p className="text-xs text-slate-500">
                    Business Billing Solution
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-1 text-sm text-slate-500">
                <p>
                  Your Business Address
                </p>

                <p>
                  GSTIN: —
                </p>

                <p>
                  Phone: —
                </p>
              </div>
            </div>

            {/* INVOICE TITLE */}

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Tax Invoice
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {invoiceNumber}
              </h3>

              <div className="mt-4 space-y-1 text-sm text-slate-500">
                <p>
                  Invoice Date:{" "}
                  <strong className="text-slate-700">
                    {formatDate(
                      invoiceData.invoiceDate
                    )}
                  </strong>
                </p>

                <p>
                  Due Date:{" "}
                  <strong className="text-slate-700">
                    {formatDate(
                      invoiceData.dueDate
                    )}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            BILL TO
        ===================================== */}

        <div className="grid border-b border-slate-200 md:grid-cols-2">

          {/* CUSTOMER */}

          <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bill To
            </p>

            <div className="mt-4">

              <h3 className="text-lg font-bold text-slate-800">
                {customer?.name ||
                  invoiceData.customerName ||
                  "Customer"}
              </h3>

              <div className="mt-3 space-y-2 text-sm text-slate-500">

                {customer?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={15} />
                    {customer.phone}
                  </div>
                )}

                {customer?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {customer.address}
                    </span>
                  </div>
                )}

                {customer?.gstin && (
                  <p>
                    GSTIN:{" "}
                    <strong className="text-slate-700">
                      {customer.gstin}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SUPPLY INFO */}

          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Supply Details
            </p>

            <div className="mt-4 space-y-4">

              <InfoItem
                icon={
                  <MapPin size={17} />
                }
                label="Place of Supply"
                value={
                  invoiceData.placeOfSupply ||
                  "—"
                }
              />

              <InfoItem
                icon={
                  <Package size={17} />
                }
                label="Tax Type"
                value={
                  invoiceData.taxType ===
                  "inter"
                    ? "Inter-State (IGST)"
                    : "Intra-State (CGST + SGST)"
                }
              />
            </div>
          </div>
        </div>

        {/* =====================================
            ITEMS TABLE
        ===================================== */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-14 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  #
                </th>

                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Item Description
                </th>

                <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Qty
                </th>

                <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Rate
                </th>

                <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  GST
                </th>

                <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map(
                (item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-5 text-sm text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.name}
                      </p>

                      <div className="mt-1 flex gap-3 text-xs text-slate-400">
                        {item.hsnSac && (
                          <span>
                            HSN/SAC:{" "}
                            {item.hsnSac}
                          </span>
                        )}

                        {item.discountPercent &&
                        item.discountPercent > 0 ? (
                          <span>
                            Discount:{" "}
                            {
                              item.discountPercent
                            }
                            %
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-5 py-5 text-center text-sm text-slate-600">
                      {item.quantity}{" "}
                      {item.unit || "PCS"}
                    </td>

                    <td className="px-5 py-5 text-right text-sm text-slate-600">
                      {formatCurrency(
                        item.rate
                      )}
                    </td>

                    <td className="px-5 py-5 text-center text-sm text-slate-600">
                      {safeNumber(
                        item.gstRate
                      )}
                      %
                    </td>

                    <td className="px-5 py-5 text-right text-sm font-bold text-slate-800">
                      {formatCurrency(
                        item.total
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================
            TOTAL SECTION
        ===================================== */}

        <div className="flex flex-col border-t border-slate-200 lg:flex-row">

          {/* NOTES */}

          <div className="flex-1 border-b border-slate-200 p-6 lg:border-b-0 lg:border-r sm:p-8">

            {invoiceData.notes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notes
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {invoiceData.notes}
                </p>
              </div>
            )}

            {invoiceData.terms && (
              <div
                className={
                  invoiceData.notes
                    ? "mt-8"
                    : ""
                }
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Terms & Conditions
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {invoiceData.terms}
                </p>
              </div>
            )}

            {!invoiceData.notes &&
              !invoiceData.terms && (
                <p className="text-sm text-slate-400">
                  No additional notes or terms.
                </p>
              )}
          </div>

          {/* TOTALS */}

          <div className="w-full p-6 lg:w-[400px] sm:p-8">

            <TotalRow
              label="Subtotal"
              value={formatCurrency(
                totals.subtotal
              )}
            />

            {totals.discount > 0 && (
              <TotalRow
                label="Discount"
                value={`- ${formatCurrency(
                  totals.discount
                )}`}
                green
              />
            )}

            <TotalRow
              label="Taxable Amount"
              value={formatCurrency(
                totals.taxableAmount
              )}
            />

            {invoiceData.taxType ===
            "inter" ? (
              <TotalRow
                label="IGST"
                value={formatCurrency(
                  totals.igst
                )}
              />
            ) : (
              <>
                <TotalRow
                  label="CGST"
                  value={formatCurrency(
                    totals.cgst
                  )}
                />

                <TotalRow
                  label="SGST"
                  value={formatCurrency(
                    totals.sgst
                  )}
                />
              </>
            )}

            <div className="mt-5 border-t border-slate-200 pt-5">

              <div className="flex items-end justify-between gap-4">

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Grand Total
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Inclusive of all taxes
                  </p>
                </div>

                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    totals.grandTotal
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            FOOTER
        ===================================== */}

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 text-center sm:px-8">
          <p className="text-xs text-slate-400">
            This is a computer generated invoice.
            No signature required.
          </p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Generated with Smart GST
          </p>
        </div>
      </div>

      {/* =========================================
          QUICK ACTIONS
      ========================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3 print:hidden">

        <QuickAction
          icon={<Printer size={19} />}
          title="Print Invoice"
          description="Print a clean copy"
          onClick={handlePrint}
        />

        <QuickAction
          icon={<FileText size={19} />}
          title="Edit Invoice"
          description="Modify invoice details"
          disabled
        />

        <QuickAction
          icon={<Download size={19} />}
          title="Download PDF"
          description="Coming in next module"
          disabled
        />
      </div>

      {/* =========================================
          LOCAL STYLE
      ========================================= */}

      <style jsx global>{`
        .menu-button {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          text-align: left;
          font-size: 14px;
          color: #475569;
        }

        .menu-button:hover {
          background: #f8fafc;
        }

        @media print {
          body {
            background: white !important;
          }

          nav,
          aside,
          header {
            display: none !important;
          }

          #invoice-print {
            width: 100% !important;
            border: none !important;
          }
        }
      `}</style>
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
        px-3 py-1 text-xs font-bold
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}

/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-blue-600">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   TOTAL ROW
===================================================== */

function TotalRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <span
        className={
          green
            ? "font-semibold text-emerald-600"
            : "font-semibold text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* =====================================================
   QUICK ACTION
===================================================== */

function QuickAction({
  icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="
        flex items-center gap-4 rounded-2xl
        border border-slate-200 bg-white
        p-5 text-left transition-all
        hover:border-blue-200 hover:bg-blue-50/30
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </button>
  );
}

/* =====================================================
   LOADING SKELETON
===================================================== */

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse">
      <div className="mb-6 h-8 w-40 rounded-lg bg-slate-200" />

      <div className="mb-6 flex justify-between">
        <div className="h-20 w-64 rounded-xl bg-slate-200" />
        <div className="h-12 w-32 rounded-xl bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-52 bg-slate-100" />
        <div className="h-48 border-t border-slate-200 bg-white" />
        <div className="h-96 border-t border-slate-200 bg-slate-50" />
      </div>
    </div>
  );
}
