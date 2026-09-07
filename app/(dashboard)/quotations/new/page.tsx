"use client";

// app/(dashboard)/quotations/new/page.tsx

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";

import { STORAGE_KEYS, getCollection } from "@/lib/storage";

/* =====================================================
   TYPES
===================================================== */

interface Customer {
  id: string;
  name: string;
  phone?: string;
  gstin?: string;
  address?: string;
}

interface QuotationItem {
  id: string;
  name: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  discountPercent: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  quotationDate: string;
  validUntil: string;
  placeOfSupply: string;
  taxType: "intra" | "inter";
  items: Array<
    QuotationItem & {
      taxableAmount: number;
      gstAmount: number;
      total: number;
    }
  >;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
  status: "draft";
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

/* =====================================================
   HELPERS
===================================================== */

function safeNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatCurrency(value: number) {
  return `₹${safeNumber(value).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function createItem(): QuotationItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    hsnSac: "",
    quantity: 1,
    unit: "PCS",
    rate: 0,
    gstRate: 18,
    discountPercent: 0,
  };
}

function getToday() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function getValidUntil() {
  const date = new Date();

  date.setDate(
    date.getDate() + 30
  );

  return date
    .toISOString()
    .split("T")[0];
}

/* =====================================================
   PAGE
===================================================== */

export default function NewQuotationPage() {
  const router = useRouter();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [customerId, setCustomerId] =
    useState("");

  const [quotationDate, setQuotationDate] =
    useState(getToday());

  const [validUntil, setValidUntil] =
    useState(getValidUntil());

  const [placeOfSupply, setPlaceOfSupply] =
    useState("");

  const [taxType, setTaxType] =
    useState<"intra" | "inter">(
      "intra"
    );

  const [items, setItems] =
    useState<QuotationItem[]>([
      createItem(),
    ]);

  const [notes, setNotes] =
    useState("");

  const [terms, setTerms] =
    useState(
      "This quotation is valid until the mentioned expiry date."
    );

  const [saving, setSaving] =
    useState(false);

  /* =============================================
     LOAD CUSTOMERS
  ============================================= */

  useEffect(() => {
    try {
      const data =
        getCollection<Customer>(
          STORAGE_KEYS.CUSTOMERS
        );

      setCustomers(data);
    } catch (error) {
      console.error(
        "Failed to load customers:",
        error
      );
    }
  }, []);

  /* =============================================
     SELECTED CUSTOMER
  ============================================= */

  const selectedCustomer =
    useMemo(() => {
      return customers.find(
        (customer) =>
          customer.id === customerId
      );
    }, [
      customers,
      customerId,
    ]);

  /* =============================================
     CALCULATE TOTALS
  ============================================= */

  const calculation =
    useMemo(() => {
      let subtotal = 0;
      let discount = 0;
      let taxableAmount = 0;
      let totalTax = 0;

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      const calculatedItems =
        items.map((item) => {
          const quantity =
            safeNumber(item.quantity);

          const rate =
            safeNumber(item.rate);

          const gstRate =
            safeNumber(item.gstRate);

          const discountPercent =
            safeNumber(
              item.discountPercent
            );

          const itemSubtotal =
            quantity * rate;

          const discountAmount =
            itemSubtotal *
            (discountPercent / 100);

          const taxable =
            itemSubtotal -
            discountAmount;

          const gstAmount =
            taxable *
            (gstRate / 100);

          subtotal += itemSubtotal;
          discount += discountAmount;
          taxableAmount += taxable;
          totalTax += gstAmount;

          if (taxType === "inter") {
            igst += gstAmount;
          } else {
            cgst += gstAmount / 2;
            sgst += gstAmount / 2;
          }

          return {
            ...item,
            taxableAmount: taxable,
            gstAmount,
            total:
              taxable + gstAmount,
          };
        });

      return {
        items: calculatedItems,
        subtotal,
        discount,
        taxableAmount,
        totalTax,
        cgst,
        sgst,
        igst,
        grandTotal:
          taxableAmount + totalTax,
      };
    }, [
      items,
      taxType,
    ]);

  /* =============================================
     ADD ITEM
  ============================================= */

  function addItem() {
    setItems((previous) => [
      ...previous,
      createItem(),
    ]);
  }

  /* =============================================
     REMOVE ITEM
  ============================================= */

  function removeItem(id: string) {
    if (items.length === 1) {
      return;
    }

    setItems((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  }

  /* =============================================
     UPDATE ITEM
  ============================================= */

  function updateItem(
    id: string,
    field: keyof QuotationItem,
    value: string | number
  ) {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  /* =============================================
     GENERATE QUOTATION NUMBER
  ============================================= */

  function generateQuotationNumber() {
    const year =
      new Date().getFullYear();

    const random =
      Math.floor(
        1000 + Math.random() * 9000
      );

    return `QT-${year}-${random}`;
  }

  /* =============================================
     SAVE QUOTATION
  ============================================= */

  function saveQuotation() {
    if (!customerId) {
      alert(
        "Please select a customer."
      );

      return;
    }

    const invalidItem =
      items.some(
        (item) =>
          !item.name.trim() ||
          item.quantity <= 0 ||
          item.rate <= 0
      );

    if (invalidItem) {
      alert(
        "Please enter valid item details."
      );

      return;
    }

    setSaving(true);

    try {
      const quotation: Quotation = {
        id: crypto.randomUUID(),

        quotationNumber:
          generateQuotationNumber(),

        customerId,

        customerName:
          selectedCustomer?.name ||
          "Customer",

        quotationDate,

        validUntil,

        placeOfSupply,

        taxType,

        items: calculation.items,

        subtotal:
          calculation.subtotal,

        discount:
          calculation.discount,

        taxableAmount:
          calculation.taxableAmount,

        cgst:
          calculation.cgst,

        sgst:
          calculation.sgst,

        igst:
          calculation.igst,

        totalTax:
          calculation.totalTax,

        grandTotal:
          calculation.grandTotal,

        status: "draft",

        notes,

        terms,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      const existing =
        getCollection<Quotation>(
          STORAGE_KEYS.QUOTATIONS
        );

      localStorage.setItem(
        STORAGE_KEYS.QUOTATIONS,
        JSON.stringify([
          ...existing,
          quotation,
        ])
      );

      router.push(
        `/quotations/${quotation.id}`
      );
    } catch (error) {
      console.error(
        "Failed to save quotation:",
        error
      );

      alert(
        "Unable to save quotation."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl pb-12">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <button
            type="button"
            onClick={() =>
              router.push("/quotations")
            }
            className="
              mb-3 inline-flex items-center
              gap-2 text-sm font-medium
              text-slate-500 hover:text-blue-600
            "
          >
            <ArrowLeft size={17} />
            Back to Quotations
          </button>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Create Quotation
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a professional quotation
            for your customer.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={saveQuotation}
          className="
            inline-flex h-11 items-center
            justify-center gap-2 rounded-xl
            bg-blue-600 px-6 text-sm
            font-semibold text-white
            hover:bg-blue-700
            disabled:opacity-60
          "
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save size={17} />
          )}

          Save Quotation
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* LEFT CONTENT */}

        <div className="space-y-6">

          {/* CUSTOMER DETAILS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Customer Details
                </h2>

                <p className="text-xs text-slate-500">
                  Select quotation recipient
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <Field label="Select Customer">

                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(
                      event.target.value
                    )
                  }
                  className="input-style"
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                      </option>
                    )
                  )}
                </select>

              </Field>

              <Field label="Place of Supply">

                <input
                  value={placeOfSupply}
                  onChange={(event) =>
                    setPlaceOfSupply(
                      event.target.value
                    )
                  }
                  placeholder="Punjab"
                  className="input-style"
                />

              </Field>

              <Field label="Quotation Date">

                <input
                  type="date"
                  value={quotationDate}
                  onChange={(event) =>
                    setQuotationDate(
                      event.target.value
                    )
                  }
                  className="input-style"
                />

              </Field>

              <Field label="Valid Until">

                <input
                  type="date"
                  value={validUntil}
                  onChange={(event) =>
                    setValidUntil(
                      event.target.value
                    )
                  }
                  className="input-style"
                />

              </Field>
            </div>

            {selectedCustomer && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">

                <p className="text-sm font-semibold text-slate-700">
                  {selectedCustomer.name}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">

                  {selectedCustomer.phone && (
                    <span>
                      {selectedCustomer.phone}
                    </span>
                  )}

                  {selectedCustomer.gstin && (
                    <span>
                      GSTIN:{" "}
                      {selectedCustomer.gstin}
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* TAX TYPE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

            <h2 className="font-bold text-slate-800">
              Tax Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select applicable GST type
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setTaxType("intra")
                }
                className={`
                  rounded-xl border p-4 text-left
                  transition
                  ${
                    taxType === "intra"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                <p className="text-sm font-bold text-slate-800">
                  Intra-State
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  CGST + SGST applicable
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setTaxType("inter")
                }
                className={`
                  rounded-xl border p-4 text-left
                  transition
                  ${
                    taxType === "inter"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                <p className="text-sm font-bold text-slate-800">
                  Inter-State
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  IGST applicable
                </p>
              </button>
            </div>
          </section>

          {/* ITEMS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-7">

              <div>
                <h2 className="font-bold text-slate-800">
                  Items
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add products or services
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="
                  inline-flex items-center gap-2
                  rounded-xl bg-slate-900 px-4 py-2.5
                  text-xs font-semibold text-white
                  hover:bg-slate-800
                "
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-400">
                      Item
                    </th>

                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase text-slate-400">
                      HSN
                    </th>

                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase text-slate-400">
                      Qty
                    </th>

                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase text-slate-400">
                      Rate
                    </th>

                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase text-slate-400">
                      GST
                    </th>

                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase text-slate-400">
                      Total
                    </th>

                    <th className="w-12" />

                  </tr>
                </thead>

                <tbody>

                  {items.map((item) => {
                    const calculated =
                      calculation.items.find(
                        (value) =>
                          value.id === item.id
                      );

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100"
                      >

                        <td className="p-3">

                          <input
                            value={item.name}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="Product name"
                            className="table-input min-w-[180px]"
                          />

                        </td>

                        <td className="p-3">

                          <input
                            value={item.hsnSac}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "hsnSac",
                                event.target.value
                              )
                            }
                            placeholder="HSN"
                            className="table-input w-20"
                          />

                        </td>

                        <td className="p-3">

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "quantity",
                                safeNumber(
                                  event.target.value
                                )
                              )
                            }
                            className="table-input w-16 text-center"
                          />

                        </td>

                        <td className="p-3">

                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "rate",
                                safeNumber(
                                  event.target.value
                                )
                              )
                            }
                            className="table-input w-24 text-right"
                          />

                        </td>

                        <td className="p-3">

                          <select
                            value={item.gstRate}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "gstRate",
                                safeNumber(
                                  event.target.value
                                )
                              )
                            }
                            className="table-input w-16"
                          >
                            <option value={0}>
                              0%
                            </option>

                            <option value={5}>
                              5%
                            </option>

                            <option value={12}>
                              12%
                            </option>

                            <option value={18}>
                              18%
                            </option>

                            <option value={28}>
                              28%
                            </option>
                          </select>

                        </td>

                        <td className="p-3 text-right text-sm font-bold text-slate-700">

                          {formatCurrency(
                            calculated?.total ||
                              0
                          )}

                        </td>

                        <td className="p-3">

                          <button
                            type="button"
                            disabled={
                              items.length === 1
                            }
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className="
                              flex h-8 w-8 items-center
                              justify-center rounded-lg
                              text-slate-400 hover:bg-red-50
                              hover:text-red-600
                              disabled:cursor-not-allowed
                              disabled:opacity-30
                            "
                          >
                            <Trash2 size={16} />
                          </button>

                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </section>

          {/* NOTES */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

            <h2 className="font-bold text-slate-800">
              Additional Information
            </h2>

            <div className="mt-5 space-y-5">

              <Field label="Notes">

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Any additional message for customer..."
                  className="input-style resize-none"
                />

              </Field>

              <Field label="Terms & Conditions">

                <textarea
                  value={terms}
                  onChange={(event) =>
                    setTerms(
                      event.target.value
                    )
                  }
                  rows={4}
                  className="input-style resize-none"
                />

              </Field>

            </div>
          </section>
        </div>

        {/* RIGHT SUMMARY */}

        <aside>

          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Calculator size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Quotation Summary
                </h2>

                <p className="text-xs text-slate-500">
                  Auto calculated
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-4">

              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  calculation.subtotal
                )}
              />

              {calculation.discount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`- ${formatCurrency(
                    calculation.discount
                  )}`}
                  green
                />
              )}

              <SummaryRow
                label="Taxable Amount"
                value={formatCurrency(
                  calculation.taxableAmount
                )}
              />

              {taxType === "inter" ? (
                <SummaryRow
                  label="IGST"
                  value={formatCurrency(
                    calculation.igst
                  )}
                />
              ) : (
                <>
                  <SummaryRow
                    label="CGST"
                    value={formatCurrency(
                      calculation.cgst
                    )}
                  />

                  <SummaryRow
                    label="SGST"
                    value={formatCurrency(
                      calculation.sgst
                    )}
                  />
                </>
              )}

              <SummaryRow
                label="Total Tax"
                value={formatCurrency(
                  calculation.totalTax
                )}
              />

              <div className="border-t border-slate-200 pt-5">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Grand Total
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {formatCurrency(
                    calculation.grandTotal
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={saveQuotation}
              className="
                mt-7 flex h-12 w-full
                items-center justify-center gap-2
                rounded-xl bg-blue-600
                text-sm font-semibold text-white
                hover:bg-blue-700
                disabled:opacity-60
              "
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <FileText size={17} />
              )}

              Save Quotation
            </button>
          </div>
        </aside>
      </div>

      {/* GLOBAL STYLES */}

      <style jsx global>{`
        .input-style {
          height: 44px;
          width: 100%;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 0 12px;
          font-size: 14px;
          color: #334155;
          outline: none;
          transition: 0.2s;
        }

        textarea.input-style {
          height: auto;
          padding-top: 12px;
        }

        .input-style:focus {
          border-color: #3b82f6;
          box-shadow:
            0 0 0 3px
            rgba(59, 130, 246, 0.1);
        }

        .table-input {
          height: 36px;
          border-radius: 7px;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 0 8px;
          font-size: 12px;
          outline: none;
        }

        .table-input:focus {
          border-color: #3b82f6;
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
   SUMMARY ROW
===================================================== */

function SummaryRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">

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
