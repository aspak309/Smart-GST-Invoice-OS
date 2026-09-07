// lib/report-utils.ts

import type {
  Invoice,
  Purchase,
  GSTSummary,
  SalesReport,
  PurchaseReport,
} from "@/types";

import { roundMoney } from "./gst-utils";

export interface ReportDateRange {
  fromDate?: string | Date;
  toDate?: string | Date;
}

export interface GSTSlabReport {
  gstRate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  invoiceCount: number;
}

export interface PartyReport {
  id: string;
  name: string;
  transactionCount: number;
  taxableValue: number;
  totalAmount: number;
  pendingAmount: number;
}

export interface DailyReportData {
  date: string;
  sales: number;
  purchases: number;
  gstCollected: number;
  inputTaxCredit: number;
}

function safeNumber(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
}

function normalizeDate(
  value?: string | Date
): Date | null {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

function isWithinRange(
  value: string | Date,
  range?: ReportDateRange
): boolean {
  if (!range?.fromDate && !range?.toDate) {
    return true;
  }

  const date = normalizeDate(value);

  if (!date) return false;

  const fromDate = normalizeDate(range.fromDate);
  const toDate = normalizeDate(range.toDate);

  if (fromDate && date < fromDate) {
    return false;
  }

  if (toDate && date > toDate) {
    return false;
  }

  return true;
}

function isValidInvoice(invoice: Invoice): boolean {
  return (
    invoice.status !== "draft" &&
    invoice.status !== "cancelled"
  );
}

function isValidPurchase(purchase: Purchase): boolean {
  return (
    purchase.status !== "draft" &&
    purchase.status !== "cancelled"
  );
}

/* =====================================================
   DATE FILTERS
===================================================== */

export function filterReportInvoices(
  invoices: Invoice[],
  range?: ReportDateRange
): Invoice[] {
  return invoices.filter(
    (invoice) =>
      isValidInvoice(invoice) &&
      isWithinRange(
        invoice.invoiceDate,
        range
      )
  );
}

export function filterReportPurchases(
  purchases: Purchase[],
  range?: ReportDateRange
): Purchase[] {
  return purchases.filter(
    (purchase) =>
      isValidPurchase(purchase) &&
      isWithinRange(
        purchase.purchaseDate,
        range
      )
  );
}

/* =====================================================
   GST SUMMARY
===================================================== */

export function createEmptyGSTSummary(): GSTSummary {
  return {
    taxableValue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    totalTax: 0,
  };
}

export function calculateSalesGSTSummary(
  invoices: Invoice[]
): GSTSummary {
  const summary = createEmptyGSTSummary();

  invoices
    .filter(isValidInvoice)
    .forEach((invoice) => {
      summary.taxableValue += safeNumber(
        invoice.totals?.taxableValue
      );

      summary.cgst += safeNumber(
        invoice.totals?.cgst
      );

      summary.sgst += safeNumber(
        invoice.totals?.sgst
      );

      summary.igst += safeNumber(
        invoice.totals?.igst
      );

      summary.cess += safeNumber(
        invoice.totals?.cess
      );

      summary.totalTax += safeNumber(
        invoice.totals?.totalTax
      );
    });

  return {
    taxableValue: roundMoney(
      summary.taxableValue
    ),
    cgst: roundMoney(summary.cgst),
    sgst: roundMoney(summary.sgst),
    igst: roundMoney(summary.igst),
    cess: roundMoney(summary.cess),
    totalTax: roundMoney(summary.totalTax),
  };
}

export function calculatePurchaseGSTSummary(
  purchases: Purchase[]
): GSTSummary {
  const summary = createEmptyGSTSummary();

  purchases
    .filter(isValidPurchase)
    .forEach((purchase) => {
      summary.taxableValue += safeNumber(
        purchase.totals?.taxableValue
      );

      summary.cgst += safeNumber(
        purchase.totals?.cgst
      );

      summary.sgst += safeNumber(
        purchase.totals?.sgst
      );

      summary.igst += safeNumber(
        purchase.totals?.igst
      );

      summary.cess += safeNumber(
        purchase.totals?.cess
      );

      summary.totalTax += safeNumber(
        purchase.totals?.totalTax
      );
    });

  return {
    taxableValue: roundMoney(
      summary.taxableValue
    ),
    cgst: roundMoney(summary.cgst),
    sgst: roundMoney(summary.sgst),
    igst: roundMoney(summary.igst),
    cess: roundMoney(summary.cess),
    totalTax: roundMoney(summary.totalTax),
  };
}

/* =====================================================
   SALES REPORT
===================================================== */

export function generateSalesReport(
  invoices: Invoice[],
  range?: ReportDateRange
): SalesReport {
  const filteredInvoices =
    filterReportInvoices(invoices, range);

  const gstSummary =
    calculateSalesGSTSummary(
      filteredInvoices
    );

  const totalSales = roundMoney(
    filteredInvoices.reduce(
      (total, invoice) =>
        total +
        safeNumber(
          invoice.totals?.grandTotal
        ),
      0
    )
  );

  return {
    fromDate:
      range?.fromDate
        ? String(range.fromDate)
        : "",

    toDate:
      range?.toDate
        ? String(range.toDate)
        : "",

    totalSales,

    totalTaxableValue:
      gstSummary.taxableValue,

    totalGST: gstSummary,

    invoiceCount:
      filteredInvoices.length,
  };
}

/* =====================================================
   PURCHASE REPORT
===================================================== */

export function generatePurchaseReport(
  purchases: Purchase[],
  range?: ReportDateRange
): PurchaseReport {
  const filteredPurchases =
    filterReportPurchases(
      purchases,
      range
    );

  const gstSummary =
    calculatePurchaseGSTSummary(
      filteredPurchases
    );

  const totalPurchases = roundMoney(
    filteredPurchases.reduce(
      (total, purchase) =>
        total +
        safeNumber(
          purchase.totals?.grandTotal
        ),
      0
    )
  );

  return {
    fromDate:
      range?.fromDate
        ? String(range.fromDate)
        : "",

    toDate:
      range?.toDate
        ? String(range.toDate)
        : "",

    totalPurchases,

    totalTaxableValue:
      gstSummary.taxableValue,

    totalInputTax: gstSummary,

    purchaseCount:
      filteredPurchases.length,
  };
}

/* =====================================================
   GST RATE-WISE REPORT
===================================================== */

export function generateGSTSlabReport(
  invoices: Invoice[]
): GSTSlabReport[] {
  const slabs = new Map<
    number,
    GSTSlabReport
  >();

  invoices
    .filter(isValidInvoice)
    .forEach((invoice) => {
      invoice.items.forEach((item) => {
        const rate = safeNumber(
          item.gstRate
        );

        if (!slabs.has(rate)) {
          slabs.set(rate, {
            gstRate: rate,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
            totalTax: 0,
            invoiceCount: 0,
          });
        }

        const slab = slabs.get(rate)!;

        slab.taxableValue += safeNumber(
          item.taxableValue
        );

        slab.cgst += safeNumber(item.cgst);
        slab.sgst += safeNumber(item.sgst);
        slab.igst += safeNumber(item.igst);
        slab.cess += safeNumber(item.cess);
        slab.totalTax += safeNumber(
          item.totalTax
        );

        slab.invoiceCount += 1;
      });
    });

  return Array.from(slabs.values())
    .map((slab) => ({
      ...slab,

      taxableValue: roundMoney(
        slab.taxableValue
      ),

      cgst: roundMoney(slab.cgst),
      sgst: roundMoney(slab.sgst),
      igst: roundMoney(slab.igst),
      cess: roundMoney(slab.cess),

      totalTax: roundMoney(
        slab.totalTax
      ),
    }))
    .sort(
      (a, b) =>
        a.gstRate - b.gstRate
    );
}

/* =====================================================
   TOP CUSTOMERS
===================================================== */

export function generateTopCustomersReport(
  invoices: Invoice[],
  limit = 10
): PartyReport[] {
  const customers = new Map<
    string,
    PartyReport
  >();

  invoices
    .filter(isValidInvoice)
    .forEach((invoice) => {
      const id =
        invoice.customerId ||
        invoice.customerSnapshot?.gstin ||
        invoice.customerSnapshot?.name ||
        "unknown";

      const name =
        invoice.customerSnapshot?.name ||
        "Unknown Customer";

      if (!customers.has(id)) {
        customers.set(id, {
          id,
          name,
          transactionCount: 0,
          taxableValue: 0,
          totalAmount: 0,
          pendingAmount: 0,
        });
      }

      const customer =
        customers.get(id)!;

      customer.transactionCount += 1;

      customer.taxableValue += safeNumber(
        invoice.totals?.taxableValue
      );

      customer.totalAmount += safeNumber(
        invoice.totals?.grandTotal
      );

      customer.pendingAmount += safeNumber(
        invoice.pendingAmount
      );
    });

  return Array.from(customers.values())
    .map((customer) => ({
      ...customer,

      taxableValue: roundMoney(
        customer.taxableValue
      ),

      totalAmount: roundMoney(
        customer.totalAmount
      ),

      pendingAmount: roundMoney(
        customer.pendingAmount
      ),
    }))
    .sort(
      (a, b) =>
        b.totalAmount - a.totalAmount
    )
    .slice(0, Math.max(1, limit));
}

/* =====================================================
   TOP SUPPLIERS
===================================================== */

export function generateTopSuppliersReport(
  purchases: Purchase[],
  limit = 10
): PartyReport[] {
  const suppliers = new Map<
    string,
    PartyReport
  >();

  purchases
    .filter(isValidPurchase)
    .forEach((purchase) => {
      const id =
        purchase.supplierId ||
        purchase.supplierSnapshot?.gstin ||
        purchase.supplierSnapshot?.name ||
        "unknown";

      const name =
        purchase.supplierSnapshot?.name ||
        "Unknown Supplier";

      if (!suppliers.has(id)) {
        suppliers.set(id, {
          id,
          name,
          transactionCount: 0,
          taxableValue: 0,
          totalAmount: 0,
          pendingAmount: 0,
        });
      }

      const supplier =
        suppliers.get(id)!;

      supplier.transactionCount += 1;

      supplier.taxableValue += safeNumber(
        purchase.totals?.taxableValue
      );

      supplier.totalAmount += safeNumber(
        purchase.totals?.grandTotal
      );

      supplier.pendingAmount += safeNumber(
        purchase.pendingAmount
      );
    });

  return Array.from(suppliers.values())
    .map((supplier) => ({
      ...supplier,

      taxableValue: roundMoney(
        supplier.taxableValue
      ),

      totalAmount: roundMoney(
        supplier.totalAmount
      ),

      pendingAmount: roundMoney(
        supplier.pendingAmount
      ),
    }))
    .sort(
      (a, b) =>
        b.totalAmount - a.totalAmount
    )
    .slice(0, Math.max(1, limit));
}

/* =====================================================
   DAILY BUSINESS REPORT
===================================================== */

export function generateDailyReport(
  invoices: Invoice[],
  purchases: Purchase[],
  range?: ReportDateRange
): DailyReportData[] {
  const data = new Map<
    string,
    DailyReportData
  >();

  filterReportInvoices(
    invoices,
    range
  ).forEach((invoice) => {
    const date = invoice.invoiceDate;

    if (!data.has(date)) {
      data.set(date, {
        date,
        sales: 0,
        purchases: 0,
        gstCollected: 0,
        inputTaxCredit: 0,
      });
    }

    const day = data.get(date)!;

    day.sales += safeNumber(
      invoice.totals?.grandTotal
    );

    day.gstCollected += safeNumber(
      invoice.totals?.totalTax
    );
  });

  filterReportPurchases(
    purchases,
    range
  ).forEach((purchase) => {
    const date = purchase.purchaseDate;

    if (!data.has(date)) {
      data.set(date, {
        date,
        sales: 0,
        purchases: 0,
        gstCollected: 0,
        inputTaxCredit: 0,
      });
    }

    const day = data.get(date)!;

    day.purchases += safeNumber(
      purchase.totals?.grandTotal
    );

    day.inputTaxCredit += safeNumber(
      purchase.totals?.totalTax
    );
  });

  return Array.from(data.values())
    .map((day) => ({
      ...day,

      sales: roundMoney(day.sales),

      purchases: roundMoney(
        day.purchases
      ),

      gstCollected: roundMoney(
        day.gstCollected
      ),

      inputTaxCredit: roundMoney(
        day.inputTaxCredit
      ),
    }))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
}

/* =====================================================
   NET GST REPORT
===================================================== */

export function calculateReportNetGST(
  invoices: Invoice[],
  purchases: Purchase[]
): {
  outputGST: number;
  inputTaxCredit: number;
  netPayable: number;
} {
  const salesGST =
    calculateSalesGSTSummary(invoices);

  const purchaseGST =
    calculatePurchaseGSTSummary(purchases);

  const outputGST =
    salesGST.totalTax;

  const inputTaxCredit =
    purchaseGST.totalTax;

  return {
    outputGST,

    inputTaxCredit,

    netPayable: roundMoney(
      outputGST - inputTaxCredit
    ),
  };
}
