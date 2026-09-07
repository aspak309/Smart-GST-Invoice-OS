// lib/document-config.ts

import type { DocumentType } from "./invoice-utils";

export type PartyRole = "customer" | "supplier" | "both" | "none";

export interface DocumentConfig {
  type: DocumentType;

  title: string;
  shortTitle: string;
  description: string;

  prefix: string;

  partyRole: PartyRole;

  requiresGST: boolean;
  allowsGST: boolean;

  supportsItems: boolean;
  supportsPayment: boolean;
  supportsDueDate: boolean;

  supportsShippingAddress: boolean;
  supportsTransport: boolean;

  supportsEInvoice: boolean;
  supportsEWayBill: boolean;

  supportsReferenceInvoice: boolean;

  supportsReverseCharge: boolean;

  defaultPaymentDays: number;

  fields: {
    invoiceDate: boolean;
    dueDate: boolean;
    supplyDate: boolean;

    placeOfSupply: boolean;

    customer: boolean;
    supplier: boolean;

    items: boolean;

    paymentTerms: boolean;

    notes: boolean;
    termsAndConditions: boolean;

    bankDetails: boolean;

    transportDetails: boolean;

    referenceInvoice: boolean;
  };
}

/* =====================================================
   DOCUMENT CONFIGURATIONS
===================================================== */

export const DOCUMENT_CONFIG: Record<
  DocumentType,
  DocumentConfig
