"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Truck,
} from "lucide-react";

const STORAGE_KEY = "smart_gst_eway_bills";

type EWayBillStatus = "Active" | "Cancelled";

export default function NewEWayBillPage() {
  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [partyName, setPartyName] = useState("");
  const [partyGstin, setPartyGstin] = useState("");

  const [fromPlace, setFromPlace] = useState("");
  const [fromPincode, setFromPincode] = useState("");

  const [toPlace, setToPlace] = useState("");
  const [toPincode, setToPincode] = useState("");

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [transportName, setTransportName] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [validUntil, setValidUntil] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const formattedAmount = useMemo(() => {
    const amount = Number(totalAmount) || 0;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  }, [totalAmount]);

  const handleSave = (status: EWayBillStatus) => {
    if (!ewayBillNumber.trim()) {
      alert("Please enter E-Way Bill Number.");
      return;
    }

    if (!partyName.trim()) {
      alert("Please enter party name.");
      return;
    }

    if (!fromPlace.trim() || !toPlace.trim()) {
      alert("Please enter dispatch and delivery locations.");
      return;
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      alert("Please enter a valid goods value.");
      return;
    }

    setSaving(true);

    try {
      const newBill = {
        id: `EWB-${Date.now()}`,
        ewayBillNumber: ewayBillNumber.trim(),
        invoiceNumber: invoiceNumber.trim(),
        partyName: partyName.trim(),
        partyGstin: partyGstin.trim(),

        fromPlace: fromPlace.trim(),
        fromPincode: fromPincode.trim(),

        toPlace: toPlace.trim(),
        toPincode: toPincode.trim(),

        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        transportName: transportName.trim(),

        date,
        validUntil,
        totalAmount: Number(totalAmount),
        status,
        createdAt: new Date().toISOString(),
      };

      const stored = localStorage.getItem(STORAGE_KEY);

      let existingBills = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            existingBills = parsed;
          }
        } catch {
          existingBills = [];
        }
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([newBill, ...existingBills])
      );

      setSuccess(true);
    } catch (error) {
      console.error("Failed to save E-Way Bill:", error);
      alert("Something went wrong while saving.");
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
            E-Way Bill Saved!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your E-Way Bill record has been successfully saved.
          </p>

          <Link
            href="/eway-bills"
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Truck size={18} />
            View E-Way Bills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-12">

      <Link
        href="/eway-bills"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Back to E-Way Bills
      </Link>

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Create E-Way Bill
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add transportation and goods movement details.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("Active")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            Save E-Way Bill
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* BASIC DETAILS */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Basic Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter E-Way Bill and invoice information.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                E-Way Bill Number *
              </label>

              <input
                value={ewayBillNumber}
                onChange={(e) =>
                  setEwayBillNumber(e.target.value)
                }
                placeholder="Enter E-Way Bill Number"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Invoice Number
              </label>

              <input
                value={invoiceNumber}
                onChange={(e) =>
                  setInvoiceNumber(e.target.value)
                }
                placeholder="Related invoice number"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                E-Way Bill Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Valid Until
              </label>

              <input
                type="date"
                value={validUntil}
                onChange={(e) =>
                  setValidUntil(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

          </div>
        </section>

        {/* PARTY DETAILS */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Party Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter recipient or supplier information.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Party Name *
              </label>

              <input
                value={partyName}
                onChange={(e) =>
                  setPartyName(e.target.value)
                }
                placeholder="Enter party name"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Party GSTIN
              </label>

              <input
                value={partyGstin}
                maxLength={15}
                onChange={(e) =>
                  setPartyGstin(
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Enter GSTIN"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none transition focus:border-blue-500"
              />
            </div>

          </div>
        </section>

        {/* MOVEMENT */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Goods Movement
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter dispatch and delivery locations.
            </p>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-2 sm:p-6">

            {/* FROM */}

            <div className="rounded-xl border border-slate-200 p-4">

              <h3 className="mb-4 text-sm font-bold text-blue-600">
                Dispatch From
              </h3>

              <div className="space-y-4">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Place *
                  </label>

                  <input
                    value={fromPlace}
                    onChange={(e) =>
                      setFromPlace(e.target.value)
                    }
                    placeholder="City / Location"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Pincode
                  </label>

                  <input
                    value={fromPincode}
                    maxLength={6}
                    onChange={(e) =>
                      setFromPincode(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="Pincode"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

              </div>
            </div>

            {/* TO */}

            <div className="rounded-xl border border-slate-200 p-4">

              <h3 className="mb-4 text-sm font-bold text-emerald-600">
                Deliver To
              </h3>

              <div className="space-y-4">

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Place *
                  </label>

                  <input
                    value={toPlace}
                    onChange={(e) =>
                      setToPlace(e.target.value)
                    }
                    placeholder="City / Location"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Pincode
                  </label>

                  <input
                    value={toPincode}
                    maxLength={6}
                    onChange={(e) =>
                      setToPincode(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="Pincode"
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* TRANSPORT */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Transportation Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Vehicle and transporter information.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Vehicle Number
              </label>

              <input
                value={vehicleNumber}
                onChange={(e) =>
                  setVehicleNumber(
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="PB10AB1234"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm uppercase outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Transporter Name
              </label>

              <input
                value={transportName}
                onChange={(e) =>
                  setTransportName(e.target.value)
                }
                placeholder="Enter transporter name"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

          </div>
        </section>

        {/* GOODS VALUE */}

        <section className="rounded-2xl border border-slate-200 bg-white">

          <div className="p-5 sm:p-6">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>
                <h2 className="font-bold text-slate-800">
                  Goods Value
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Total value of goods being transported.
                </p>
              </div>

              <div className="w-full sm:w-72">

                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  TOTAL GOODS VALUE *
                </label>

                <input
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(e) =>
                    setTotalAmount(e.target.value)
                  }
                  placeholder="0.00"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-lg font-bold outline-none transition focus:border-blue-500"
                />

              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-900 p-5">

              <p className="text-xs font-medium text-slate-300">
                TOTAL GOODS VALUE
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {formattedAmount}
              </p>

            </div>

          </div>
        </section>

        {/* BOTTOM BUTTON */}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

          <Link
            href="/eway-bills"
            className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave("Active")}
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

            Save E-Way Bill
          </button>

        </div>

      </div>
    </div>
  );
}
