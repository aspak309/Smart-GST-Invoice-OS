/* =========================================================
   SMART GST
   GST COMMON UTILITIES

   IMPORTANT:
   - Common helper functions only
   - No React
   - No UI
   - Reusable across all GST document modules
========================================================= */

/* =========================================================
   INDIAN GST STATES
========================================================= */

export type GSTState = {
  name: string;
  code: string;
};

export const GST_STATES: GSTState[] = [
  {
    name: "Jammu and Kashmir",
    code: "01",
  },
  {
    name: "Himachal Pradesh",
    code: "02",
  },
  {
    name: "Punjab",
    code: "03",
  },
  {
    name: "Chandigarh",
    code: "04",
  },
  {
    name: "Uttarakhand",
    code: "05",
  },
  {
    name: "Haryana",
    code: "06",
  },
  {
    name: "Delhi",
    code: "07",
  },
  {
    name: "Rajasthan",
    code: "08",
  },
  {
    name: "Uttar Pradesh",
    code: "09",
  },
  {
    name: "Bihar",
    code: "10",
  },
  {
    name: "Sikkim",
    code: "11",
  },
  {
    name: "Arunachal Pradesh",
    code: "12",
  },
  {
    name: "Nagaland",
    code: "13",
  },
  {
    name: "Manipur",
    code: "14",
  },
  {
    name: "Mizoram",
    code: "15",
  },
  {
    name: "Tripura",
    code: "16",
  },
  {
    name: "Meghalaya",
    code: "17",
  },
  {
    name: "Assam",
    code: "18",
  },
  {
    name: "West Bengal",
    code: "19",
  },
  {
    name: "Jharkhand",
    code: "20",
  },
  {
    name: "Odisha",
    code: "21",
  },
  {
    name: "Chhattisgarh",
    code: "22",
  },
  {
    name: "Madhya Pradesh",
    code: "23",
  },
  {
    name: "Gujarat",
    code: "24",
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    code: "26",
  },
  {
    name: "Maharashtra",
    code: "27",
  },
  {
    name: "Karnataka",
    code: "29",
  },
  {
    name: "Goa",
    code: "30",
  },
  {
    name: "Lakshadweep",
    code: "31",
  },
  {
    name: "Kerala",
    code: "32",
  },
  {
    name: "Tamil Nadu",
    code: "33",
  },
  {
    name: "Puducherry",
    code: "34",
  },
  {
    name: "Andaman and Nicobar Islands",
    code: "35",
  },
  {
    name: "Telangana",
    code: "36",
  },
  {
    name: "Andhra Pradesh",
    code: "37",
  },
  {
    name: "Ladakh",
    code: "38",
  },
  {
    name: "Other Territory",
    code: "97",
  },
];

/* =========================================================
   GSTIN NORMALIZATION
========================================================= */

export function normalizeGSTIN(
  gstin: string
): string {
  return gstin
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/* =========================================================
   BASIC GSTIN FORMAT VALIDATION
========================================================= */

export function isValidGSTIN(
  gstin: string
): boolean {
  const value =
    normalizeGSTIN(gstin);

  const pattern =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  return pattern.test(value);
}

/* =========================================================
   EXTRACT STATE CODE FROM GSTIN
========================================================= */

export function getStateCodeFromGSTIN(
  gstin: string
): string | null {
  const value =
    normalizeGSTIN(gstin);

  if (value.length < 2) {
    return null;
  }

  const stateCode =
    value.slice(0, 2);

  const stateExists =
    GST_STATES.some(
      (state) =>
        state.code === stateCode
    );

  return stateExists
    ? stateCode
    : null;
}

/* =========================================================
   GET STATE FROM CODE
========================================================= */

export function getStateByCode(
  code: string
): GSTState | null {
  const normalizedCode =
    code.trim();

  return (
    GST_STATES.find(
      (state) =>
        state.code === normalizedCode
    ) || null
  );
}

/* =========================================================
   GET STATE FROM NAME
========================================================= */

export function getStateByName(
  name: string
): GSTState | null {
  const normalizedName =
    name.trim().toLowerCase();

  return (
    GST_STATES.find(
      (state) =>
        state.name
          .toLowerCase() ===
        normalizedName
    ) || null
  );
}

/* =========================================================
   FORMAT INDIAN CURRENCY
========================================================= */

export function formatINR(
  value: number
): string {
  const amount =
    Number.isFinite(value)
      ? value
      : 0;

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

/* =========================================================
   FORMAT NUMBER
========================================================= */

export function formatIndianNumber(
  value: number,
  maximumFractionDigits = 2
): string {
  const number =
    Number.isFinite(value)
      ? value
      : 0;

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits,
    }
  ).format(number);
}

