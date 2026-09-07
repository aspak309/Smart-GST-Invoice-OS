"use client";

// app/(dashboard)/quotations/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Eye,
  FilePlus2,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

import { STORAGE_KEYS, getCollection, removeItem, updateItem } from "@/lib/storage";
import { formatCurrency } from "@/lib/format-utils";

/* =====================================================
   TYPES
===================================================== */

type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

interface Quotation {
  id: string;
  quotationNumber?: string;
  number?: string;
  customerId?: string;
  customerName?: string;
  quotationDate?: string;
  validUntil?: string;
  grandTotal?: number;
  total?: number;
  status?: QuotationStatus;
  createdAt?: string;
  updatedAt?: string;
}

type StatusFilter = "all" | QuotationStatus;

/* =====================================================
   HELPERS
===================================================== */

function getQuotationNumber(
  quotation: Quotation
) {
  return (
    quotation.quotationNumber ||
    quotation.number ||
    `QT-${quotation.id.slice(0, 8).toUpperCase()}`
  );
}

function getStatus(
  quotation: Quotation
): QuotationStatus {
  const status = String(
    quotation.status || "draft"
  ).toLowerCase();

  if (
    status === "draft" ||
    status === "sent" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "expired"
  ) {
    return status;
  }

  return "draft";
}

function getTotal(
  quotation: Quotation
) {
  return Number(
    quotation.grandTotal ||
      quotation.total ||
      0
  );
}

