"use client";

// app/(dashboard)/invoices/new/page.tsx

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Calculator,
  ChevronDown,
  FileText,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";

import type {
  Customer,
  Invoice,
  Product,
} from "@/types";

import {
  STORAGE_KEYS,
  addItem,
  getCollection,
} from "@/lib/storage";

import { formatCurrency } from "@/lib/format-utils";

/* =====================================================
   TYPES
===================================================== */

type TaxType = "intra" | "inter";

interface InvoiceLineItem {
  id: string;
  productId: string;
  name: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  gstRate: number;
  taxableAmount: number;
  gstAmount: number;
  total: number;
}

interface InvoiceFormState {
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  taxType: TaxType;
  notes: string;
  terms: string;
  overallDiscount: number;
}

/* =====================================================
   HELPERS
===================================================== */

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function todayDate(): string {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function dueDateAfter(days: number): string {
  const date = new Date();

  date.setDate(
    date.getDate() + days
  );

  return date
    .toISOString()
    .split("T")[0];
}

function generateInvoiceNumber(): string {
  const now = new Date();

  const year =
    now.getFullYear();

  const random =
    Math.floor(
      1000 +
        Math.random() * 9000
    );

  return `INV-${year}-${random}`;
}

function calculateLineItem(
  item: Partial<InvoiceLineItem>
): InvoiceLineItem {
  const quantity =
    safeNumber(item.quantity) || 1;

  const rate =
    safeNumber(item.rate);

  const discountPercent =
    safeNumber(item.discountPercent);

  const gstRate =
    safeNumber(item.gstRate);

  const grossAmount =
    quantity * rate;

  const discountAmount =
    (grossAmount * discountPercent) /
    100;

  const taxableAmount =
    grossAmount - discountAmount;

  const gstAmount =
    (taxableAmount * gstRate) /
    100;

  return {
    id:
      item.id ||
      crypto.randomUUID(),

    productId:
      item.productId || "",

    name:
      item.name || "",

    hsnSac:
      item.hsnSac || "",

    quantity,

    unit:
      item.unit || "PCS",

    rate,

    discountPercent,

    gstRate,

    taxableAmount,

    gstAmount,

    total:
      taxableAmount + gstAmount,
  };
}

/* =====================================================
   PAGE
===================================================== */

export default function NewInvoicePage() {
  const router = useRouter();

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showProductPicker, setShowProductPicker] =
    useState(false);

  const [productSearch, setProductSearch] =
    useState("");

  const [items, setItems] =
    useState<InvoiceLineItem[]>([]);

  const [form, setForm] =
    useState<InvoiceFormState>({
      customerId: "",
      invoiceDate: todayDate(),
      dueDate: dueDateAfter(15),
      placeOfSupply: "Punjab",
      taxType: "intra",
      notes: "",
      terms:
        "Thank you for your business.",
      overallDiscount: 0,
    });

  /* =============================================
     LOAD CUSTOMERS + PRODUCTS
  ============================================= */

  useEffect(() => {
    try {
      const savedCustomers =
        getCollection<Customer>(
          STORAGE_KEYS.CUSTOMERS
        );

      const savedProducts =
        getCollection<Product>(
          STORAGE_KEYS.PRODUCTS
        );

      setCustomers(savedCustomers);
      setProducts(savedProducts);
    } catch (error) {
      console.error(
        "Failed to load invoice data:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =============================================
     UPDATE FORM
  ============================================= */

  function updateForm(
    field: keyof InvoiceFormState,
    value:
      | string
      | number
      | TaxType
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =============================================
     ADD PRODUCT
  ============================================= */

  function addProduct(
    product: Product
  ) {
    const newItem =
      calculateLineItem({
        productId: product.id,
        name: product.name,
        hsnSac: product.hsnSac || "",
        quantity: 1,
        unit: product.unit || "PCS",
        rate: safeNumber(
          product.salePrice
        ),
        discountPercent: 0,
        gstRate: safeNumber(
          product.gstRate
        ),
      });

    setItems((previous) => [
      ...previous,
      newItem,
    ]);

    setShowProductPicker(false);
    setProductSearch("");
  }

  /* =============================================
     ADD CUSTOM ITEM
  ============================================= */

  function addCustomItem() {
    setItems((previous) => [
      ...previous,
      calculateLineItem({
        name: "",
        quantity: 1,
        unit: "PCS",
        rate: 0,
        discountPercent: 0,
        gstRate: 18,
      }),
    ]);
  }

  /* =============================================
     UPDATE ITEM
  ============================================= */

  function updateItem(
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number
  ) {
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updated = {
          ...item,
          [field]:
            typeof value === "string" &&
            [
              "quantity",
              "rate",
              "discountPercent",
              "gstRate",
            ].includes(field)
              ? Number(value)
              : value,
        };

        return calculateLineItem(
          updated
        );
      })
    );
  }

  /* =============================================
     REMOVE ITEM
  ============================================= */

  function removeInvoiceItem(
    id: string
  ) {
    setItems((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  }

  /* =============================================
     SELECTED CUSTOMER
  ============================================= */

  const selectedCustomer =
    useMemo(
      () =>
        customers.find(
          (customer) =>
            customer.id === form.customerId
        ),
      [
        customers,
        form.customerId,
      ]
    );

  /* =============================================
     FILTERED PRODUCTS
  ============================================= */

  const filteredProducts =
    useMemo(() => {
      const query =
        productSearch
          .trim()
          .toLowerCase();

      if (!query) return products;

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(query) ||
          product.hsnSac
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      products,
      productSearch,
    ]);

  /* =============================================
     TOTALS
  ============================================= */

  const totals = useMemo(() => {
    const subtotal =
      items.reduce(
        (sum, item) =>
          sum +
          item.quantity *
            item.rate,
        0
      );

    const lineDiscount =
      items.reduce(
        (sum, item) => {
          const gross =
            item.quantity *
            item.rate;

          return (
            sum +
            (gross *
              item.discountPercent) /
              100
          );
        },
        0
      );

    const afterLineDiscount =
      subtotal - lineDiscount;

    const overallDiscount =
      (afterLineDiscount *
        safeNumber(
          form.overallDiscount
        )) /
      100;

    const taxableAmount =
      afterLineDiscount -
      overallDiscount;

    /*
      GST distribution:
      Intra-state = CGST + SGST
      Inter-state = IGST
    */

    const totalGst =
      items.reduce(
        (sum, item) =>
          sum + item.gstAmount,
        0
      );

    const discountRatio =
      afterLineDiscount > 0
        ? taxableAmount /
          afterLineDiscount
        : 1;

    const adjustedGst =
      totalGst * discountRatio;

    const cgst =
      form.taxType === "intra"
        ? adjustedGst / 2
        : 0;

    const sgst =
      form.taxType === "intra"
        ? adjustedGst / 2
        : 0;

    const igst =
      form.taxType === "inter"
        ? adjustedGst
        : 0;

    const grandTotal =
      taxableAmount +
      adjustedGst;

    return {
      subtotal,
      lineDiscount,
      overallDiscount,
      taxableAmount,
      totalGst: adjustedGst,
      cgst,
      sgst,
      igst,
      grandTotal,
    };
  }, [
    items,
    form.overallDiscount,
    form.taxType,
  ]);

  /* =============================================
     SAVE INVOICE
  ============================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.customerId) {
      alert(
        "Please select a customer."
      );
      return;
    }

    if (items.length === 0) {
      alert(
        "Please add at least one item."
      );
      return;
    }

    const invalidItem =
      items.find(
        (item) =>
          !item.name.trim() ||
          item.quantity <= 0 ||
          item.rate < 0
      );

    if (invalidItem) {
      alert(
        "Please complete all invoice item details."
      );
      return;
    }

    setSaving(true);

    try {
      const now =
        new Date().toISOString();

      const invoiceNumber =
        generateInvoiceNumber();

      /*
        Extra properties are intentionally included
        because the Invoice object will be used by
        Invoice Details + PDF modules later.
      */

      const invoice = {
        id: crypto.randomUUID(),

        invoiceNumber,

        customerId:
          selectedCustomer?.id ||
          form.customerId,

        customerName:
          selectedCustomer?.name ||
          "Customer",

        invoiceDate:
          form.invoiceDate,

        dueDate:
          form.dueDate,

        placeOfSupply:
          form.placeOfSupply,

        taxType:
          form.taxType,

        items,

        subtotal:
          totals.subtotal,

        discount:
          totals.lineDiscount +
          totals.overallDiscount,

        taxableAmount:
          totals.taxableAmount,

        cgst:
          totals.cgst,

        sgst:
          totals.sgst,

        igst:
          totals.igst,

        totalTax:
          totals.totalGst,

        grandTotal:
          Math.round(
            totals.grandTotal * 100
          ) / 100,

        notes:
          form.notes,

        terms:
          form.terms,

        status: "draft",

        createdAt: now,
        updatedAt: now,
      } as Invoice;

      addItem(
        STORAGE_KEYS.INVOICES,
        invoice
      );

      router.push(
        `/invoices/${invoice.id}`
      );
    } catch (error) {
      console.error(
        "Failed to create invoice:",
        error
      );

      alert(
        "Unable to create invoice. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =============================================
     LOADING
  ============================================= */

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* =========================================
          BACK
      ========================================= */}

      <Link
        href="/invoices"
        className="
          mb-6 inline-flex items-center gap-2
          text-sm font-medium text-slate-500
          hover:text-blue-600
        "
      >
        <ArrowLeft size={17} />
        Back to Invoices
      </Link>

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          CREATE GST INVOICE
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          New Invoice
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add customer, products and generate
          a professional GST invoice.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* =====================================
            CUSTOMER + INVOICE DETAILS
        ===================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* CUSTOMER */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              icon={<User size={19} />}
              title="Bill To"
              description="Select the customer for this invoice."
            />

            <div className="mt-6">
              <label className={labelClass}>
                Customer
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <select
                  value={form.customerId}
                  onChange={(event) =>
                    updateForm(
                      "customerId",
                      event.target.value
                    )
                  }
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">
                    Select Customer
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name}
                        {customer.phone
                          ? ` — ${customer.phone}`
                          : ""}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={17}
                  className="
                    pointer-events-none absolute
                    right-3 top-1/2 -translate-y-1/2
                    text-slate-400
                  "
                />
              </div>

              {customers.length === 0 && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">
                    No customers found.
                  </p>

                  <Link
                    href="/customers/new"
                    className="mt-2 inline-flex text-sm font-bold text-blue-600"
                  >
                    + Add Customer
                  </Link>
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">
                  {selectedCustomer.name}
                </p>

                <div className="mt-2 grid gap-1 text-xs text-slate-500">
                  {selectedCustomer.phone && (
                    <span>
                      {selectedCustomer.phone}
                    </span>
                  )}

                  {selectedCustomer.email && (
                    <span>
                      {selectedCustomer.email}
                    </span>
                  )}

                  {selectedCustomer.gstin && (
                    <span>
                      GSTIN:{" "}
                      {
                        selectedCustomer.gstin
                      }
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* INVOICE INFORMATION */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading
              icon={<FileText size={19} />}
              title="Invoice Details"
              description="Set invoice and payment information."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <DateField
                label="Invoice Date"
                value={
                  form.invoiceDate
                }
                onChange={(value) =>
                  updateForm(
                    "invoiceDate",
                    value
                  )
                }
              />

              <DateField
                label="Due Date"
                value={form.dueDate}
                onChange={(value) =>
                  updateForm(
                    "dueDate",
                    value
                  )
                }
              />

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Place of Supply
                </label>

                <input
                  value={
                    form.placeOfSupply
                  }
                  onChange={(event) =>
                    updateForm(
                      "placeOfSupply",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Punjab"
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </div>

        {/* =====================================
            TAX TYPE
        ===================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <SectionHeading
            icon={<Calculator size={19} />}
            title="GST Calculation Type"
            description="Choose how GST should be applied."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <TaxOption
              active={
                form.taxType === "intra"
              }
              title="Within State"
              description="CGST + SGST will be applied"
              onClick={() =>
                updateForm(
                  "taxType",
                  "intra"
                )
              }
            />

            <TaxOption
              active={
                form.taxType === "inter"
              }
              title="Outside State"
              description="IGST will be applied"
              onClick={() =>
                updateForm(
                  "taxType",
                  "inter"
                )
              }
            />
          </div>
        </section>

        {/* =====================================
            INVOICE ITEMS
        ===================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-bold text-slate-800">
                Invoice Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add products or services to invoice.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowProductPicker(true)
                }
                className="
                  inline-flex h-10 items-center gap-2
                  rounded-xl bg-blue-600 px-4
                  text-sm font-semibold text-white
                  hover:bg-blue-700
                "
              >
                <PackagePlus size={17} />
                Add Product
              </button>

              <button
                type="button"
                onClick={addCustomItem}
                className="
                  inline-flex h-10 items-center gap-2
                  rounded-xl border border-slate-200
                  px-4 text-sm font-semibold
                  text-slate-600 hover:bg-slate-50
                "
              >
                <Plus size={17} />
                Custom Item
              </button>
            </div>
          </div>

          {/* ITEMS */}

          {items.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <PackagePlus size={24} />
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                No items added
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Add products or create a custom
                line item to start your invoice.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowProductPicker(true)
                }
                className="
                  mt-5 inline-flex items-center gap-2
                  rounded-xl bg-blue-600 px-4 py-2.5
                  text-sm font-semibold text-white
                "
              >
                <Plus size={17} />
                Add Item
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map(
                (item, index) => (
                  <InvoiceItemRow
                    key={item.id}
                    index={index}
                    item={item}
                    onChange={(
                      field,
                      value
                    ) =>
                      updateItem(
                        item.id,
                        field,
                        value
                      )
                    }
                    onDelete={() =>
                      removeInvoiceItem(
                        item.id
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* =====================================
            BOTTOM AREA
        ===================================== */}

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">

          {/* NOTES */}

          <div className="space-y-6">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="font-bold text-slate-800">
                Notes
              </h2>

              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  updateForm(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Add notes for the customer..."
                className={`${inputClass} mt-4 h-auto resize-none py-3`}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="font-bold text-slate-800">
                Terms & Conditions
              </h2>

              <textarea
                rows={4}
                value={form.terms}
                onChange={(event) =>
                  updateForm(
                    "terms",
                    event.target.value
                  )
                }
                className={`${inputClass} mt-4 h-auto resize-none py-3`}
              />
            </section>
          </div>

          {/* TOTALS */}

          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-bold text-slate-800">
              Invoice Summary
            </h2>

            <div className="mt-5">

              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  totals.subtotal
                )}
              />

              {totals.lineDiscount > 0 && (
                <SummaryRow
                  label="Item Discount"
                  value={`- ${formatCurrency(
                    totals.lineDiscount
                  )}`}
                  tone="success"
                />
              )}

              <div className="border-b border-slate-100 py-4">
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Overall Discount (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    form.overallDiscount
                  }
                  onChange={(event) =>
                    updateForm(
                      "overallDiscount",
                      Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            event.target.value
                          )
                        )
                      )
                    )
                  }
                  className={inputClass}
                />
              </div>

              {totals.overallDiscount > 0 && (
                <SummaryRow
                  label="Overall Discount"
                  value={`- ${formatCurrency(
                    totals.overallDiscount
                  )}`}
                  tone="success"
                />
              )}

              <SummaryRow
                label="Taxable Amount"
                value={formatCurrency(
                  totals.taxableAmount
                )}
              />

              {form.taxType ===
                "intra" ? (
                <>
                  <SummaryRow
                    label="CGST"
                    value={formatCurrency(
                      totals.cgst
                    )}
                  />

                  <SummaryRow
                    label="SGST"
                    value={formatCurrency(
                      totals.sgst
                    )}
                  />
                </>
              ) : (
                <SummaryRow
                  label="IGST"
                  value={formatCurrency(
                    totals.igst
                  )}
                />
              )}

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Grand Total
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Including all taxes
                    </p>
                  </div>

                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(
                      totals.grandTotal
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================
            ACTIONS
        ===================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/invoices"
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
            disabled={
              saving ||
              items.length === 0
            }
            className="
              inline-flex h-11 items-center
              justify-center gap-2 rounded-xl
              bg-blue-600 px-6 text-sm
              font-semibold text-white
              shadow-sm hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Creating...
              </>
            ) : (
              <>
                <Save size={17} />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </form>

      {/* =========================================
          PRODUCT PICKER MODAL
      ========================================= */}

      {showProductPicker && (
        <ProductPickerModal
          products={filteredProducts}
          search={productSearch}
          onSearchChange={
            setProductSearch
          }
          onClose={() => {
            setShowProductPicker(false);
            setProductSearch("");
          }}
          onSelect={addProduct}
        />
      )}
    </div>
  );
}

/* =====================================================
   INVOICE ITEM ROW
===================================================== */

function InvoiceItemRow({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: InvoiceLineItem;
  index: number;
  onChange: (
    field: keyof InvoiceLineItem,
    value: string | number
  ) => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-5 sm:p-6">

      {/* MOBILE ITEM NUMBER */}

      <div className="mb-4 flex items-center justify-between lg:hidden">
        <span className="text-xs font-bold text-slate-400">
          ITEM {index + 1}
        </span>

        <button
          type="button"
          onClick={onDelete}
          className="text-red-500"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_90px_90px_110px_90px_120px_40px]">

        {/* NAME */}

        <div>
          <label className={smallLabelClass}>
            Item Name
          </label>

          <input
            value={item.name}
            onChange={(event) =>
              onChange(
                "name",
                event.target.value
              )
            }
            placeholder="Product or service name"
            className={inputClass}
          />

          <input
            value={item.hsnSac}
            onChange={(event) =>
              onChange(
                "hsnSac",
                event.target.value
              )
            }
            placeholder="HSN/SAC"
            className="
              mt-2 h-8 w-full rounded-lg
              border border-slate-200 px-2
              text-xs outline-none
              focus:border-blue-500
            "
          />
        </div>

        {/* QUANTITY */}

        <div>
          <label className={smallLabelClass}>
            Qty
          </label>

          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) =>
              onChange(
                "quantity",
                event.target.value
              )
            }
            className={inputClass}
          />

          <input
            value={item.unit}
            onChange={(event) =>
              onChange(
                "unit",
                event.target.value
              )
            }
            className="
              mt-2 h-8 w-full rounded-lg
              border border-slate-200 px-2
              text-xs outline-none
            "
          />
        </div>

        {/* RATE */}

        <div>
          <label className={smallLabelClass}>
            Rate
          </label>

          <input
            type="number"
            min="0"
            value={item.rate}
            onChange={(event) =>
              onChange(
                "rate",
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>

        {/* DISCOUNT */}

        <div>
          <label className={smallLabelClass}>
            Discount %
          </label>

          <input
            type="number"
            min="0"
            max="100"
            value={
              item.discountPercent
            }
            onChange={(event) =>
              onChange(
                "discountPercent",
                Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      event.target.value
                    )
                  )
                )
              )
            }
            className={inputClass}
          />
        </div>

        {/* GST */}

        <div>
          <label className={smallLabelClass}>
            GST %
          </label>

          <input
            type="number"
            min="0"
            value={item.gstRate}
            onChange={(event) =>
              onChange(
                "gstRate",
                event.target.value
              )
            }
            className={inputClass}
          />
        </div>

        {/* TOTAL */}

        <div>
          <label className={smallLabelClass}>
            Total
          </label>

          <div
            className="
              flex h-11 items-center
              rounded-xl bg-slate-50 px-3
              text-sm font-bold text-slate-800
            "
          >
            {formatCurrency(item.total)}
          </div>
        </div>

        {/* DELETE */}

        <div className="hidden items-end pb-1 lg:flex">
          <button
            type="button"
            onClick={onDelete}
            className="
              flex h-10 w-10 items-center
              justify-center rounded-xl
              text-red-500 hover:bg-red-50
            "
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   PRODUCT PICKER
===================================================== */

function ProductPickerModal({
  products,
  search,
  onSearchChange,
  onClose,
  onSelect,
}: {
  products: Product[];
  search: string;
  onSearchChange: (
    value: string
  ) => void;
  onClose: () => void;
  onSelect: (
    product: Product
  ) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">

      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-bold text-slate-800">
              Add Product
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select a product or service.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9 items-center
              justify-center rounded-lg
              text-slate-500 hover:bg-slate-100
            "
          >
            ×
          </button>
        </div>

        {/* SEARCH */}

        <div className="border-b border-slate-100 p-4">
          <input
            autoFocus
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search products..."
            className={inputClass}
          />
        </div>

        {/* LIST */}

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">
                No products found.
              </p>

              <Link
                href="/products/new"
                className="mt-3 inline-flex text-sm font-bold text-blue-600"
              >
                + Add New Product
              </Link>
            </div>
          ) : (
            products.map(
              (product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() =>
                    onSelect(product)
                  }
                  className="
                    flex w-full items-center
                    justify-between gap-4 rounded-xl
                    p-4 text-left
                    transition-colors hover:bg-slate-50
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <PackagePlus size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {product.hsnSac ||
                          "No HSN"}{" "}
                        • GST{" "}
                        {safeNumber(
                          product.gstRate
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-800">
                      {formatCurrency(
                        safeNumber(
                          product.salePrice
                        )
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {product.unit || "PCS"}
                    </p>
                  </div>
                </button>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   UI COMPONENTS
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
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </div>
  );
}

function TaxOption({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl border p-5 text-left
        transition-all
        ${
          active
            ? "border-blue-500 bg-blue-50 ring-4 ring-blue-50"
            : "border-slate-200 hover:bg-slate-50"
        }
      `}
    >
      <p
        className={
          active
            ? "font-bold text-blue-700"
            : "font-bold text-slate-800"
        }
      >
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </button>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={`
          text-sm font-semibold
          ${
            tone === "success"
              ? "text-emerald-600"
              : "text-slate-700"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse">
      <div className="mb-7 h-20 w-80 rounded-xl bg-slate-200" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>

      <div className="mt-6 h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

const smallLabelClass =
  "mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-400";

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
