// lib/format-utils.ts

/* =====================================================
   CURRENCY
===================================================== */

export const DEFAULT_CURRENCY = "INR";

export const DEFAULT_LOCALE = "en-IN";

/**
 * Format number as Indian Rupees.
 *
 * Example:
 * 125000.5 => ₹1,25,000.50
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
  }
): string {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: options?.currency ?? DEFAULT_CURRENCY,
    minimumFractionDigits:
      options?.minimumFractionDigits ?? 2,
    maximumFractionDigits:
      options?.maximumFractionDigits ?? 2,
  }).format(amount);
}

/**
 * Format currency without decimal places.
 *
 * Example:
 * 125000 => ₹1,25,000
 */
export function formatCurrencyCompact(
  value: number | string | null | undefined
): string {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Short Indian currency format.
 *
 * Example:
 * 125000 => ₹1.25L
 * 2500000 => ₹25L
 * 10000000 => ₹1Cr
 */
export function formatCompactCurrency(
  value: number | string | null | undefined
): string {
  const amount = Number(value) || 0;

  const absoluteValue = Math.abs(amount);

  if (absoluteValue >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }

  if (absoluteValue >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  if (absoluteValue >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return formatCurrencyCompact(amount);
}

/* =====================================================
   NUMBERS
===================================================== */

/**
 * Format number using Indian numbering system.
 *
 * Example:
 * 1234567.89 => 12,34,567.89
 */
export function formatNumber(
  value: number | string | null | undefined,
  maximumFractionDigits = 2
): string {
  const number = Number(value) || 0;

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits,
  }).format(number);
}

/**
 * Format quantity.
 */
export function formatQuantity(
  value: number | string | null | undefined
): string {
  const quantity = Number(value) || 0;

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(quantity);
}

/* =====================================================
   PERCENTAGE
===================================================== */

/**
 * Format percentage.
 *
 * Example:
 * 18 => 18%
 * 18.5 => 18.5%
 */
export function formatPercentage(
  value: number | string | null | undefined,
  maximumFractionDigits = 2
): string {
  const percentage = Number(value) || 0;

  return `${new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits,
  }).format(percentage)}%`;
}

/**
 * Format GST rate.
 */
export function formatGSTRate(
  rate: number | string | null | undefined
): string {
  return formatPercentage(rate, 2);
}

/* =====================================================
   DATE FORMATTING
===================================================== */

function parseDate(
  value: string | Date | null | undefined
): Date | null {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Format date as DD/MM/YYYY.
 */
export function formatDate(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Format date as 07 Sep 2026.
 */
export function formatReadableDate(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Format date with full month.
 *
 * Example:
 * 07 September 2026
 */
export function formatLongDate(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format date and time.
 */
export function formatDateTime(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value);

  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Convert date to input compatible format.
 *
 * YYYY-MM-DD
 */
export function formatDateForInput(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value);

  if (!date) return "";

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =====================================================
   GSTIN / PAN FORMATTING
===================================================== */

/**
 * Normalize GSTIN.
 */
export function formatGSTIN(
  gstin: string | null | undefined
): string {
  if (!gstin) return "";

  return gstin
    .trim()
    .toUpperCase()
    .replace(/\s/g, "");
}

/**
 * Mask GSTIN for privacy.
 *
 * Example:
 * 03ABCDE1234F1Z5
 * =>
 * 03ABCDE****F1Z5
 */
export function maskGSTIN(
  gstin: string | null | undefined
): string {
  const value = formatGSTIN(gstin);

  if (!value) return "-";

  if (value.length < 10) {
    return value;
  }

  return (
    value.slice(0, 7) +
    "****" +
    value.slice(-4)
  );
}

/**
 * Normalize PAN.
 */
export function formatPAN(
  pan: string | null | undefined
): string {
  if (!pan) return "";

  return pan
    .trim()
    .toUpperCase()
    .replace(/\s/g, "");
}

/**
 * Mask PAN.
 *
 * ABCDE1234F => ABC***234F
 */
export function maskPAN(
  pan: string | null | undefined
): string {
  const value = formatPAN(pan);

  if (!value) return "-";

  if (value.length < 6) {
    return value;
  }

  return (
    value.slice(0, 3) +
    "***" +
    value.slice(-4)
  );
}

/* =====================================================
   PHONE / CONTACT
===================================================== */

export function formatPhoneNumber(
  phone: string | null | undefined
): string {
  if (!phone) return "-";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `${cleaned.slice(
      0,
      5
    )} ${cleaned.slice(5)}`;
  }

  return phone;
}

/* =====================================================
   INVOICE NUMBER
===================================================== */

/**
 * Format document number.
 *
 * Example:
 * INV-0001
 */
export function formatDocumentNumber(
  prefix: string,
  number: number,
  padding = 4
): string {
  const safePrefix =
    prefix.trim().toUpperCase() || "DOC";

  const safeNumber = Math.max(
    0,
    Math.floor(Number(number) || 0)
  );

  return `${safePrefix}-${String(
    safeNumber
  ).padStart(padding, "0")}`;
}

/**
 * Generate financial year label.
 *
 * Example:
 * 2026-04-01 => FY 2026-27
 */
export function getFinancialYear(
  value?: string | Date
): string {
  const date = parseDate(value) ?? new Date();

  const year = date.getFullYear();
  const month = date.getMonth();

  const startYear =
    month >= 3 ? year : year - 1;

  const endYear =
    String(startYear + 1).slice(-2);

  return `FY ${startYear}-${endYear}`;
}

/**
 * Generate financial year short format.
 *
 * Example:
 * 2026-27
 */
export function getFinancialYearShort(
  value?: string | Date
): string {
  return getFinancialYear(value)
    .replace("FY ", "");
}

/* =====================================================
   TEXT HELPERS
===================================================== */

/**
 * Convert first letter to uppercase.
 */
export function capitalize(
  value?: string | null
): string {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

/**
 * Convert kebab-case to readable text.
 *
 * "partially-paid" => "Partially Paid"
 */
export function formatStatus(
  value?: string | null
): string {
  if (!value) return "-";

  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Truncate long text.
 */
export function truncateText(
  value: string | null | undefined,
  maxLength = 50
): string {
  if (!value) return "";

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(
    0,
    maxLength
  ).trim()}...`;
}

/* =====================================================
   ADDRESS FORMATTING
===================================================== */

export interface FormatAddressInput {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

/**
 * Convert address object into readable address.
 */
export function formatAddress(
  address?: FormatAddressInput | null
): string {
  if (!address) return "-";

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.district,
    address.state,
    address.pincode,
    address.country,
  ].filter(
    (value): value is string =>
      Boolean(value?.trim())
  );

  return parts.length
    ? parts.join(", ")
    : "-";
}

/**
 * Short address format.
 */
export function formatShortAddress(
  address?: FormatAddressInput | null
): string {
  if (!address) return "-";

  const parts = [
    address.city,
    address.state,
    address.pincode,
  ].filter(
    (value): value is string =>
      Boolean(value?.trim())
  );

  return parts.length
    ? parts.join(", ")
    : "-";
}

/* =====================================================
   FILE SIZE
===================================================== */

export function formatFileSize(
  bytes: number | null | undefined
): string {
  const size = Number(bytes) || 0;

  if (size === 0) return "0 Bytes";

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(size) / Math.log(1024)
  );

  const value =
    size / Math.pow(1024, index);

  return `${value.toFixed(
    index === 0 ? 0 : 2
  )} ${units[index]}`;
}

/* =====================================================
   RELATIVE TIME
===================================================== */

export function formatRelativeTime(
  value: string | Date | null | undefined
): string {
  const date = parseDate(value);

  if (!date) return "-";

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatReadableDate(date);
}
