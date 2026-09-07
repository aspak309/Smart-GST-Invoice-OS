// lib/constants.ts

import type { DocumentType } from "@/lib/invoice-utils";
import type { GSTType } from "@/lib/gst-utils";

/* =====================================================
   APP INFORMATION
===================================================== */

export const APP_NAME = "Smart GST";

export const APP_DESCRIPTION =
  "Simple GST invoicing and business management";

/* =====================================================
   GST RATES
===================================================== */

export const GST_RATES = [
  0,
  0.1,
  0.25,
  1,
  1.5,
  3,
  5,
  6,
  7.5,
  12,
  18,
  28,
] as const;

export const COMMON_GST_RATES = [
  0,
  5,
  12,
  18,
  28,
] as const;

/* =====================================================
   INDIAN STATES & GST STATE CODES
===================================================== */

export interface IndianState {
  code: string;
  name: string;
  shortName: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: "01", name: "Jammu and Kashmir", shortName: "JK" },
  { code: "02", name: "Himachal Pradesh", shortName: "HP" },
  { code: "03", name: "Punjab", shortName: "PB" },
  { code: "04", name: "Chandigarh", shortName: "CH" },
  { code: "05", name: "Uttarakhand", shortName: "UK" },
  { code: "06", name: "Haryana", shortName: "HR" },
  { code: "07", name: "Delhi", shortName: "DL" },
  { code: "08", name: "Rajasthan", shortName: "RJ" },
  { code: "09", name: "Uttar Pradesh", shortName: "UP" },
  { code: "10", name: "Bihar", shortName: "BR" },
  { code: "11", name: "Sikkim", shortName: "SK" },
  { code: "12", name: "Arunachal Pradesh", shortName: "AR" },
  { code: "13", name: "Nagaland", shortName: "NL" },
  { code: "14", name: "Manipur", shortName: "MN" },
  { code: "15", name: "Mizoram", shortName: "MZ" },
  { code: "16", name: "Tripura", shortName: "TR" },
  { code: "17", name: "Meghalaya", shortName: "ML" },
  { code: "18", name: "Assam", shortName: "AS" },
  { code: "19", name: "West Bengal", shortName: "WB" },
  { code: "20", name: "Jharkhand", shortName: "JH" },
  { code: "21", name: "Odisha", shortName: "OD" },
  { code: "22", name: "Chhattisgarh", shortName: "CG" },
  { code: "23", name: "Madhya Pradesh", shortName: "MP" },
  { code: "24", name: "Gujarat", shortName: "GJ" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu", shortName: "DNHDD" },
  { code: "27", name: "Maharashtra", shortName: "MH" },
  { code: "29", name: "Karnataka", shortName: "KA" },
  { code: "30", name: "Goa", shortName: "GA" },
  { code: "31", name: "Lakshadweep", shortName: "LD" },
  { code: "32", name: "Kerala", shortName: "KL" },
  { code: "33", name: "Tamil Nadu", shortName: "TN" },
  { code: "34", name: "Puducherry", shortName: "PY" },
  { code: "35", name: "Andaman and Nicobar Islands", shortName: "AN" },
  { code: "36", name: "Telangana", shortName: "TS" },
  { code: "37", name: "Andhra Pradesh", shortName: "AP" },
  { code: "38", name: "Ladakh", shortName: "LA" },
  { code: "97", name: "Other Territory", shortName: "OT" },
  { code: "99", name: "Centre Jurisdiction", shortName: "CJ" },
];

/* =====================================================
   PRODUCT UNITS
===================================================== */

export const PRODUCT_UNITS = [
  "BAG",
  "BAL",
  "BDL",
  "BKL",
  "BOU",
  "BOX",
  "BTL",
  "BUN",
  "CAN",
  "CBM",
  "CCM",
  "CMS",
  "CTN",
  "DOZ",
  "DRM",
  "GMS",
  "GRS",
  "KGS",
  "KLR",
  "KME",
  "LTR",
  "MTR",
  "MLT",
  "MTS",
  "NOS",
  "PAC",
  "PCS",
  "PRS",
  "QTL",
  "ROL",
  "SET",
  "SQF",
  "SQM",
  "TBS",
  "TGM",
  "THD",
  "TON",
  "TUB",
  "UGS",
  "UNT",
] as const;

/* =====================================================
   GST TYPE OPTIONS
===================================================== */

export interface GSTTypeOption {
  value: GSTType;
  label: string;
  description: string;
}

export const GST_TYPE_OPTIONS: GSTTypeOption[] = [
  {
    value: "intra-state",
    label: "Intra-State Supply",
    description: "Same state supply — CGST + SGST",
  },
  {
    value: "inter-state",
    label: "Inter-State Supply",
    description: "Different state supply — IGST",
  },
  {
    value: "export",
    label: "Export Supply",
    description: "Supply outside India",
  },
  {
    value: "sez",
    label: "SEZ Supply",
    description: "Supply to SEZ",
  },
  {
    value: "reverse-charge",
    label: "Reverse Charge",
    description: "Tax applicable under reverse charge",
  },
  {
    value: "exempt",
    label: "Exempt Supply",
    description: "GST exempt supply",
  },
  {
    value: "nil-rated",
    label: "Nil Rated Supply",
    description: "GST rate is zero",
  },
];

