"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  IndianRupee,
  Percent,
  RefreshCcw,
  ReceiptText,
} from "lucide-react";

const GST_RATES = [0, 3, 5, 12, 18, 28];

export default function GstCalculatorPage() {
  const [amount, setAmount] = useState("1000");
  const [gstRate, setGstRate] = useState(18);
  const [calculationType, setCalculationType] =
    useState<"exclusive" | "inclusive">("exclusive");

  const [taxType, setTaxType] =
    useState<"intra" | "inter">("intra");

  const result = useMemo(() => {
    const value = Number(amount) || 0;
    const rate = Number(gstRate) || 0;

    let taxableAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (calculationType === "exclusive") {
      taxableAmount = value;
      gstAmount = (value * rate) / 100;
      totalAmount = taxableAmount + gstAmount;
    } else {
      totalAmount = value;
      taxableAmount =
        value / (1 + rate / 100);
      gstAmount = value - taxableAmount;
    }

    const cgst =
      taxType === "intra" ? gstAmount / 2 : 0;

    const sgst =
      taxType === "intra" ? gstAmount / 2 : 0;

    const igst =
      taxType === "inter" ? gstAmount : 0;

    return {
      taxableAmount,
      gstAmount,
      totalAmount,
      cgst,
      sgst,
      igst,
    };
  }, [
    amount,
    gstRate,
    calculationType,
    taxType,
  ]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const resetCalculator = () => {
    setAmount("1000");
    setGstRate(18);
    setCalculationType("exclusive");
    setTaxType("intra");
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Calculator size={23} />
            </span>
            GST Calculator
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Quickly calculate GST, CGST, SGST and IGST amounts.
          </p>
        </div>

        <button
          type="button"
          onClick={resetCalculator}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCcw size={16} />
          Reset
        </button>

      </div>

      <div className="grid gap-6 lg:grid-cols-5">

        {/* CALCULATOR */}

        <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <h2 className="font-bold text-slate-800">
              Calculate GST
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter an amount and select the applicable GST rate.
            </p>

          </div>

          <div className="space-y-6 p-5 sm:p-6">

            {/* AMOUNT */}

            <div>

              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Enter Amount
              </label>

              <div className="relative">

                <IndianRupee
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="Enter amount"
                  className="h-14 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-lg font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* INCLUSIVE / EXCLUSIVE */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Amount Type
              </label>

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setCalculationType("exclusive")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    calculationType === "exclusive"
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-700">
                    GST Exclusive
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    GST will be added to amount
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCalculationType("inclusive")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    calculationType === "inclusive"
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-700">
                    GST Inclusive
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    GST is included in amount
                  </p>
                </button>

              </div>

            </div>

            {/* GST RATE */}

            <div>

              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Percent size={16} />
                GST Rate
              </label>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">

                {GST_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setGstRate(rate)}
                    className={`h-12 rounded-xl border text-sm font-bold transition ${
                      gstRate === rate
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}

              </div>

            </div>

            {/* TAX TYPE */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Transaction Type
              </label>

              <div className="grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() => setTaxType("intra")}
                  className={`rounded-xl border p-4 text-left transition ${
                    taxType === "intra"
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-700">
                    Intra-State
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    CGST + SGST applicable
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTaxType("inter")}
                  className={`rounded-xl border p-4 text-left transition ${
                    taxType === "inter"
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-700">
                    Inter-State
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    IGST applicable
                  </p>
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* RESULT */}

        <aside className="lg:col-span-2">

          <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="bg-slate-900 p-6 text-white">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ReceiptText size={20} />
                </div>

                <div>
                  <p className="font-bold">
                    Calculation Result
                  </p>

                  <p className="mt-1 text-xs text-slate-300">
                    GST @ {gstRate}%
                  </p>
                </div>

              </div>

              <div className="mt-7">

                <p className="text-xs uppercase tracking-wider text-slate-400">
                  Total Amount
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {formatCurrency(result.totalAmount)}
                </p>

              </div>

            </div>

            <div className="divide-y divide-slate-100 p-2">

              <ResultRow
                label="Taxable Amount"
                value={formatCurrency(
                  result.taxableAmount
                )}
              />

              {taxType === "intra" ? (
                <>
                  <ResultRow
                    label={`CGST (${gstRate / 2}%)`}
                    value={formatCurrency(
                      result.cgst
                    )}
                  />

                  <ResultRow
                    label={`SGST (${gstRate / 2}%)`}
                    value={formatCurrency(
                      result.sgst
                    )}
                  />
                </>
              ) : (
                <ResultRow
                  label={`IGST (${gstRate}%)`}
                  value={formatCurrency(
                    result.igst
                  )}
                />
              )}

              <ResultRow
                label="Total GST"
                value={formatCurrency(
                  result.gstAmount
                )}
                highlight
              />

            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-5">

              <p className="text-xs leading-5 text-slate-500">
                This calculator provides an estimated GST
                calculation. Always verify final tax details
                before filing official returns.
              </p>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">

      <span
        className={
          highlight
            ? "font-bold text-slate-800"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          highlight
            ? "font-bold text-blue-600"
            : "text-sm font-semibold text-slate-700"
        }
      >
        {value}
      </span>

    </div>
  );
        }
