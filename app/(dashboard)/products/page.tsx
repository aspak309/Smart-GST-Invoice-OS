"use client";

// app/(dashboard)/products/page.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  ChevronRight,
  Edit3,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import type { Product } from "@/types";

import {
  STORAGE_KEYS,
  getCollection,
  removeItem,
} from "@/lib/storage";

import { formatCurrency } from "@/lib/format-utils";

/* =====================================================
   TYPES
===================================================== */

type ProductFilter = "all" | "products" | "services";

/* =====================================================
   HELPERS
===================================================== */

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getProductType(product: Product): string {
  return (product.type || "product").toLowerCase();
}

function getStock(product: Product): number {
  return safeNumber(product.stock);
}

function getLowStockLimit(product: Product): number {
  return safeNumber(product.lowStockAlert);
}

/* =====================================================
   PAGE
===================================================== */

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [filter, setFilter] =
    useState<ProductFilter>("all");

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  /* =============================================
     LOAD PRODUCTS
  ============================================= */

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    try {
      const savedProducts =
        getCollection<Product>(
          STORAGE_KEYS.PRODUCTS
        );

      setProducts(savedProducts);
    } catch (error) {
      console.error(
        "Failed to load products:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =============================================
     FILTER PRODUCTS
  ============================================= */

  const filteredProducts = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name
          ?.toLowerCase()
          .includes(query) ||
        product.hsnSac
          ?.toLowerCase()
          .includes(query);

      const type = getProductType(product);

      const matchesFilter =
        filter === "all" ||
        (filter === "products" &&
          type === "product") ||
        (filter === "services" &&
          type === "service");

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    products,
    searchQuery,
    filter,
  ]);

  /* =============================================
     STATS
  ============================================= */

  const stats = useMemo(() => {
    const productCount =
      products.filter(
        (product) =>
          getProductType(product) ===
          "product"
      ).length;

    const serviceCount =
      products.filter(
        (product) =>
          getProductType(product) ===
          "service"
      ).length;

    const lowStockCount =
      products.filter((product) => {
        if (
          getProductType(product) ===
          "service"
        ) {
          return false;
        }

        const stock =
          getStock(product);

        const limit =
          getLowStockLimit(product);

        return (
          stock <= limit &&
          limit > 0
        );
      }).length;

    const inventoryValue =
      products.reduce(
        (total, product) => {
          if (
            getProductType(product) ===
            "service"
          ) {
            return total;
          }

          return (
            total +
            getStock(product) *
              safeNumber(
                product.purchasePrice
              )
          );
        },
        0
      );

    return {
      total: products.length,
      productCount,
      serviceCount,
      lowStockCount,
      inventoryValue,
    };
  }, [products]);

  /* =============================================
     DELETE
  ============================================= */

  function handleDelete() {
    if (!deleteProduct) return;

    try {
      removeItem(
        STORAGE_KEYS.PRODUCTS,
        deleteProduct.id
      );

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !==
            deleteProduct.id
        )
      );

      setDeleteProduct(null);
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );

      alert(
        "Unable to delete product. Please try again."
      );
    }
  }

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return <ProductsSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            INVENTORY MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Products & Services
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage products, services, prices and GST rates.
          </p>
        </div>

        <Link
          href="/products/new"
          className="
            inline-flex h-11 items-center
            justify-center gap-2 rounded-xl
            bg-blue-600 px-5 text-sm
            font-semibold text-white
            shadow-sm transition-all
            hover:bg-blue-700 hover:shadow-md
          "
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* =========================================
          STATS
      ========================================= */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Package size={20} />}
          title="Total Items"
          value={String(stats.total)}
          description="Products & services"
        />

        <StatCard
          icon={<Box size={20} />}
          title="Products"
          value={String(stats.productCount)}
          description="Physical inventory items"
        />

        <StatCard
          icon={<Tag size={20} />}
          title="Services"
          value={String(stats.serviceCount)}
          description="Service offerings"
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Low Stock"
          value={String(stats.lowStockCount)}
          description="Items need attention"
          warning={stats.lowStockCount > 0}
        />
      </div>

      {/* =========================================
          LOW STOCK ALERT
      ========================================= */}

      {stats.lowStockCount > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="text-sm font-semibold text-amber-800">
              Low stock alert
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              {stats.lowStockCount} item
              {stats.lowStockCount > 1
                ? "s are"
                : " is"}{" "}
              running low on stock.
            </p>
          </div>
        </div>
      )}

      {/* =========================================
          MAIN CARD
      ========================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* =======================================
            TOOLBAR
        ======================================= */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* SEARCH */}

          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="
                pointer-events-none absolute
                left-3 top-1/2 -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search products or HSN..."
              className="
                h-11 w-full rounded-xl
                border border-slate-200
                bg-slate-50 pl-10 pr-10
                text-sm outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-slate-400 hover:text-slate-700
                "
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* FILTERS */}

          <div className="flex rounded-lg bg-slate-100 p-1">
            <FilterButton
              active={filter === "all"}
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </FilterButton>

            <FilterButton
              active={
                filter === "products"
              }
              onClick={() =>
                setFilter("products")
              }
            >
              Products
            </FilterButton>

            <FilterButton
              active={
                filter === "services"
              }
              onClick={() =>
                setFilter("services")
              }
            >
              Services
            </FilterButton>
          </div>
        </div>

        {/* =======================================
            TABLE
        ======================================= */}

        {filteredProducts.length === 0 ? (
          <EmptyProducts
            hasProducts={
              products.length > 0
            }
            searchQuery={searchQuery}
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <TableHead>
                      Product
                    </TableHead>

                    <TableHead>
                      HSN / SAC
                    </TableHead>

                    <TableHead>
                      GST
                    </TableHead>

                    <TableHead>
                      Selling Price
                    </TableHead>

                    <TableHead>
                      Stock
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead align="right">
                      Actions
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => (
                      <ProductTableRow
                        key={product.id}
                        product={product}
                        onDelete={() =>
                          setDeleteProduct(
                            product
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredProducts.map(
                (product) => (
                  <ProductMobileCard
                    key={product.id}
                    product={product}
                    onDelete={() =>
                      setDeleteProduct(
                        product
                      )
                    }
                  />
                )
              )}
            </div>
          </>
        )}

        {/* =======================================
            FOOTER
        ======================================= */}

        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredProducts.length}
              </span>{" "}
              of {products.length} items
            </p>

            <p className="hidden text-xs text-slate-400 sm:block">
              Inventory value:{" "}
              <span className="font-semibold text-slate-600">
                {formatCurrency(
                  stats.inventoryValue
                )}
              </span>
            </p>
          </div>
        )}
      </section>

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {deleteProduct && (
        <DeleteProductModal
          product={deleteProduct}
          onCancel={() =>
            setDeleteProduct(null)
          }
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* =====================================================
   PRODUCT TABLE ROW
===================================================== */

function ProductTableRow({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: () => void;
}) {
  const isService =
    getProductType(product) ===
    "service";

  const stock = getStock(product);

  const lowStock =
    !isService &&
    getLowStockLimit(product) > 0 &&
    stock <=
      getLowStockLimit(product);

  return (
    <tr className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/70">

      {/* PRODUCT */}

      <td className="px-5 py-4">
        <Link
          href={`/products/${product.id}`}
          className="flex items-center gap-3"
        >
          <div
            className={`
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              ${
                isService
                  ? "bg-violet-50 text-violet-600"
                  : "bg-blue-50 text-blue-600"
              }
            `}
          >
            {isService ? (
              <Tag size={18} />
            ) : (
              <Package size={18} />
            )}
          </div>

          <div className="min-w-0">
            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-800 group-hover:text-blue-600">
              {product.name}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {isService
                ? "Service"
                : "Product"}
              {product.unit
                ? ` • ${product.unit}`
                : ""}
            </p>
          </div>
        </Link>
      </td>

      {/* HSN */}

      <td className="px-5 py-4">
        <span className="font-mono text-xs text-slate-600">
          {product.hsnSac || "—"}
        </span>
      </td>

      {/* GST */}

      <td className="px-5 py-4">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          {safeNumber(product.gstRate)}%
        </span>
      </td>

      {/* SELLING PRICE */}

      <td className="px-5 py-4">
        <span className="text-sm font-semibold text-slate-800">
          {formatCurrency(
            safeNumber(product.salePrice)
          )}
        </span>
      </td>

      {/* STOCK */}

      <td className="px-5 py-4">
        {isService ? (
          <span className="text-xs text-slate-400">
            Not applicable
          </span>
        ) : (
          <div>
            <p
              className={`
                text-sm font-semibold
                ${
                  lowStock
                    ? "text-amber-600"
                    : "text-slate-700"
                }
              `}
            >
              {stock}{" "}
              <span className="text-xs font-normal">
                {product.unit || "pcs"}
              </span>
            </p>

            {lowStock && (
              <p className="mt-1 text-[10px] font-medium text-amber-600">
                Low stock
              </p>
            )}
          </div>
        )}
      </td>

      {/* STATUS */}

      <td className="px-5 py-4">
        <StockBadge
          product={product}
        />
      </td>

      {/* ACTIONS */}

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <Link
            href={`/products/${product.id}`}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-slate-400
              hover:bg-blue-50 hover:text-blue-600
            "
          >
            <Edit3 size={15} />
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="
              flex h-8 w-8 items-center
              justify-center rounded-lg
              text-slate-400
              hover:bg-red-50 hover:text-red-500
            "
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =====================================================
   MOBILE PRODUCT CARD
===================================================== */

function ProductMobileCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: () => void;
}) {
  const isService =
    getProductType(product) ===
    "service";

  return (
    <div className="p-4">
      <div className="flex gap-3">

        <div
          className={`
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-xl
            ${
              isService
                ? "bg-violet-50 text-violet-600"
                : "bg-blue-50 text-blue-600"
            }
          `}
        >
          {isService ? (
            <Tag size={19} />
          ) : (
            <Package size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-3">
            <Link
              href={`/products/${product.id}`}
              className="min-w-0"
            >
              <p className="truncate text-sm font-bold text-slate-800">
                {product.name}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {product.hsnSac
                  ? `HSN: ${product.hsnSac}`
                  : isService
                  ? "Service"
                  : "Product"}
              </p>
            </Link>

            <StockBadge
              product={product}
            />
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Selling Price
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {formatCurrency(
                  safeNumber(
                    product.salePrice
                  )
                )}
              </p>
            </div>

            <div className="flex gap-1">
              <Link
                href={`/products/${product.id}`}
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-lg
                  border border-slate-200
                  text-slate-500
                "
              >
                <Edit3 size={15} />
              </Link>

              <button
                type="button"
                onClick={onDelete}
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-lg
                  border border-red-100
                  text-red-500
                "
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   STOCK BADGE
===================================================== */

function StockBadge({
  product,
}: {
  product: Product;
}) {
  const isService =
    getProductType(product) ===
    "service";

  if (isService) {
    return (
      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-600">
        SERVICE
      </span>
    );
  }

  const stock = getStock(product);
  const limit =
    getLowStockLimit(product);

  if (stock <= 0) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
        OUT OF STOCK
      </span>
    );
  }

  if (
    limit > 0 &&
    stock <= limit
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

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  title,
  value,
  description,
  warning = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div
        className={`
          flex h-10 w-10 items-center
          justify-center rounded-xl
          ${
            warning
              ? "bg-amber-50 text-amber-600"
              : "bg-blue-50 text-blue-600"
          }
        `}
      >
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p
        className={`
          mt-1 text-2xl font-bold
          ${
            warning
              ? "text-amber-600"
              : "text-slate-900"
          }
        `}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   FILTER BUTTON
===================================================== */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-md px-3 py-1.5
        text-xs font-semibold
        transition-all
        ${
          active
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }
      `}
    >
      {children}
    </button>
  );
}

/* =====================================================
   TABLE HEAD
===================================================== */

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`
        px-5 py-3 text-xs
        font-semibold uppercase
        tracking-wider text-slate-400
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyProducts({
  hasProducts,
  searchQuery,
}: {
  hasProducts: boolean;
  searchQuery: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Package size={28} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-800">
        {hasProducts
          ? "No products found"
          : "No products added yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {hasProducts
          ? `We couldn't find any product matching "${searchQuery}".`
          : "Add your products and services here to quickly use them while creating invoices."}
      </p>

      {!hasProducts && (
        <Link
          href="/products/new"
          className="
            mt-5 inline-flex items-center gap-2
            rounded-xl bg-blue-600 px-5 py-2.5
            text-sm font-semibold text-white
            hover:bg-blue-700
          "
        >
          <Plus size={17} />
          Add First Product
        </Link>
      )}
    </div>
  );
}

/* =====================================================
   DELETE MODAL
===================================================== */

function DeleteProductModal({
  product,
  onCancel,
  onConfirm,
}: {
  product: Product;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Trash2 size={21} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Delete Product?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <strong className="text-slate-800">
            {product.name}
          </strong>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-lg border border-slate-200
              px-4 py-2.5 text-sm
              font-semibold text-slate-700
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
              rounded-lg bg-red-600
              px-4 py-2.5 text-sm
              font-semibold text-white
              hover:bg-red-700
            "
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SKELETON
===================================================== */

function ProductsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-7 flex justify-between">
        <div>
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="mt-3 h-8 w-64 rounded bg-slate-200" />
        </div>

        <div className="h-11 w-36 rounded-xl bg-slate-200" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-40 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="h-[500px] rounded-2xl bg-slate-200" />
    </div>
  );
         }
