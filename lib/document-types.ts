/* =========================================================
   SMART GST
   CENTRAL DOCUMENT TYPE DEFINITIONS

   IMPORTANT:
   - No React
   - No UI
   - No browser APIs
   - Central registry for all business documents
   - Every document can have its own module/workflow
========================================================= */

/* =========================================================
   DOCUMENT CATEGORIES
========================================================= */

export type DocumentCategory =
  | "SALES"
  | "ADJUSTMENTS"
  | "GOODS_MOVEMENT"
  | "PURCHASE"
  | "GST_COMPLIANCE"
  | "BUSINESS"
  | "SUPPORT";

/* =========================================================
   DOCUMENT TYPE IDS
========================================================= */

export type DocumentTypeId =
  | "tax-invoice"
  | "bill-of-supply"
  | "export-invoice"
  | "sez-invoice"
  | "credit-note"
  | "debit-note"
  | "revised-invoice"
  | "delivery-challan"
  | "stock-transfer"
  | "job-work"
  | "e-way-bill"
  | "purchase-invoice"
  | "import-goods"
  | "import-services"
  | "supplier-credit-note"
  | "supplier-debit-note"
  | "e-invoice"
  | "reverse-charge"
  | "gst-validation";

/* =========================================================
   DOCUMENT DEFINITION
========================================================= */

export type DocumentDefinition = {
  id: DocumentTypeId;
  title: string;
  shortTitle: string;
  category: DocumentCategory;
  description: string;
  route: string;
  enabled: boolean;
};

/* =========================================================
   CENTRAL DOCUMENT REGISTRY
========================================================= */

