/* =========================================================
   SMART GST
   CENTRAL GST CALCULATION ENGINE

   IMPORTANT:
   - This file contains calculation logic only.
   - No UI.
   - No React.
   - No browser APIs.
   - Document modules can reuse these functions.
========================================================= */

export type GSTSupplyType =
  | "INTRA_STATE"
  | "INTER_STATE";

export type GSTCalculationInput = {
  quantity: number;
  rate: number;
  discount?: number;
  gstRate: number;
};

export type GSTLineCalculation = {
  quantity: number;
  rate: number;
  grossValue: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalValue: number;
};

export type GSTDocumentCalculation = {
  grossValue: number;
  totalDiscount: number;
  taxableValue: number;

  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;

  totalGST: number;
  grandTotal: number;

  lineItems: GSTLineCalculation[];
};

/* =========================================================
   NUMBER SAFETY
========================================================= */

function safeNumber(value: unknown): number {
  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

/* =========================================================
   ROUNDING
========================================================= */

export function roundMoney(value: number): number {
  const safeValue = safeNumber(value);

  return Math.round(
    (safeValue + Number.EPSILON) * 100
  ) / 100;
}

/* =========================================================
   POSITIVE NUMBER
========================================================= */

function nonNegative(value: unknown): number {
  return Math.max(
    0,
    safeNumber(value)
  );
}

/* =========================================================
   GST RATE VALIDATION
========================================================= */

export function normalizeGSTRate(
  gstRate: unknown
): number {
  return Math.max(
    0,
    safeNumber(gstRate)
  );
}

/* =========================================================
   SINGLE LINE CALCULATION
========================================================= */

export function calculateGSTLine(
  input: GSTCalculationInput,
  supplyType: GSTSupplyType
): GSTLineCalculation {
  const quantity = nonNegative(
    input.quantity
  );

  const rate = nonNegative(
    input.rate
  );

  const gstRate = normalizeGSTRate(
    input.gstRate
  );

  const grossValue = roundMoney(
    quantity * rate
  );

  const requestedDiscount = nonNegative(
    input.discount ?? 0
  );

  const discount = roundMoney(
    Math.min(
      requestedDiscount,
      grossValue
    )
  );

  const taxableValue = roundMoney(
    Math.max(
      0,
      grossValue - discount
    )
  );

  const gstAmount = roundMoney(
    taxableValue *
      (gstRate / 100)
  );

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (
    supplyType ===
    "INTRA_STATE"
  ) {
    cgstAmount = roundMoney(
      gstAmount / 2
    );

    sgstAmount = roundMoney(
      gstAmount - cgstAmount
    );
  } else {
    igstAmount = gstAmount;
  }

  const totalValue = roundMoney(
    taxableValue +
      cgstAmount +
      sgstAmount +
      igstAmount
  );

  return {
    quantity,
    rate,
    grossValue,
    discount,
    taxableValue,
    gstRate,
    gstAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalValue,
  };
}

/* =========================================================
   MULTIPLE LINE CALCULATION
========================================================= */

export function calculateGSTDocument(
  items: GSTCalculationInput[],
  supplyType: GSTSupplyType
): GSTDocumentCalculation {
  let grossValue = 0;
  let totalDiscount = 0;
  let taxableValue = 0;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  const lineItems: GSTLineCalculation[] =
    items.map((item) => {
      const calculatedLine =
        calculateGSTLine(
          item,
          supplyType
        );

      grossValue +=
        calculatedLine.grossValue;

      totalDiscount +=
        calculatedLine.discount;

      taxableValue +=
        calculatedLine.taxableValue;

      cgstAmount +=
        calculatedLine.cgstAmount;

      sgstAmount +=
        calculatedLine.sgstAmount;

      igstAmount +=
        calculatedLine.igstAmount;

      return calculatedLine;
    });

  grossValue = roundMoney(
    grossValue
  );

  totalDiscount = roundMoney(
    totalDiscount
  );

  taxableValue = roundMoney(
    taxableValue
  );

  cgstAmount = roundMoney(
    cgstAmount
  );

  sgstAmount = roundMoney(
    sgstAmount
  );

  igstAmount = roundMoney(
    igstAmount
  );

  const totalGST = roundMoney(
    cgstAmount +
      sgstAmount +
      igstAmount
  );

  const grandTotal = roundMoney(
    taxableValue +
      totalGST
  );

  return {
    grossValue,
    totalDiscount,
    taxableValue,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGST,
    grandTotal,
    lineItems,
  };
}

/* =========================================================
   SUPPLY TYPE
========================================================= */

export function getSupplyType(
  sellerStateCode: string,
  buyerStateCode: string
): GSTSupplyType | null {
  const sellerCode =
    sellerStateCode.trim();

  const buyerCode =
    buyerStateCode.trim();

  if (
    !sellerCode ||
    !buyerCode
  ) {
    return null;
  }

  return sellerCode === buyerCode
    ? "INTRA_STATE"
    : "INTER_STATE";
}

/* =========================================================
   GSTIN BASIC FORMAT CHECK
========================================================= */

export function isValidGSTINFormat(
  gstin: string
): boolean {
  const value =
    gstin.trim().toUpperCase();

  if (!value) {
    return false;
  }

  return /^[0-9A-Z]{15}$/.test(
    value
  );
}

/* =========================================================
   TOTAL CONSISTENCY CHECK
========================================================= */

export function isCalculationBalanced(
  calculation: GSTDocumentCalculation
): boolean {
  const calculatedTotal =
    roundMoney(
      calculation.taxableValue +
        calculation.totalGST
    );

  return (
    calculatedTotal ===
    roundMoney(
      calculation.grandTotal
    )
  );
  }
