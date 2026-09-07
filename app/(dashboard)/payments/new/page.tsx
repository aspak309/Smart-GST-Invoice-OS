"use client";

// app/(dashboard)/payments/new/page.tsx

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Landmark,
  Loader2,
  Save,
  Smartphone,
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
  customerId?: string;
  customerName?: string;
  invoiceDate?: string;
  dueDate?: string;
  grandTotal?: number;
  paidAmount?: number;
  status?: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
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
    minimumFractionDigits: 2,
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

function getInvoiceNumber(invoice: Invoice) {
  return (
    invoice.invoiceNumber ||
    `INV-${invoice.id.slice(0, 8).toUpperCase()}`
  );
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

/* =====================================================
   PAGE
===================================================== */

export default function NewPaymentPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState("");

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentDate, setPaymentDate] =
    useState(getTodayDate());

  const [paymentMode, setPaymentMode] =
    useState("Cash");

  const [referenceNumber, setReferenceNumber] =
    useState("");

  const [notes, setNotes] = useState("");

  /* =============================================
     LOAD INVOICES
  ============================================= */

  useEffect(() => {
    try {
      const data =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      // Only invoices with pending balance
      const pendingInvoices = data.filter(
        (invoice) => {
          const total = safeNumber(
            invoice.grandTotal
          );

          const paid = safeNumber(
            invoice.paidAmount
          );

          return total > paid;
        }
      );

      setInvoices(pendingInvoices);
    } catch (error) {
      console.error(
        "Failed to load invoices:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =============================================
     SELECTED INVOICE
  ============================================= */

  const selectedInvoice = useMemo(() => {
    return invoices.find(
      (invoice) =>
        invoice.id === selectedInvoiceId
    );
  }, [invoices, selectedInvoiceId]);

  const invoiceTotal = safeNumber(
    selectedInvoice?.grandTotal
  );

  const alreadyPaid = safeNumber(
    selectedInvoice?.paidAmount
  );

  const pendingAmount = Math.max(
    invoiceTotal - alreadyPaid,
    0
  );

  const enteredAmount = safeNumber(
    paymentAmount
  );

  const remainingAfterPayment = Math.max(
    pendingAmount - enteredAmount,
    0
  );

  /* =============================================
     PAYMENT MODE ICON
  ============================================= */

  function getModeIcon() {
    switch (paymentMode) {
      case "UPI":
        return <Smartphone size={18} />;

      case "Bank Transfer":
        return <Landmark size={18} />;

      case "Card":
        return <CreditCard size={18} />;

      default:
        return <Banknote size={18} />;
    }
  }

  /* =============================================
     SET FULL AMOUNT
  ============================================= */

  function setFullPayment() {
    setPaymentAmount(
      pendingAmount.toFixed(2)
    );
  }

  /* =============================================
     SAVE PAYMENT
  ============================================= */

  function savePayment() {
    if (!selectedInvoice) {
      alert("Please select an invoice.");
      return;
    }

    if (enteredAmount <= 0) {
      alert(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (enteredAmount > pendingAmount) {
      alert(
        `Payment amount cannot exceed pending amount of ${formatCurrency(
          pendingAmount
        )}`
      );
      return;
    }

    try {
      setSaving(true);

      const newPaidAmount =
        alreadyPaid + enteredAmount;

      const newStatus =
        newPaidAmount >= invoiceTotal
          ? "paid"
          : "partial";

      const allInvoices =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      const updatedInvoices =
        allInvoices.map((invoice) =>
          invoice.id === selectedInvoice.id
            ? {
                ...invoice,
                paidAmount: newPaidAmount,
                status: newStatus,
                updatedAt:
                  new Date().toISOString(),
              }
            : invoice
        );

      // Update Invoice
      localStorage.setItem(
        STORAGE_KEYS.INVOICES,
        JSON.stringify(updatedInvoices)
      );

      // Create payment record
      const newPayment: Payment = {
        id: crypto.randomUUID(),

        invoiceId:
          selectedInvoice.id,

        invoiceNumber:
          getInvoiceNumber(
            selectedInvoice
          ),

        customerId:
          selectedInvoice.customerId,

        customerName:
          selectedInvoice.customerName,

        amount: enteredAmount,

        paymentDate,

        paymentMode,

        referenceNumber:
          referenceNumber.trim(),

        notes: notes.trim(),

        createdAt:
          new Date().toISOString(),
      };

      /*
       Payment storage key safely supports
       old STORAGE_KEYS versions too.
      */

      const paymentKey =
        (STORAGE_KEYS as any).PAYMENTS ||
        "smart_gst_payments";

      const existingPaymentsRaw =
        localStorage.getItem(paymentKey);

      const existingPayments: Payment[] =
        existingPaymentsRaw
          ? JSON.parse(existingPaymentsRaw)
          : [];

      existingPayments.push(newPayment);

      localStorage.setItem(
        paymentKey,
        JSON.stringify(existingPayments)
      );

      router.push("/payments");
    } catch (error) {
      console.error(
        "Failed to save payment:",
        error
      );

      alert(
        "Unable to record payment. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

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
    <div className="mx-auto max-w-5xl pb-12">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <button
            onClick={() =>
              router.push("/payments")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Payments
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Record Payment
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add a full or partial payment against
            an invoice.
          </p>
        </div>

        <button
          disabled={saving}
          onClick={savePayment}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save size={17} />
          )}

          Save Payment
        </button>

      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={30} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-800">
            No Pending Payments
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            All invoices are fully paid or no
            invoices have been created yet.
          </p>

          <button
            onClick={() =>
              router.push("/invoices")
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            View Invoices
          </button>

        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* =============================================
             FORM
          ============================================= */}

          <div className="space-y-6">

            {/* INVOICE */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

              <h2 className="font-bold text-slate-800">
                Select Invoice
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose the invoice for this payment.
              </p>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Pending Invoice
                </label>

                <select
                  value={selectedInvoiceId}
                  onChange={(event) => {
                    setSelectedInvoiceId(
                      event.target.value
                    );

                    setPaymentAmount("");
                  }}
                  className="input-style"
                >
                  <option value="">
                    Select an invoice
                  </option>

                  {invoices.map(
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

                      return (
                        <option
                          key={invoice.id}
                          value={invoice.id}
                        >
                          {getInvoiceNumber(
                            invoice
                          )}{" "}
                          —{" "}
                          {invoice.customerName ||
                            "Customer"}{" "}
                          (Pending:{" "}
                          {formatCurrency(
                            pending
                          )}
                          )
                        </option>
                      );
                    }
                  )}

                </select>

              </div>

              {/* INVOICE INFO */}

              {selectedInvoice && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">

                  <InfoBox
                    label="Invoice Total"
                    value={formatCurrency(
                      invoiceTotal
                    )}
                  />

                  <InfoBox
                    label="Already Paid"
                    value={formatCurrency(
                      alreadyPaid
                    )}
                    color="green"
                  />

                  <InfoBox
                    label="Pending"
                    value={formatCurrency(
                      pendingAmount
                    )}
                    color="orange"
                  />

                </div>
              )}

            </section>

            {/* PAYMENT AMOUNT */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="font-bold text-slate-800">
                    Payment Amount
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter received amount.
                  </p>
                </div>

                {selectedInvoice && (
                  <button
                    type="button"
                    onClick={setFullPayment}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
                  >
                    Pay Full Amount
                  </button>
                )}

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount Received
                </label>

                <div className="relative">

                  <IndianRupee
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(
                        event.target.value
                      )
                    }
                    placeholder="0.00"
                    className="h-14 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-lg font-bold outline-none focus:border-blue-500"
                  />

                </div>

                {selectedInvoice &&
                  enteredAmount > 0 && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Remaining after payment
                        </span>

                        <span className="font-bold text-slate-800">
                          {formatCurrency(
                            remainingAfterPayment
                          )}
                        </span>

                      </div>

                      {enteredAmount >=
                        pendingAmount && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                          <CheckCircle2
                            size={15}
                          />
                          This invoice will be marked
                          as fully paid.
                        </div>
                      )}

                    </div>
                  )}

              </div>

            </section>

            {/* PAYMENT DETAILS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

              <h2 className="font-bold text-slate-800">
                Payment Details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <Field label="Payment Date">

                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(event) =>
                      setPaymentDate(
                        event.target.value
                      )
                    }
                    className="input-style"
                  />

                </Field>

                <Field label="Payment Mode">

                  <div className="relative">

                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {getModeIcon()}
                    </div>

                    <select
                      value={paymentMode}
                      onChange={(event) =>
                        setPaymentMode(
                          event.target.value
                        )
                      }
                      className="input-style pl-11"
                    >
                      <option value="Cash">
                        Cash
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="Bank Transfer">
                        Bank Transfer
                      </option>

                      <option value="Card">
                        Card
                      </option>

                      <option value="Cheque">
                        Cheque
                      </option>
                    </select>

                  </div>

                </Field>

                <Field label="Reference / Transaction No.">

                  <input
                    value={referenceNumber}
                    onChange={(event) =>
                      setReferenceNumber(
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                    className="input-style"
                  />

                </Field>

                <Field label="Invoice Due Date">

                  <input
                    value={
                      selectedInvoice
                        ? formatDate(
                            selectedInvoice.dueDate
                          )
                        : ""
                    }
                    disabled
                    placeholder="Select invoice first"
                    className="input-style bg-slate-50 text-slate-500"
                  />

                </Field>

              </div>

              <div className="mt-5">

                <Field label="Notes (Optional)">

                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    placeholder="Add payment notes..."
                    className="input-style resize-none py-3"
                  />

                </Field>

              </div>

            </section>

          </div>

          {/* =============================================
             SUMMARY
          ============================================= */}

          <aside>

            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <IndianRupee size={22} />
              </div>

              <h2 className="mt-4 font-bold text-slate-800">
                Payment Summary
              </h2>

              {!selectedInvoice ? (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Select an invoice to see payment
                  details here.
                </p>
              ) : (
                <div className="mt-6 space-y-5">

                  <SummaryRow
                    label="Invoice"
                    value={getInvoiceNumber(
                      selectedInvoice
                    )}
                  />

                  <SummaryRow
                    label="Customer"
                    value={
                      selectedInvoice.customerName ||
                      "—"
                    }
                  />

                  <div className="border-t border-slate-100" />

                  <SummaryRow
                    label="Pending Before"
                    value={formatCurrency(
                      pendingAmount
                    )}
                  />

                  <SummaryRow
                    label="Payment"
                    value={formatCurrency(
                      enteredAmount
                    )}
                    highlight
                  />

                  <SummaryRow
                    label="Remaining"
                    value={formatCurrency(
                      remainingAfterPayment
                    )}
                  />

                  <div className="border-t border-slate-200 pt-5">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment Status
                    </p>

                    <div
                      className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                        enteredAmount >=
                          pendingAmount &&
                        enteredAmount > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {enteredAmount >=
                        pendingAmount &&
                      enteredAmount > 0
                        ? "Fully Paid"
                        : "Partial Payment"}
                    </div>

                  </div>

                </div>
              )}

              <button
                disabled={
                  saving || !selectedInvoice
                }
                onClick={savePayment}
                className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                Record Payment
              </button>

            </div>

          </aside>

        </div>
      )}

      <style jsx global>{`
        .input-style {
          width: 100%;
          min-height: 44px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        textarea.input-style {
          padding-top: 12px;
        }

        .input-style:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px
            rgba(59, 130, 246, 0.1);
        }
      `}</style>

    </div>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}

    </label>
  );
}

/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: string;
  color?: "default" | "green" | "orange";
}) {
  const colors = {
    default:
      "border-slate-100 bg-slate-50 text-slate-800",
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    orange:
      "border-orange-100 bg-orange-50 text-orange-700",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${colors[color]}`}
    >
      <p className="text-[11px] font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   SUMMARY ROW
===================================================== */

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">

      <span className="text-slate-500">
        {label}
      </span>

      <span
        className={`max-w-[170px] text-right font-semibold ${
          highlight
            ? "text-emerald-600"
            : "text-slate-700"
        }`}
      >
        {value}
      </span>

    </div>
  );
}