function formatDate(
  value?: string
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function QuotationsPage() {
  const [quotations, setQuotations] =
    useState<Quotation[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* =============================================
     LOAD QUOTATIONS
  ============================================= */

  useEffect(() => {
    loadQuotations();
  }, []);

  function loadQuotations() {
    try {
      const data =
        getCollection<Quotation>(
          STORAGE_KEYS.QUOTATIONS
        );

      const sorted = [...data].sort(
        (a, b) => {
          const dateA = new Date(
            a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        }
      );

      setQuotations(sorted);
    } catch (error) {
      console.error(
        "Failed to load quotations:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =============================================
     FILTERED DATA
  ============================================= */

  const filteredQuotations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return quotations.filter(
        (quotation) => {
          const matchesSearch =
            !query ||
            getQuotationNumber(
              quotation
            )
              .toLowerCase()
              .includes(query) ||
            quotation.customerName
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            getStatus(quotation) ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      quotations,
      search,
      statusFilter,
    ]);

  /* =============================================
     STATS
  ============================================= */

  const stats = useMemo(() => {
    return {
      total: quotations.length,

      draft: quotations.filter(
        (item) =>
          getStatus(item) === "draft"
      ).length,

      sent: quotations.filter(
        (item) =>
          getStatus(item) === "sent"
      ).length,

      accepted: quotations.filter(
        (item) =>
          getStatus(item) === "accepted"
      ).length,
    };
  }, [quotations]);

  /* =============================================
     UPDATE STATUS
  ============================================= */

  function handleStatusChange(
    quotation: Quotation,
    status: QuotationStatus
  ) {
    try {
      const updated = {
        ...quotation,
        status,
        updatedAt:
          new Date().toISOString(),
      };

      updateItem(
        STORAGE_KEYS.QUOTATIONS,
        quotation.id,
        updated
      );

      setQuotations((previous) =>
        previous.map((item) =>
          item.id === quotation.id
            ? updated
            : item
        )
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Failed to update quotation:",
        error
      );
    }
  }

  /* =============================================
     DELETE
  ============================================= */

  function handleDelete(
    quotation: Quotation
  ) {
    const confirmed =
      window.confirm(
        `Delete ${getQuotationNumber(
          quotation
        )}?`
      );

    if (!confirmed) return;

    try {
      removeItem(
        STORAGE_KEYS.QUOTATIONS,
        quotation.id
      );

      setQuotations((previous) =>
        previous.filter(
          (item) =>
            item.id !== quotation.id
        )
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Failed to delete quotation:",
        error
      );
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Quotations
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Create and manage customer quotations.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="
            inline-flex h-11 items-center
            justify-center gap-2 rounded-xl
            bg-blue-600 px-5 text-sm
            font-semibold text-white
            shadow-sm transition-all
            hover:bg-blue-700
          "
        >
          <Plus size={18} />
          Create Quotation
        </Link>
      </div>

      {/* =========================================
          STATS
      ========================================= */}

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

        <StatCard
          label="Total Quotations"
          value={stats.total}
          icon={
            <FileText size={20} />
          }
          color="blue"
        />

        <StatCard
          label="Draft"
          value={stats.draft}
          icon={
            <FilePlus2 size={20} />
          }
          color="slate"
        />

        <StatCard
          label="Sent"
          value={stats.sent}
          icon={
            <Send size={20} />
          }
          color="purple"
        />

        <StatCard
          label="Accepted"
          value={stats.accepted}
          icon={
            <CheckCircle2 size={20} />
          }
          color="green"
        />
      </div>

      {/* =========================================
          FILTER BAR
      ========================================= */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">

        <div className="relative flex-1">

          <Search
            size={18}
            className="
              absolute left-4 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search quotation or customer..."
            className="
              h-11 w-full rounded-xl
              border border-slate-200 bg-white
              pl-11 pr-4 text-sm
              outline-none transition
              placeholder:text-slate-400
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
          />
        </div>

        <div className="relative">

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as StatusFilter
              )
            }
            className="
              h-11 min-w-[170px]
              appearance-none rounded-xl
              border border-slate-200
              bg-white px-4 pr-10
              text-sm font-medium
              text-slate-600 outline-none
              focus:border-blue-500
            "
          >
            <option value="all">
              All Status
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="sent">
              Sent
            </option>

            <option value="accepted">
              Accepted
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="expired">
              Expired
            </option>
          </select>

          <ChevronDown
            size={17}
            className="
              pointer-events-none
              absolute right-3 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />
        </div>
      </div>

      {/* =========================================
          CONTENT
      ========================================= */}

      {loading ? (
        <LoadingSkeleton />
      ) : filteredQuotations.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className="
            overflow-hidden rounded-2xl
            border border-slate-200
            bg-white shadow-sm
          "
        >
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Quotation
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Valid Until
                  </th>

                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="w-20 px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredQuotations.map(
                  (quotation) => (
                    <QuotationRow
                      key={quotation.id}
                      quotation={quotation}
                      isMenuOpen={
                        openMenuId ===
                        quotation.id
                      }
                      onMenuToggle={() =>
                        setOpenMenuId(
                          openMenuId ===
                            quotation.id
                            ? null
                            : quotation.id
                        )
                      }
                      onStatusChange={
                        handleStatusChange
                      }
                      onDelete={handleDelete}
                    />
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESULT COUNT */}

      {!loading &&
        filteredQuotations.length >
          0 && (
          <p className="mt-4 text-sm text-slate-400">
            Showing{" "}
            {filteredQuotations.length}{" "}
            of {quotations.length} quotations
          </p>
        )}
    </div>
  );
}

/* =====================================================
   QUOTATION ROW
===================================================== */

function QuotationRow({
  quotation,
  isMenuOpen,
  onMenuToggle,
  onStatusChange,
  onDelete,
}: {
  quotation: Quotation;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onStatusChange: (
    quotation: Quotation,
    status: QuotationStatus
  ) => void;
  onDelete: (
    quotation: Quotation
  ) => void;
}) {
  const status =
    getStatus(quotation);

  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0">

      {/* NUMBER */}

      <td className="px-6 py-5">

        <Link
          href={`/quotations/${quotation.id}`}
          className="font-semibold text-slate-800 hover:text-blue-600"
        >
          {getQuotationNumber(
            quotation
          )}
        </Link>

        <p className="mt-1 text-xs text-slate-400">
          ID:{" "}
          {quotation.id.slice(
            0,
            8
          )}
        </p>
      </td>

      {/* CUSTOMER */}

      <td className="px-6 py-5">

        <p className="text-sm font-medium text-slate-700">
          {quotation.customerName ||
            "Unknown Customer"}
        </p>
      </td>

      {/* DATE */}

      <td className="px-6 py-5 text-sm text-slate-500">
        {formatDate(
          quotation.quotationDate ||
            quotation.createdAt
        )}
      </td>

      {/* VALID */}

      <td className="px-6 py-5 text-sm text-slate-500">
        {formatDate(
          quotation.validUntil
        )}
      </td>

      {/* AMOUNT */}

      <td className="px-6 py-5 text-right text-sm font-bold text-slate-800">
        {formatCurrency(
          getTotal(quotation)
        )}
      </td>

      {/* STATUS */}

      <td className="px-6 py-5 text-center">
        <QuotationStatusBadge
          status={status}
        />
      </td>

      {/* ACTION */}

      <td className="relative px-6 py-5 text-right">

        <button
          type="button"
          onClick={onMenuToggle}
          className="
            inline-flex h-9 w-9
            items-center justify-center
            rounded-lg text-slate-400
            hover:bg-slate-100
            hover:text-slate-700
          "
        >
          <MoreHorizontal size={19} />
        </button>

        {isMenuOpen && (
          <div
            className="
              absolute right-6 top-14 z-50
              w-52 overflow-hidden rounded-xl
              border border-slate-200
              bg-white py-1 text-left
              shadow-xl
            "
          >

            <Link
              href={`/quotations/${quotation.id}`}
              className="quotation-menu-item"
            >
              <Eye size={15} />
              View Details
            </Link>

            <Link
              href={`/quotations/${quotation.id}/edit`}
              className="quotation-menu-item"
            >
              <Copy size={15} />
              Edit Quotation
            </Link>

            <div className="my-1 border-t border-slate-100" />

            {status !== "sent" && (
              <button
                onClick={() =>
                  onStatusChange(
                    quotation,
                    "sent"
                  )
                }
                className="quotation-menu-item"
              >
                <Send size={15} />
                Mark as Sent
              </button>
            )}

            {status !== "accepted" && (
              <button
                onClick={() =>
                  onStatusChange(
                    quotation,
                    "accepted"
                  )
                }
                className="quotation-menu-item text-emerald-600"
              >
                <CheckCircle2 size={15} />
                Mark Accepted
              </button>
            )}

            {status !== "rejected" && (
              <button
                onClick={() =>
                  onStatusChange(
                    quotation,
                    "rejected"
                  )
                }
                className="quotation-menu-item text-orange-600"
              >
                <XCircle size={15} />
                Mark Rejected
              </button>
            )}

            <div className="my-1 border-t border-slate-100" />

            <button
              onClick={() =>
                onDelete(quotation)
              }
              className="quotation-menu-item text-red-600"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function QuotationStatusBadge({
  status,
}: {
  status: QuotationStatus;
}) {
  const config = {
    draft: {
      label: "Draft",
      className:
        "bg-slate-100 text-slate-600",
    },

    sent: {
      label: "Sent",
      className:
        "bg-blue-50 text-blue-600",
    },

    accepted: {
      label: "Accepted",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-600",
    },

    expired: {
      label:
        "Expired",
      className:
        "bg-orange-50 text-orange-600",
    },
  }[status];

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-3 py-1
        text-xs font-bold
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color:
    | "blue"
    | "slate"
    | "purple"
    | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    slate:
      "bg-slate-100 text-slate-600",
    purple:
      "bg-purple-50 text-purple-600",
    green:
      "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {value}
          </p>
        </div>

        <div
          className={`
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            ${colors[color]}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState() {
  return (
    <div
      className="
        flex min-h-[400px] flex-col
        items-center justify-center
        rounded-2xl border
        border-dashed border-slate-300
        bg-white p-8 text-center
      "
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <FileText size={30} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-800">
        No quotations found
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Create your first quotation and send
        a professional price proposal to your
        customer.
      </p>

      <Link
        href="/quotations/new"
        className="
          mt-6 inline-flex items-center
          gap-2 rounded-xl bg-blue-600
          px-5 py-3 text-sm
          font-semibold text-white
          hover:bg-blue-700
        "
      >
        <Plus size={17} />
        Create Quotation
      </Link>
    </div>
  );
}

/* =====================================================
   LOADING SKELETON
===================================================== */

function LoadingSkeleton() {
  return (
    <div
      className="
        overflow-hidden rounded-2xl
        border border-slate-200 bg-white
      "
    >
      {[1, 2, 3, 4, 5].map(
        (item) => (
          <div
            key={item}
            className="
              flex animate-pulse items-center
              gap-6 border-b border-slate-100
              p-6 last:border-0
            "
          >
            <div className="h-10 w-32 rounded-lg bg-slate-100" />
            <div className="h-10 flex-1 rounded-lg bg-slate-100" />
            <div className="h-10 w-24 rounded-lg bg-slate-100" />
            <div className="h-10 w-28 rounded-lg bg-slate-100" />
          </div>
        )
      )}
    </div>
  );
  }
