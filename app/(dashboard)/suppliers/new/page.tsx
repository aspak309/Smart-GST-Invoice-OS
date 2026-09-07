"use client";

// app/(dashboard)/suppliers/new/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Save,
  User,
} from "lucide-react";

import {
  STORAGE_KEYS,
  getCollection,
} from "@/lib/storage";

/* =====================================================
   TYPES
===================================================== */

interface Supplier {
  id: string;
  name: string;
  businessName?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  openingBalance?: number;
  payableAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/* =====================================================
   INITIAL FORM
===================================================== */

const initialForm = {
  name: "",
  businessName: "",
  phone: "",
  email: "",
  gstin: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  openingBalance: "",
};

/* =====================================================
   PAGE
===================================================== */

export default function NewSupplierPage() {
  const router = useRouter();

  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  /* =============================================
     UPDATE FIELD
  ============================================= */

  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =============================================
     SAVE SUPPLIER
  ============================================= */

  function saveSupplier() {
    if (!form.name.trim()) {
      alert("Please enter supplier name.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter phone number.");
      return;
    }

    try {
      setSaving(true);

      const supplierKey =
        (STORAGE_KEYS as any).SUPPLIERS ||
        "smart_gst_suppliers";

      const existingSuppliers =
        getCollection<Supplier>(
          supplierKey
        );

      const openingBalance =
        Number(form.openingBalance) || 0;

      const newSupplier: Supplier = {
        id: crypto.randomUUID(),

        name: form.name.trim(),

        businessName:
          form.businessName.trim(),

        phone: form.phone.trim(),

        email: form.email.trim(),

        gstin:
          form.gstin.trim().toUpperCase(),

        address:
          form.address.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        pincode:
          form.pincode.trim(),

        openingBalance,

        /*
         payableAmount starts with opening balance.
         Later purchase bills can increase this amount.
        */
        payableAmount:
          openingBalance,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      const updatedSuppliers = [
        ...existingSuppliers,
        newSupplier,
      ];

      localStorage.setItem(
        supplierKey,
        JSON.stringify(updatedSuppliers)
      );

      router.push("/suppliers");
    } catch (error) {
      console.error(
        "Failed to save supplier:",
        error
      );

      alert(
        "Unable to save supplier. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto max-w-4xl pb-12">

      {/* =============================================
         HEADER
      ============================================= */}

      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <button
            onClick={() =>
              router.push("/suppliers")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Suppliers
          </button>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Add New Supplier
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add supplier details for purchase and
            payable management.
          </p>
        </div>

        <button
          onClick={saveSupplier}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save size={17} />
          )}

          Save Supplier
        </button>

      </div>

      <div className="space-y-6">

        {/* =============================================
           BASIC INFORMATION
        ============================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the primary supplier details.
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            {/* SUPPLIER NAME */}

            <Field
              label="Contact Person / Supplier Name"
              required
            >
              <input
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter supplier name"
                className="input-style"
              />
            </Field>

            {/* BUSINESS NAME */}

            <Field label="Business / Company Name">
              <input
                value={form.businessName}
                onChange={(event) =>
                  updateField(
                    "businessName",
                    event.target.value
                  )
                }
                placeholder="Enter business name"
                className="input-style"
              />
            </Field>

            {/* PHONE */}

            <Field
              label="Phone Number"
              required
            >
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="Enter phone number"
                className="input-style"
              />
            </Field>

            {/* EMAIL */}

            <Field label="Email Address">
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="supplier@example.com"
                className="input-style"
              />
            </Field>

          </div>

        </section>

        {/* =============================================
           GST INFORMATION
        ============================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                GST & Business Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Optional GST registration information.
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            {/* GSTIN */}

            <Field label="GSTIN">
              <input
                value={form.gstin}
                onChange={(event) =>
                  updateField(
                    "gstin",
                    event.target.value
                  )
                }
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className="input-style font-mono uppercase"
              />
            </Field>

            {/* OPENING BALANCE */}

            <Field label="Opening Payable Balance">
              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.openingBalance}
                  onChange={(event) =>
                    updateField(
                      "openingBalance",
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  className="input-style pl-9"
                />

              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Existing amount you need to pay
                this supplier.
              </p>
            </Field>

          </div>

        </section>

        {/* =============================================
           ADDRESS
        ============================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

          <h2 className="font-bold text-slate-800">
            Address Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Supplier business location information.
          </p>

          <div className="mt-6">

            <Field label="Address">
              <textarea
                rows={3}
                value={form.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                placeholder="Enter complete address"
                className="input-style resize-none py-3"
              />
            </Field>

          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">

            {/* CITY */}

            <Field label="City">
              <input
                value={form.city}
                onChange={(event) =>
                  updateField(
                    "city",
                    event.target.value
                  )
                }
                placeholder="City"
                className="input-style"
              />
            </Field>

            {/* STATE */}

            <Field label="State">
              <input
                value={form.state}
                onChange={(event) =>
                  updateField(
                    "state",
                    event.target.value
                  )
                }
                placeholder="State"
                className="input-style"
              />
            </Field>

            {/* PINCODE */}

            <Field label="Pincode">
              <input
                value={form.pincode}
                onChange={(event) =>
                  updateField(
                    "pincode",
                    event.target.value
                  )
                }
                placeholder="Pincode"
                className="input-style"
              />
            </Field>

          </div>

        </section>

        {/* =============================================
           BOTTOM ACTIONS
        ============================================= */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              router.push("/suppliers")
            }
            disabled={saving}
            className="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveSupplier}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            Save Supplier
          </button>

        </div>

      </div>

      {/* =============================================
         GLOBAL INPUT STYLE
      ============================================= */}

      <style jsx global>{`
        .input-style {
          width: 100%;
          min-height: 44px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding-left: 12px;
          padding-right: 12px;
          font-size: 14px;
          outline: none;
          background: white;
          transition: all 0.2s ease;
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
   FIELD COMPONENT
===================================================== */

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-semibold text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </span>

      {children}

    </label>
  );
    }
