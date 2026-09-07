"use client";

// app/(dashboard)/products/new/page.tsx

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Box,
  Check,
  FileText,
  IndianRupee,
  Loader2,
  Package,
  Save,
  Tag,
} from "lucide-react";

import type { Product } from "@/types";

import {
  STORAGE_KEYS,
  addItem,
} from "@/lib/storage";

/* =====================================================
   TYPES
===================================================== */

type ItemType = "product" | "service";

interface ProductFormData {
  name: string;
  type: ItemType;
  description: string;
  hsnSac: string;
  gstRate: string;
  unit: string;
  salePrice: string;
  purchasePrice: string;
  stock: string;
  lowStockAlert: string;
}

/* =====================================================
   CONSTANTS
===================================================== */

const GST_RATES = [
  0,
  0.1,
  0.25,
  3,
  5,
  12,
  18,
  28,
];

const UNITS = [
  "PCS",
  "NOS",
  "KG",
  "GRAM",
  "LITRE",
  "ML",
  "METER",
  "CM",
  "BOX",
  "PACK",
  "SET",
  "PAIR",
  "DOZEN",
  "BAG",
  "HOUR",
  "DAY",
  "MONTH",
];

/* =====================================================
   PAGE
===================================================== */

export default function NewProductPage() {
  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] =
    useState<ProductFormData>({
      name: "",
      type: "product",
      description: "",
      hsnSac: "",
      gstRate: "18",
      unit: "PCS",
      salePrice: "",
      purchasePrice: "",
      stock: "0",
      lowStockAlert: "5",
    });

  /* =============================================
     UPDATE FIELD
  ============================================= */

  function updateField(
    field: keyof ProductFormData,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =============================================
     SAVE PRODUCT
  ============================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert(
        "Please enter product or service name."
      );
      return;
    }

    if (
      !formData.salePrice ||
      Number(formData.salePrice) < 0
    ) {
      alert(
        "Please enter a valid selling price."
      );
      return;
    }

    setSaving(true);

    try {
      const now =
        new Date().toISOString();

      const product: Product = {
        id: crypto.randomUUID(),

        name:
          formData.name.trim(),

        type:
          formData.type,

        description:
          formData.description.trim(),

        hsnSac:
          formData.hsnSac.trim(),

        gstRate:
          Number(formData.gstRate) || 0,

        unit:
          formData.type === "service"
            ? ""
            : formData.unit,

        salePrice:
          Number(formData.salePrice) || 0,

        purchasePrice:
          Number(
            formData.purchasePrice
          ) || 0,

        stock:
          formData.type === "product"
            ? Number(formData.stock) || 0
            : 0,

        lowStockAlert:
          formData.type === "product"
            ? Number(
                formData.lowStockAlert
              ) || 0
            : 0,

        createdAt: now,
        updatedAt: now,
      };

      addItem(
        STORAGE_KEYS.PRODUCTS,
        product
      );

      window.location.href =
        `/products/${product.id}`;
    } catch (error) {
      console.error(
        "Failed to save product:",
        error
      );

      alert(
        "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =============================================
     CALCULATIONS
  ============================================= */

  const salePrice =
    Number(formData.salePrice) || 0;

  const purchasePrice =
    Number(formData.purchasePrice) || 0;

  const profit =
    salePrice - purchasePrice;

  const profitMargin =
    salePrice > 0
      ? (profit / salePrice) * 100
      : 0;

  return (
    <div className="mx-auto max-w-4xl">

      {/* =========================================
          BACK
      ========================================= */}

      <Link
        href="/products"
        className="
          mb-6 inline-flex items-center gap-2
          text-sm font-medium text-slate-500
          transition-colors hover:text-blue-600
        "
      >
        <ArrowLeft size={17} />
        Back to Products
      </Link>

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
          INVENTORY MANAGEMENT
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Add New Product
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add products or services for faster invoicing.
        </p>
      </div>

      {/* =========================================
          FORM
      ========================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* =======================================
            PRODUCT TYPE
        ======================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SectionHeading
            icon={<Package size={19} />}
            title="What are you adding?"
            description="Choose whether this is a physical product or service."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            {/* PRODUCT */}

            <TypeCard
              active={
                formData.type === "product"
              }
              icon={<Package size={23} />}
              title="Product"
              description="Physical goods with inventory stock"
              onClick={() =>
                updateField(
                  "type",
                  "product"
                )
              }
            />

            {/* SERVICE */}

            <TypeCard
              active={
                formData.type === "service"
              }
              icon={<Tag size={23} />}
              title="Service"
              description="Professional or business services"
              onClick={() =>
                updateField(
                  "type",
                  "service"
                )
              }
            />
          </div>
        </section>

        {/* =======================================
            BASIC INFORMATION
        ======================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SectionHeading
            icon={<FileText size={19} />}
            title="Basic Information"
            description="Enter the primary details of your item."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* NAME */}

            <FormInput
              label={
                formData.type === "product"
                  ? "Product Name"
                  : "Service Name"
              }
              required
              placeholder={
                formData.type === "product"
                  ? "e.g. Cotton T-Shirt"
                  : "e.g. Website Design Service"
              }
              value={formData.name}
              onChange={(value) =>
                updateField("name", value)
              }
            />

            {/* HSN SAC */}

            <FormInput
              label={
                formData.type === "product"
                  ? "HSN Code"
                  : "SAC Code"
              }
              placeholder={
                formData.type === "product"
                  ? "e.g. 6109"
                  : "e.g. 998314"
              }
              value={formData.hsnSac}
              onChange={(value) =>
                updateField(
                  "hsnSac",
                  value
                )
              }
            />

            {/* UNIT */}

            {formData.type === "product" && (
              <div>
                <label className={labelClass}>
                  Unit
                </label>

                <select
                  value={formData.unit}
                  onChange={(event) =>
                    updateField(
                      "unit",
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  {UNITS.map((unit) => (
                    <option
                      key={unit}
                      value={unit}
                    >
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* GST RATE */}

            <div>
              <label className={labelClass}>
                GST Rate
              </label>

              <select
                value={formData.gstRate}
                onChange={(event) =>
                  updateField(
                    "gstRate",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                {GST_RATES.map((rate) => (
                  <option
                    key={rate}
                    value={rate}
                  >
                    {rate}% GST
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="mt-5">
            <label className={labelClass}>
              Description
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <textarea
              rows={4}
              value={formData.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Add a short description about this product or service..."
              className={`${inputClass} h-auto resize-none py-3`}
            />
          </div>
        </section>

        {/* =======================================
            PRICING
        ======================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SectionHeading
            icon={<IndianRupee size={19} />}
            title="Pricing"
            description="Set your selling and purchase prices."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* SELLING PRICE */}

            <CurrencyInput
              label="Selling Price"
              required
              value={formData.salePrice}
              onChange={(value) =>
                updateField(
                  "salePrice",
                  value
                )
              }
              placeholder="0.00"
            />

            {/* PURCHASE PRICE */}

            <CurrencyInput
              label={
                formData.type === "product"
                  ? "Purchase Price"
                  : "Cost Price"
              }
              value={
                formData.purchasePrice
              }
              onChange={(value) =>
                updateField(
                  "purchasePrice",
                  value
                )
              }
              placeholder="0.00"
            />
          </div>

          {/* PROFIT PREVIEW */}

          {salePrice > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <PricePreview
                label="Estimated Profit"
                value={profit}
                positive={profit >= 0}
              />

              <PricePreview
                label="Profit Margin"
                value={profitMargin}
                suffix="%"
                positive={profitMargin >= 0}
              />
            </div>
          )}

          {/* GST INFO */}

          {salePrice > 0 && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                  <IndianRupee size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Price Preview
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Base price ₹
                    {salePrice.toLocaleString(
                      "en-IN"
                    )}{" "}
                    with{" "}
                    {formData.gstRate}% GST.
                  </p>

                  <p className="mt-2 text-sm font-bold text-blue-900">
                    GST Amount: ₹
                    {(
                      (salePrice *
                        Number(
                          formData.gstRate
                        )) /
                      100
                    ).toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =======================================
            INVENTORY
        ======================================= */}

        {formData.type === "product" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              icon={<Box size={19} />}
              title="Inventory"
              description="Manage available stock and low stock alerts."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* OPENING STOCK */}

              <NumberInput
                label="Opening Stock"
                value={formData.stock}
                onChange={(value) =>
                  updateField(
                    "stock",
                    value
                  )
                }
                placeholder="0"
              />

              {/* LOW STOCK */}

              <NumberInput
                label="Low Stock Alert"
                value={
                  formData.lowStockAlert
                }
                onChange={(value) =>
                  updateField(
                    "lowStockAlert",
                    value
                  )
                }
                placeholder="5"
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <AlertIcon />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Stock Alert
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    You will be notified when stock falls to{" "}
                    <strong>
                      {formData.lowStockAlert || 0}
                    </strong>{" "}
                    {formData.unit.toLowerCase()} or below.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =======================================
            SUMMARY
        ======================================= */}

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Check size={20} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                Ready to save
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                This item will be available while creating
                invoices and quotations.
              </p>
            </div>
          </div>
        </section>

        {/* =======================================
            ACTIONS
        ======================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/products"
            className="
              inline-flex h-11 items-center
              justify-center rounded-xl
              border border-slate-200 px-5
              text-sm font-semibold text-slate-600
              hover:bg-slate-50
            "
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex h-11 items-center
              justify-center gap-2 rounded-xl
              bg-blue-600 px-6 text-sm
              font-semibold text-white
              shadow-sm transition-all
              hover:bg-blue-700 hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =====================================================
   SECTION HEADING
===================================================== */

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   TYPE CARD
===================================================== */

function TypeCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-start gap-4
        rounded-xl border p-5
        text-left transition-all
        ${
          active
            ? "border-blue-500 bg-blue-50 ring-4 ring-blue-50"
            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
        }
      `}
    >
      <div
        className={`
          flex h-11 w-11 shrink-0
          items-center justify-center rounded-xl
          ${
            active
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500"
          }
        `}
      >
        {icon}
      </div>

      <div className="pr-6">
        <p
          className={`
            font-bold
            ${
              active
                ? "text-blue-700"
                : "text-slate-800"
            }
          `}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      {active && (
        <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check size={13} />
        </div>
      )}
    </button>
  );
}

/* =====================================================
   FORM INPUT
===================================================== */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

/* =====================================================
   CURRENCY INPUT
===================================================== */

function CurrencyInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
          ₹
        </span>

        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className={`${inputClass} pl-8`}
        />
      </div>
    </div>
  );
}

/* =====================================================
   NUMBER INPUT
===================================================== */

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
      </label>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

/* =====================================================
   PRICE PREVIEW
===================================================== */

function PricePreview({
  label,
  value,
  suffix = "",
  positive,
}: {
  label: string;
  value: number;
  suffix?: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`
          mt-1 text-lg font-bold
          ${
            positive
              ? "text-emerald-600"
              : "text-red-600"
          }
        `}
      >
        {suffix
          ? `${value.toFixed(1)}${suffix}`
          : `₹${value.toLocaleString(
              "en-IN",
              {
                maximumFractionDigits: 2,
              }
            )}`}
      </p>
    </div>
  );
}

/* =====================================================
   ALERT ICON
===================================================== */

function AlertIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
      <Box size={17} />
    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

const inputClass = `
  h-11 w-full rounded-xl
  border border-slate-200
  bg-white px-3 text-sm
  text-slate-800 outline-none
  transition-all
  placeholder:text-slate-400
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-50
`;
