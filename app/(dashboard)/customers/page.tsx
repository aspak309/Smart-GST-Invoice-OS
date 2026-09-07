"use client";

// app/(dashboard)/customers/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

import type { Customer } from "@/types";

import {
  STORAGE_KEYS,
  getCollection,
  removeItem,
} from "@/lib/storage";

import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/format-utils";

/* =====================================================
   TYPES
===================================================== */

interface CustomerWithOutstanding extends Customer {
  outstandingAmount?: number;
}

/* =====================================================
   HELPERS
===================================================== */

function getCustomerOutstanding(
  customer: CustomerWithOutstanding
): number {
  return Number(customer.outstandingAmount || 0);
}

function getCustomerInitials(name?: string): string {
  if (!name) return "C";

  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

/* =====================================================
   PAGE
===================================================== */

export default function CustomersPage() {
  const [customers, setCustomers] = useState<
    CustomerWithOutstanding[]
  >([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [deleteCustomer, setDeleteCustomer] =
    useState<CustomerWithOutstanding | null>(
      null
    );

  /* =============================================
     LOAD CUSTOMERS
  ============================================= */

  useEffect(() => {
    loadCustomers();
  }, []);

  function loadCustomers() {
    try {
      const data =
        getCollection<CustomerWithOutstanding>(
          STORAGE_KEYS.CUSTOMERS
        );

      setCustomers(data);
    } catch (error) {
      console.error(
        "Failed to load customers:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =============================================
     FILTERED CUSTOMERS
  ============================================= */

  const filteredCustomers = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      return [
        customer.name,
        customer.businessName,
        customer.phone,
        customer.email,
        customer.gstin,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [customers, searchQuery]);

  /* =============================================
     SUMMARY
  ============================================= */

  const summary = useMemo(() => {
    const totalOutstanding =
      customers.reduce(
        (total, customer) =>
          total +
          getCustomerOutstanding(customer),
        0
      );

    const activeCustomers =
      customers.filter(
        (customer) =>
          getCustomerOutstanding(customer) >= 0
      ).length;

    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalOutstanding,
    };
  }, [customers]);

  /* =============================================
     DELETE
  ============================================= */

  function handleDeleteCustomer() {
    if (!deleteCustomer) return;

    try {
      removeItem(
        STORAGE_KEYS.CUSTOMERS,
        deleteCustomer.id
      );

      setCustomers((previous) =>
        previous.filter(
          (customer) =>
            customer.id !== deleteCustomer.id
        )
      );

      setDeleteCustomer(null);
    } catch (error) {
      console.error(
        "Failed to delete customer:",
        error
      );
    }
  }

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return <CustomersSkeleton />;
  }

  return (
    <div className="space-y-7">
      {/* =========================================
          HEADER
      ========================================= */}

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            BUSINESS PARTIES
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Customers
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your customers and track
            outstanding payments.
          </p>
        </div>

        <Link
          href="/customers/new"
          className="
            inline-flex h-11 items-center
            justify-center gap-2 rounded-xl
            bg-blue-600 px-4
            text-sm font-semibold text-white
            shadow-sm transition-all
            hover:bg-blue-700
            active:scale-[0.98]
          "
        >
          <Plus size={18} />
          Add Customer
        </Link>
      </section>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Total Customers"
          value={summary.totalCustomers.toString()}
          description="Registered customer profiles"
          icon={<Users size={21} />}
        />

        <SummaryCard
          title="Active Customers"
          value={summary.activeCustomers.toString()}
          description="Currently active in business"
          icon={<Building2 size={21} />}
        />

        <SummaryCard
          title="Total Receivable"
          value={formatCompactCurrency(
            summary.totalOutstanding
          )}
          description="Pending customer payments"
          icon={<Wallet size={21} />}
          highlight
        />
      </section>

      {/* =========================================
          CUSTOMER LIST
      ========================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Toolbar */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="
                pointer-events-none
                absolute left-3 top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search customers..."
              className="
                h-11 w-full rounded-lg
                border border-slate-200
                bg-slate-50 pl-10 pr-10
                text-sm text-slate-800
                outline-none transition-all
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-slate-700
                "
              >
                <X size={17} />
              </button>
            )}
          </div>

          <p className="text-sm text-slate-500">
            {filteredCustomers.length} customer
            {filteredCustomers.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* Desktop Table */}

        {filteredCustomers.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      GSTIN
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Outstanding
                    </th>

                    <th className="w-[90px] px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map(
                    (customer) => (
                      <CustomerTableRow
                        key={customer.id}
                        customer={customer}
                        onDelete={() =>
                          setDeleteCustomer(
                            customer
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredCustomers.map(
                (customer) => (
                  <CustomerMobileCard
                    key={customer.id}
                    customer={customer}
                    onDelete={() =>
                      setDeleteCustomer(customer)
                    }
                  />
                )
              )}
            </div>
          </>
        ) : (
          <EmptyCustomers
            hasSearch={Boolean(searchQuery)}
            onClearSearch={() =>
              setSearchQuery("")
            }
          />
        )}
      </section>

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {deleteCustomer && (
        <DeleteCustomerModal
          customer={deleteCustomer}
          onClose={() =>
            setDeleteCustomer(null)
          }
          onConfirm={handleDeleteCustomer}
        />
      )}
    </div>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  description,
  icon,
  highlight = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl border p-5
        ${
          highlight
            ? "border-blue-100 bg-blue-50/40"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h2>
        </div>

        <div
          className={`
            flex h-11 w-11 items-center
            justify-center rounded-xl
            ${
              highlight
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   CUSTOMER TABLE ROW
===================================================== */

function CustomerTableRow({
  customer,
  onDelete,
}: {
  customer: CustomerWithOutstanding;
  onDelete: () => void;
}) {
  const outstanding =
    getCustomerOutstanding(customer);

  return (
    <tr className="group transition-colors hover:bg-slate-50">
      {/* Customer */}

      <td className="px-5 py-4">
        <Link
          href={`/customers/${customer.id}`}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
            {getCustomerInitials(
              customer.name
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-blue-600">
              {customer.name}
            </p>

            {customer.businessName && (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {customer.businessName}
              </p>
            )}
          </div>
        </Link>
      </td>

      {/* Contact */}

      <td className="px-5 py-4">
        <div className="space-y-1">
          {customer.phone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Phone
                size={13}
                className="text-slate-400"
              />

              {customer.phone}
            </div>
          )}

          {customer.email && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Mail
                size={13}
                className="text-slate-400"
              />

              <span className="max-w-[180px] truncate">
                {customer.email}
              </span>
            </div>
          )}

          {!customer.phone &&
            !customer.email && (
              <span className="text-xs text-slate-400">
                —
              </span>
            )}
        </div>
      </td>

      {/* GSTIN */}

      <td className="px-5 py-4">
        {customer.gstin ? (
          <span className="font-mono text-xs font-medium text-slate-600">
            {customer.gstin}
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            Unregistered
          </span>
        )}
      </td>

      {/* Outstanding */}

      <td className="px-5 py-4 text-right">
        <p
          className={`
            text-sm font-bold
            ${
              outstanding > 0
                ? "text-amber-600"
                : "text-slate-700"
            }
          `}
        >
          {formatCurrency(outstanding)}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          {outstanding > 0
            ? "Pending"
            : "No dues"}
        </p>
      </td>

      {/* Action */}

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <Link
            href={`/customers/${customer.id}`}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-slate-400
              hover:bg-blue-50
              hover:text-blue-600
            "
            aria-label="View customer"
          >
            <ChevronRight size={18} />
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-slate-400
              hover:bg-red-50
              hover:text-red-600
            "
            aria-label="Delete customer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =====================================================
   MOBILE CUSTOMER CARD
===================================================== */

function CustomerMobileCard({
  customer,
  onDelete,
}: {
  customer: CustomerWithOutstanding;
  onDelete: () => void;
}) {
  const outstanding =
    getCustomerOutstanding(customer);

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
          {getCustomerInitials(customer.name)}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/customers/${customer.id}`}
          >
            <h3 className="truncate text-sm font-semibold text-slate-800">
              {customer.name}
            </h3>

            {customer.businessName && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {customer.businessName}
              </p>
            )}
          </Link>

          {customer.phone && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Phone size={13} />
              {customer.phone}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-xs text-slate-500">
          Outstanding
        </span>

        <span
          className={`
            text-sm font-bold
            ${
              outstanding > 0
                ? "text-amber-600"
                : "text-slate-700"
            }
          `}
        >
          {formatCurrency(outstanding)}
        </span>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyCustomers({
  hasSearch,
  onClearSearch,
}: {
  hasSearch: boolean;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Users size={28} />
      </div>

      <h3 className="text-lg font-bold text-slate-800">
        {hasSearch
          ? "No customers found"
          : "No customers yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {hasSearch
          ? "Try searching with a different name, phone number or GSTIN."
          : "Add your first customer to start creating invoices and tracking payments."}
      </p>

      {hasSearch ? (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Clear Search
        </button>
      ) : (
        <Link
          href="/customers/new"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={17} />
          Add Customer
        </Link>
      )}
    </div>
  );
}

/* =====================================================
   DELETE MODAL
===================================================== */

function DeleteCustomerModal({
  customer,
  onClose,
  onConfirm,
}: {
  customer: CustomerWithOutstanding;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
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
          <strong className="text-slate-700">
            {customer.name}
          </strong>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg border border-slate-200
              px-4 py-2.5 text-sm font-semibold
              text-slate-700 hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
              rounded-lg bg-red-600
              px-4 py-2.5 text-sm
              font-semibold text-white
              hover:bg-red-700
            "
          >
            Delete Customer
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SKELETON
===================================================== */

function CustomersSkeleton() {
  return (
    <div className="animate-pulse space-y-7">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-9 w-52 rounded bg-slate-200" />
        <div className="h-4 w-80 rounded bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="h-[450px] rounded-2xl bg-slate-200" />
    </div>
  );
}
