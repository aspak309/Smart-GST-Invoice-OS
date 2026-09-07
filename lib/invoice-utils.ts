// lib/invoice-utils.ts

export type DocumentType =
  | "tax-invoice"
  | "bill-of-supply"
  | "credit-note"
  | "debit-note"
  | "delivery-challan"
  | "export-invoice"
  | "sez-invoice"
  | "receipt-voucher"
  | "payment-voucher"
  | "refund-voucher"
  | "other";

export type InvoiceStatus =
  | "draft"
  | "generated"
  | "sent"
  | "partially-paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type SupplyType = "intra-state" | "inter-state";

export interface PartyAddress {
  state?: string;
  stateCode?: string;
}

export interface InvoiceNumberOptions {
  prefix?: string;
  financialYear?: string;
  sequence: number;
  padding?: number;
}

export interface InvoicePaymentStatusInput {
  totalAmount: number;
  paidAmount: number;
  dueDate?: string | Date;
  cancelled?: boolean;
}

/**
 * Generates Indian financial year string.
 * Example: 2026-04-01 => 2026-27
 */
export function getFinancialYear(
  date: Date = new Date()
): string {
  const year = date.getFullYear();
  const month = date.getMonth();

  const startYear = month >= 3 ? year : year - 1;
  const endYear = String(startYear + 1).slice(-2);

  return `${startYear}-${endYear}`;
}

/**
 * Generates a document number.
 *
 * Example:
 * INV/2026-27/000123
 */
export function generateDocumentNumber(
  options: InvoiceNumberOptions
): string {
  const {
    prefix = "INV",
    financialYear = getFinancialYear(),
    sequence,
    padding = 6,
  } = options;

  const safeSequence = Math.max(
    1,
    Math.floor(Number(sequence) || 1)
  );

  const paddedSequence = String(safeSequence).padStart(
    padding,
    "0"
  );

  return `${prefix}/${financialYear}/${paddedSequence}`;
}

/**
 * Returns prefix based on document type.
 */
export function getDocumentPrefix(
  documentType: DocumentType
): string {
  const prefixes: Record<DocumentType, string> = {
    "tax-invoice": "INV",
    "bill-of-supply": "BOS",
    "credit-note": "CN",
    "debit-note": "DN",
    "delivery-challan": "DC",
    "export-invoice": "EXP",
    "sez-invoice": "SEZ",
    "receipt-voucher": "RV",
    "payment-voucher": "PV",
    "refund-voucher": "RFV",
    other: "DOC",
  };

  return prefixes[documentType];
}

/**
 * Generates a document number directly from document type.
 */
export function createDocumentNumber(
  documentType: DocumentType,
  sequence: number,
  date: Date = new Date()
): string {
  return generateDocumentNumber({
    prefix: getDocumentPrefix(documentType),
    financialYear: getFinancialYear(date),
    sequence,
  });
}

/**
 * Determines whether a transaction is intra-state or inter-state.
 */
export function determineSupplyType(
  seller: PartyAddress,
  buyer: PartyAddress
): SupplyType {
  const sellerCode = String(
    seller.stateCode ?? ""
  ).trim();

  const buyerCode = String(
    buyer.stateCode ?? ""
  ).trim();

  if (sellerCode && buyerCode) {
    return sellerCode === buyerCode
      ? "intra-state"
      : "inter-state";
  }

  const sellerState = String(
    seller.state ?? ""
  )
    .trim()
    .toLowerCase();

  const buyerState = String(
    buyer.state ?? ""
  )
    .trim()
    .toLowerCase();

  if (sellerState && buyerState) {
    return sellerState === buyerState
      ? "intra-state"
      : "inter-state";
  }

  return "intra-state";
}

/**
 * Returns whether IGST should be applied.
 */
export function shouldApplyIGST(
  seller: PartyAddress,
  buyer: PartyAddress
): boolean {
  return (
    determineSupplyType(seller, buyer) ===
    "inter-state"
  );
}

/**
 * Adds days to a date.
 */
export function addDays(
  date: Date | string,
  days: number
): Date {
  const result = new Date(date);

  if (Number.isNaN(result.getTime())) {
    return new Date();
  }

  result.setDate(result.getDate() + Math.max(0, days));

  return result;
}