export const DOCUMENT_TYPES: DocumentDefinition[] = [
  /* -------------------------------------------------------
     SALES
  ------------------------------------------------------- */

  {
    id: "tax-invoice",
    title: "Tax Invoice",
    shortTitle: "Invoice",
    category: "SALES",
    description:
      "Create and manage GST tax invoices for taxable sales.",
    route: "/tax-invoice",
    enabled: true,
  },

  {
    id: "bill-of-supply",
    title: "Bill of Supply",
    shortTitle: "Bill of Supply",
    category: "SALES",
    description:
      "Create bills of supply for eligible non-taxable or composition transactions.",
    route: "/bill-of-supply",
    enabled: true,
  },

  {
    id: "export-invoice",
    title: "Export Invoice",
    shortTitle: "Export",
    category: "SALES",
    description:
      "Create invoices for export transactions.",
    route: "/export-invoice",
    enabled: true,
  },

  {
    id: "sez-invoice",
    title: "SEZ Invoice",
    shortTitle: "SEZ",
    category: "SALES",
    description:
      "Manage invoices related to supplies involving Special Economic Zones.",
    route: "/sez-invoice",
    enabled: true,
  },

  /* -------------------------------------------------------
     ADJUSTMENTS
  ------------------------------------------------------- */

  {
    id: "credit-note",
    title: "Credit Note",
    shortTitle: "Credit Note",
    category: "ADJUSTMENTS",
    description:
      "Create credit notes against eligible sales documents.",
    route: "/credit-note",
    enabled: true,
  },

  {
    id: "debit-note",
    title: "Debit Note",
    shortTitle: "Debit Note",
    category: "ADJUSTMENTS",
    description:
      "Create debit notes for eligible adjustments to earlier transactions.",
    route: "/debit-note",
    enabled: true,
  },

  {
    id: "revised-invoice",
    title: "Revised Invoice",
    shortTitle: "Revised",
    category: "ADJUSTMENTS",
    description:
      "Create and manage revised invoice workflows.",
    route: "/revised-invoice",
    enabled: true,
  },

  /* -------------------------------------------------------
     GOODS MOVEMENT
  ------------------------------------------------------- */

  {
    id: "delivery-challan",
    title: "Delivery Challan",
    shortTitle: "Challan",
    category: "GOODS_MOVEMENT",
    description:
      "Create delivery challans for applicable movement of goods.",
    route: "/delivery-challan",
    enabled: true,
  },

  {
    id: "stock-transfer",
    title: "Stock Transfer",
    shortTitle: "Stock Transfer",
    category: "GOODS_MOVEMENT",
    description:
      "Record and manage movement of stock between business locations or applicable units.",
    route: "/stock-transfer",
    enabled: true,
  },

  {
    id: "job-work",
    title: "Job Work",
    shortTitle: "Job Work",
    category: "GOODS_MOVEMENT",
    description:
      "Manage documents and records related to job-work movement of goods.",
    route: "/job-work",
    enabled: true,
  },

  {
    id: "e-way-bill",
    title: "E-Way Bill",
    shortTitle: "E-Way Bill",
    category: "GOODS_MOVEMENT",
    description:
      "Prepare and manage data required for applicable e-way bill workflows.",
    route: "/e-way-bill",
    enabled: true,
  },

  /* -------------------------------------------------------
     PURCHASE
  ------------------------------------------------------- */

  {
    id: "purchase-invoice",
    title: "Purchase Invoice",
    shortTitle: "Purchase",
    category: "PURCHASE",
    description:
      "Record and manage purchase invoices received from suppliers.",
    route: "/purchase-invoice",
    enabled: true,
  },

  {
    id: "import-goods",
    title: "Import of Goods",
    shortTitle: "Import Goods",
    category: "PURCHASE",
    description:
      "Manage purchase and tax data related to imports of goods.",
    route: "/import-goods",
    enabled: true,
  },

  {
    id: "import-services",
    title: "Import of Services",
    shortTitle: "Import Services",
    category: "PURCHASE",
    description:
      "Manage purchase and tax data related to imports of services.",
    route: "/import-services",
    enabled: true,
  },

  {
    id: "supplier-credit-note",
    title: "Supplier Credit Note",
    shortTitle: "Supplier Credit",
    category: "PURCHASE",
    description:
      "Record credit notes received from suppliers.",
    route: "/supplier-credit-note",
    enabled: true,
  },

  {
    id: "supplier-debit-note",
    title: "Supplier Debit Note",
    shortTitle: "Supplier Debit",
    category: "PURCHASE",
    description:
      "Record debit notes received from suppliers.",
    route: "/supplier-debit-note",
    enabled: true,
  },

  /* -------------------------------------------------------
     GST & COMPLIANCE
  ------------------------------------------------------- */

  {
    id: "e-invoice",
    title: "E-Invoice",
    shortTitle: "E-Invoice",
    category: "GST_COMPLIANCE",
    description:
      "Manage data and workflow for applicable e-invoice transactions.",
    route: "/e-invoice",
    enabled: true,
  },

  {
    id: "reverse-charge",
    title: "Reverse Charge",
    shortTitle: "RCM",
    category: "GST_COMPLIANCE",
    description:
      "Manage transactions that require a reverse-charge workflow.",
    route: "/reverse-charge",
    enabled: true,
  },

  {
    id: "gst-validation",
    title: "GST Validation",
    shortTitle: "GST Check",
    category: "GST_COMPLIANCE",
    description:
      "Validate GST-related information before using it in business documents.",
    route: "/gst-validation",
    enabled: true,
  },
];

/* =========================================================
   LOOKUP FUNCTIONS
========================================================= */

export function getDocumentById(
  id: DocumentTypeId
): DocumentDefinition | null {
  return (
    DOCUMENT_TYPES.find(
      (document) =>
        document.id === id
    ) || null
  );
}

/* =========================================================
   GET DOCUMENTS BY CATEGORY
========================================================= */

export function getDocumentsByCategory(
  category: DocumentCategory
): DocumentDefinition[] {
  return DOCUMENT_TYPES.filter(
    (document) =>
      document.category === category
  );
}

/* =========================================================
   GET ENABLED DOCUMENTS
========================================================= */

export function getEnabledDocuments(): DocumentDefinition[] {
  return DOCUMENT_TYPES.filter(
    (document) =>
      document.enabled
  );
}

/* =========================================================
   CHECK DOCUMENT TYPE
========================================================= */

export function isDocumentTypeId(
  value: string
): value is DocumentTypeId {
  return DOCUMENT_TYPES.some(
    (document) =>
      document.id === value
  );
}

/* =========================================================
   GET DOCUMENT TITLE
========================================================= */

export function getDocumentTitle(
  id: DocumentTypeId
): string {
  return (
    getDocumentById(id)?.title ||
    id
  );
}

/* =========================================================
   GET DOCUMENT SHORT TITLE
========================================================= */

export function getDocumentShortTitle(
  id: DocumentTypeId
): string {
  return (
    getDocumentById(id)?.shortTitle ||
    id
  );
}