/* =========================================================
   SAFE NUMBER
========================================================= */

export function toSafeNumber(
  value: unknown,
  fallback = 0
): number {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

/* =========================================================
   ROUND MONEY
========================================================= */

export function roundToTwo(
  value: number
): number {
  const number =
    toSafeNumber(value);

  return (
    Math.round(
      (number + Number.EPSILON) *
        100
    ) / 100
  );
}

/* =========================================================
   GENERATE INVOICE NUMBER
========================================================= */

export function generateInvoiceNumber(
  prefix = "INV"
): string {
  const now = new Date();

  const year =
    now.getFullYear()
      .toString()
      .slice(-2);

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const random =
    Math.floor(
      1000 +
        Math.random() * 9000
    );

  return `${prefix}-${year}${month}${day}-${random}`;
}

/* =========================================================
   FORMAT DATE FOR INVOICE
========================================================= */

export function formatInvoiceDate(
  value: string | Date
): string {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* =========================================================
   AMOUNT TO WORDS
========================================================= */

const ONES = [
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

const TEENS = [
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

const TENS = [
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

function twoDigitWords(
  number: number
): string {
  if (number === 0) {
    return "";
  }

  if (number < 10) {
    return ONES[number];
  }

  if (number < 20) {
    return TEENS[number - 10];
  }

  const tens =
    TENS[
      Math.floor(number / 10)
    ];

  const ones =
    ONES[number % 10];

  return [tens, ones]
    .filter(Boolean)
    .join(" ");
}

function threeDigitWords(
  number: number
): string {
  if (number === 0) {
    return "";
  }

  const parts: string[] = [];

  const hundreds =
    Math.floor(number / 100);

  const remainder =
    number % 100;

  if (hundreds > 0) {
    parts.push(
      `${ONES[hundreds]} Hundred`
    );
  }

  if (remainder > 0) {
    parts.push(
      twoDigitWords(remainder)
    );
  }

  return parts.join(" ");
}

/* =========================================================
   INDIAN RUPEE AMOUNT IN WORDS
========================================================= */

export function amountToWords(
  value: number
): string {
  const amount =
    Math.max(
      0,
      roundToTwo(value)
    );

  const rupees =
    Math.floor(amount);

  const paise =
    Math.round(
      (amount - rupees) * 100
    );

  if (rupees === 0) {
    if (paise === 0) {
      return "Zero Rupees Only";
    }

    return `Zero Rupees and ${twoDigitWords(
      paise
    )} Paise Only`;
  }

  const parts: string[] = [];

  const crore =
    Math.floor(
      rupees / 10000000
    );

  const lakh =
    Math.floor(
      (rupees % 10000000) /
        100000
    );

  const thousand =
    Math.floor(
      (rupees % 100000) /
        1000
    );

  const remainder =
    rupees % 1000;

  if (crore > 0) {
    parts.push(
      `${twoDigitWords(
        crore
      )} Crore`
    );
  }

  if (lakh > 0) {
    parts.push(
      `${twoDigitWords(
        lakh
      )} Lakh`
    );
  }

  if (thousand > 0) {
    parts.push(
      `${twoDigitWords(
        thousand
      )} Thousand`
    );
  }

  if (remainder > 0) {
    parts.push(
      threeDigitWords(remainder)
    );
  }

  const rupeeWords =
    parts.join(" ");

  if (paise > 0) {
    return `${rupeeWords} Rupees and ${twoDigitWords(
      paise
    )} Paise Only`;
  }

  return `${rupeeWords} Rupees Only`;
}

/* =========================================================
   PLACE OF SUPPLY HELPER
========================================================= */

export function getPlaceOfSupply(
  stateName: string,
  stateCode: string
): string {
  const name =
    stateName.trim();

  const code =
    stateCode.trim();

  if (!name && !code) {
    return "";
  }

  if (name && code) {
    return `${name} (${code})`;
  }

  if (name) {
    return name;
  }

  const state =
    getStateByCode(code);

  return state
    ? `${state.name} (${state.code})`
    : code;
}

/* =========================================================
   DOCUMENT STORAGE KEY
========================================================= */

export function createStorageKey(
  documentType: string,
  documentNumber: string
): string {
  const type =
    documentType
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  const number =
    documentNumber
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  return `smart-gst-${type}-${number}`;
    }
