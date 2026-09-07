"use client";

// app/(dashboard)/invoices/[id]/edit/page.tsx

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  STORAGE_KEYS,
  getCollection,
} from "@/lib/storage";

/* =====================================================
   TYPES
===================================================== */

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  state?: string;
}

interface Product {
  id: string;
  name: string;
  hsnSac?: string;
  price?: number;
  sellingPrice?: number;
  gstRate?: number;
  unit?: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  rate: number;
  gstRate: number;
  discountPercent?: number;
  taxableAmount?: number;
  gstAmount?: number;
  total?: number;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  customer?: Customer;
  invoiceDate?: string;
  dueDate?: string;
  placeOfSupply?: string;
  taxType?: "intra" | "inter";
  items?: InvoiceItem[];
  subtotal?: number;
  discount?: number;
  taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalTax?: number;
  grandTotal?: number;
  paidAmount?: number;
  status?: string;
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
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function createEmptyItem(): InvoiceItem {
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

/* =====================================================
   PAGE
===================================================== */

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();

  const invoiceId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [invoice, setInvoice] =
    useState<Invoice | null>(null);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [customerId, setCustomerId] =
    useState("");

  const [invoiceDate, setInvoiceDate] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [placeOfSupply, setPlaceOfSupply] =
    useState("");

  const [taxType, setTaxType] =
    useState<"intra" | "inter">("intra");

  const [items, setItems] =
    useState<InvoiceItem[]>([]);

  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  /* =============================================
     LOAD DATA
  ============================================= */

  useEffect(() => {
    try {
      const invoices =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      const foundInvoice =
        invoices.find(
          (item) => item.id === invoiceId
        );

      const customerData =
        getCollection<Customer>(
          STORAGE_KEYS.CUSTOMERS
        );

      const productData =
        getCollection<Product>(
          STORAGE_KEYS.PRODUCTS
        );

      setCustomers(customerData);
      setProducts(productData);

      if (!foundInvoice) {
        setInvoice(null);
        return;
      }

      setInvoice(foundInvoice);

      setCustomerId(
        foundInvoice.customerId || ""
      );

      setInvoiceDate(
        foundInvoice.invoiceDate || ""
      );

      setDueDate(
        foundInvoice.dueDate || ""
      );

      setPlaceOfSupply(
        foundInvoice.placeOfSupply || ""
      );

      setTaxType(
        foundInvoice.taxType || "intra"
      );

      setItems(
        foundInvoice.items?.length
          ? foundInvoice.items
          : [createEmptyItem()]
      );

      setNotes(foundInvoice.notes || "");
      setTerms(foundInvoice.terms || "");
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
     CALCULATIONS
  ============================================= */

  const calculation = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let taxableAmount = 0;
    let totalTax = 0;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const calculatedItems = items.map(
      (item) => {
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
          taxable * (gstRate / 100);

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
          total: taxable + gstAmount,
        };
      }
    );

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
  }, [items, taxType]);

  /* =============================================
     ITEM FUNCTIONS
  ============================================= */

  function addItem() {
    setItems((previous) => [
      ...previous,
      createEmptyItem(),
    ]);
  }

  function removeItem(id: string) {
    if (items.length <= 1) return;

    setItems((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  }

  function updateItem(
    id: string,
    field: keyof InvoiceItem,
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

  function selectProduct(
    itemId: string,
    productId: string
  ) {
    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) return;

    setItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: product.name,
              hsnSac:
                product.hsnSac || "",
              rate: safeNumber(
                product.sellingPrice ??
                  product.price
              ),
              gstRate:
                safeNumber(
                  product.gstRate
                ) || 18,
              unit:
                product.unit || "PCS",
            }
          : item
      )
    );
  }

  /* =============================================
     SAVE
  ============================================= */

  function saveChanges() {
    if (!invoice) return;

    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        safeNumber(item.quantity) <= 0
    );

    if (invalidItem) {
      alert(
        "Please enter valid item details."
      );
      return;
    }

