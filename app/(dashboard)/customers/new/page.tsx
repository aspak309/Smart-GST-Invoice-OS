"use client";

// app/(dashboard)/customers/new/page.tsx

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Save,
  User,
} from "lucide-react";

import type { Customer } from "@/types";

import {
  STORAGE_KEYS,
  addItem,
} from "@/lib/storage";

/* =====================================================
   CONSTANTS
===================================================== */

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/* =====================================================
   FORM TYPE
===================================================== */

interface CustomerFormData {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  gstin: string;
  customerType: "registered" | "unregistered";
  state: string;
  address: string;
  pincode: string;
  openingBalance: string;
  notes: string;
}

/* =====================================================
   INITIAL FORM
===================================================== */

const initialFormData: CustomerFormData = {
  name: "",
  businessName: "",
  phone: "",
  email: "",
  gstin: "",
  customerType: "unregistered",
  state: "",
  address: "",
  pincode: "",
  openingBalance: "0",
  notes: "",
};

/* =====================================================
   GSTIN VALIDATION
===================================================== */

function validateGSTIN(gstin: string): boolean {
  if (!gstin) return true;

  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  return gstinRegex.test(
    gstin.toUpperCase()
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function NewCustomerPage() {
  const [formData, setFormData] =
    useState<CustomerFormData>(
      initialFormData
    );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  /* =============================================
     UPDATE FIELD
  ============================================= */

  function updateField(
    field: keyof CustomerFormData,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  }

  /* =============================================
     VALIDATE
  ============================================= */

  function validateForm(): boolean {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!formData.name.trim()) {
      newErrors.name =
        "Customer name is required";
    }

    if (
      formData.phone &&
      !/^[0-9]{10}$/.test(
        formData.phone.replace(/\s/g, "")
      )
    ) {
      newErrors.phone =
        "Enter a valid 10 digit mobile number";
    }

    if (
      formData.email &&
      !/^\S+@\S+\.\S+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (
      formData.customerType ===
        "registered" &&
      !formData.gstin
    ) {
      newErrors.gstin =
        "GSTIN is required for registered customer";
    }

    if (
      formData.gstin &&
      !validateGSTIN(formData.gstin)
    ) {
      newErrors.gstin =
        "Enter a valid GSTIN";
    }

    if (
      formData.pincode &&
      !/^[0-9]{6}$/.test(
        formData.pincode
      )
    ) {
      newErrors.pincode =
        "Enter a valid 6 digit pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  /* =============================================
     SUBMIT
  ============================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();

      const customer: Customer = {
        id: crypto.randomUUID(),

        name:
          formData.name.trim(),

        businessName:
          formData.businessName.trim(),

        phone:
          formData.phone.trim(),

        email:
          formData.email.trim(),

        gstin:
          formData.gstin
            .trim()
            .toUpperCase(),

        customerType:
          formData.customerType,

        state:
          formData.state,

        address:
          formData.address.trim(),

        pincode:
          formData.pincode.trim(),

        openingBalance:
          Number(
            formData.openingBalance
          ) || 0,

        notes:
          formData.notes.trim(),

        createdAt: now,

        updatedAt: now,
      };

      addItem(
        STORAGE_KEYS.CUSTOMERS,
        customer
      );

      setSuccess(true);

      setTimeout(() => {
        window.location.href =
          "/customers";
      }, 1200);
    } catch (error) {
      console.error(
        "Failed to save customer:",
        error
      );

      alert(
        "Unable to save customer. Please try again."
      );

      setSaving(false);
    }
  }

  /* =============================================
     SUCCESS SCREEN
  ============================================= */

  if (success) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Customer Added Successfully!
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Redirecting you to customers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="mb-7">
        <Link
          href="/customers"
          className="
            mb-4 inline-flex items-center gap-2
            text-sm font-medium text-slate-500
            transition-colors hover:text-blue-600
          "
        >
          <ArrowLeft size={17} />
          Back to Customers
        </Link>

        <p className="mb-1 text-sm font-medium text-blue-600">
          BUSINESS PARTIES
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Add New Customer
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a customer profile for invoices
          and payment tracking.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* =========================================
            BASIC INFORMATION
        ========================================= */}

        <FormSection
          icon={<User size={20} />}
          title="Basic Information"
          description="Enter customer and business details"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Customer Name"
              required
              error={errors.name}
            >
              <input
                value={formData.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter customer name"
                className={inputClass(
                  Boolean(errors.name)
                )}
              />
            </FormField>

            <FormField label="Business Name">
              <input
                value={
                  formData.businessName
                }
                onChange={(event) =>
                  updateField(
                    "businessName",
                    event.target.value
                  )
                }
                placeholder="Optional business name"
                className={inputClass(false)}
              />
            </FormField>

            <FormField
              label="Mobile Number"
              error={errors.phone}
            >
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="10 digit mobile number"
                className={inputClass(
                  Boolean(errors.phone)
                )}
              />
            </FormField>

            <FormField
              label="Email Address"
              error={errors.email}
            >
              <input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="customer@email.com"
                className={inputClass(
                  Boolean(errors.email)
                )}
              />
            </FormField>
          </div>
        </FormSection>

        {/* =========================================
            GST DETAILS
        ========================================= */}

        <FormSection
          icon={<Building2 size={20} />}
          title="GST & Tax Details"
          description="Add GST registration information"
        >
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Customer Type
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <CustomerTypeOption
                title="Registered Customer"
                description="Customer has GSTIN"
                active={
                  formData.customerType ===
                  "registered"
                }
                onClick={() =>
                  updateField(
                    "customerType",
                    "registered"
                  )
                }
              />

              <CustomerTypeOption
                title="Unregistered Customer"
                description="Customer does not have GSTIN"
                active={
                  formData.customerType ===
                  "unregistered"
                }
                onClick={() =>
                  updateField(
                    "customerType",
                    "unregistered"
                  )
                }
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="GSTIN"
              required={
                formData.customerType ===
                "registered"
              }
              error={errors.gstin}
            >
              <input
                value={formData.gstin}
                onChange={(event) =>
                  updateField(
                    "gstin",
                    event.target.value
                      .toUpperCase()
                      .replace(/\s/g, "")
                  )
                }
                maxLength={15}
                placeholder="22AAAAA0000A1Z5"
                className={`${inputClass(
                  Boolean(errors.gstin)
                )} uppercase font-mono`}
              />
            </FormField>

            <FormField label="State">
              <select
                value={formData.state}
                onChange={(event) =>
                  updateField(
                    "state",
                    event.target.value
                  )
                }
                className={inputClass(false)}
              >
                <option value="">
                  Select State
                </option>

                {INDIAN_STATES.map(
                  (state) => (
                    <option
                      key={state}
                      value={state}
                    >
                      {state}
                    </option>
                  )
                )}
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* =========================================
            ADDRESS
        ========================================= */}

        <FormSection
          icon={<MapPin size={20} />}
          title="Billing Address"
          description="Customer billing location"
        >
          <div className="grid gap-5">
            <FormField label="Address">
              <textarea
                value={formData.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                rows={3}
                placeholder="House number, street, area..."
                className={`${inputClass(
                  false
                )} resize-none py-3`}
              />
            </FormField>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Pincode"
                error={errors.pincode}
              >
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(event) =>
                    updateField(
                      "pincode",
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter pincode"
                  className={inputClass(
                    Boolean(errors.pincode)
                  )}
                />
              </FormField>

              <FormField label="Opening Balance">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      formData.openingBalance
                    }
                    onChange={(event) =>
                      updateField(
                        "openingBalance",
                        event.target.value
                      )
                    }
                    className={`${inputClass(
                      false
                    )} pl-8`}
                  />
                </div>
              </FormField>
            </div>
          </div>
        </FormSection>

        {/* =========================================
            NOTES
        ========================================= */}

        <FormSection
          title="Additional Notes"
          description="Optional internal notes about this customer"
        >
          <FormField label="Notes">
            <textarea
              value={formData.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Any additional information..."
              className={`${inputClass(
                false
              )} resize-none py-3`}
            />
          </FormField>
        </FormSection>

        {/* =========================================
            ACTIONS
        ========================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/customers"
            className="
              inline-flex h-11 items-center
              justify-center rounded-xl
              border border-slate-200 px-5
              text-sm font-semibold text-slate-700
              hover:bg-slate-50
            "
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex h-11 items-center
              justify-center gap-2 rounded-xl
              bg-blue-600 px-5
              text-sm font-semibold text-white
              shadow-sm transition-all
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =====================================================
   FORM SECTION
===================================================== */

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {icon}
            </div>
          )}

          <div>
            <h2 className="font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =====================================================
   CUSTOMER TYPE OPTION
===================================================== */

function CustomerTypeOption({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl border p-4 text-left
        transition-all
        ${
          active
            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
            : "border-slate-200 bg-white hover:border-slate-300"
        }
      `}
    >
      <p
        className={`
          text-sm font-semibold
          ${
            active
              ? "text-blue-700"
              : "text-slate-800"
          }
        `}
      >
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </button>
  );
}

/* =====================================================
   INPUT STYLES
===================================================== */

function inputClass(hasError: boolean) {
  return `
    h-11 w-full rounded-lg border
    ${
      hasError
        ? "border-red-400 bg-red-50"
        : "border-slate-200 bg-white"
    }
    px-3 text-sm text-slate-800
    outline-none transition-all
    placeholder:text-slate-400
    focus:border-blue-500
    focus:ring-4
    focus:ring-blue-50
  `;
      }
