// lib/calculations.ts

import {
  GSTType,
  calculateGST,
  calculateItemTaxableValue,
  roundMoney,
} from "./gst-utils";

export interface InvoiceItem {
  id: string;
  productName: string;
  description?: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discountPercentage?: number;
  gstRate: number;
  cessRate?: number;
}

export interface CalculatedInvoiceItem extends InvoiceItem {
  grossAmount: number;
  discountAmount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  totalAmount: number;
}

export interface InvoiceSummary {
  totalQuantity: number;
  grossAmount: number;
  totalDiscount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  grandTotal: number;
  roundedGrandTotal: number;
  roundOff: number;
}

export interface CalculateInvoiceOptions {
  gstType: GSTType;
  roundTotal?: boolean;
}

/**
 * Safely converts any numeric input into a non-negative number.
 */
function safeNumber(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, number);
}

/**
 * Calculates one invoice item's complete monetary breakdown.
 */
export function calculateInvoiceItem(
  item: InvoiceItem,
  gstType: GSTType
): CalculatedInvoiceItem {
  const quantity = safeNumber(item.quantity);
  const rate = safeNumber(item.rate);

  const discountPercentage = Math.min(
    100,
    safeNumber(item.discountPercentage ?? 0)
  );

  const grossAmount = roundMoney(quantity * rate);

  const discountAmount = roundMoney(
    (grossAmount * discountPercentage) / 100
  );

  const taxableValue = calculateItemTaxableValue(
    quantity,
    rate,
    discountPercentage
  );

  const gst = calculateGST({
    taxableValue,
    gstRate: safeNumber(item.gstRate),
    type: gstType,
    cessRate: safeNumber(item.cessRate ?? 0),
  });

  return {
    ...item,

    quantity,
    rate,
    discountPercentage,
    gstRate: safeNumber(item.gstRate),
    cessRate: safeNumber(item.cessRate ?? 0),

    grossAmount,
    discountAmount,
    taxableValue,

    cgst: gst.cgst,
    sgst: gst.sgst,
    igst: gst.igst,
    cess: gst.cess,

    totalTax: gst.totalTax,
    totalAmount: gst.grandTotal,
  };
}

/**
 * Calculates all invoice items and the invoice summary.
 */
export function calculateInvoice(
  items: InvoiceItem[],
  options: CalculateInvoiceOptions
): {
  items: CalculatedInvoiceItem[];
  summary: InvoiceSummary;
} {
  const safeItems = Array.isArray(items) ? items : [];

  const calculatedItems = safeItems.map((item) =>
    calculateInvoiceItem(item, options.gstType)
  );

  let totalQuantity = 0;
  let grossAmount = 0;
  let totalDiscount = 0;
  let taxableValue = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let cess = 0;
  let totalTax = 0;
  let grandTotal = 0;

  for (const item of calculatedItems) {
    totalQuantity += safeNumber(item.quantity);
    grossAmount += item.grossAmount;
    totalDiscount += item.discountAmount;
    taxableValue += item.taxableValue;
    cgst += item.cgst;
    sgst += item.sgst;
    igst += item.igst;
    cess += item.cess;
    totalTax += item.totalTax;
    grandTotal += item.totalAmount;
  }

  grossAmount = roundMoney(grossAmount);
  totalDiscount = roundMoney(totalDiscount);
  taxableValue = roundMoney(taxableValue);
  cgst = roundMoney(cgst);
  sgst = roundMoney(sgst);
  igst = roundMoney(igst);
  cess = roundMoney(cess);
  totalTax = roundMoney(totalTax);
  grandTotal = roundMoney(grandTotal);
  totalQuantity = roundMoney(totalQuantity);

  let roundedGrandTotal = grandTotal;
  let roundOff = 0;

  if (options.roundTotal) {
    roundedGrandTotal = Math.round(grandTotal);
    roundOff = roundMoney(roundedGrandTotal - grandTotal);
  }

  return {
    items: calculatedItems,

    summary: {
      totalQuantity,
      grossAmount,
      totalDiscount,
      taxableValue,
      cgst,
      sgst,
      igst,
      cess,
      totalTax,
      grandTotal,
      roundedGrandTotal,
      roundOff,
    },
  };
}

/**
 * Groups invoice items by GST rate.
 * Useful for GST summaries and reports.
 */
export function groupItemsByGSTRate(
  items: CalculatedInvoiceItem[]
): Record<
  string,
  {
    gstRate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
    totalTax: number;
  }
> {
  const grouped: Record<
    string,
    {
      gstRate: number;
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
      totalTax: number;
    }
  > = {};

  for (const item of items) {
    const rate = safeNumber(item.gstRate);
    const key = String(rate);

    if (!grouped[key]) {
      grouped[key] = {
        gstRate: rate,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        cess: 0,
        totalTax: 0,
      };
    }

    grouped[key].taxableValue += item.taxableValue;
    grouped[key].cgst += item.cgst;
    grouped[key].sgst += item.sgst;
    grouped[key].igst += item.igst;
    grouped[key].cess += item.cess;
    grouped[key].totalTax += item.totalTax;
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].taxableValue = roundMoney(
      grouped[key].taxableValue
    );

    grouped[key].cgst = roundMoney(grouped[key].cgst);
    grouped[key].sgst = roundMoney(grouped[key].sgst);
    grouped[key].igst = roundMoney(grouped[key].igst);
    grouped[key].cess = roundMoney(grouped[key].cess);
    grouped[key].totalTax = roundMoney(grouped[key].totalTax);
  }

  return grouped;
}

/**
 * Calculates the total value before GST.
 */
export function calculateTaxableTotal(
  items: InvoiceItem[]
): number {
  return roundMoney(
    items.reduce(
      (total, item) =>
        total +
        calculateItemTaxableValue(
          safeNumber(item.quantity),
          safeNumber(item.rate),
          safeNumber(item.discountPercentage ?? 0)
        ),
      0
    )
  );
}

/**
 * Calculates the gross value before discounts.
 */
export function calculateGrossTotal(
  items: InvoiceItem[]
): number {
  return roundMoney(
    items.reduce(
      (total, item) =>
        total +
        safeNumber(item.quantity) *
          safeNumber(item.rate),
      0
    )
  );
}

/**
 * Calculates total discount across all items.
 */
export function calculateDiscountTotal(
  items: InvoiceItem[]
): number {
  return roundMoney(
    items.reduce((total, item) => {
      const gross =
        safeNumber(item.quantity) * safeNumber(item.rate);

      const discountPercentage = Math.min(
        100,
        safeNumber(item.discountPercentage ?? 0)
      );

      return (
        total +
        (gross * discountPercentage) / 100
      );
    }, 0)
  );
}

/**
 * Creates a unique item ID.
 */
export function createInvoiceItemId(): string {
  return `item_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/**
 * Returns an empty invoice item for the Add Item form.
 */
export function createEmptyInvoiceItem(): InvoiceItem {
  return {
    id: createInvoiceItemId(),
    productName: "",
    description: "",
    hsnSac: "",
    quantity: 1,
    unit: "Nos",
    rate: 0,
    discountPercentage: 0,
    gstRate: 18,
    cessRate: 0,
  };
    }