    try {
      setSaving(true);

      const selectedCustomer =
        customers.find(
          (customer) =>
            customer.id === customerId
        );

      const invoices =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      const updatedInvoice: Invoice = {
        ...invoice,

        customerId,

        customerName:
          selectedCustomer?.name ||
          invoice.customerName,

        customer: selectedCustomer,

        invoiceDate,
        dueDate,
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

        notes,
        terms,

        updatedAt:
          new Date().toISOString(),
      };

      const updatedInvoices =
        invoices.map((item) =>
          item.id === invoice.id
            ? updatedInvoice
            : item
        );

      localStorage.setItem(
        STORAGE_KEYS.INVOICES,
        JSON.stringify(updatedInvoices)
      );

      router.push(
        `/invoices/${invoice.id}`
      );
    } catch (error) {
      console.error(
        "Failed to update invoice:",
        error
      );

      alert(
        "Unable to update invoice."
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

  /* =============================================
     NOT FOUND
  ============================================= */

  if (!invoice) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
        <h1 className="text-xl font-bold text-slate-800">
          Invoice not found
        </h1>

        <button
          onClick={() =>
            router.push("/invoices")
          }
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Invoices
        </button>
      </div>
    );
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
            onClick={() =>
              router.push(
                `/invoices/${invoice.id}`
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Invoice
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            Edit Invoice
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {invoice.invoiceNumber ||
              "Update invoice details"}
          </p>
        </div>

        <button
          disabled={saving}
          onClick={saveChanges}
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

          Save Changes
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* LEFT */}

        <div className="space-y-6">

          {/* CUSTOMER */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

            <h2 className="font-bold text-slate-800">
              Customer & Invoice Details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <Field label="Customer">
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
                    Select Customer
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

              <Field label="Invoice Date">
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(event) =>
                    setInvoiceDate(
                      event.target.value
                    )
                  }
                  className="input-style"
                />
              </Field>

              <Field label="Due Date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  className="input-style"
                />
              </Field>

            </div>
          </section>

          {/* GST TYPE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

            <h2 className="font-bold text-slate-800">
              GST Calculation Type
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setTaxType("intra")
                }
                className={`rounded-xl border p-4 text-left ${
                  taxType === "intra"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <p className="font-bold text-slate-800">
                  Intra-State
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  CGST + SGST
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setTaxType("inter")
                }
                className={`rounded-xl border p-4 text-left ${
                  taxType === "inter"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <p className="font-bold text-slate-800">
                  Inter-State
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  IGST
                </p>
              </button>

            </div>
          </section>

          {/* ITEMS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-7">

              <div>
                <h2 className="font-bold text-slate-800">
                  Items & Services
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Edit invoice products
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-[10px] font-bold uppercase text-slate-400">
                      Item
                    </th>
                    <th className="p-3 text-center text-[10px] font-bold uppercase text-slate-400">
                      HSN
                    </th>
                    <th className="p-3 text-center text-[10px] font-bold uppercase text-slate-400">
                      Qty
                    </th>
                    <th className="p-3 text-right text-[10px] font-bold uppercase text-slate-400">
                      Rate
                    </th>
                    <th className="p-3 text-center text-[10px] font-bold uppercase text-slate-400">
                      GST
                    </th>
                    <th className="p-3 text-right text-[10px] font-bold uppercase text-slate-400">
                      Total
                    </th>
                    <th />
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

                          <select
                            defaultValue=""
                            onChange={(event) => {
                              if (
                                event.target.value
                              ) {
                                selectProduct(
                                  item.id,
                                  event.target.value
                                );
                              }
                            }}
                            className="table-input mb-2 w-full"
                          >
                            <option value="">
                              Select saved product
                            </option>

                            {products.map(
                              (product) => (
                                <option
                                  key={product.id}
                                  value={product.id}
                                >
                                  {product.name}
                                </option>
                              )
                            )}
                          </select>

                          <input
                            value={item.name}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="Item name"
                            className="table-input w-full"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            value={
                              item.hsnSac || ""
                            }
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "hsnSac",
                                event.target.value
                              )
                            }
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
                            className="table-input w-20"
                          >
                            {[0, 5, 12, 18, 28].map(
                              (rate) => (
                                <option
                                  key={rate}
                                  value={rate}
                                >
                                  {rate}%
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td className="p-3 text-right text-sm font-bold text-slate-700">
                          {formatCurrency(
                            calculated?.total || 0
                          )}
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.id)
                            }
                            disabled={
                              items.length === 1
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
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
              Additional Details
            </h2>

            <div className="mt-5 space-y-5">

              <Field label="Notes">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  className="input-style resize-none"
                />
              </Field>

              <Field label="Terms & Conditions">
                <textarea
                  rows={4}
                  value={terms}
                  onChange={(event) =>
                    setTerms(event.target.value)
                  }
                  className="input-style resize-none"
                />
              </Field>

            </div>
          </section>

        </div>

        {/* SUMMARY */}

        <aside>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="font-bold text-slate-800">
              Updated Summary
            </h2>

            <div className="mt-6 space-y-4">

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
              disabled={saving}
              onClick={saveChanges}
              className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              Save Changes
            </button>
          </div>
        </aside>

      </div>

      <style jsx global>{`
        .input-style {
          width: 100%;
          min-height: 44px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        textarea.input-style {
          padding-top: 12px;
        }

        .input-style:focus,
        .table-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px
            rgba(59, 130, 246, 0.1);
        }

        .table-input {
          height: 36px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          padding: 0 8px;
          font-size: 12px;
          outline: none;
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}
