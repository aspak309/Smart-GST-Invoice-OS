"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "smart_gst_credit_notes";

const GST_RATES = [0, 3, 5, 12, 18, 28];

type CreditNoteStatus = "Draft" | "Issued";

interface CreditNoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
}

export default function NewCreditNotePage() {
  const [noteNumber, setNoteNumber] = useState(
    `CN-${Date.now().toString().slice(-6)}`
  );

  const [customerName, setCustomerName] =
    useState("");

  const [customerGstin, setCustomerGstin] =
    useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [reason, setReason] = useState("");

  const [items, setItems] = useState<
    CreditNoteItem[]
  >([
    {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      rate: 0,
      gstRate: 18,
    },
  ]);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] =
    useState(false);

  const calculations = useMemo(() => {
    let taxableAmount = 0;
    let gstAmount = 0;

    items.forEach((item) => {
      const quantity =
        Number(item.quantity) || 0;

      const rate =
        Number(item.rate) || 0;

      const gstRate =
        Number(item.gstRate) || 0;

      const itemTaxable =
        quantity * rate;

      const itemGst =
        (itemTaxable * gstRate) / 100;

      taxableAmount += itemTaxable;
      gstAmount += itemGst;
    });

    return {
      taxableAmount,
      gstAmount,
      totalAmount:
        taxableAmount + gstAmount,
    };
  }, [items]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        rate: 0,
        gstRate: 18,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;

    setItems((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  };

  const updateItem = (
    id: string,
    field: keyof CreditNoteItem,
    value: string | number
  ) => {
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
  };

  const handleSave = (
    status: CreditNoteStatus
  ) => {
    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.description.trim() ||
        Number(item.rate) > 0
    );

    if (validItems.length === 0) {
      alert(
        "Please add at least one valid item."
      );
      return;
    }

    setSaving(true);

    try {
      const creditNote = {
        id: `CN-${Date.now()}`,
        noteNumber: noteNumber.trim(),
        customerName: customerName.trim(),
        customerGstin:
          customerGstin.trim(),
        date,
        reason: reason.trim(),
        taxableAmount:
          calculations.taxableAmount,
        gstAmount:
          calculations.gstAmount,
        totalAmount:
          calculations.totalAmount,
        status,
        items: validItems,
        createdAt:
          new Date().toISOString(),
      };

      const stored =
        localStorage.getItem(STORAGE_KEY);

      const existing = stored
        ? JSON.parse(stored)
        : [];

      const updated = [
        creditNote,
        ...(Array.isArray(existing)
          ? existing
          : []),
      ];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      setSuccess(true);
    } catch (error) {
      console.error(
        "Failed to save credit note:",
        error
      );

      alert(
        "Something went wrong while saving."
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
            Credit Note Saved!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your credit note has been successfully
            saved and is now available in the Credit
            Notes section.
          </p>

          <div className="mt-8">

            <Link
              href="/credit-notes"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <CreditCard size={18} />
              View Credit Notes
            </Link>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl pb-12">

      {/* BACK */}

      <Link
        href="/credit-notes"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Back to Credit Notes
      </Link>

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Create Credit Note
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create a credit note for returns, discounts
            or invoice adjustments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              handleSave("Draft")
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}
            Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              handleSave("Issued")
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <CheckCircle2 size={17} />
            Issue Credit Note
          </button>

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT SIDE */}

        <div className="space-y-6 lg:col-span-2">

          {/* BASIC DETAILS */}

          <section className="rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5 sm:p-6">

              <h2 className="font-bold text-slate-800">
                Credit Note Details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Enter the basic credit note information.
              </p>

            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Credit Note Number
                </label>

                <input
                  value={noteNumber}
                  onChange={(event) =>
                    setNoteNumber(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Credit Note Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer Name *
                </label>

                <input
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value
                    )
                  }
                  placeholder="Enter customer name"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer GSTIN
                </label>

                <input
                  value={customerGstin}
                  onChange={(event) =>
                    setCustomerGstin(
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="Enter GSTIN (optional)"
                  maxLength={15}
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none transition focus:border-blue-500"
                />

              </div>

              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Reason for Credit Note
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Example: Goods returned, discount adjustment..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />

              </div>

            </div>

          </section>

          {/* ITEMS */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">

              <div>
                <h2 className="font-bold text-slate-800">
                  Items
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add products or services being credited.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex h-9 items-center gap-2 rounded-lg bg-blue-50 px-3 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                <Plus size={15} />
                Add Item
              </button>

            </div>

            {/* DESKTOP ITEMS */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full min-w-[760px]">

                <thead className="bg-slate-50">

                  <tr className="text-left">

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      Description
                    </th>

                    <th className="w-24 px-3 py-3 text-xs font-semibold text-slate-500">
                      Qty
                    </th>

                    <th className="w-32 px-3 py-3 text-xs font-semibold text-slate-500">
                      Rate
                    </th>

                    <th className="w-28 px-3 py-3 text-xs font-semibold text-slate-500">
                      GST
                    </th>

                    <th className="w-36 px-3 py-3 text-right text-xs font-semibold text-slate-500">
                      Amount
                    </th>

                    <th className="w-14 px-3 py-3" />

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {items.map((item) => {

                    const itemAmount =
                      (Number(item.quantity) || 0) *
                      (Number(item.rate) || 0);

                    return (
                      <tr key={item.id}>

                        <td className="px-5 py-3">

                          <input
                            value={item.description}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Product / Service"
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                          />

                        </td>

                        <td className="px-3 py-3">

                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "quantity",
                                Number(
                                  event.target.value
                                )
                              )
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                          />

                        </td>

                        <td className="px-3 py-3">

                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "rate",
                                Number(
                                  event.target.value
                                )
                              )
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                          />

                        </td>

                        <td className="px-3 py-3">

                          <select
                            value={item.gstRate}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "gstRate",
                                Number(
                                  event.target.value
                                )
                              )
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-blue-500"
                          >
                            {GST_RATES.map((rate) => (
                              <option
                                key={rate}
                                value={rate}
                              >
                                {rate}%
                              </option>
                            ))}
                          </select>

                        </td>

                        <td className="px-3 py-3 text-right">

                          <span className="font-semibold text-slate-700">
                            {formatCurrency(
                              itemAmount
                            )}
                          </span>

                        </td>

                        <td className="px-3 py-3 text-center">

                          <button
                            type="button"
                            disabled={
                              items.length === 1
                            }
                            onClick={() =>
                              removeItem(item.id)
                            }
                            className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
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

            {/* MOBILE ITEMS */}

            <div className="space-y-4 p-5 md:hidden">

              {items.map((item, index) => {

                const itemAmount =
                  (Number(item.quantity) || 0) *
                  (Number(item.rate) || 0);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >

                    <div className="mb-4 flex items-center justify-between">

                      <span className="text-sm font-bold text-slate-600">
                        Item {index + 1}
                      </span>

                      <button
                        type="button"
                        disabled={
                          items.length === 1
                        }
                        onClick={() =>
                          removeItem(item.id)
                        }
                        className="text-red-500 disabled:opacity-30"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                    <input
                      value={item.description}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Product / Service"
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-3">

                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none"
                      />

                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "rate",
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none"
                      />

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <select
                        value={item.gstRate}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "gstRate",
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                      >
                        {GST_RATES.map((rate) => (
                          <option
                            key={rate}
                            value={rate}
                          >
                            GST {rate}%
                          </option>
                        ))}
                      </select>

                      <span className="font-bold text-slate-700">
                        {formatCurrency(
                          itemAmount
                        )}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>

        </div>

        {/* SUMMARY */}

        <aside>

          <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="bg-slate-900 p-6 text-white">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <IndianRupee size={21} />
                </div>

                <div>
                  <p className="font-bold">
                    Credit Summary
                  </p>

                  <p className="mt-1 text-xs text-slate-300">
                    Amount to be credited
                  </p>
                </div>

              </div>

              <p className="mt-7 text-3xl font-bold">
                {formatCurrency(
                  calculations.totalAmount
                )}
              </p>

            </div>

            <div className="divide-y divide-slate-100 p-2">

              <SummaryRow
                label="Taxable Amount"
                value={formatCurrency(
                  calculations.taxableAmount
                )}
              />

              <SummaryRow
                label="Total GST"
                value={formatCurrency(
                  calculations.gstAmount
                )}
              />

              <SummaryRow
                label="Total Credit"
                value={formatCurrency(
                  calculations.totalAmount
                )}
                highlight
              />

            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-5">

              <p className="text-xs leading-5 text-slate-500">
                Review all information carefully before
                issuing the credit note.
              </p>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

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
    <div className="flex items-center justify-between px-4 py-4">

      <span
        className={
          highlight
            ? "font-bold text-slate-800"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          highlight
            ? "font-bold text-blue-600"
            : "text-sm font-semibold text-slate-700"
        }
      >
        {value}
      </span>

    </div>
  );
        }