> = {
  "tax-invoice": {
    type: "tax-invoice",

    title: "Tax Invoice",
    shortTitle: "Invoice",

    description:
      "Create a GST compliant tax invoice for goods or services.",

    prefix: "INV",

    partyRole: "customer",

    requiresGST: true,
    allowsGST: true,

    supportsItems: true,
    supportsPayment: true,
    supportsDueDate: true,

    supportsShippingAddress: true,
    supportsTransport: true,

    supportsEInvoice: true,
    supportsEWayBill: true,

    supportsReferenceInvoice: false,

    supportsReverseCharge: true,

    defaultPaymentDays: 30,

    fields: {
      invoiceDate: true,
      dueDate: true,
      supplyDate: true,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: true,

      paymentTerms: true,

      notes: true,
      termsAndConditions: true,

      bankDetails: true,

      transportDetails: true,

      referenceInvoice: false,
    },
  },

  /* =====================================================
     BILL OF SUPPLY
  ===================================================== */

  "bill-of-supply": {
    type: "bill-of-supply",

    title: "Bill of Supply",
    shortTitle: "Bill of Supply",

    description:
      "Create a bill of supply for composition or exempt supplies.",

    prefix: "BOS",

    partyRole: "customer",

    requiresGST: false,
    allowsGST: false,

    supportsItems: true,
    supportsPayment: true,
    supportsDueDate: true,

    supportsShippingAddress: true,
    supportsTransport: true,

    supportsEInvoice: false,
    supportsEWayBill: true,

    supportsReferenceInvoice: false,

    supportsReverseCharge: false,

    defaultPaymentDays: 30,

    fields: {
      invoiceDate: true,
      dueDate: true,
      supplyDate: true,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: true,

      paymentTerms: true,

      notes: true,
      termsAndConditions: true,

      bankDetails: true,

      transportDetails: true,

      referenceInvoice: false,
    },
  },

  /* =====================================================
     CREDIT NOTE
  ===================================================== */

  "credit-note": {
    type: "credit-note",

    title: "Credit Note",
    shortTitle: "Credit Note",

    description:
      "Issue a credit note against an existing invoice.",

    prefix: "CN",

    partyRole: "customer",

    requiresGST: true,
    allowsGST: true,

    supportsItems: true,
    supportsPayment: false,
    supportsDueDate: false,

    supportsShippingAddress: false,
    supportsTransport: false,

    supportsEInvoice: false,
    supportsEWayBill: false,

    supportsReferenceInvoice: true,

    supportsReverseCharge: false,

    defaultPaymentDays: 0,

    fields: {
      invoiceDate: true,
      dueDate: false,
      supplyDate: false,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: true,

      paymentTerms: false,

      notes: true,
      termsAndConditions: false,

      bankDetails: false,

      transportDetails: false,

      referenceInvoice: true,
    },
  },

  /* =====================================================
     DEBIT NOTE
  ===================================================== */

  "debit-note": {
    type: "debit-note",

    title: "Debit Note",
    shortTitle: "Debit Note",

    description:
      "Issue a debit note against an existing transaction.",

    prefix: "DN",

    partyRole: "customer",

    requiresGST: true,
    allowsGST: true,

    supportsItems: true,
    supportsPayment: true,
    supportsDueDate: true,

    supportsShippingAddress: false,
    supportsTransport: false,

    supportsEInvoice: false,
    supportsEWayBill: false,

    supportsReferenceInvoice: true,

    supportsReverseCharge: false,

    defaultPaymentDays: 30,

    fields: {
      invoiceDate: true,
      dueDate: true,
      supplyDate: false,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: true,

      paymentTerms: true,

      notes: true,
      termsAndConditions: true,

      bankDetails: true,

      transportDetails: false,

      referenceInvoice: true,
    },
  },

  /* =====================================================
     DELIVERY CHALLAN
  ===================================================== */

  "delivery-challan": {
    type: "delivery-challan",

    title: "Delivery Challan",
    shortTitle: "Challan",

    description:
      "Create a delivery challan for movement of goods.",

    prefix: "DC",

    partyRole: "customer",

    requiresGST: false,
    allowsGST: false,

    supportsItems: true,
    supportsPayment: false,
    supportsDueDate: false,

    supportsShippingAddress: true,
    supportsTransport: true,

    supportsEInvoice: false,
    supportsEWayBill: true,

    supportsReferenceInvoice: false,

    supportsReverseCharge: false,

    defaultPaymentDays: 0,

    fields: {
      invoiceDate: true,
      dueDate: false,
      supplyDate: true,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: true,

      paymentTerms: false,

      notes: true,
      termsAndConditions: true,

      bankDetails: false,

      transportDetails: true,

      referenceInvoice: false,
    },
  },

  /* =====================================================
     EXPORT INVOICE
  ===================================================== */

  "export-invoice": {
    type: "export-invoice",

    title: "Export Invoice",
    shortTitle: "Export",

    description:
      "Create an invoice for export supply outside India.",

    prefix: "EXP",

    partyRole: "customer",

    requiresGST: true,
    allowsGST: true,

    supportsItems: true,
    supportsPayment: true,
    supportsDueDate: true,

    supportsShippingAddress: true,
    supportsTransport: true,

    supportsEInvoice: true,
    supportsEWayBill: true,

    supportsReferenceInvoice: false,

    supportsReverseCharge: false,

    defaultPaymentDays: 30,

    fields: {
      invoiceDate: true,
      dueDate: true,
      supplyDate: true,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: true,

      paymentTerms: true,

      notes: true,
      termsAndConditions: true,

      bankDetails: true,

      transportDetails: true,

      referenceInvoice: false,
    },
  },

  /* =====================================================
     SEZ INVOICE
  ===================================================== */

  "sez-invoice": {
    type: "sez-invoice",

    title: "SEZ Invoice",
    shortTitle: "SEZ",

    description:
      "Create an invoice for supply to a Special Economic Zone.",

    prefix: "SEZ",

    partyRole: "customer",

    requiresGST: true,
    allowsGST: true,

    supportsItems: true,
    supportsPayment: true,
    supportsDueDate: true,

    supportsShippingAddress: true,
    supportsTransport: true,

    supportsEInvoice: true,
    supportsEWayBill: true,

    supportsReferenceInvoice: false,

    supportsReverseCharge: false,

    defaultPaymentDays: 30,

    fields: {
      invoiceDate: true,
      dueDate: true,
      supplyDate: true,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: true,

      paymentTerms: true,

      notes: true,
      termsAndConditions: true,

      bankDetails: true,

      transportDetails: true,

      referenceInvoice: false,
    },
  },

  /* =====================================================
     RECEIPT VOUCHER
  ===================================================== */

  "receipt-voucher": {
    type: "receipt-voucher",

    title: "Receipt Voucher",
    shortTitle: "Receipt",

    description:
      "Record advance payment received from a customer.",

    prefix: "RV",

    partyRole: "customer",

    requiresGST: true,
    allowsGST: true,

    supportsItems: false,
    supportsPayment: true,
    supportsDueDate: false,

    supportsShippingAddress: false,
    supportsTransport: false,

    supportsEInvoice: false,
    supportsEWayBill: false,

    supportsReferenceInvoice: false,

    supportsReverseCharge: false,

    defaultPaymentDays: 0,

    fields: {
      invoiceDate: true,
      dueDate: false,
      supplyDate: false,

      placeOfSupply: true,

      customer: true,
      supplier: false,

      items: false,

      paymentTerms: false,

      notes: true,
      termsAndConditions: false,

      bankDetails: false,

      transportDetails: false,

      referenceInvoice: false,
    },
  },

  /* =====================================================
     PAYMENT VOUCHER
  ===================================================== */

  "payment-voucher": {
    type: "payment-voucher",

    title: "Payment Voucher",
    shortTitle: "Payment",

    description:
      "Record payment made under reverse charge mechanism.",

    prefix: "PV",

    partyRole: "supplier",

    requiresGST: true,
    allowsGST: true,

    supportsItems: false,
    supportsPayment: true,
    supportsDueDate: false,

    supportsShippingAddress: false,
    supportsTransport: false,

    supportsEInvoice: false,
    supportsEWayBill: false,

    supportsReferenceInvoice: false,

    supportsReverseCharge: true,

    defaultPaymentDays: 0,

    fields: {
      invoiceDate: true,
      dueDate: false,
      supplyDate: false,

      placeOfSupply: true,

      customer: false,
      supplier: true,

      items: false,

      paymentTerms: false,

      notes: true,
      termsAndConditions: false,

      bankDetails: false,

      transportDetails: false,

      referenceInvoice: false,
    },
  },

  /* =====================================================
     REFUND VOUCHER
  ===================================================== */

  "refund-voucher": {
    type: "refund-voucher",

    title: "Refund Voucher",
    shortTitle: "Refund",

    description:
      "Create a refund voucher for advance payments.",

    prefix: "RFV",

    partyRole: "customer",

    requiresGST: false,
    allowsGST: false,

    supportsItems: false,
    supportsPayment: true,
    supportsDueDate: false,

    supportsShippingAddress: false,
    supportsTransport: false,

    supportsEInvoice: false,
    supportsEWayBill: false,

    supportsReferenceInvoice: true,

    supportsReverseCharge: false,

    defaultPaymentDays: 0,

    fields: {
      invoiceDate: true,
      dueDate: false,
      supplyDate: false,

      placeOfSupply: false,

      customer: true,
      supplier: false,

      items: false,

      paymentTerms: false,

      notes: true,
      termsAndConditions: false,

      bankDetails: false,

      transportDetails: false,

      referenceInvoice: true,
    },
  },

  /* =====================================================
     OTHER
  ===================================================== */

  other: {
    type: "other",

    title: "Other Document",
    shortTitle: "Document",

    description:
      "Create a custom business document.",

    prefix: "DOC",

    partyRole: "both",

    requiresGST: false,
    allowsGST: true,

    supportsItems: true,
    supportsPayment: false,
    supportsDueDate: false,

    supportsShippingAddress: false,
    supportsTransport: false,

    supportsEInvoice: false,
    supportsEWayBill: false,

    supportsReferenceInvoice: false,

    supportsReverseCharge: false,

    defaultPaymentDays: 0,

    fields: {
      invoiceDate: true,
      dueDate: false,
      supplyDate: false,

      placeOfSupply: false,

      customer: true,
      supplier: true,

      items: true,

      paymentTerms: false,

      notes: true,
      termsAndConditions: true,

      bankDetails: false,

      transportDetails: false,

      referenceInvoice: false,
    },
  },
};

/* =====================================================
   HELPERS
===================================================== */

/**
 * Get complete configuration for a document type.
 */
export function getDocumentConfig(
  type: DocumentType
): DocumentConfig {
  return DOCUMENT_CONFIG[type];
}

/**
 * Check whether GST fields should be shown.
 */
export function documentUsesGST(
  type: DocumentType
): boolean {
  return DOCUMENT_CONFIG[type].allowsGST;
}

/**
 * Check whether document requires GST.
 */
export function documentRequiresGST(
  type: DocumentType
): boolean {
  return DOCUMENT_CONFIG[type].requiresGST;
}

/**
 * Check whether E-Invoice is supported.
 */
export function documentSupportsEInvoice(
  type: DocumentType
): boolean {
  return DOCUMENT_CONFIG[type].supportsEInvoice;
}

/**
 * Check whether E-Way Bill is supported.
 */
export function documentSupportsEWayBill(
  type: DocumentType
): boolean {
  return DOCUMENT_CONFIG[type].supportsEWayBill;
}

/**
 * Get all available document configurations.
 */
export function getAllDocumentConfigs(): DocumentConfig[] {
  return Object.values(DOCUMENT_CONFIG);
}
