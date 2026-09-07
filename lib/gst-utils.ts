// lib/gst-utils.ts

export type GSTType =
  | "intra-state"
  | "inter-state"
  | "export"
  | "sez"
  | "exempt"
  | "nil-rated"
  | "reverse-charge";

export interface GSTCalculationInput {
  taxableValue: number;
  gstRate: number;
  type: GSTType;
  cessRate?: number;
}

export interface GSTCalculationResult {
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  grandTotal: number;
}

/**
 * Safely rounds a monetary value to 2 decimal places.
 */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Ensures percentage values stay valid.
 */
export function normalizeRate(rate: number): number {
  if (!Number.isFinite(rate) || rate < 0) return 0;
  return rate;
}

/**
 * Calculates GST for intra-state / inter-state transactions.
 */
export function calculateGST(
  input: GSTCalculationInput
): GSTCalculationResult {
  const taxableValue = Math.max(0, Number(input.taxableValue) || 0);
  const gstRate = normalizeRate(input.gstRate);
  const cessRate = normalizeRate(input.cessRate ?? 0);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  const totalGST = (taxableValue * gstRate) / 100;

  switch (input.type) {
    case "intra-state":
      cgst = totalGST / 2;
      sgst = totalGST / 2;
      break;

    case "inter-state":
    case "export":
    case "sez":
    case "reverse-charge":
      igst = totalGST;
      break;

    case "exempt":
    case "nil-rated":
      cgst = 0;
      sgst = 0;
      igst = 0;
      break;

    default:
      break;
  }

  const cess = (taxableValue * cessRate) / 100;

  const roundedCGST = roundMoney(cgst);
  const roundedSGST = roundMoney(sgst);
  const roundedIGST = roundMoney(igst);
  const roundedCess = roundMoney(cess);

  const totalTax = roundMoney(
    roundedCGST +
      roundedSGST +
      roundedIGST +
      roundedCess
  );

  const grandTotal = roundMoney(
    taxableValue + totalTax
  );

  return {
    taxableValue: roundMoney(taxableValue),
    gstRate,
    cgst: roundedCGST,
    sgst: roundedSGST,
    igst: roundedIGST,
    cess: roundedCess,
    totalTax,
    grandTotal,
  };
}

/**
 * Calculates GST amount only.
 */
export function getGSTAmount(
  taxableValue: number,
  gstRate: number
): number {
  const value = Math.max(0, Number(taxableValue) || 0);
  const rate = normalizeRate(gstRate);

  return roundMoney((value * rate) / 100);
}

/**
 * Splits GST equally into CGST and SGST.
 */
export function splitCGSTSGST(
  taxableValue: number,
  gstRate: number
): {
  cgst: number;
  sgst: number;
} {
  const gstAmount = getGSTAmount(taxableValue, gstRate);

  return {
    cgst: roundMoney(gstAmount / 2),
    sgst: roundMoney(gstAmount / 2),
  };
}

/**
 * Calculates IGST.
 */
export function calculateIGST(
  taxableValue: number,
  gstRate: number
): number {
  return getGSTAmount(taxableValue, gstRate);
}

/**
 * Calculates total invoice amount from taxable value and GST.
 */
export function calculateInvoiceTotal(
  taxableValue: number,
  gstRate: number,
  type: GSTType,
  cessRate = 0
): number {
  return calculateGST({
    taxableValue,
    gstRate,
    type,
    cessRate,
  }).grandTotal;
}

/**
 * Calculates the taxable value of an item.
 */
export function calculateItemTaxableValue(
  quantity: number,
  rate: number,
  discountPercentage = 0
): number {
  const qty = Math.max(0, Number(quantity) || 0);
  const itemRate = Math.max(0, Number(rate) || 0);
  const discount = Math.min(
    100,
    Math.max(0, Number(discountPercentage) || 0)
  );

  const grossValue = qty * itemRate;
  const discountAmount = (grossValue * discount) / 100;

  return roundMoney(grossValue - discountAmount);
}

/**
 * Calculates complete item-level GST.
 */
export function calculateItemGST(params: {
  quantity: number;
  rate: number;
  discountPercentage?: number;
  gstRate: number;
  type: GSTType;
  cessRate?: number;
}): GSTCalculationResult {
  const taxableValue = calculateItemTaxableValue(
    params.quantity,
    params.rate,
    params.discountPercentage ?? 0
  );

  return calculateGST({
    taxableValue,
    gstRate: params.gstRate,
    type: params.type,
    cessRate: params.cessRate ?? 0,
  });
}

/**
 * Returns GST rate label.
 */
export function formatGSTRate(rate: number): string {
  const normalized = normalizeRate(rate);

  return `${normalized}%`;
}

/**
 * Formats an amount as Indian Rupees.
 */
export function formatINR(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  const value = Number(amount) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Converts a numeric amount into a simple amount-in-words
 * representation suitable for Indian invoice previews.
 */
export function amountToWords(amount: number): string {
  const value = Math.round(Number(amount) || 0);

  if (value === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];

  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function twoDigits(num: number): string {
    if (num === 0) return "";

    if (num < 10) {
      return ones[num];
    }

    if (num < 20) {
      return teens[num - 10];
    }

    const ten = Math.floor(num / 10);
    const one = num % 10;

    return one === 0
      ? tens[ten]
      : `${tens[ten]} ${ones[one]}`;
  }

  function threeDigits(num: number): string {
    if (num < 100) {
      return twoDigits(num);
    }

    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    return remainder === 0
      ? `${ones[hundred]} Hundred`
      : `${ones[hundred]} Hundred ${twoDigits(remainder)}`;
  }

  function convertIndianNumber(num: number): string {
    if (num < 1000) {
      return threeDigits(num);
    }

    const crore = Math.floor(num / 10_000_000);
    const afterCrore = num % 10_000_000;

    const lakh = Math.floor(afterCrore / 100_000);
    const afterLakh = afterCrore % 100_000;

    const thousand = Math.floor(afterLakh / 1000);
    const remainder = afterLakh % 1000;

    const parts: string[] = [];

    if (crore > 0) {
      parts.push(`${convertIndianNumber(crore)} Crore`);
    }

    if (lakh > 0) {
      parts.push(`${twoDigits(lakh)} Lakh`);
    }

    if (thousand > 0) {
      parts.push(`${twoDigits(thousand)} Thousand`);
    }

    if (remainder > 0) {
      parts.push(threeDigits(remainder));
    }

    return parts.join(" ");
  }

  return `${convertIndianNumber(value)} Rupees Only`;
}

/**
 * Determines whether GST should be charged.
 */
export function isGSTApplicable(type: GSTType): boolean {
  return type !== "exempt" && type !== "nil-rated";
}

/**
 * Returns the appropriate tax label for an invoice.
 */
export function getTaxLabel(type: GSTType): string {
  switch (type) {
    case "intra-state":
      return "CGST + SGST";

    case "inter-state":
      return "IGST";

    case "export":
      return "IGST";

    case "sez":
      return "IGST";

    case "reverse-charge":
      return "IGST / Reverse Charge";

    case "exempt":
      return "Exempt";

    case "nil-rated":
      return "Nil Rated";

    default:
      return "GST";
  }
}

/**
 * Validates a GST rate.
 */
export function isValidGSTRate(rate: number): boolean {
  return Number.isFinite(rate) && rate >= 0 && rate <= 100;
      }
