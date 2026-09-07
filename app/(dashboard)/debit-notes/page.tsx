"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeIndianRupee,
  CalendarDays,
  FileText,
  Loader2,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";

const STORAGE_KEY = "smart_gst_debit_notes";

type DebitNoteStatus = "Draft" | "Issued";

interface DebitNote {
  id: string;
  noteNumber: string;
  supplierName: string;
  supplierGstin?: string;
  date: string;
  reason: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: DebitNoteStatus;
}

export default function DebitNotesPage() {
  const [notes, setNotes] = useState<DebitNote[]>([]);
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
      console.error("Failed to load debit notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter((note) =>
      [
        note.noteNumber,
        note.supplierName,
        note.supplierGstin,
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
    return {
      total: notes.length,

      totalAmount: notes.reduce(
        (sum, note) =>
          sum + (Number(note.totalAmount) || 0),
        0
      ),

      issued: notes.filter(
        (note) => note.status === "Issued"
      ).length,

      drafts: notes.filter(
        (note) => note.status === "Draft"
      ).length,
    };
  }, [notes]);

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
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <BadgeIndianRupee size={23} />
            </span>
            Debit Notes
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Manage debit notes for purchase adjustments,
            additional charges and supplier transactions.
          </p>
        </div>

        <Link
          href="/debit-notes/new"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Debit Note
        </Link>

      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Debit Notes"
          value={String(stats.total)}
          icon={<FileText size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          label="Total Debit Amount"
          value={formatCurrency(stats.totalAmount)}
          icon={<BadgeIndianRupee size={20} />}
          iconClass="bg-orange-50 text-orange-600"
        />

        <StatCard
          label="Issued"
          value={String(stats.issued)}
          icon={<TrendingUp size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          label="Drafts"
          value={String(stats.drafts)}
          icon={<CalendarDays size={20} />}
          iconClass="bg-amber-50 text-amber-600"
        />

      </div>

      {/* LIST */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="font-bold text-slate-800">
              All Debit Notes
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage all your debit note documents.
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
              placeholder="Search debit notes..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />

          </div>

        </div>

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BadgeIndianRupee size={28} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-700">
              {notes.length === 0
                ? "No debit notes yet"
                : "No matching debit notes"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              {notes.length === 0
                ? "Create your first debit note to manage purchase adjustments and additional supplier charges."
                : "Try changing your search term."}
            </p>

            {notes.length === 0 && (
              <Link
                href="/debit-notes/new"
                className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={17} />
                Create Debit Note
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
                      Debit Note
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Supplier
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
                          {note.supplierName}
                        </p>

                        {note.supplierGstin && (
                          <p className="mt-1 text-xs text-slate-400">
                            {note.supplierGstin}
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
                          {formatCurrency(
                            note.taxableAmount
                          )}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-center">
                        <StatusBadge
                          status={note.status}
                        />
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {/* MOBILE LIST */}

            <div className="divide-y divide-slate-100 md:hidden">

              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="font-bold text-slate-700">
                        {note.noteNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {note.supplierName}
                      </p>
                    </div>

                    <StatusBadge
                      status={note.status}
                    />

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
                        {formatCurrency(
                          note.totalAmount
                        )}
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
            Showing {filteredNotes.length} of{" "}
            {notes.length} debit notes
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
  status: DebitNoteStatus;
}) {
  const styles: Record<
    DebitNoteStatus,
    string
  > = {
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
