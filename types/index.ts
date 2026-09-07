// types/index.ts

import type {
  DocumentType,
  InvoiceStatus,
} from "@/lib/invoice-utils";

import type {
  GSTType,
} from "@/lib/gst-utils";

/* =====================================================
   COMMON
===================================================== */

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type EntityStatus =
  | "active"
  | "inactive"
  | "archived";

/* =====================================================
   ADDRESS
===================================================== */

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  pincode?: string;
}

/* =====================================================
   BUSINESS PROFILE
===================================================== */

export interface BusinessProfile extends BaseEntity {
  businessName: string;
  legalName?: string;

  gstin?: string;
  pan?: string;

  businessType?:
    | "proprietorship"
    | "partnership"
    | "llp"
    | "private-limited"
    | "public-limited"
    | "huf"
    | "trust"
    | "other";

  email?: string;
  phone?: string;
  website?: string;

  address?: Address;

  logoUrl?: string;

  financialYear?: string;

  invoicePrefix?: string;
  creditNotePrefix?: string;
  debitNotePrefix?: string;

  defaultPaymentTerms?: number;

  bankDetails?: BankDetails;
}

/* =====================================================
   BANK DETAILS
===================================================== */

export interface BankDetails {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
}

/* =====================================================
   CUSTOMER
===================================================== */

export interface Customer extends BaseEntity {
  customerCode?: string;

  name: string;
  legalName?: string;

  gstin?: string;
  pan?: string;

  email?: string;
  phone?: string;

  billingAddress?: Address;
  shippingAddress?: Address;

  creditLimit?: number;
  creditDays?: number;

  openingBalance?: number;

  status: EntityStatus;

  notes?: string;
}

/* =====================================================
   SUPPLIER
===================================================== */

export interface Supplier extends BaseEntity {
  supplierCode?: string;

  name: string;
  legalName?: string;

  gstin?: string;
  pan?: string;

  email?: string;
  phone?: string;

  address?: Address;

  creditLimit?: number;
  creditDays?: number;

  openingBalance?: number;

  status: EntityStatus;

  notes?: string;
}

/* =====================================================
   PRODUCT / SERVICE
===================================================== */

export type ProductType =
  | "product"
  | "service";

export interface Product extends BaseEntity {
  name: string;

  description?: string;

  type: ProductType;

  sku?: string;

  hsnSac?: string;

  unit: string;

  sellingPrice: number;
  purchasePrice?: number;

  gstRate: number;
  cessRate?: number;

  openingStock?: number;
  currentStock?: number;

  lowStockAlert?: number;

  status: EntityStatus;
}

/* =====================================================
   INVOICE ITEM
===================================================== */

export interface InvoiceLineItem {
  id: string;

  productId?: string;

  productName: string;

  description?: string;

  hsnSac?: string;

  quantity: number;

  unit?: string;

  rate: number;

  discountPercentage: number;

  discountAmount?: number;

  grossAmount?: number;

  taxableValue: number;

  gstRate: number;

  cessRate?: number;

  cgst: number;

  sgst: number;

  igst: number;

  cess: number;

  totalTax: number;

  totalAmount: number;
}

/* =====================================================
   INVOICE TOTALS
===================================================== */

export interface InvoiceTotals {
  totalQuantity: number;

  grossAmount: number;

  totalDiscount: number;

  taxableValue: number;

  cgst: number;

  sgst: number;

  igst: number;

  cess: number;

  totalTax: number;

  roundOff: number;

  grandTotal: number;
}

/* =====================================================
   INVOICE
===================================================== */

export interface Invoice extends BaseEntity {
  invoiceNumber: string;

  documentType: DocumentType;

  status: InvoiceStatus;

  invoiceDate: string;

  dueDate?: string;

  supplyDate?: string;

  gstType: GSTType;

  supplyType:
    | "intra-state"
    | "inter-state";

  placeOfSupply?: string;

  placeOfSupplyCode?: string;

  reverseCharge?: boolean;

  sellerId?: string;

  sellerSnapshot?: PartySnapshot;

  customerId?: string;

  customerSnapshot?: PartySnapshot;

  shippingAddress?: Address;

  items: InvoiceLineItem[];

  totals: InvoiceTotals;

  notes?: string;

  termsAndConditions?: string;

  paymentTerms?: string;

  paymentStatus?: InvoiceStatus;

  paidAmount?: number;

  pendingAmount?: number;

  eInvoiceDetails?: EInvoiceDetails;

  eWayBillDetails?: EWayBillDetails;

  pdfUrl?: string;

  createdBy?: string;
}