/* =====================================================
   DOCUMENT TYPES
===================================================== */

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    value: "tax-invoice",
    label: "Tax Invoice",
    shortLabel: "Invoice",
    description: "Standard GST tax invoice",
    icon: "FileText",
  },
  {
    value: "bill-of-supply",
    label: "Bill of Supply",
    shortLabel: "Bill of Supply",
    description: "For composition or exempt supplies",
    icon: "Receipt",
  },
  {
    value: "credit-note",
    label: "Credit Note",
    shortLabel: "Credit Note",
    description: "Reduce value or tax of previous invoice",
    icon: "FileMinus",
  },
  {
    value: "debit-note",
    label: "Debit Note",
    shortLabel: "Debit Note",
    description: "Increase value or tax of previous invoice",
    icon: "FilePlus",
  },
  {
    value: "delivery-challan",
    label: "Delivery Challan",
    shortLabel: "Challan",
    description: "Goods movement without immediate invoice",
    icon: "Truck",
  },
  {
    value: "export-invoice",
    label: "Export Invoice",
    shortLabel: "Export",
    description: "Invoice for export outside India",
    icon: "Globe",
  },
  {
    value: "sez-invoice",
    label: "SEZ Invoice",
    shortLabel: "SEZ",
    description: "Supply to Special Economic Zone",
    icon: "Building2",
  },
  {
    value: "receipt-voucher",
    label: "Receipt Voucher",
    shortLabel: "Receipt",
    description: "Advance payment receipt",
    icon: "CircleDollarSign",
  },
  {
    value: "payment-voucher",
    label: "Payment Voucher",
    shortLabel: "Payment",
    description: "Payment under reverse charge",
    icon: "Wallet",
  },
  {
    value: "refund-voucher",
    label: "Refund Voucher",
    shortLabel: "Refund",
    description: "Refund of advance payment",
    icon: "RotateCcw",
  },
];

/* =====================================================
   PAYMENT MODES
===================================================== */

export const PAYMENT_MODES = [
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "upi",
    label: "UPI",
  },
  {
    value: "bank-transfer",
    label: "Bank Transfer",
  },
  {
    value: "cheque",
    label: "Cheque",
  },
  {
    value: "card",
    label: "Debit / Credit Card",
  },
  {
    value: "other",
    label: "Other",
  },
] as const;

/* =====================================================
   PAYMENT TERMS
===================================================== */

export const PAYMENT_TERMS = [
  {
    label: "Due on Receipt",
    days: 0,
  },
  {
    label: "Net 7 Days",
    days: 7,
  },
  {
    label: "Net 15 Days",
    days: 15,
  },
  {
    label: "Net 30 Days",
    days: 30,
  },
  {
    label: "Net 45 Days",
    days: 45,
  },
  {
    label: "Net 60 Days",
    days: 60,
  },
  {
    label: "Net 90 Days",
    days: 90,
  },
] as const;

/* =====================================================
   BUSINESS TYPES
===================================================== */

export const BUSINESS_TYPES = [
  {
    value: "proprietorship",
    label: "Proprietorship",
  },
  {
    value: "partnership",
    label: "Partnership Firm",
  },
  {
    value: "llp",
    label: "Limited Liability Partnership",
  },
  {
    value: "private-limited",
    label: "Private Limited Company",
  },
  {
    value: "public-limited",
    label: "Public Limited Company",
  },
  {
    value: "huf",
    label: "Hindu Undivided Family",
  },
  {
    value: "trust",
    label: "Trust",
  },
  {
    value: "other",
    label: "Other",
  },
] as const;

/* =====================================================
   TRANSPORT MODES
===================================================== */

export const TRANSPORT_MODES = [
  {
    value: "road",
    label: "Road",
    code: "1",
  },
  {
    value: "rail",
    label: "Rail",
    code: "2",
  },
  {
    value: "air",
    label: "Air",
    code: "3",
  },
  {
    value: "ship",
    label: "Ship",
    code: "4",
  },
] as const;

/* =====================================================
   SUPPORT REQUEST TYPES
===================================================== */

export const SUPPORT_REQUEST_TYPES = [
  {
    value: "bug",
    label: "Report a Bug",
    description: "Something is not working correctly",
  },
  {
    value: "feature-request",
    label: "Request a Feature",
    description: "Suggest a new feature",
  },
  {
    value: "feedback",
    label: "Give Feedback",
    description: "Share your experience",
  },
  {
    value: "complaint",
    label: "Submit Complaint",
    description: "Report an issue",
  },
  {
    value: "other",
    label: "Other",
    description: "Other support request",
  },
] as const;

/* =====================================================
   HELPER FUNCTIONS
===================================================== */

/**
 * Get Indian state details using GST state code.
 */
export function getStateByCode(
  code?: string
): IndianState | undefined {
  if (!code) return undefined;

  return INDIAN_STATES.find(
    (state) => state.code === String(code).padStart(2, "0")
  );
}

/**
 * Get Indian state details using state name.
 */
export function getStateByName(
  name?: string
): IndianState | undefined {
  if (!name) return undefined;

  return INDIAN_STATES.find(
    (state) =>
      state.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get state name from GST code.
 */
export function getStateName(
  code?: string
): string {
  return getStateByCode(code)?.name ?? "";
}

/**
 * Get GST code from state name.
 */
export function getStateCode(
  name?: string
): string {
  return getStateByName(name)?.code ?? "";
}

/**
 * Get document type details.
 */
export function getDocumentTypeOption(
  type: DocumentType
): DocumentTypeOption | undefined {
  return DOCUMENT_TYPES.find(
    (document) => document.value === type
  );
}
