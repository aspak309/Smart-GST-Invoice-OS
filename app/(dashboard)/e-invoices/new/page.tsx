"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "smart_gst_e_invoices";

type InvoiceItem = {
  id: string;
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
  gstRate: number;
};

export default function NewEInvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [placeOfSupply, setPlaceOfSupply] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: crypto.randomUUID(),
      description: "",
      hsn: "",
      quantity: 1,
      rate: 0,
      gstRate: 18,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        description: "",
        hsn: "",
        quantity: 1,
        rate: 0,
        gstRate: 18,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      alert("At least one item is required.");
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const calculations = useMemo(() => {
    const taxableAmount = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity) || 0) *
          (Number(item.rate) || 0),
      0
    );

    const gstAmount = items.reduce((sum, item) => {
      const itemAmount =
        (Number(item.quantity) || 0) *
        (Number(item.rate) || 0);

      return (
        sum +
        (itemAmount * (Number(item.gstRate) || 0)) /
          100
      );
    }, 0);

    return {
      taxableAmount,
      gstAmount,
      totalAmount: taxableAmount + gstAmount,
    };
  }, [items]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const generateIRN = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let result = "";

    for (let i = 0; i < 32; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return result;
  };

  const handleSave = () => {
    if (!invoiceNumber.trim()) {
      alert("Please enter invoice number.");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.description.trim() &&
        Number(item.quantity) > 0 &&
        Number(item.rate) > 0
    );

    if (validItems.length === 0) {
      alert(
        "Please add at least one valid invoice item."
      );
      return;
    }

    setSaving(true);

    try {
      const newInvoice = {
        id: `EINV-${Date.now()}`,
        invoiceNumber: invoiceNumber.trim(),
        customerName: customerName.trim(),
        customerGstin: customerGstin.trim(),
        date,
        placeOfSupply: placeOfSupply.trim(),

        irn: generateIRN(),

        items: validItems,

        taxableAmount: calculations.taxableAmount,
        gstAmount: calculations.gstAmount,
        totalAmount: calculations.totalAmount,

        status: "Generated",
        createdAt: new Date().toISOString(),
      };

      const stored = localStorage.getItem(STORAGE_KEY);

      let existingInvoices = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            existingInvoices = parsed;
          }
        } catch {
          existingInvoices = [];
        }
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          newInvoice,
          ...existingInvoices,
        ])
      );

      setSuccess(true);
    } catch (error) {
      console.error(
        "Failed to save E-Invoice:",
        error
      );

      alert(
        "Something went wrong while saving the E-Invoice."
      );
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-800">
            E-Invoice Generated!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your E-Invoice has been successfully saved
            with an IRN reference.
          </p>

          <Link
            href="/e-invoices"
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FileCheck2 size={18} />
            View E-Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-12">
      {/* BACK */}

      <Link
        href="/e-invoices"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Back to E-Invoices
      </Link>

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Create E-Invoice
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create a GST compliant electronic invoice.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Save size={18} />
          )}

          Generate E-Invoice
        </button>
      </div>

      <div className="space-y-6">

        {/* BASIC DETAILS */}

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Invoice Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Basic invoice information.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Invoice Number *
              </label>

              <input
                value={invoiceNumber}
                onChange={(e) =>
                  setInvoiceNumber(e.target.value)
                }
                placeholder="INV-001"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Invoice Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Place of Supply
              </label>

              <input
                value={placeOfSupply}
                onChange={(e) =>
                  setPlaceOfSupply(e.target.value)
                }
                placeholder="Punjab"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

          </div>
        </section>

        {/* CUSTOMER */}

        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Customer Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter recipient information.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Customer Name *
              </label>

              <input
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Customer / Business Name"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Customer GSTIN
              </label>

              <input
                value={customerGstin}
                maxLength={15}
                onChange={(e) =>
                  setCustomerGstin(
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Enter GSTIN"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none transition focus:border-blue-500"
              />
            </div>

          </div>
        </section>

        {/* ITEMS */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-bold text-slate-800">
                Invoice Items
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Add products or services.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              <Plus size={17} />
              Add Item
            </button>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {items.map((item, index) => {
              const itemTaxable =
                (Number(item.quantity) || 0) *
                (Number(item.rate) || 0);

              const itemGst =
                (itemTaxable *
                  (Number(item.gstRate) || 0)) /
                100;

              const itemTotal =
                itemTaxable + itemGst;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700">
                      Item {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50"
                      title="Remove Item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        DESCRIPTION *
                      </label>

                      <input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Product or service name"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        HSN / SAC
                      </label>

                      <input
                        value={item.hsn}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "hsn",
                            e.target.value
                          )
                        }
                        placeholder="HSN Code"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        QUANTITY
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        RATE
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "rate",
                            Number(e.target.value)
                          )
                        }
                        placeholder="0"
                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        GST RATE
                      </label>

                      <select
                        value={item.gstRate}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "gstRate",
                            Number(e.target.value)
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-500">
                        TAXABLE VALUE
                      </p>

                      <div className="flex h-11 items-center rounded-xl bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                        {formatCurrency(itemTaxable)}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-500">
                        ITEM TOTAL
                      </p>

                      <div className="flex h-11 items-center rounded-xl bg-blue-50 px-3 text-sm font-bold text-blue-700">
                        {formatCurrency(itemTotal)}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SUMMARY */}

        <section className="rounded-2xl bg-slate-900 p-5 text-white sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-medium text-slate-400">
                Invoice Summary
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Total Amount
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Taxable Amount
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(
                    calculations.taxableAmount
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  GST Amount
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(
                    calculations.gstAmount
                  )}
                </p>
              </div>

              <div className="sm:border-l sm:border-slate-700 sm:pl-5">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Grand Total
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(
                    calculations.totalAmount
                  )}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ACTIONS */}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

          <Link
            href="/e-invoices"
            className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            Generate E-Invoice
          </button>

        </div>
      </div>
    </div>
  );
      }
