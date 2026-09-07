"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Send,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const SUPPORT_KEY = "smart_gst_support_requests";

type RequestType =
  | "Complaint"
  | "Feedback"
  | "Update Request"
  | "Technical Issue";

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

export default function NewSupportRequestPage() {
  const [type, setType] =
    useState<RequestType>("Complaint");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date().toISOString();

      const newRequest = {
        id: `SUP-${Date.now()}`,
        type,
        subject: subject.trim(),
        message: message.trim(),
        status: "Open",
        createdAt: now,
        updatedAt: now,
      };

      const stored = localStorage.getItem(
        SUPPORT_KEY
      );

      const existingRequests = stored
        ? JSON.parse(stored)
        : [];

      const updatedRequests = [
        newRequest,
        ...(Array.isArray(existingRequests)
          ? existingRequests
          : []),
      ];

      localStorage.setItem(
        SUPPORT_KEY,
        JSON.stringify(updatedRequests)
      );

      setSuccess(true);
    } catch (error) {
      console.error(
        "Failed to submit support request:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-800">
            Request Submitted!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Thank you for your feedback. Your request
            has been successfully recorded and can now
            be tracked from the support section.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <Link
              href="/support"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <MessageSquarePlus size={17} />
              View My Requests
            </Link>

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setSubject("");
                setMessage("");
                setType("Complaint");
              }}
              className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Submit Another
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">

      {/* BACK */}

      <Link
        href="/support"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Back to Support
      </Link>

      {/* HEADER */}

      <div className="rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-200 p-5 sm:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquarePlus size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                Submit Support Request
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Report an issue, share feedback or request
                a new feature for Smart GST.
              </p>
            </div>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-7"
        >

          {/* REQUEST TYPE */}

          <div>

            <label className="mb-3 block text-sm font-semibold text-slate-700">
              What is your request about?
            </label>

            <div className="grid gap-3 sm:grid-cols-2">

              {requestTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  className={`rounded-xl border p-4 text-left transition ${
                    type === item.type
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >

                  <div
                    className={
                      type === item.type
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  >
                    {item.icon}
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-700">
                    {item.type}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {item.description}
                  </p>

                </button>
              ))}

            </div>

          </div>

          {/* SUBJECT */}

          <div className="mt-6">

            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Subject
            </label>

            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              placeholder="Briefly describe your request"
              maxLength={120}
              required
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-1 text-right text-[11px] text-slate-400">
              {subject.length}/120
            </div>

          </div>

          {/* MESSAGE */}

          <div className="mt-5">

            <label
              htmlFor="message"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Describe your request
            </label>

            <textarea
              id="message"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Please explain in detail so we can better understand your request..."
              rows={8}
              maxLength={2000}
              required
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>
                Please provide enough detail for better support.
              </span>

              <span>
                {message.length}/2000
              </span>
            </div>

          </div>

          {/* INFO */}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

            <p className="text-sm font-semibold text-blue-800">
              Your request will be tracked
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-600">
              After submission, you can check the
              current status of your request from the
              Help & Support page.
            </p>

          </div>

          {/* ACTIONS */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <Link
              href="/support"
              className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                submitting ||
                !subject.trim() ||
                !message.trim()
              }
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Request
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
              }
