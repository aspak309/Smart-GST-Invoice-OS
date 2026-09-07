"use client";

// app/(dashboard)/products/[id]/page.tsx

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Check,
  Edit3,
  FileText,
  IndianRupee,
  Loader2,
  Package,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import type { Product } from "@/types";

import {
  STORAGE_KEYS,
  getCollection,
  updateItem,
  removeItem,
} from "@/lib/storage";

import { formatCurrency } from "@/lib/format-utils";

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
   HELPERS
===================================================== */

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number)
    ? number
    : 0;
}

/* =====================================================
   PAGE
===================================================== */

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
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
     LOAD PRODUCT
  ============================================= */

  useEffect(() => {
    if (!productId) return;

    try {
      const products =
        getCollection<Product>(
          STORAGE_KEYS.PRODUCTS
        );

      const foundProduct =
        products.find(
          (item) =>
            item.id === productId
        );

      if (foundProduct) {
        setProduct(foundProduct);

        setFormData({
          name:
            foundProduct.name || "",

          type:
            foundProduct.type === "service"
              ? "service"
              : "product",

          description:
            foundProduct.description || "",

          hsnSac:
            foundProduct.hsnSac || "",

          gstRate: String(
            safeNumber(
              foundProduct.gstRate
            )
          ),

          unit:
            foundProduct.unit || "PCS",

          salePrice: String(
            safeNumber(
              foundProduct.salePrice
            )
          ),

          purchasePrice: String(
            safeNumber(
              foundProduct.purchasePrice
            )
          ),

          stock: String(
            safeNumber(
              foundProduct.stock
            )
          ),

          lowStockAlert: String(
            safeNumber(
              foundProduct.lowStockAlert
            )
          ),
        });
      }
    } catch (error) {
      console.error(
        "Failed to load product:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

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
     CANCEL EDIT
  ============================================= */

  function handleCancelEdit() {
    if (!product) return;

    setFormData({
      name: product.name || "",
      type:
        product.type === "service"
          ? "service"
          : "product",

      description:
        product.description || "",

      hsnSac:
        product.hsnSac || "",

      gstRate: String(
        safeNumber(product.gstRate)
      ),

      unit:
        product.unit || "PCS",

      salePrice: String(
        safeNumber(product.salePrice)
      ),

      purchasePrice: String(
        safeNumber(product.purchasePrice)
      ),

      stock: String(
        safeNumber(product.stock)
      ),

      lowStockAlert: String(
        safeNumber(product.lowStockAlert)
      ),
    });

    setEditing(false);
  }

  /* =============================================
     SAVE EDIT
  ============================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!product) return;

    if (!formData.name.trim()) {
      alert("Please enter a name.");
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
      const updatedProduct: Product = {
        ...product,

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

        updatedAt:
          new Date().toISOString(),
      };

      updateItem(
        STORAGE_KEYS.PRODUCTS,
        product.id,
        updatedProduct
      );

      setProduct(updatedProduct);
      setEditing(false);
    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );

      alert(
        "Unable to update product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =============================================
     DELETE PRODUCT
  ============================================= */

  function handleDelete() {
    if (!product) return;

    try {
      removeItem(
        STORAGE_KEYS.PRODUCTS,
        product.id
      );

      router.push("/products");
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );

      alert(
        "Unable to delete product."
      );
    }
  }

  /* =============================================
     CALCULATIONS
  ============================================= */

  const calculations = useMemo(() => {
    if (!product) {
      return {
        profit: 0,
        margin: 0,
        inventoryValue: 0,
        gstAmount: 0,
      };
    }

    const salePrice =
      safeNumber(product.salePrice);

    const purchasePrice =
      safeNumber(
        product.purchasePrice
      );

    const stock =
      safeNumber(product.stock);

    const gstRate =
      safeNumber(product.gstRate);

    const profit =
      salePrice - purchasePrice;

    return {
      profit,

      margin:
        salePrice > 0
          ? (profit / salePrice) * 100
          : 0,

      inventoryValue:
        stock * purchasePrice,

      gstAmount:
        (salePrice * gstRate) / 100,
    };
  }, [product]);

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return <PageSkeleton />;
  }

  /* =============================================
     NOT FOUND
  ============================================= */

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Package size={28} />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-800">
          Product not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          This product may have been deleted.
        </p>

        <Link
          href="/products"
          className="
            mt-6 inline-flex items-center gap-2
            rounded-xl bg-blue-600 px-5 py-2.5
            text-sm font-semibold text-white
          "
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>
      </div>
    );
  }

  const isService =
    product.type === "service";

  const stock =
    safeNumber(product.stock);

  const lowStockLimit =
    safeNumber(
      product.lowStockAlert
    );

  const isOutOfStock =
    !isService && stock <= 0;

  const isLowStock =
    !isService &&
    stock > 0 &&
    lowStockLimit > 0 &&
    stock <= lowStockLimit;

  /* =============================================
     EDIT MODE
  ============================================= */

  if (editing) {
    return (
      <EditProductForm
        product={product}
        formData={formData}
        saving={saving}
        updateField={updateField}
        onCancel={handleCancelEdit}
        onSubmit={handleSubmit}
      />
    );
  }

  /* =============================================
     VIEW MODE
  ============================================= */

  return (
    <div className="mx-auto max-w-6xl">

      {/* =========================================
          BACK
      ========================================= */}

      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/products"
          className="
            inline-flex items-center gap-2
            text-sm font-medium text-slate-500
            hover:text-blue-600
          "
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setEditing(true)
            }
            className="
              inline-flex h-10 items-center gap-2
              rounded-xl border border-slate-200
              bg-white px-4 text-sm
              font-semibold text-slate-700
              hover:bg-slate-50
            "
          >
            <Edit3 size={16} />
            <span className="hidden sm:inline">
              Edit
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setShowDeleteModal(true)
            }
            className="
              inline-flex h-10 items-center gap-2
              rounded-xl border border-red-100
              bg-red-50 px-4 text-sm
              font-semibold text-red-600
              hover:bg-red-100
            "
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">
              Delete
            </span>
          </button>
        </div>
      </div>

      {/* =========================================
          HERO CARD
      ========================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            {/* PRODUCT INFO */}

            <div className="flex gap-4">
              <div
                className={`
                  flex h-16 w-16 shrink-0
                  items-center justify-center
                  rounded-2xl
                  ${
                    isService
                      ? "bg-violet-50 text-violet-600"
                      : "bg-blue-50 text-blue-600"
                  }
                `}
              >
                {isService ? (
                  <Tag size={28} />
                ) : (
                  <Package size={28} />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`
                      rounded-full px-2.5 py-1
                      text-[10px] font-bold
                      ${
                        isService
                          ? "bg-violet-50 text-violet-600"
                          : "bg-blue-50 text-blue-600"
                      }
                    `}
                  >
                    {isService
                      ? "SERVICE"
                      : "PRODUCT"}
                  </span>

                  {!isService && (
                    <ProductStatusBadge
                      stock={stock}
                      lowStockLimit={
                        lowStockLimit
                      }
                    />
                  )}
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    {product.description}
                  </p>
                )}
              </div>
            </div>

            {/* PRICE */}

            <div className="rounded-xl bg-slate-50 px-5 py-4 sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Selling Price
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(
                  safeNumber(
                    product.salePrice
                  )
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                + {product.gstRate}% GST
              </p>
            </div>
          </div>
        </div>

        {/* QUICK DETAILS */}

        <div className="grid border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          <QuickInfo
            label={
              isService
                ? "SAC Code"
                : "HSN Code"
            }
            value={
              product.hsnSac || "—"
            }
          />

          <QuickInfo
            label="GST Rate"
            value={`${safeNumber(
              product.gstRate
            )}%`}
          />

          <QuickInfo
            label={
              isService
                ? "Type"
                : "Available Stock"
            }
            value={
              isService
                ? "Service"
                : `${stock} ${
                    product.unit || "PCS"
                  }`
            }
          />

          <QuickInfo
            label="Last Updated"
            value={
              product.updatedAt
                ? new Date(
                    product.updatedAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "—"
            }
          />
        </div>
      </section>

      {/* =========================================
          LOW STOCK WARNING
      ========================================= */}

      {(isOutOfStock || isLowStock) && (
        <div
          className={`
            mt-6 flex items-start gap-3
            rounded-xl border p-4
            ${
              isOutOfStock
                ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
            }
          `}
        >
          <AlertTriangle
            size={20}
            className={
              isOutOfStock
                ? "text-red-600"
                : "text-amber-600"
            }
          />

          <div>
            <p
              className={`
                text-sm font-bold
                ${
                  isOutOfStock
                    ? "text-red-800"
                    : "text-amber-800"
                }
              `}
            >
              {isOutOfStock
                ? "Product is out of stock"
                : "Low stock alert"}
            </p>

            <p
              className={`
                mt-1 text-xs
                ${
                  isOutOfStock
                    ? "text-red-700"
                    : "text-amber-700"
                }
              `}
            >
              Current stock is {stock}{" "}
              {product.unit || "PCS"}.
              {lowStockLimit > 0 &&
                ` Alert limit is ${lowStockLimit}.`}
            </p>
          </div>
        </div>
      )}

      {/* =========================================
          DETAILS GRID
      ========================================= */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        {/* LEFT */}

        <div className="space-y-6 lg:col-span-2">

          {/* PRICING */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionTitle
              icon={<IndianRupee size={19} />}
              title="Pricing Details"
              description="Selling price, cost and profit overview."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <MetricCard
                label="Selling Price"
                value={formatCurrency(
                  safeNumber(
                    product.salePrice
                  )
                )}
              />

              <MetricCard
                label="Purchase Price"
                value={formatCurrency(
                  safeNumber(
                    product.purchasePrice
                  )
                )}
              />

              <MetricCard
                label="Estimated Profit"
                value={formatCurrency(
                  calculations.profit
                )}
                highlight={
                  calculations.profit >= 0
                    ? "success"
                    : "danger"
                }
              />

              <MetricCard
                label="Profit Margin"
                value={`${calculations.margin.toFixed(
                  1
                )}%`}
                highlight={
                  calculations.margin >= 0
                    ? "success"
                    : "danger"
                }
              />
            </div>
          </section>

          {/* GST */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionTitle
              icon={<FileText size={19} />}
              title="GST Information"
              description="Tax details used for invoices."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="GST Rate"
                value={`${safeNumber(
                  product.gstRate
                )}%`}
              />

              <MetricCard
                label="GST Amount"
                value={formatCurrency(
                  calculations.gstAmount
                )}
              />

              <MetricCard
                label="Price incl. GST"
                value={formatCurrency(
                  safeNumber(
                    product.salePrice
                  ) +
                    calculations.gstAmount
                )}
              />
            </div>

            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <p className="text-xs leading-6 text-blue-700">
                GST will automatically be calculated when
                this item is added to an invoice.
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          {/* INVENTORY */}

          {!isService && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <SectionTitle
                icon={<Box size={19} />}
                title="Inventory"
                description="Current stock status."
              />

              <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Available Stock
                </p>

                <p
                  className={`
                    mt-2 text-4xl font-bold
                    ${
                      isOutOfStock
                        ? "text-red-600"
                        : isLowStock
                        ? "text-amber-600"
                        : "text-slate-900"
                    }
                  `}
                >
                  {stock}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {product.unit || "PCS"}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <InfoRow
                  label="Low Stock Alert"
                  value={`${lowStockLimit} ${
                    product.unit || "PCS"
                  }`}
                />

                <InfoRow
                  label="Inventory Value"
                  value={formatCurrency(
                    calculations.inventoryValue
                  )}
                />
              </div>
            </section>
          )}

          {/* ITEM INFORMATION */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionTitle
              icon={<Package size={19} />}
              title="Item Details"
              description="Product classification."
            />

            <div className="mt-5 space-y-1">
              <InfoRow
                label="Item Type"
                value={
                  isService
                    ? "Service"
                    : "Product"
                }
              />

              <InfoRow
                label={
                  isService
                    ? "SAC Code"
                    : "HSN Code"
                }
                value={
                  product.hsnSac || "Not added"
                }
              />

              {!isService && (
                <InfoRow
                  label="Unit"
                  value={
                    product.unit || "PCS"
                  }
                />
              )}

              <InfoRow
                label="GST Rate"
                value={`${safeNumber(
                  product.gstRate
                )}%`}
              />
            </div>
          </section>

          {/* CREATED */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              RECORD INFORMATION
            </p>

            <div className="mt-4 space-y-3">
              <InfoRow
                label="Created"
                value={
                  product.createdAt
                    ? new Date(
                        product.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "—"
                }
              />

              <InfoRow
                label="Updated"
                value={
                  product.updatedAt
                    ? new Date(
                        product.updatedAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "—"
                }
              />
            </div>
          </section>
        </div>
      </div>

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {showDeleteModal && (
        <DeleteModal
          productName={product.name}
          onCancel={() =>
            setShowDeleteModal(false)
          }
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* =====================================================
   EDIT PRODUCT FORM
===================================================== */

function EditProductForm({
  product,
  formData,
  saving,
  updateField,
  onCancel,
  onSubmit,
}: {
  product: Product;
  formData: ProductFormData;
  saving: boolean;
  updateField: (
    field: keyof ProductFormData,
    value: string
  ) => void;
  onCancel: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">

      <button
        type="button"
        onClick={onCancel}
        className="
          mb-6 inline-flex items-center gap-2
          text-sm font-medium text-slate-500
          hover:text-blue-600
        "
      >
        <ArrowLeft size={17} />
        Cancel Editing
      </button>

      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          EDIT PRODUCT
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Edit {product.name}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update product information and save changes.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6"
      >
        {/* TYPE */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold text-slate-800">
            Item Type
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TypeOption
              active={
                formData.type === "product"
              }
              icon={<Package size={21} />}
              title="Product"
              description="Physical inventory item"
              onClick={() =>
                updateField(
                  "type",
                  "product"
                )
              }
            />

            <TypeOption
              active={
                formData.type === "service"
              }
              icon={<Tag size={21} />}
              title="Service"
              description="Professional service"
              onClick={() =>
                updateField(
                  "type",
                  "service"
                )
              }
            />
          </div>
        </section>

        {/* BASIC */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold text-slate-800">
            Basic Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <InputField
              label="Name"
              required
              value={formData.name}
              onChange={(value) =>
                updateField("name", value)
              }
            />

            <InputField
              label={
                formData.type === "service"
                  ? "SAC Code"
                  : "HSN Code"
              }
              value={formData.hsnSac}
              onChange={(value) =>
                updateField(
                  "hsnSac",
                  value
                )
              }
            />

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

          <div className="mt-5">
            <label className={labelClass}>
              Description
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
              className={`${inputClass} h-auto resize-none py-3`}
            />
          </div>
        </section>

        {/* PRICING */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-bold text-slate-800">
            Pricing
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <CurrencyField
              label="Selling Price"
              required
              value={formData.salePrice}
              onChange={(value) =>
                updateField(
                  "salePrice",
                  value
                )
              }
            />

            <CurrencyField
              label="Purchase Price"
              value={
                formData.purchasePrice
              }
              onChange={(value) =>
                updateField(
                  "purchasePrice",
                  value
                )
              }
            />
          </div>
        </section>

        {/* INVENTORY */}

        {formData.type === "product" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Inventory
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <NumberField
                label="Current Stock"
                value={formData.stock}
                onChange={(value) =>
                  updateField(
                    "stock",
                    value
                  )
                }
              />

              <NumberField
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
              />
            </div>
          </section>
        )}

        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="
              h-11 rounded-xl border border-slate-200
              px-5 text-sm font-semibold
              text-slate-600 hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex h-11 items-center
              justify-center gap-2 rounded-xl
              bg-blue-600 px-6 text-sm
              font-semibold text-white
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function QuickInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-100 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "success" | "danger";
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`
          mt-2 text-lg font-bold
          ${
            highlight === "success"
              ? "text-emerald-600"
              : highlight === "danger"
              ? "text-red-600"
              : "text-slate-800"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function ProductStatusBadge({
  stock,
  lowStockLimit,
}: {
  stock: number;
  lowStockLimit: number;
}) {
  if (stock <= 0) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
        OUT OF STOCK
      </span>
    );
  }

  if (
    lowStockLimit > 0 &&
    stock <= lowStockLimit
  ) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600">
        LOW STOCK
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
      IN STOCK
    </span>
  );
}

function TypeOption({
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
        flex items-center gap-3 rounded-xl
        border p-4 text-left transition-all
        ${
          active
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:bg-slate-50"
        }
      `}
    >
      <div
        className={`
          flex h-10 w-10 items-center
          justify-center rounded-lg
          ${
            active
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500"
          }
        `}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      {active && (
        <Check
          size={17}
          className="ml-auto text-blue-600"
        />
      )}
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </div>
  );
}

function CurrencyField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
          className={`${inputClass} pl-8`}
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        className={inputClass}
      />
    </div>
  );
}

function DeleteModal({
  productName,
  onCancel,
  onConfirm,
}: {
  productName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Trash2 size={21} />
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Delete Product?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          You are about to permanently delete{" "}
          <strong className="text-slate-800">
            {productName}
          </strong>
          .
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-xl border border-slate-200
              px-4 py-2.5 text-sm
              font-semibold text-slate-600
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
              rounded-xl bg-red-600
              px-4 py-2.5 text-sm
              font-semibold text-white
              hover:bg-red-700
            "
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="mb-6 h-5 w-36 rounded bg-slate-200" />

      <div className="h-72 rounded-2xl bg-slate-200" />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-72 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>

        <div className="space-y-6">
          <div className="h-80 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
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
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-50
`;
