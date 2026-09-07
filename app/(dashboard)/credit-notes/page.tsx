"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileText,
  IndianRupee,
  Plus,
  Search,
  Loader2,
  CalendarDays,
} from "lucide-react";

const STORAGE_KEY = "smart_gst_credit_notes";

type CreditNoteStatus = "Draft" | "Issued";

interface CreditNote {
  id: string;
  noteNumber: string;
  customerName: string;
  customerGstin?: string;
  date: string;
  reason: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: CreditNoteStatus;
}

export default function CreditNotesPage() {
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load credit notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return notes;

    return notes.filter((note) =>
      [
        note.noteNumber,
        note.customerName,
        note.customerGstin,
        note.reason,
        note.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [notes, search]);

  const stats = useMemo(() => {
    const totalAmount = notes.reduce(
      (sum, note) => sum + (Number(note.totalAmount) || 0),
      0
    );

    const issued = notes.filter(
      (note) => note.status === "Issued"
    ).length;

    const drafts = notes.filter(
      (note) => note.status === "Draft"
    ).length;

    return {
      total: notes.length,
      totalAmount,
      issued,
      drafts,
    };
  }, [notes]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <CreditCard size={23} />
            </span>
            Credit Notes
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Manage credit notes issued to customers for returns,
            discounts and invoice adjustments.
          </p>
        </div>

        <Link
          href="/credit-notes/new"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Credit Note
        </Link>
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Credit Notes"
          value={stats.total.toString()}
          icon={<FileText size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          label="Total Credit Amount"
          value={formatCurrency(stats.totalAmount)}
          icon={<IndianRupee size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          label="Issued"
          value={stats.issued.toString()}
          icon={<CreditCard size={20} />}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          label="Drafts"
          value={stats.drafts.toString()}
          icon={<CalendarDays size={20} />}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* LIST */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              All Credit Notes
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage all your credit note documents.
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
              placeholder="Search credit notes..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CreditCard size={28} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-700">
              {notes.length === 0
                ? "No credit notes yet"
                : "No matching credit notes"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              {notes.length === 0
                ? "Create your first credit note to record returns, discounts or invoice adjustments."
                : "Try changing your search term."}
            </p>

            {notes.length === 0 && (
              <Link
                href="/credit-notes/new"
                className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Create Credit Note
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Credit Note
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Reason
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredNotes.map((note) => (
                    <tr
                      key={note.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">
                          {note.noteNumber}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-slate-400">
                          {note.id}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {note.customerName}
                        </p>

                        {note.customerGstin && (
                          <p className="mt-1 text-xs text-slate-400">
                            {note.customerGstin}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(note.date)}
                      </td>

                      <td className="max-w-[200px] truncate px-6 py-4 text-sm text-slate-500">
                        {note.reason || "—"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-800">
                          {formatCurrency(note.totalAmount)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Taxable:{" "}
                          {formatCurrency(note.taxableAmount)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={note.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredNotes.map((note) => (
                <div key={note.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-700">
                        {note.noteNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {note.customerName}
                      </p>
                    </div>

                    <StatusBadge status={note.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(note.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {formatCurrency(note.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {note.reason && (
                    <p className="mt-3 text-xs text-slate-400">
                      Reason: {note.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {filteredNotes.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:px-6">
            Showing {filteredNotes.length} of {notes.length} credit
            notes
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
  status: CreditNoteStatus;
}) {
  const styles: Record<CreditNoteStatus, string> = {
    Draft: "bg-amber-50 text-amber-600",
    Issued: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
        }
