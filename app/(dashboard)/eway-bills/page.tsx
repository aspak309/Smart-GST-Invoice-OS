"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Plus,
  Search,
  FileText,
  IndianRupee,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const STORAGE_KEY = "smart_gst_eway_bills";

type EWayBillStatus = "Active" | "Expired" | "Cancelled";

interface EWayBill {
  id: string;
  ewayBillNumber: string;
  invoiceNumber: string;
  partyName: string;
  fromPlace: string;
  toPlace: string;
  vehicleNumber?: string;
  date: string;
  validUntil: string;
  totalAmount: number;
  status: EWayBillStatus;
}

export default function EWayBillsPage() {
  const [bills, setBills] = useState<EWayBill[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setBills(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load E-Way Bills:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return bills;

    return bills.filter((bill) =>
      [
        bill.ewayBillNumber,
        bill.invoiceNumber,
        bill.partyName,
        bill.fromPlace,
        bill.toPlace,
        bill.vehicleNumber,
        bill.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [bills, search]);

  const stats = useMemo(() => {
    const active = bills.filter(
      (bill) => bill.status === "Active"
    ).length;

    const expired = bills.filter(
      (bill) => bill.status === "Expired"
    ).length;

    const totalValue = bills.reduce(
      (sum, bill) =>
        sum + (Number(bill.totalAmount) || 0),
      0
    );

    return {
      total: bills.length,
      active,
      expired,
      totalValue,
    };
  }, [bills]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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

  return (
    <div className="mx-auto max-w-7xl pb-12">
      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Truck size={23} />
            </span>
            E-Way Bills
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Manage goods transportation and E-Way Bill records.
          </p>
        </div>

        <Link
          href="/eway-bills/new"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create E-Way Bill
        </Link>
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total E-Way Bills"
          value={String(stats.total)}
          icon={<FileText size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          label="Active"
          value={String(stats.active)}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          label="Expired"
          value={String(stats.expired)}
          icon={<Clock size={20} />}
          iconClass="bg-rose-50 text-rose-600"
        />

        <StatCard
          label="Total Goods Value"
          value={formatCurrency(stats.totalValue)}
          icon={<IndianRupee size={20} />}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* LIST */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              All E-Way Bills
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Track transportation details and validity status.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search E-Way Bills..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Truck size={29} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-700">
              {bills.length === 0
                ? "No E-Way Bills yet"
                : "No matching E-Way Bills"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              {bills.length === 0
                ? "Create and manage E-Way Bill records for goods transportation."
                : "Try changing your search term."}
            </p>

            {bills.length === 0 && (
              <Link
                href="/eway-bills/new"
                className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Create E-Way Bill
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      E-Way Bill
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Party
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Route
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Vehicle
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Value
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBills.map((bill) => (
                    <tr
                      key={bill.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {bill.ewayBillNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Invoice: {bill.invoiceNumber || "—"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {bill.partyName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(bill.date)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-600">
                          {bill.fromPlace}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          To: {bill.toPlace}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          {bill.vehicleNumber || "Not Added"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-800">
                          {formatCurrency(bill.totalAmount)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Valid till {formatDate(bill.validUntil)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={bill.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredBills.map((bill) => (
                <div key={bill.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-700">
                        {bill.ewayBillNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {bill.partyName}
                      </p>
                    </div>

                    <StatusBadge status={bill.status} />
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      {bill.fromPlace} → {bill.toPlace}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Vehicle:{" "}
                      {bill.vehicleNumber || "Not Added"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Valid Until
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(bill.validUntil)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Value
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatCurrency(bill.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredBills.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:px-6">
            Showing {filteredBills.length} of {bills.length} E-Way Bills
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: EWayBillStatus;
}) {
  const styles: Record<EWayBillStatus, string> = {
    Active: "bg-emerald-50 text-emerald-600",
    Expired: "bg-rose-50 text-rose-600",
    Cancelled: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
    }
