"use client";

// app/(dashboard)/quotations/[id]/page.tsx

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit3,
  FileText,
  Loader2,
  MoreVertical,
  Printer,
  Receipt,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  STORAGE_KEYS,
  getCollection,
  removeItem,
  updateItem,
} from "@/lib/storage";

import {
  generateInvoicePDF,
} from "@/lib/invoice-pdf";

/* =====================================================
   TYPES
===================================================== */

type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

interface Customer {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
}

interface QuotationItem {
  id: string;
  name: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  rate: number;
  gstRate?: number;
  discountPercent?: number;
  taxableAmount?: number;
  gstAmount?: number;
  total: number;
}

interface Quotation {
  id: string;
  quotationNumber?: string;
  customerId?: string;
  customerName?: string;
  quotationDate?: string;
  validUntil?: string;
  placeOfSupply?: string;
  taxType?: "intra" | "inter";

  customer?: Customer;

  items: QuotationItem[];

  subtotal?: number;
  discount?: number;
  taxableAmount?: number;

  cgst?: number;
  sgst?: number;
  igst?: number;

  totalTax?: number;
  grandTotal?: number;

  status?: QuotationStatus;

  notes?: string;
  terms?: string;

  createdAt?: string;
  updatedAt?: string;
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

function formatCurrency(value: unknown): string {
  return `₹${safeNumber(value).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(value?: string): string {
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

function getQuotationNumber(
  quotation: Quotation
) {
  return (
    quotation.quotationNumber ||
    `QT-${quotation.id.slice(
      0,
      8
    ).toUpperCase()}`
  );
}

function getStatus(
  quotation: Quotation
): QuotationStatus {
  const status = quotation.status;

  if (
    status === "draft" ||
    status === "sent" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "expired"
  ) {
    return status;
  }

  return "draft";
}

/* =====================================================
   MAIN PAGE
===================================================== */

export default function QuotationDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const quotationId =
    String(params.id);

  const [quotation, setQuotation] =
    useState<Quotation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  /* =============================================
     LOAD QUOTATION
  ============================================= */

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  function loadQuotation() {
    try {
      const quotations =
        getCollection<Quotation>(
          STORAGE_KEYS.QUOTATIONS
        );

      const found =
        quotations.find(
          (item) =>
            item.id === quotationId
        );

      setQuotation(found || null);
    } catch (error) {
      console.error(
        "Failed to load quotation:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =============================================
     CUSTOMER
  ============================================= */

  const customer = useMemo(() => {
    if (!quotation) return null;

    if (quotation.customer) {
      return quotation.customer;
    }

    return {
      id: quotation.customerId,
      name:
        quotation.customerName ||
        "Customer",
    };
  }, [quotation]);

  /* =============================================
     STATUS UPDATE
  ============================================= */

  function changeStatus(
    status: QuotationStatus
  ) {
    if (!quotation) return;

    try {
      setActionLoading(true);

      const updatedQuotation = {
        ...quotation,
        status,
        updatedAt:
          new Date().toISOString(),
      };

      updateItem(
        STORAGE_KEYS.QUOTATIONS,
        quotation.id,
        updatedQuotation
      );

      setQuotation(updatedQuotation);
      setShowMenu(false);
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* =============================================
     DELETE
  ============================================= */

  function handleDelete() {
    if (!quotation) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this quotation?"
      );

    if (!confirmed) return;

    try {
      removeItem(
        STORAGE_KEYS.QUOTATIONS,
        quotation.id
      );

      router.push("/quotations");
    } catch (error) {
      console.error(
        "Failed to delete quotation:",
        error
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
     DOWNLOAD PDF
  ============================================= */

  function handleDownloadPDF() {
    if (!quotation) return;

    generateInvoicePDF({
      invoiceNumber:
        getQuotationNumber(quotation),

      invoiceDate:
        quotation.quotationDate,

      dueDate:
        quotation.validUntil,

      customer: {
        name:
          customer?.name ||
          quotation.customerName,
        phone: customer?.phone,
        email: customer?.email,
        address: customer?.address,
        gstin: customer?.gstin,
      },

      placeOfSupply:
        quotation.placeOfSupply,

      taxType:
        quotation.taxType || "intra",

      items: quotation.items,

      subtotal:
        quotation.subtotal,

      discount:
        quotation.discount,

      taxableAmount:
        quotation.taxableAmount,

      cgst:
        quotation.cgst,

      sgst:
        quotation.sgst,

      igst:
        quotation.igst,

      totalTax:
        quotation.totalTax,

      grandTotal:
        quotation.grandTotal || 0,

      notes:
        quotation.notes,

      terms:
        quotation.terms,

      businessName:
        "SMART GST",

      businessAddress:
        "Your Business Address",
    });
  }

  /* =============================================
     CONVERT TO INVOICE
  ============================================= */

  function convertToInvoice() {
    if (!quotation) return;

    const confirmed =
      window.confirm(
        "Convert this quotation into an invoice?"
      );

    if (!confirmed) return;

    try {
      const existingInvoices =
        getCollection<any>(
          STORAGE_KEYS.INVOICES
        );

      const year =
        new Date().getFullYear();

      const invoiceNumber =
        `INV-${year}-${String(
          existingInvoices.length + 1
        ).padStart(4, "0")}`;

      const invoice = {
        id: crypto.randomUUID(),

        invoiceNumber,

        customerId:
          quotation.customerId,

        customerName:
          quotation.customerName,

        customer,

        invoiceDate:
          new Date()
            .toISOString()
            .split("T")[0],

        dueDate:
          quotation.validUntil,

        placeOfSupply:
          quotation.placeOfSupply,

        taxType:
          quotation.taxType || "intra",

        items:
          quotation.items,

        subtotal:
          quotation.subtotal || 0,

        discount:
          quotation.discount || 0,

        taxableAmount:
          quotation.taxableAmount || 0,

        cgst:
          quotation.cgst || 0,

        sgst:
          quotation.sgst || 0,

        igst:
          quotation.igst || 0,

        totalTax:
          quotation.totalTax || 0,

        grandTotal:
          quotation.grandTotal || 0,

        status: "unpaid",

        notes:
          quotation.notes || "",

        terms:
          quotation.terms || "",

        sourceQuotationId:
          quotation.id,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEYS.INVOICES,
        JSON.stringify([
          ...existingInvoices,
          invoice,
        ])
      );

      const updatedQuotation = {
        ...quotation,

        status:
          "accepted" as QuotationStatus,

        convertedToInvoiceId:
          invoice.id,

        updatedAt:
          new Date().toISOString(),
      };

      updateItem(
        STORAGE_KEYS.QUOTATIONS,
        quotation.id,
        updatedQuotation
      );

      router.push(
        `/invoices/${invoice.id}`
      );
    } catch (error) {
      console.error(
        "Failed to convert quotation:",
        error
      );

      alert(
        "Unable to convert quotation."
      );
    }
  }

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-blue-600"
        />
      </div>
    );
  }

  /* =============================================
     NOT FOUND
  ============================================= */

  if (!quotation) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center text-center">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <FileText size={30} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-800">
          Quotation not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This quotation may have been deleted.
        </p>

        <button
          onClick={() =>
            router.push("/quotations")
          }
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Quotations
        </button>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl pb-12">

      {/* =========================================
          TOP HEADER
      ========================================= */}

      <div className="mb-7 flex flex-col gap-5 print:hidden sm:flex-row sm:items-center sm:justify-between">

        <div>

          <button
            onClick={() =>
              router.push("/quotations")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Quotations
          </button>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-bold text-slate-900">
              {getQuotationNumber(
                quotation
              )}
            </h1>

            <StatusBadge
              status={getStatus(
                quotation
              )}
            />
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Created on{" "}
            {formatDate(
              quotation.createdAt ||
                quotation.quotationDate
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={handlePrint}
            className="action-button"
          >
            <Printer size={17} />
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className="action-button"
          >
            <Download size={17} />
            Download
          </button>

          <button
            onClick={() =>
              router.push(
                `/quotations/${quotation.id}/edit`
              )
            }
            className="action-button"
          >
            <Edit3 size={17} />
            Edit
          </button>

          <div className="relative">

            <button
              onClick={() =>
                setShowMenu(!showMenu)
              }
              className="action-button px-3"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">

                <button
                  onClick={() =>
                    changeStatus("sent")
                  }
                  className="menu-item"
                >
                  <Send size={16} />
                  Mark as Sent
                </button>

                <button
                  onClick={() =>
                    changeStatus(
                      "accepted"
                    )
                  }
                  className="menu-item text-emerald-600"
                >
                  <CheckCircle2 size={16} />
                  Mark as Accepted
                </button>

                <button
                  onClick={() =>
                    changeStatus(
                      "rejected"
                    )
                  }
                  className="menu-item text-red-500"
                >
                  <XCircle size={16} />
                  Mark as Rejected
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={handleDelete}
                  className="menu-item text-red-600"
                >
                  <Trash2 size={16} />
                  Delete Quotation
                </button>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          ACTION BAR
      ========================================= */}

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 print:hidden">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Receipt size={19} />
            </div>

            <div>
              <p className="font-semibold text-slate-800">
                Ready to create an invoice?
              </p>

              <p className="text-xs text-slate-500">
                Convert this accepted quotation into an invoice.
              </p>
            </div>
          </div>

          <button
            disabled={actionLoading}
            onClick={convertToInvoice}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <FileText size={17} />
            Convert to Invoice
          </button>
        </div>
      </div>

      {/* =========================================
          QUOTATION DOCUMENT
      ========================================= */}

      <div
        id="quotation-print"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none"
      >

        {/* DOCUMENT HEADER */}

        <div className="border-b border-slate-200 p-6 sm:p-10">

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                SMART GST
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                QUOTATION
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Professional business quotation generated through Smart GST.
              </p>
            </div>

            <div className="text-left sm:text-right">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quotation Number
              </p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {getQuotationNumber(
                  quotation
                )}
              </p>

              <div className="mt-5 space-y-1 text-sm text-slate-500">

                <p>
                  Date:{" "}
                  <span className="font-medium text-slate-700">
                    {formatDate(
                      quotation.quotationDate
                    )}
                  </span>
                </p>

                <p>
                  Valid Until:{" "}
                  <span className="font-medium text-slate-700">
                    {formatDate(
                      quotation.validUntil
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BILL TO */}

        <div className="grid border-b border-slate-200 sm:grid-cols-2">

          <div className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r sm:p-8">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quotation For
            </p>

            <h3 className="mt-3 text-lg font-bold text-slate-800">
              {customer?.name ||
                quotation.customerName ||
                "Customer"}
            </h3>

            <div className="mt-3 space-y-1 text-sm leading-6 text-slate-500">

              {customer?.address && (
                <p>
                  {customer.address}
                </p>
              )}

              {customer?.phone && (
                <p>
                  {customer.phone}
                </p>
              )}

              {customer?.email && (
                <p>
                  {customer.email}
                </p>
              )}

              {customer?.gstin && (
                <p>
                  GSTIN:{" "}
                  {customer.gstin}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tax Information
            </p>

            <div className="mt-4 space-y-3 text-sm">

              <InfoRow
                label="Place of Supply"
                value={
                  quotation.placeOfSupply ||
                  "—"
                }
              />

              <InfoRow
                label="Tax Type"
                value={
                  quotation.taxType === "inter"
                    ? "Inter-State (IGST)"
                    : "Intra-State (CGST + SGST)"
                }
              />

              <InfoRow
                label="Status"
                value={
                  getStatus(quotation)
                    .charAt(0)
                    .toUpperCase() +
                  getStatus(quotation).slice(
                    1
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[750px]">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  #
                </th>

                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Description
                </th>

                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Qty
                </th>

                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rate
                </th>

                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  GST
                </th>

                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Amount
                </th>

              </tr>
            </thead>

            <tbody>

              {quotation.items.map(
                (item, index) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100"
                  >

                    <td className="px-6 py-5 text-sm text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-6 py-5">

                      <p className="font-semibold text-slate-700">
                        {item.name}
                      </p>

                      {item.hsnSac && (
                        <p className="mt-1 text-xs text-slate-400">
                          HSN/SAC:{" "}
                          {item.hsnSac}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-5 text-center text-sm text-slate-600">
                      {item.quantity}{" "}
                      {item.unit || "PCS"}
                    </td>

                    <td className="px-6 py-5 text-right text-sm text-slate-600">
                      {formatCurrency(
                        item.rate
                      )}
                    </td>

                    <td className="px-6 py-5 text-center text-sm text-slate-600">
                      {safeNumber(
                        item.gstRate
                      )}
                      %
                    </td>

                    <td className="px-6 py-5 text-right font-semibold text-slate-800">
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

        {/* TOTAL SECTION */}

        <div className="grid gap-8 border-t border-slate-200 p-6 sm:grid-cols-[1fr_330px] sm:p-8">

          {/* NOTES */}

          <div className="space-y-6">

            {quotation.notes && (
              <div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Notes
                </h4>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {quotation.notes}
                </p>
              </div>
            )}

            {quotation.terms && (
              <div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Terms & Conditions
                </h4>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {quotation.terms}
                </p>
              </div>
            )}
          </div>

          {/* TOTALS */}

          <div className="rounded-2xl bg-slate-50 p-5">

            <div className="space-y-4">

              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  quotation.subtotal
                )}
              />

              {safeNumber(
                quotation.discount
              ) > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`- ${formatCurrency(
                    quotation.discount
                  )}`}
                  green
                />
              )}

              <SummaryRow
                label="Taxable Amount"
                value={formatCurrency(
                 
