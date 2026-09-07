"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquarePlus,
  Plus,
  RefreshCw,
  Send,
  ThumbsUp,
  Wrench,
  X,
} from "lucide-react";

const SUPPORT_KEY = "smart_gst_support_requests";

type RequestType =
  | "Complaint"
  | "Feedback"
  | "Update Request"
  | "Technical Issue";

type RequestStatus =
  | "Open"
  | "In Progress"
  | "Resolved";

interface SupportRequest {
  id: string;
  type: RequestType;
  subject: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

const requestTypes: {
  type: RequestType;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    type: "Complaint",
    icon: <AlertCircle size={20} />,
    description: "Report a problem or issue",
  },
  {
    type: "Feedback",
    icon: <ThumbsUp size={20} />,
    description: "Share your suggestions",
  },
  {
    type: "Update Request",
    icon: <RefreshCw size={20} />,
    description: "Request a new feature",
  },
  {
    type: "Technical Issue",
    icon: <Wrench size={20} />,
    description: "Report a technical problem",
  },
];

export default function SupportPage() {
  const [requests, setRequests] = useState<
    SupportRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] =
    useState(false);

  const [type, setType] =
    useState<RequestType>("Complaint");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  /* LOAD REQUESTS */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        SUPPORT_KEY
      );

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setRequests(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load support requests:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* STATS */

  const stats = useMemo(() => {
    return {
      total: requests.length,
      open: requests.filter(
        (item) => item.status === "Open"
      ).length,
      progress: requests.filter(
        (item) =>
          item.status === "In Progress"
      ).length,
      resolved: requests.filter(
        (item) =>
          item.status === "Resolved"
      ).length,
    };
  }, [requests]);

  /* SUBMIT */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date().toISOString();

      const newRequest: SupportRequest = {
        id: `SUP-${Date.now()}`,
        type,
        subject: subject.trim(),
        message: message.trim(),
        status: "Open",
        createdAt: now,
        updatedAt: now,
      };

      const updatedRequests = [
        newRequest,
        ...requests,
      ];

      setRequests(updatedRequests);

      localStorage.setItem(
        SUPPORT_KEY,
        JSON.stringify(updatedRequests)
      );

      setSubject("");
      setMessage("");
      setType("Complaint");

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to submit support request:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateValue: string) => {
    const date = new Date(dateValue);

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
    <div className="mx-auto max-w-6xl pb-12">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Help & Support
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Report issues, share feedback or request
            improvements for Smart GST.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setShowForm(true);
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Request
        </button>

      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SupportStat
          label="Total Requests"
          value={stats.total}
          icon={<MessageSquarePlus size={20} />}
          variant="blue"
        />

        <SupportStat
          label="Open"
          value={stats.open}
          icon={<AlertCircle size={20} />}
          variant="orange"
        />

        <SupportStat
          label="In Progress"
          value={stats.progress}
          icon={<Clock3 size={20} />}
          variant="purple"
        />

        <SupportStat
          label="Resolved"
          value={stats.resolved}
          icon={<CheckCircle2 size={20} />}
          variant="green"
        />

      </div>

      {/* SUPPORT INTRO */}

      <section className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <MessageSquarePlus size={23} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Your feedback helps improve Smart GST
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Found a problem? Need a feature?
              Submit your request here. Every request
              is tracked so you can see its current
              status.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Submit a request
              <Send size={15} />
            </button>
          </div>

        </div>

      </section>

      {/* REQUEST LIST */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">

          <div>
            <h2 className="font-bold text-slate-800">
              Your Requests
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Track previously submitted requests.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {requests.length}
          </span>

        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <MessageSquarePlus size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No support requests yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-400">
              If you find an issue or have an idea,
              create your first request.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create Request
            </button>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {requests.map((request) => (
              <div
                key={request.id}
                className="p-5 transition hover:bg-slate-50 sm:p-6"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <RequestTypeBadge
                        type={request.type}
                      />

                      <span className="font-mono text-[10px] text-slate-400">
                        {request.id}
                      </span>

                    </div>

                    <h3 className="mt-3 font-bold text-slate-800">
                      {request.subject}
                    </h3>

                    <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-500">
                      {request.message}
                    </p>

                  </div>

                  <StatusBadge
                    status={request.status}
                  />

                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">

                  <Clock3 size={13} />

                  Submitted on{" "}
                  {formatDate(
                    request.createdAt
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* FORM MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">

          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">

              <div>
                <h2 className="font-bold text-slate-800">
                  Submit Support Request
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tell us how we can improve Smart GST.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!submitting) {
                    setShowForm(false);
                  }
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  Request Submitted!
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Your request has been recorded
                  successfully.
                </p>

              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-6"
              >

                {/* TYPE */}

                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    What do you need help with?
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {requestTypes.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() =>
                          setType(item.type)
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          type === item.type
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >

                        <div
                          className={`${
                            type === item.type
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          {item.type}
                        </p>

                        <p className="mt-1 text-[11px] leading-4 text-slate-400">
                          {item.description}
                        </p>

                      </button>
                    ))}

                  </div>

                </div>

                {/* SUBJECT */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <input
                    value={subject}
                    onChange={(event) =>
                      setSubject(
                        event.target.value
                      )
                    }
                    placeholder="Briefly describe your issue"
                    maxLength={120}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />

                </div>

                {/* MESSAGE */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Describe in detail
                  </label>

                  <textarea
                    value={message}
                    onChange={(event) =>
                      setMessage(
                        event.target.value
                      )
                    }
                    placeholder="Explain the problem, feedback or feature request..."
                    rows={6}
                    maxLength={2000}
                    required
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  />

                  <div className="mt-1 text-right text-[10px] text-slate-400">
                    {message.length}/2000
                  </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5">

                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                    disabled={submitting}
                    className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !subject.trim() ||
                      !message.trim()
                    }
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={17} />
                    )}

                    {submitting
                      ? "Submitting..."
                      : "Submit Request"}
                  </button>

                </div>

              </form>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* =============================================
   SUPPORT STAT
============================================= */

function SupportStat({
  label,
  value,
  icon,
  variant,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant:
    | "blue"
    | "orange"
    | "purple"
    | "green";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
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
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[variant]}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =============================================
   REQUEST TYPE BADGE
============================================= */

function RequestTypeBadge({
  type,
}: {
  type: RequestType;
}) {
  const styles: Record<
    RequestType,
    string
  > = {
    Complaint:
      "bg-red-50 text-red-600",
    Feedback:
      "bg-blue-50 text-blue-600",
    "Update Request":
      "bg-violet-50 text-violet-600",
    "Technical Issue":
      "bg-orange-50 text-orange-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${styles[type]}`}
    >
      {type}
    </span>
  );
}

/* =============================================
   STATUS BADGE
============================================= */

function StatusBadge({
  status,
}: {
  status: RequestStatus;
}) {
  const styles: Record<
    RequestStatus,
    string
  > = {
    Open:
      "bg-orange-50 text-orange-600",
    "In Progress":
      "bg-blue-50 text-blue-600",
    Resolved:
      "bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
  }
