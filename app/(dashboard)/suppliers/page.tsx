"use client";

// app/(dashboard)/suppliers/page.tsx

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Users,
  ArrowUpRight,
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
  state?: string;
  openingBalance?: number;
  payableAmount?: number;
  createdAt?: string;
}

/* =====================================================
   HELPERS
===================================================== */

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/* =====================================================
   PAGE
===================================================== */

export default function SuppliersPage() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  /* =============================================
     LOAD SUPPLIERS
  ============================================= */

  useEffect(() => {
    try {
      /*
       Uses a fallback key so this page can work
       before STORAGE_KEYS.SUPPLIERS is added.
      */
      const supplierKey =
        (STORAGE_KEYS as any).SUPPLIERS ||
        "smart_gst_suppliers";

      const data =
        getCollection<Supplier>(
          supplierKey
        );

      setSuppliers(data);
    } catch (error) {
      console.error(
        "Failed to load suppliers:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =============================================
     SUMMARY
  ============================================= */

  const summary = useMemo(() => {
    const totalSuppliers =
      suppliers.length;

    const totalPayable =
      suppliers.reduce(
        (total, supplier) =>
          total +
          safeNumber(
            supplier.payableAmount ??
              supplier.openingBalance
          ),
        0
      );

    const suppliersWithGST =
      suppliers.filter(
        (supplier) =>
          supplier.gstin &&
          supplier.gstin.trim().length > 0
      ).length;

    const activeSuppliers =
      suppliers.filter(
        (supplier) =>
          supplier.name &&
          supplier.name.trim().length > 0
      ).length;

    return {
      totalSuppliers,
      totalPayable,
      suppliersWithGST,
      activeSuppliers,
    };
  }, [suppliers]);

  /* =============================================
     FILTER
  ============================================= */

  const filteredSuppliers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) => {
          return [
            supplier.name,
            supplier.businessName,
            supplier.phone,
            supplier.email,
            supplier.gstin,
            supplier.state,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query)
            );
        }
      );
    }, [suppliers, search]);

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

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl pb-12">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Suppliers
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your suppliers and outstanding
            payable amounts.
          </p>
        </div>

        <Link
          href="/suppliers/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Supplier
        </Link>

      </div>

      {/* =============================================
         SUMMARY
      ============================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Users size={21} />}
          label="Total Suppliers"
          value={summary.totalSuppliers.toString()}
          description="Registered suppliers"
          variant="blue"
        />

        <StatCard
          icon={<IndianRupee size={21} />}
          label="Total Payable"
          value={formatCurrency(
            summary.totalPayable
          )}
          description="Outstanding amount"
          variant="orange"
        />

        <StatCard
          icon={<Building2 size={21} />}
          label="GST Registered"
          value={summary.suppliersWithGST.toString()}
          description="With GSTIN"
          variant="purple"
        />

        <StatCard
          icon={<Users size={21} />}
          label="Active Suppliers"
          value={summary.activeSuppliers.toString()}
          description="Available in records"
          variant="green"
        />

      </div>

      {/* =============================================
         MAIN TABLE
      ============================================= */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* TABLE HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="font-bold text-slate-800">
              Supplier Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredSuppliers.length} supplier
              {filteredSuppliers.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search suppliers..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 sm:w-72"
            />

          </div>

        </div>

        {/* EMPTY STATE */}

        {filteredSuppliers.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2 size={30} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-800">
              {suppliers.length === 0
                ? "No suppliers yet"
                : "No suppliers found"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {suppliers.length === 0
                ? "Add your suppliers to manage business purchases and payable balances."
                : "Try changing your search to find the supplier you're looking for."}
            </p>

            {suppliers.length === 0 && (
              <Link
                href="/suppliers/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={17} />
                Add First Supplier
              </Link>
            )}

          </div>
        ) : (
          /* TABLE */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Supplier
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contact
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    GSTIN
                  </th>

                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    State
                  </th>

                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payable
                  </th>

                  <th className="px-6 py-4" />

                </tr>

              </thead>

              <tbody>

                {filteredSuppliers.map(
                  (supplier) => {
                    const payable =
                      safeNumber(
                        supplier.payableAmount ??
                          supplier.openingBalance
                      );

                    return (
                      <tr
                        key={supplier.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50/70"
                      >

                        {/* SUPPLIER */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                              {(
                                supplier.businessName ||
                                supplier.name ||
                                "S"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>

                              <p className="font-semibold text-slate-800">
                                {supplier.businessName ||
                                  supplier.name}
                              </p>

                              {supplier.businessName &&
                                supplier.name && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {supplier.name}
                                  </p>
                                )}

                            </div>

                          </div>

                        </td>

                        {/* CONTACT */}

                        <td className="px-4 py-5">

                          <div className="space-y-1.5">

                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Phone size={13} />
                                {supplier.phone}
                              </div>
                            )}

                            {supplier.email && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail size={13} />
                                {supplier.email}
                              </div>
                            )}

                            {!supplier.phone &&
                              !supplier.email && (
                                <span className="text-xs text-slate-400">
                                  —
                                </span>
                              )}

                          </div>

                        </td>

                        {/* GSTIN */}

                        <td className="px-4 py-5">

                          {supplier.gstin ? (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600">
                              {supplier.gstin}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}

                        </td>

                        {/* STATE */}

                        <td className="px-4 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            {supplier.state && (
                              <MapPin
                                size={15}
                                className="text-slate-400"
                              />
                            )}

                            {supplier.state || "—"}

                          </div>

                        </td>

                        {/* PAYABLE */}

                        <td className="px-4 py-5 text-right">

                          <p
                            className={`font-bold ${
                              payable > 0
                                ? "text-orange-600"
                                : "text-slate-500"
                            }`}
                          >
                            {formatCurrency(payable)}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Outstanding
                          </p>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5 text-right">

                          <Link
                            href={`/suppliers/${supplier.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            View
                            <ArrowUpRight
                              size={14}
                            />
                          </Link>

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
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  variant:
    | "blue"
    | "green"
    | "orange"
    | "purple";
}) {
  const styles = {
    blue: {
      background: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
    },
    green: {
      background: "bg-emerald-50",
      icon: "bg-emerald-100 text-emerald-600",
    },
    orange: {
      background: "bg-orange-50",
      icon: "bg-orange-100 text-orange-600",
    },
    purple: {
      background: "bg-violet-50",
      icon: "bg-violet-100 text-violet-600",
    },
  };

  return (
    <div
      className={`rounded-2xl p-5 ${
        styles[variant].background
      }`}
    >
      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            styles[variant].icon
          }`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
        }