/**
 * Calculates due date from invoice date and payment terms.
 */
export function calculateDueDate(
  invoiceDate: Date | string,
  creditDays: number
): Date {
  return addDays(invoiceDate, creditDays);
}

/**
 * Checks whether a due date has passed.
 */
export function isOverdue(
  dueDate?: Date | string
): boolean {
  if (!dueDate) return false;

  const due = new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

/**
 * Calculates pending amount.
 */
export function calculatePendingAmount(
  totalAmount: number,
  paidAmount: number
): number {
  const total = Math.max(0, Number(totalAmount) || 0);
  const paid = Math.max(0, Number(paidAmount) || 0);

  return Math.max(0, total - paid);
}

/**
 * Determines current invoice payment status.
 */
export function getInvoicePaymentStatus(
  input: InvoicePaymentStatusInput
): InvoiceStatus {
  if (input.cancelled) {
    return "cancelled";
  }

  const total = Math.max(
    0,
    Number(input.totalAmount) || 0
  );

  const paid = Math.max(
    0,
    Number(input.paidAmount) || 0
  );

  if (paid >= total && total > 0) {
    return "paid";
  }

  if (paid > 0 && paid < total) {
    if (isOverdue(input.dueDate)) {
      return "overdue";
    }

    return "partially-paid";
  }

  if (total > 0 && isOverdue(input.dueDate)) {
    return "overdue";
  }

  return "generated";
}

/**
 * Returns human-readable invoice status.
 */
export function getInvoiceStatusLabel(
  status: InvoiceStatus
): string {
  const labels: Record<InvoiceStatus, string> = {
    draft: "Draft",
    generated: "Generated",
    sent: "Sent",
    "partially-paid": "Partially Paid",
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
  };

  return labels[status];
}

/**
 * Returns document type label.
 */
export function getDocumentTypeLabel(
  type: DocumentType
): string {
  const labels: Record<DocumentType, string> = {
    "tax-invoice": "Tax Invoice",
    "bill-of-supply": "Bill of Supply",
    "credit-note": "Credit Note",
    "debit-note": "Debit Note",
    "delivery-challan": "Delivery Challan",
    "export-invoice": "Export Invoice",
    "sez-invoice": "SEZ Invoice",
    "receipt-voucher": "Receipt Voucher",
    "payment-voucher": "Payment Voucher",
    "refund-voucher": "Refund Voucher",
    other: "Other Document",
  };

  return labels[type];
}

/**
 * Formats date as DD/MM/YYYY.
 */
export function formatInvoiceDate(
  date?: Date | string | null
): string {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

/**
 * Formats date for HTML date input.
 * Example: 2026-09-07
 */
export function formatDateInput(
  date?: Date | string | null
): string {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsedDate.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Creates a short unique document reference ID.
 */
export function createDocumentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();

  const random = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();

  return `${timestamp}-${random}`;
}

/**
 * Checks whether document type supports GST tax calculation.
 */
export function supportsGST(
  documentType: DocumentType
): boolean {
  return ![
    "delivery-challan",
    "receipt-voucher",
    "payment-voucher",
  ].includes(documentType);
}

/**
 * Checks whether document type can have payment tracking.
 */
export function supportsPaymentTracking(
  documentType: DocumentType
): boolean {
  return [
    "tax-invoice",
    "bill-of-supply",
    "export-invoice",
    "sez-invoice",
    "debit-note",
  ].includes(documentType);
}

/**
 * Gets default payment terms based on document type.
 */
export function getDefaultPaymentTerms(
  documentType: DocumentType
): string {
  switch (documentType) {
    case "tax-invoice":
      return "Due on Receipt";

    case "bill-of-supply":
      return "Due on Receipt";

    case "credit-note":
      return "Credit Adjustment";

    case "debit-note":
      return "Due on Receipt";

    case "delivery-challan":
      return "Not Applicable";

    case "export-invoice":
      return "As Per Agreement";

    case "sez-invoice":
      return "As Per Agreement";

    default:
      return "Due on Receipt";
  }
    }