/* =====================================================
   PARTY SNAPSHOT
   Invoice बनने के बाद customer data बदलने पर
   पुरानी invoice प्रभावित नहीं होगी।
===================================================== */

export interface PartySnapshot {
  name: string;

  legalName?: string;

  gstin?: string;

  pan?: string;

  phone?: string;

  email?: string;

  address?: Address;
}

/* =====================================================
   E-INVOICE
===================================================== */

export type EInvoiceStatus =
  | "not-generated"
  | "generated"
  | "cancelled"
  | "failed";

export interface EInvoiceDetails {
  status: EInvoiceStatus;

  irn?: string;

  ackNumber?: string;

  ackDate?: string;

  signedInvoice?: string;

  signedQRCode?: string;

  errorMessage?: string;
}

/* =====================================================
   E-WAY BILL
===================================================== */

export type EWayBillStatus =
  | "not-generated"
  | "generated"
  | "cancelled"
  | "expired"
  | "failed";

export interface EWayBillDetails {
  status: EWayBillStatus;

  eWayBillNumber?: string;

  generatedDate?: string;

  validUntil?: string;

  transporterName?: string;

  transporterId?: string;

  vehicleNumber?: string;

  transportMode?:
    | "road"
    | "rail"
    | "air"
    | "ship";

  distance?: number;

  errorMessage?: string;
}

/* =====================================================
   PAYMENT
===================================================== */

export type PaymentMode =
  | "cash"
  | "upi"
  | "bank-transfer"
  | "cheque"
  | "card"
  | "other";

export type PaymentDirection =
  | "received"
  | "paid";

export interface Payment extends BaseEntity {
  paymentNumber?: string;

  direction: PaymentDirection;

  invoiceId?: string;

  partyId?: string;

  amount: number;

  paymentDate: string;

  paymentMode: PaymentMode;

  referenceNumber?: string;

  notes?: string;

  status:
    | "completed"
    | "pending"
    | "failed"
    | "cancelled";
}

/* =====================================================
   PURCHASE
===================================================== */

export interface Purchase extends BaseEntity {
  purchaseNumber: string;

  supplierId?: string;

  supplierSnapshot?: PartySnapshot;

  purchaseDate: string;

  dueDate?: string;

  supplierInvoiceNumber?: string;

  gstType: GSTType;

  items: InvoiceLineItem[];

  totals: InvoiceTotals;

  paidAmount: number;

  pendingAmount: number;

  status:
    | "draft"
    | "recorded"
    | "partially-paid"
    | "paid"
    | "overdue"
    | "cancelled";

  notes?: string;
}

/* =====================================================
   DASHBOARD
===================================================== */

export interface DashboardStats {
  totalSales: number;

  totalPurchases: number;

  gstPayable: number;

  gstInputCredit: number;

  netGSTPayable: number;

  outstandingReceivables: number;

  outstandingPayables: number;

  overdueReceivables: number;

  overduePayables: number;

  totalInvoices: number;

  totalCustomers: number;
}

/* =====================================================
   REPORTS
===================================================== */

export interface GSTSummary {
  taxableValue: number;

  cgst: number;

  sgst: number;

  igst: number;

  cess: number;

  totalTax: number;
}

export interface SalesReport {
  fromDate: string;
  toDate: string;

  totalSales: number;

  totalTaxableValue: number;

  totalGST: GSTSummary;

  invoiceCount: number;
}

export interface PurchaseReport {
  fromDate: string;
  toDate: string;

  totalPurchases: number;

  totalTaxableValue: number;

  totalInputTax: GSTSummary;

  purchaseCount: number;
}

/* =====================================================
   COMPLAINT / FEEDBACK SYSTEM
===================================================== */

export type SupportRequestType =
  | "bug"
  | "feature-request"
  | "feedback"
  | "complaint"
  | "other";

export type SupportRequestStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed";

export interface SupportRequest extends BaseEntity {
  type: SupportRequestType;

  subject: string;

  message: string;

  userEmail?: string;

  userId?: string;

  status: SupportRequestStatus;

  adminNotes?: string;

  priority:
    | "low"
    | "medium"
    | "high";
}

/* =====================================================
   APP SETTINGS
===================================================== */

export interface AppSettings {
  businessProfile?: BusinessProfile;

  currency: "INR";

  dateFormat:
    | "DD/MM/YYYY"
    | "DD-MM-YYYY"
    | "YYYY-MM-DD";

  invoiceRounding: boolean;

  defaultGSTType: GSTType;

  defaultPaymentDays: number;

  enableStockManagement: boolean;

  enableEInvoice: boolean;

  enableEWayBill: boolean;
}
