"use client";

// app/(dashboard)/customers/[id]/page.tsx

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  Building2,
  Edit3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  User,
  Wallet,
} from "lucide-react";

import type {
  Customer,
  Invoice,
} from "@/types";

import {
  STORAGE_KEYS,
  getCollection,
  getItem,
  updateItem,
  removeItem,
} from "@/lib/storage";

import {
  formatCurrency,
  formatReadableDate,
  formatStatus,
} from "@/lib/format-utils";

/* =====================================================
   TYPES
===================================================== */

interface CustomerPageProps {
  params: {
    id: string;
  };
}

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
   HELPERS
===================================================== */

function getInitials(name?: string) {
  if (!name) return "C";

  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function safeNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

/* =====================================================
   PAGE
===================================================== */

export default function CustomerDetailsPage({
  params,
}: CustomerPageProps) {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [notFound, setNotFound] =
    useState(false);

  const [formData, setFormData] =
    useState<CustomerFormData>({
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
    });

  /* =============================================
     LOAD DATA
  ============================================= */

  useEffect(() => {
    loadCustomer();
  }, [params.id]);

  function loadCustomer() {
    try {
      const foundCustomer =
        getItem<Customer>(
          STORAGE_KEYS.CUSTOMERS,
          params.id
        );

      if (!foundCustomer) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const allInvoices =
        getCollection<Invoice>(
          STORAGE_KEYS.INVOICES
        );

      const customerInvoices =
        allInvoices.filter(
          (invoice) =>
            invoice.customerId ===
            foundCustomer.id
        );

      setCustomer(foundCustomer);
      setInvoices(customerInvoices);

      setFormData({
        name: foundCustomer.name || "",
        businessName:
          foundCustomer.businessName || "",
        phone: foundCustomer.phone || "",
        email: foundCustomer.email || "",
        gstin: foundCustomer.gstin || "",
        customerType:
          foundCustomer.customerType ||
          "unregistered",
        state: foundCustomer.state || "",
        address:
          foundCustomer.address || "",
        pincode:
          foundCustomer.pincode || "",
        openingBalance: String(
          foundCustomer.openingBalance || 0
        ),
        notes: foundCustomer.notes || "",
      });
    } catch (error) {
      console.error(
        "Failed to load customer:",
        error
      );

      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  /* =============================================
     CALCULATIONS
  ============================================= */

  const customerStats = useMemo(() => {
    const totalSales = invoices.reduce(
      (total, invoice) =>
        total +
        safeNumber(
          invoice.totals?.grandTotal
        ),
      0
    );

    const totalPending = invoices.reduce(
      (total, invoice) =>
        total +
        safeNumber(
          invoice.pendingAmount
        ),
      0
    );

    const totalPaid =
      totalSales - totalPending;

    return {
      totalInvoices: invoices.length,
      totalSales,
      totalPending,
      totalPaid,
    };
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      )
      .slice(0, 8);
  }, [invoices]);

  /* =============================================
     FORM UPDATE
  ============================================= */

  function updateField(
    field: keyof CustomerFormData,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =============================================
     SAVE CUSTOMER
  ============================================= */

  function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!customer?.name) return;

    if (!formData.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    setSaving(true);

    try {
      const updatedCustomer: Customer = {
        ...customer,

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

        updatedAt:
          new Date().toISOString(),
      };

      updateItem(
        STORAGE_KEYS.CUSTOMERS,
        customer.id,
        updatedCustomer
      );

      setCustomer(updatedCustomer);
      setEditing(false);
    } catch (error) {
      console.error(
        "Failed to update customer:",
        error
      );

      alert(
        "Unable to update customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =============================================
     DELETE CUSTOMER
  ============================================= */

  function handleDelete() {
    if (!customer) return;

    try {
      removeItem(
        STORAGE_KEYS.CUSTOMERS,
        customer.id
      );

      window.location.href =
        "/customers";
    } catch (error) {
      console.error(
        "Failed to delete customer:",
        error
      );

      alert(
        "Unable to delete customer."
      );
    }
  }

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return <CustomerDetailsSkeleton />;
  }

  /* =============================================
     NOT FOUND
  ============================================= */

  if (notFound || !customer) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <User size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Customer Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This customer may have been deleted.
          </p>

          <Link
            href="/customers"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft size={17} />
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* =========================================
          BACK + ACTIONS
      ========================================= */}

      <div className="flex items-center justify-between gap-4">
        <Link
          href="/customers"
          className="
            inline-flex items-center gap-2
            text-sm font-medium text-slate-500
            hover:text-blue-600
          "
        >
          <ArrowLeft size={17} />
          Back to Customers
        </Link>

        {!editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setShowDeleteModal(true)
              }
              className="
                flex h-10 w-10 items-center
                justify-center rounded-lg
                border border-red-100
                text-red-500
                hover:bg-red-50
              "
            >
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="
                inline-flex h-10 items-center
                gap-2 rounded-lg
                bg-blue-600 px-4
                text-sm font-semibold
                text-white hover:bg-blue-700
              "
            >
              <Edit3 size={16} />
              Edit Customer
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              setEditing(false)
            }
            className="
              rounded-lg border border-slate-200
              px-4 py-2 text-sm font-semibold
              text-slate-600 hover:bg-slate-50
            "
          >
            Cancel
          </button>
        )}
      </div>

      {/* =========================================
          PROFILE HEADER
      ========================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-xl font-bold text-white shadow-md">
                {getInitials(customer.name)}
              </div>

              <div className="pb-1">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {customer.name}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {customer.businessName ||
                    "Individual Customer"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <span
                className={`
                  rounded-full px-3 py-1.5
                  text-xs font-semibold
                  ${
                    customer.customerType ===
                    "registered"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }
                `}
              >
                {customer.customerType ===
                "registered"
                  ? "GST Registered"
                  : "Unregistered"}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={<Phone size={16} />}
              label="Mobile"
              value={
                customer.phone || "Not added"
              }
            />

            <InfoItem
              icon={<Mail size={16} />}
              label="Email"
              value={
                customer.email || "Not added"
              }
            />

            <InfoItem
              icon={<Building2 size={16} />}
              label="GSTIN"
              value={
                customer.gstin ||
                "Unregistered"
              }
            />

            <InfoItem
              icon={<MapPin size={16} />}
              label="State"
              value={
                customer.state || "Not added"
              }
            />
          </div>
        </div>
      </section>

      {/* =========================================
          EDIT FORM
      ========================================= */}

      {editing ? (
        <form
          onSubmit={handleSave}
          className="space-y-6"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Edit Customer Details
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormInput
                label="Customer Name"
                required
                value={formData.name}
                onChange={(value) =>
                  updateField("name", value)
                }
              />

              <FormInput
                label="Business Name"
                value={
                  formData.businessName
                }
                onChange={(value) =>
                  updateField(
                    "businessName",
                    value
                  )
                }
              />

              <FormInput
                label="Mobile Number"
                value={formData.phone}
                onChange={(value) =>
                  updateField("phone", value)
                }
              />

              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) =>
                  updateField("email", value)
                }
              />

              <FormInput
                label="GSTIN"
                value={formData.gstin}
                onChange={(value) =>
                  updateField("gstin", value)
                }
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Customer Type
                </label>

                <select
                  value={
                    formData.customerType
                  }
                  onChange={(event) =>
                    updateField(
                      "customerType",
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="registered">
                    Registered
                  </option>

                  <option value="unregistered">
                    Unregistered
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  State
                </label>

                <select
                  value={formData.state}
                  onChange={(event) =>
                    updateField(
                      "state",
                      event.target.value
                    )
                  }
                  className={inputClass}
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
              </div>

              <FormInput
                label="Pincode"
                value={formData.pincode}
                onChange={(value) =>
                  updateField(
                    "pincode",
                    value
                  )
                }
              />

              <FormInput
                label="Opening Balance"
                type="number"
                value={
                  formData.openingBalance
                }
                onChange={(value) =>
                  updateField(
                    "openingBalance",
                    value
                  )
                }
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Billing Address
              </label>

              <textarea
                rows={3}
                value={formData.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                className={`${inputClass} h-auto resize-none py-3`}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>

              <textarea
                rows={3}
                value={formData.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                className={`${inputClass} h-auto resize-none py-3`}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() =>
                  setEditing(false)
                }
                className="
                  rounded-lg border border-slate-200
                  px-4 py-2.5 text-sm font-semibold
                  text-slate-700 hover:bg-slate-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="
                  inline-flex items-center gap-2
                  rounded-lg bg-blue-600
                  px-5 py-2.5 text-sm font-semibold
                  text-white hover:bg-blue-700
                  disabled:opacity-70
                "
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      ) : (
        <>
          {/* =====================================
              STATS
          ===================================== */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CustomerStatCard
              title="Total Invoices"
              value={String(
                customerStats.totalInvoices
              )}
              description="Invoices created"
              icon={<FileText size={20} />}
            />

            <CustomerStatCard
              title="Total Business"
              value={formatCurrency(
                customerStats.totalSales
              )}
              description="Total invoiced amount"
              icon={<Building2 size={20} />}
            />

            <CustomerStatCard
              title="Amount Received"
              value={formatCurrency(
                customerStats.totalPaid
              )}
              description="Payments received"
              icon={<Wallet size={20} />}
            />

            <CustomerStatCard
              title="Outstanding"
              value={formatCurrency(
                customerStats.totalPending
              )}
              description="Pending payment"
              icon={<Wallet size={20} />}
              warning={
                customerStats.totalPending > 0
              }
            />
          </section>

          {/* =====================================
              ADDRESS + NOTES
          ===================================== */}

          <section className="grid gap-6 lg:grid-cols-2">
            <InfoCard
              title="Billing Address"
              icon={<MapPin size={19} />}
            >
              {customer.address ? (
                <div className="text-sm leading-7 text-slate-600">
                  <p>{customer.address}</p>

                  {customer.pincode && (
                    <p>
                      Pincode: {customer.pincode}
                    </p>
                  )}

                  {customer.state && (
                    <p>
                      {customer.state}
                    </p>
                  )}
                </div>
              ) : (
                <EmptyInfo>
                  No billing address added.
                </EmptyInfo>
              )}
            </InfoCard>

            <InfoCard
              title="Internal Notes"
              icon={<FileText size={19} />}
            >
              {customer.notes ? (
                <p className="text-sm leading-7 text-slate-600">
                  {customer.notes}
                </p>
              ) : (
                <EmptyInfo>
                  No additional notes.
                </EmptyInfo>
              )}
            </InfoCard>
          </section>

          {/* =====================================
              INVOICE HISTORY
          ===================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Invoice History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recent transactions with this customer
                </p>
              </div>

              <Link
                href="/sales/invoices/new"
                className="
                  rounded-lg bg-blue-600
                  px-3 py-2 text-xs
                  font-semibold text-white
                  hover:bg-blue-700
                "
              >
                Create Invoice
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center px-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <FileText size={22} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-700">
                  No invoices yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Invoices created for this customer
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentInvoices.map(
                  (invoice) => (
                    <InvoiceHistoryRow
                      key={invoice.id}
                      invoice={invoice}
                    />
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Delete Customer?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800">
                {customer.name}
              </strong>
              ? Existing invoices will not be deleted.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="
                  rounded-lg border border-slate-200
                  px-4 py-2.5 text-sm font-semibold
                  text-slate-700
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="
                  rounded-lg bg-red-600
                  px-4 py-2.5 text-sm font-semibold
                  text-white hover:bg-red-700
                "
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SMALL COMPONENTS
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
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function CustomerStatCard({
  title,
  value,
  description,
  icon,
  warning = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span
          className={`
            flex h-10 w-10 items-center
            justify-center rounded-xl
            ${
              warning
                ? "bg-amber-50 text-amber-600"
                : "bg-blue-50 text-blue-600"
            }
          `}
        >
          {icon}
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p
        className={`
          mt-1 text-xl font-bold
          ${
            warning
              ? "text-amber-600"
              : "text-slate-900"
          }
        `}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2 text-slate-700">
        <span className="text-blue-600">
          {icon}
        </span>

        <h2 className="font-bold">
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}

function EmptyInfo({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm italic text-slate-400">
      {children}
    </p>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
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

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </div>
  );
}

function InvoiceHistoryRow({
  invoice,
}: {
  invoice: Invoice;
}) {
  return (
    <Link
      href={`/sales/invoices/${invoice.id}`}
      className="
        flex items-center justify-between
        gap-4 px-5 py-4
        transition-colors hover:bg-slate-50
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <FileText size={18} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {invoice.invoiceNumber}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatReadableDate(
              invoice.invoiceDate
            )}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-slate-800">
          {formatCurrency(
            invoice.totals?.grandTotal
          )}
        </p>

        <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
          {formatStatus(invoice.status)}
        </span>
      </div>
    </Link>
  );
}

function CustomerDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-40 rounded bg-slate-200" />

      <div className="h-80 rounded-2xl bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}

const inputClass = `
  h-11 w-full rounded-lg
  border border-slate-200
  bg-white px-3 text-sm
  text-slate-800 outline-none
  transition-all
  focus:border-blue-500
  focus:ring-4 focus:ring-blue-50
`;
