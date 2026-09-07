// lib/invoice-pdf.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =====================================================
   TYPES
===================================================== */

export interface PDFInvoiceItem {
  id?: string;
  name: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  rate: number;
  gstRate?: number;
  discountPercent?: number;
  taxableAmount?: number;
  gstAmount?: number;
  total: number;
}

export interface PDFCustomer {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
}

export interface PDFInvoiceData {
  invoiceNumber: string;

  invoiceDate?: string;
  dueDate?: string;

  status?: string;

  customer?: PDFCustomer;

  placeOfSupply?: string;

  taxType?: "intra" | "inter";

  items: PDFInvoiceItem[];

  subtotal?: number;
  discount?: number;
  taxableAmount?: number;

  cgst?: number;
  sgst?: number;
  igst?: number;

  totalTax?: number;
  grandTotal: number;

  notes?: string;
  terms?: string;

  businessName?: string;
  businessAddress?: string;
  businessGSTIN?: string;
  businessPhone?: string;
  businessEmail?: string;
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

function formatCurrency(value: number): string {
  return `Rs. ${safeNumber(value).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatDate(value?: string): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncateText(
  text: string,
  maxLength = 45
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(
    0,
    maxLength
  )}...`;
}

/* =====================================================
   MAIN PDF FUNCTION
===================================================== */

export function generateInvoicePDF(
  data: PDFInvoiceData
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  const margin = 14;

  let currentY = 15;

  /* =============================================
     COLORS
  ============================================= */

  const primaryColor: [number, number, number] = [
    37,
    99,
    235,
  ];

  const darkColor: [number, number, number] = [
    30,
    41,
    59,
  ];

  const grayColor: [number, number, number] = [
    100,
    116,
    139,
  ];

  /* =============================================
     HEADER BACKGROUND
  ============================================= */

  pdf.setFillColor(
    ...primaryColor
  );

  pdf.rect(
    0,
    0,
    pageWidth,
    42,
    "F"
  );

  /* =============================================
     BUSINESS NAME
  ============================================= */

  pdf.setTextColor(
    255,
    255,
    255
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(18);

  pdf.text(
    data.businessName ||
      "SMART GST",
    margin,
    16
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(8);

  const businessDetails = [
    data.businessAddress,
    data.businessGSTIN
      ? `GSTIN: ${data.businessGSTIN}`
      : "",
    data.businessPhone,
  ]
    .filter(Boolean)
    .join(" | ");

  pdf.text(
    businessDetails || "Business Billing Solution",
    margin,
    23
  );

  /* =============================================
     TAX INVOICE TITLE
  ============================================= */

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(16);

  pdf.text(
    "TAX INVOICE",
    pageWidth - margin,
    16,
    {
      align: "right",
    }
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(9);

  pdf.text(
    data.invoiceNumber,
    pageWidth - margin,
    24,
    {
      align: "right",
    }
  );

  currentY = 52;

  /* =============================================
     BILL TO SECTION
  ============================================= */

  pdf.setDrawColor(
    226,
    232,
    240
  );

  pdf.setLineWidth(0.3);

  pdf.roundedRect(
    margin,
    currentY,
    pageWidth - margin * 2,
    42,
    2,
    2,
    "S"
  );

  /* LEFT TITLE */

  pdf.setTextColor(
    ...primaryColor
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(9);

  pdf.text(
    "BILL TO",
    margin + 5,
    currentY + 8
  );

  /* CUSTOMER */

  pdf.setTextColor(
    ...darkColor
  );

  pdf.setFontSize(11);

  pdf.text(
    data.customer?.name ||
      "Customer",
    margin + 5,
    currentY + 16
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setTextColor(
    ...grayColor
  );

  pdf.setFontSize(8);

  const customerLines = [
    data.customer?.phone,
    data.customer?.email,
    data.customer?.address,
    data.customer?.gstin
      ? `GSTIN: ${data.customer.gstin}`
      : "",
  ].filter(Boolean);

  let customerY =
    currentY + 22;

  customerLines.forEach((line) => {
    const wrapped = pdf.splitTextToSize(
      String(line),
      82
    );

    pdf.text(
      wrapped,
      margin + 5,
      customerY
    );

    customerY +=
      wrapped.length * 4;
  });

  /* RIGHT SIDE */

  const rightX =
    pageWidth / 2 + 10;

  pdf.setTextColor(
    ...primaryColor
  );

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(9);

  pdf.text(
    "INVOICE DETAILS",
    rightX,
    currentY + 8
  );

  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setTextColor(
    ...grayColor
  );

  pdf.setFontSize(8);

  const invoiceDetails = [
    [
      "Invoice Date",
      formatDate(data.invoiceDate),
    ],
    [
      "Due Date",
      formatDate(data.dueDate),
    ],
    [
      "Place of Supply",
      data.placeOfSupply || "-",
    ],
    [
      "Tax Type",
      data.taxType === "inter"
        ? "Inter-State"
        : "Intra-State",
    ],
  ];

  let detailY =
    currentY + 16;

  invoiceDetails.forEach(
    ([label, value]) => {
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setTextColor(
        ...grayColor
      );

      pdf.text(
        label,
        rightX,
        detailY
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setTextColor(
        ...darkColor
      );

      pdf.text(
        value,
        pageWidth - margin - 5,
        detailY,
        {
          align: "right",
        }
      );

      detailY += 7;
    }
  );

  currentY += 52;

  /* =============================================
     ITEMS TABLE
  ============================================= */

  const tableRows =
    data.items.map(
      (item, index) => [
        String(index + 1),

        [
          truncateText(
            item.name,
            38
          ),

          item.hsnSac
            ? `HSN: ${item.hsnSac}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),

        `${item.quantity} ${
          item.unit || "PCS"
        }`,

        formatCurrency(
          item.rate
        ),

        `${safeNumber(
          item.gstRate
        )}%`,

        formatCurrency(
          item.total
        ),
      ]
    );

  autoTable(pdf, {
    startY: currentY,

    head: [
      [
        "#",
        "Item Description",
        "Qty",
        "Rate",
        "GST",
        "Amount",
      ],
    ],

    body: tableRows,

    theme: "plain",

    margin: {
      left: margin,
      right: margin,
    },

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      textColor: darkColor,
      lineColor: [
        226,
        232,
        240,
      ],
      lineWidth: 0.2,
    },

    headStyles: {
      fillColor: primaryColor,
      textColor: [
        255,
        255,
        255,
      ],
      fontStyle: "bold",
      halign: "center",
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 10,
      },

      1: {
        cellWidth: 70,
      },

      2: {
        halign: "center",
        cellWidth: 22,
      },

      3: {
        halign: "right",
        cellWidth: 28,
      },

      4: {
        halign: "center",
        cellWidth: 18,
      },

      5: {
        halign: "right",
        cellWidth: 35,
      },
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },
  });

  // @ts-ignore
  currentY =
    pdf.lastAutoTable.finalY + 10;

  /* =============================================
     PAGE BREAK CHECK
  ============================================= */

  if (
    currentY >
    pageHeight - 80
  ) {
    pdf.addPage();

    currentY = 20;
  }

  /* =============================================
     NOTES SECTION
  ============================================= */

  const notesWidth = 100;

  if (data.notes) {
    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(8);

    pdf.setTextColor(
      ...grayColor
    );

    pdf.text(
      "NOTES",
      margin,
      currentY
    );

    currentY += 6;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    const notesLines =
      pdf.splitTextToSize(
        data.notes,
        notesWidth
      );

    pdf.text(
      notesLines,
      margin,
      currentY
    );

    currentY +=
      notesLines.length * 4 + 8;
  }

  /* =============================================
     TERMS
  ============================================= */

  if (data.terms) {
    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(8);

    pdf.setTextColor(
      ...grayColor
    );

    pdf.text(
      "TERMS & CONDITIONS",
      margin,
      currentY
    );

    currentY += 6;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    const termsLines =
      pdf.splitTextToSize(
        data.terms,
        notesWidth
      );

    pdf.text(
      termsLines,
      margin,
      currentY
    );
  }

  /* =============================================
     TOTALS BOX
  ============================================= */

  const totalsX =
    pageWidth - margin - 75;

  let totalsY =
    Math.max(
      currentY -
        (data.notes || data.terms
          ? 0
          : 0),
      // @ts-ignore
      pdf.lastAutoTable.finalY + 10
    );

  if (
    totalsY >
    pageHeight - 70
  ) {
    pdf.addPage();
    totalsY = 25;
  }

  pdf.setFillColor(
    248,
    250,
    252
  );

  pdf.roundedRect(
    totalsX,
    totalsY,
    75,
    52,
    2,
    2,
    "F"
  );

  const totalRows = [
    [
      "Subtotal",
      formatCurrency(
        safeNumber(data.subtotal)
      ),
    ],

    [
      "Discount",
      data.discount &&
      data.discount > 0
        ? `- ${formatCurrency(
            data.discount
          )}`
        : "-",
    ],

    [
      "Taxable Amount",
      formatCurrency(
        safeNumber(
          data.taxableAmount
        )
      ),
    ],
  ];

  if (data.taxType === "inter") {
    totalRows.push([
      "IGST",
      formatCurrency(
        safeNumber(data.igst)
      ),
    ]);
  } else {
    totalRows.push(
      [
        "CGST",
        formatCurrency(
          safeNumber(data.cgst)
        ),
      ],
      [
        "SGST",
        formatCurrency(
          safeNumber(data.sgst)
        ),
      ]
    );
  }

  let rowY =
    totalsY + 8;

  totalRows.forEach(
    ([label, value]) => {
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setTextColor(
        ...grayColor
      );

      pdf.setFontSize(8);

      pdf.text(
        label,
        totalsX + 5,
        rowY
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setTextColor(
        ...darkColor
      );

      pdf.text(
        value,
        totalsX + 70,
        rowY,
        {
          align: "right",
        }
      );

      rowY += 7;
    }
  );

  /* GRAND TOTAL */

  pdf.setDrawColor(
    203,
    213,
    225
  );

  pdf.line(
    totalsX + 5,
    rowY - 2,
    totalsX + 70,
    rowY - 2
  );

  rowY += 5;

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(10);

  pdf.setTextColor(
    ...primaryColor
  );

  pdf.text(
    "GRAND TOTAL",
    totalsX + 5,
    rowY
  );

  pdf.setFontSize(11);

  pdf.text(
    formatCurrency(
      data.grandTotal
    ),
    totalsX + 70,
    rowY,
    {
      align: "right",
    }
  );

  /* =============================================
     FOOTER
  ============================================= */

  const totalPages =
    pdf.getNumberOfPages();

  for (
    let page = 1;
    page <= totalPages;
    page++
  ) {
    pdf.setPage(page);

    pdf.setDrawColor(
      226,
      232,
      240
    );

    pdf.line(
      margin,
      pageHeight - 15,
      pageWidth - margin,
      pageHeight - 15
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(7);

    pdf.setTextColor(
      ...grayColor
    );

    pdf.text(
      "This is a computer generated invoice.",
      margin,
      pageHeight - 9
    );

    pdf.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 9,
      {
        align: "right",
      }
    );
  }

  /* =============================================
     DOWNLOAD
  ============================================= */

  const safeInvoiceNumber =
    data.invoiceNumber
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      )
      .trim();

  pdf.save(
    `${safeInvoiceNumber}.pdf`
  );
}

/* =====================================================
   PREPARE DATA HELPER
===================================================== */

export function calculateInvoiceTotals(
  items: PDFInvoiceItem[],
  taxType: "intra" | "inter" = "intra"
) {
  let subtotal = 0;

  let taxableAmount = 0;

  let totalTax = 0;

  let cgst = 0;

  let sgst = 0;

  let igst = 0;

  items.forEach((item) => {
    const quantity =
      safeNumber(item.quantity);

    const rate =
      safeNumber(item.rate);

    const discount =
      safeNumber(
        item.discountPercent
      );

    const gstRate =
      safeNumber(item.gstRate);

    const itemSubtotal =
      quantity * rate;

    const discountAmount =
      itemSubtotal *
      (discount / 100);

    const taxable =
      itemSubtotal -
      discountAmount;

    const gstAmount =
      taxable *
      (gstRate / 100);

    subtotal += itemSubtotal;

    taxableAmount += taxable;

    totalTax += gstAmount;

    if (taxType === "inter") {
      igst += gstAmount;
    } else {
      cgst += gstAmount / 2;
      sgst += gstAmount / 2;
    }
  });

  return {
    subtotal,
    taxableAmount,
    totalTax,
    cgst,
    sgst,
    igst,
    grandTotal:
      taxableAmount + totalTax,
  };
}
