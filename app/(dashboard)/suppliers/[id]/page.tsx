"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Edit3,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  STORAGE_KEYS,
  getCollection,
} from "@/lib/storage";

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

interface Purchase {
  id: string;
  supplierId?: string;
  supplierName?: string;
  purchaseNumber?: string;
  purchaseDate?: string;
  grandTotal?: number;
  paidAmount?: number;
  status?: string;
}

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
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

export default function SupplierDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const supplierId =
    typeof params.id === "string"
      ? params.id
      : "";

  const supplierKey =
    (STORAGE_KEYS as any).SUPPLIERS ||
    "smart_gst_suppliers";

  const [supplier, setSupplier] =
    useState<Supplier | null>(null);

  const [purchases, setPurchases] =
    useState<Purchase[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [form, setForm] =
    useState({
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
    });

  useEffect(() => {
    try {
      const suppliers =
        getCollection<Supplier>(
          supplierKey
        );

      const found =
        suppliers.find(
          (item) =>
            item.id === supplierId
        ) || null;

      setSupplier(found);

      if (found) {
        setForm({
          name: found.name || "",
          businessName:
            found.businessName || "",
          phone: found.phone || "",
          email: found.email || "",
          gstin: found.gstin || "",
          address:
            found.address || "",
          city: found.city || "",
          state: found.state || "",
          pincode:
            found.pincode || "",
          openingBalance:
            String(
              found.openingBalance || 0
            ),
        });
      }

      const purchaseKey =
        (STORAGE_KEYS as any).PURCHASES ||
        "smart_gst_purchases";

      const purchaseData =
        getCollection<Purchase>(
          purchaseKey
        );

      setPurchases(
        purchaseData.filter(
          (purchase) =>
            purchase.supplierId ===
            supplierId
        )
      );
    } catch (error) {
      console.error(
        "Failed to load supplier:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [supplierId, supplierKey]);

  const purchaseSummary = useMemo(() => {
    let totalPurchases = 0;
    let totalPaid = 0;

    purchases.forEach((purchase) => {
      totalPurchases += safeNumber(
        purchase.grandTotal
      );

      totalPaid += safeNumber(
        purchase.paidAmount
      );
    });

    return {
      totalPurchases,
      totalPaid,
      outstanding: Math.max(
        totalPurchases - totalPaid,
        0
      ),
    };
  }, [purchases]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function saveChanges() {
    if (!supplier) return;

    if (!form.name.trim()) {
      alert("Please enter supplier name.");
      return;
    }

    try {
      setSaving(true);

      const suppliers =
        getCollection<Supplier>(
          supplierKey
        );

      const openingBalance =
        Number(form.openingBalance) || 0;

      const updatedSupplier: Supplier = {
        ...supplier,
        name: form.name.trim(),
        businessName:
          form.businessName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gstin:
          form.gstin.trim().toUpperCase(),
        address:
          form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode:
          form.pincode.trim(),
        openingBalance,
        payableAmount:
          purchaseSummary.outstanding +
          openingBalance,
        updatedAt:
          new Date().toISOString(),
      };

      const updatedSuppliers =
        suppliers.map((item) =>
          item.id === supplier.id
            ? updatedSupplier
            : item
        );

      localStorage.setItem(
        supplierKey,
        JSON.stringify(updatedSuppliers)
      );

      setSupplier(updatedSupplier);
      setEditing(false);
    } catch (error) {
      console.error(
        "Failed to update supplier:",
        error
      );

      alert(
        "Unable to update supplier."
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteSupplier() {
    if (!supplier) return;

    try {
      const suppliers =
        getCollection<Supplier>(
          supplierKey
        );

      const updated =
        suppliers.filter(
          (item) =>
            item.id !== supplier.id
        );

      localStorage.setItem(
        supplierKey,
        JSON.stringify(updated)
      );

      router.push("/suppliers");
    } catch (error) {
      console.error(
        "Failed to delete supplier:",
        error
      );

      alert(
        "Unable to delete supplier."
      );
    }
  }

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

  if (!supplier) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Building2 size={30} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-800">
          Supplier not found
        </h1>

        <Link
          href="/suppliers"
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Suppliers
        </Link>
      </div>
    );
  }

  const payable =
    safeNumber(
      supplier.payableAmount
    );

  return (
    <div className="mx-auto max-w-7xl pb-12">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        <div>
          <button
            onClick={() =>
              router.push("/suppliers")
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Suppliers
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2 size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {supplier.businessName ||
                  supplier.name}
              </h1>

              {supplier.businessName &&
                supplier.name && (
                  <p className="mt-1 text-sm text-slate-500">
                    {supplier.name}
                  </p>
                )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              setEditing((value) => !value)
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {editing ? (
              <>
                <X size={17} />
                Cancel
              </>
            ) : (
              <>
                <Edit3 size={17} />
                Edit Supplier
              </>
            )}
          </button>

          {editing && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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
          )}
        </div>
      </div>

      {/* STATS */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">

        <StatCard
          label="Opening Balance"
          value={formatCurrency(
            safeNumber(
              supplier.openingBalance
            )
          )}
          icon={<IndianRupee size={20} />}
          variant="blue"
        />

        <StatCard
          label="Purchase Value"
          value={formatCurrency(
            purchaseSummary.totalPurchases
          )}
          icon={<Building2 size={20} />}
          variant="purple"
        />

        <StatCard
          label="Payable"
          value={formatCurrency(payable)}
          icon={<IndianRupee size={20} />}
          variant="orange"
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">

        {/* MAIN */}

        <div className="space-y-6">

          {/* DETAILS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">

            <div className="mb-6">
              <h2 className="font-bold text-slate-800">
                Supplier Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Contact and business information.
              </p>
            </div>

            {editing ? (
              <div className="grid gap-5 sm:grid-cols-2">

                <Field label="Supplier Name" required>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

                <Field label="Business Name">
                  <input
                    value={form.businessName}
                    onChange={(event) =>
                      updateField(
                        "businessName",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

                <Field label="Phone">
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

                <Field label="GSTIN">
                  <input
                    value={form.gstin}
                    onChange={(event) =>
                      updateField(
                        "gstin",
                        event.target.value
                      )
                    }
                    maxLength={15}
                    className="input-style font-mono uppercase"
                  />
                </Field>

                <Field label="Opening Balance">
                  <input
                    type="number"
                    min="0"
                    value={form.openingBalance}
                    onChange={(event) =>
                      updateField(
                        "openingBalance",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

                <div className="sm:col-span-2">
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
                      className="input-style resize-none py-3"
                    />
                  </Field>
                </div>

                <Field label="City">
                  <input
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

                <Field label="State">
                  <input
                    value={form.state}
                    onChange={(event) =>
                      updateField(
                        "state",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

                <Field label="Pincode">
                  <input
                    value={form.pincode}
                    onChange={(event) =>
                      updateField(
                        "pincode",
                        event.target.value
                      )
                    }
                    className="input-style"
                  />
                </Field>

              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">

                <DetailItem
                  icon={<UserIcon />}
                  label="Contact Person"
                  value={supplier.name}
                />

                <DetailItem
                  icon={<Building2 size={17} />}
                  label="Business"
                  value={
                    supplier.businessName ||
                    "—"
                  }
                />

                <DetailItem
                  icon={<Phone size={17} />}
                  label="Phone"
                  value={
                    supplier.phone || "—"
                  }
                />

                <DetailItem
                  icon={<Mail size={17} />}
                  label="Email"
                  value={
                    supplier.email || "—"
                  }
                />

                <DetailItem
                  icon={<Building2 size={17} />}
                  label="GSTIN"
                  value={
                    supplier.gstin || "Unregistered"
                  }
                />

                <DetailItem
                  icon={<MapPin size={17} />}
                  label="Location"
                  value={[
                    supplier.city,
                    supplier.state,
                    supplier.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                />

                <div className="sm:col-span-2">
                  <DetailItem
                    icon={<MapPin size={17} />}
                    label="Address"
                    value={
                      supplier.address ||
                      "—"
                    }
                  />
                </div>

              </div>
            )}

          </section>

          {/* PURCHASE HISTORY */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-6">
              <h2 className="font-bold text-slate-800">
                Purchase History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {purchases.length} purchase
                {purchases.length !== 1
                  ? "s"
                  : ""}{" "}
                linked to this supplier.
              </p>
            </div>

            {purchases.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-slate-700">
                  No purchase records
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Purchase history will appear here
                  when purchases are linked.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">

                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Purchase
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total
                      </th>

                      <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Paid
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pending
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {purchases.map(
                      (purchase) => {
                        const total =
                          safeNumber(
                            purchase.grandTotal
                          );

                        const paid =
                          safeNumber(
                            purchase.paidAmount
                          );

                        return (
                          <tr
                            key={purchase.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-6 py-5 font-semibold text-blue-600">
                              {purchase.purchaseNumber ||
                                `PUR-${purchase.id.slice(
                                  0,
                                  8
                                ).toUpperCase()}`}
                            </td>

                            <td className="px-4 py-5 text-sm text-slate-600">
                              {formatDate(
                                purchase.purchaseDate
                              )}
                            </td>

                            <td className="px-4 py-5 text-right font-semibold text-slate-700">
                              {formatCurrency(
                                total
                              )}
                            </td>

                            <td className="px-4 py-5 text-right font-semibold text-emerald-600">
                              {formatCurrency(
                                paid
                              )}
                            </td>

                            <td className="px-6 py-5 text-right font-semibold text-orange-600">
                              {formatCurrency(
                                Math.max(
                                  total - paid,
                                  0
                                )
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>

                </table>
              </div>
            )}

          </section>

        </div>

        {/* RIGHT SIDEBAR */}

        <aside className="space-y-6">

          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <h2 className="font-bold text-slate-800">
              Payable Summary
            </h2>

            <div className="mt-6 space-y-4">

              <SummaryRow
                label="Opening Balance"
                value={formatCurrency(
                  safeNumber(
                    supplier.openingBalance
                  )
                )}
              />

              <SummaryRow
                label="Purchase Value"
                value={formatCurrency(
                  purchaseSummary.totalPurchases
                )}
              />

              <SummaryRow
                label="Paid"
                value={formatCurrency(
                  purchaseSummary.totalPaid
                )}
              />

              <div className="border-t border-slate-200 pt-5">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Payable
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {formatCurrency(payable)}
                </p>

              </div>

            </div>
          </div>

          {/* DANGER ZONE */}

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

            <p className="font-semibold text-red-700">
              Danger Zone
            </p>

            <p className="mt-1 text-xs leading-5 text-red-500">
              Deleting this supplier removes the
              supplier record from this app.
            </p>

            <button
              onClick={() =>
                setDeleteOpen(true)
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Delete Supplier
            </button>

          </div>

        </aside>

      </div>

      {/* DELETE MODAL */}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Delete Supplier?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This will permanently remove{" "}
                  <strong>
                    {supplier.businessName ||
                      supplier.name}
                  </strong>{" "}
                  from your supplier records.
                </p>
              </div>

              <button
                onClick={() =>
                  setDeleteOpen(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setDeleteOpen(false)
                }
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={deleteSupplier}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>

            </div>

          </div>
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

/* =====================================================
   DETAIL ITEM
===================================================== */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   SUMMARY
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

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant:
    | "blue"
    | "purple"
    | "orange";
}) {
  const styles = {
    blue:
      "bg-blue-50 text-blue-600",
    purple:
      "bg-violet-50 text-violet-600",
    orange:
      "bg-orange-50 text-orange-600",
  };

  return (
    <div
      className={`rounded-2xl border border-slate-100 p-5 ${styles[variant]}`}
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   SIMPLE USER ICON
===================================================== */

function UserIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="7"
        r="4"
      />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
    }
