// lib/id-utils.ts

/* =====================================================
   UNIQUE ID GENERATION
===================================================== */

/**
 * Generate a cryptographically safe UUID when available.
 * Falls back to a timestamp + random string.
 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 12)}`;
}

/**
 * Generate a prefixed ID.
 *
 * Example:
 * generatePrefixedId("inv")
 * => inv_550e8400-e29b-41d4...
 */
export function generatePrefixedId(
  prefix: string
): string {
  const safePrefix =
    prefix
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "id";

  return `${safePrefix}_${generateId()}`;
}

/* =====================================================
   SHORT ID
===================================================== */

/**
 * Generate short readable ID.
 *
 * Example:
 * INV-K7M2X9
 */
export function generateShortId(
  prefix = "ID",
  length = 6
): string {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let result = "";

  for (let index = 0; index < length; index++) {
    const randomIndex = Math.floor(
      Math.random() * characters.length
    );

    result += characters[randomIndex];
  }

  return `${prefix.toUpperCase()}-${result}`;
}

/* =====================================================
   TIMESTAMPS
===================================================== */

/**
 * Current ISO timestamp.
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Create standard entity timestamps.
 */
export function createTimestamps(): {
  createdAt: string;
  updatedAt: string;
} {
  const now = getCurrentTimestamp();

  return {
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update only updatedAt timestamp.
 */
export function getUpdatedTimestamp(): {
  updatedAt: string;
} {
  return {
    updatedAt: getCurrentTimestamp(),
  };
}

/* =====================================================
   ENTITY FACTORY
===================================================== */

export interface NewEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create standard base entity.
 *
 * Example:
 * const customerBase = createEntity();
 *
 * Returns:
 * {
 *   id: "...",
 *   createdAt: "...",
 *   updatedAt: "..."
 * }
 */
export function createEntity(): NewEntity {
  return {
    id: generateId(),
    ...createTimestamps(),
  };
}

/**
 * Create entity with prefix.
 *
 * Example:
 * createPrefixedEntity("customer")
 */
export function createPrefixedEntity(
  prefix: string
): NewEntity {
  return {
    id: generatePrefixedId(prefix),
    ...createTimestamps(),
  };
}

/* =====================================================
   DUPLICATE CHECK HELPERS
===================================================== */

/**
 * Check whether ID already exists.
 */
export function idExists<
  T extends { id: string }
>(
  items: T[],
  id: string
): boolean {
  return items.some(
    (item) => item.id === id
  );
}

/**
 * Generate unique ID against existing items.
 */
export function generateUniqueId<
  T extends { id: string }
>(
  items: T[],
  prefix?: string
): string {
  let id = prefix
    ? generatePrefixedId(prefix)
    : generateId();

  while (idExists(items, id)) {
    id = prefix
      ? generatePrefixedId(prefix)
      : generateId();
  }

  return id;
}

/* =====================================================
   ENTITY TYPE PREFIXES
===================================================== */

export const ENTITY_PREFIXES = {
  BUSINESS: "biz",
  CUSTOMER: "cus",
  SUPPLIER: "sup",
  PRODUCT: "prd",
  INVOICE: "inv",
  PURCHASE: "pur",
  PAYMENT: "pay",
  SUPPORT: "supreq",
  CREDIT_NOTE: "cn",
  DEBIT_NOTE: "dn",
  DELIVERY_CHALLAN: "dc",
} as const;

/* =====================================================
   TYPE-SPECIFIC ID HELPERS
===================================================== */

export function createCustomerId(): string {
  return generatePrefixedId(
    ENTITY_PREFIXES.CUSTOMER
  );
}

export function createSupplierId(): string {
  return generatePrefixedId(
    ENTITY_PREFIXES.SUPPLIER
  );
}

export function createProductId(): string {
  return generatePrefixedId(
    ENTITY_PREFIXES.PRODUCT
  );
}

export function createInvoiceId(): string {
  return generatePrefixedId(
    ENTITY_PREFIXES.INVOICE
  );
}

export function createPurchaseId(): string {
  return generatePrefixedId(
    ENTITY_PREFIXES.PURCHASE
  );
}

export function createPaymentId(): string {
  return generatePrefixedId(
    ENTITY_PREFIXES.PAYMENT
  );
}

export function createSupportRequestId(): string {
  return generatePrefixedId(
    ENTITY_PREFIXES.SUPPORT
  );
}

/* =====================================================
   REQUEST / OPERATION ID
===================================================== */

/**
 * Generate operation ID useful for debugging
 * and tracking important actions.
 */
export function generateOperationId(
  operation = "op"
): string {
  const timestamp = Date.now().toString(36);

  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `${operation.toUpperCase()}-${timestamp}-${random}`;
}

/* =====================================================
   SAFE ENTITY CREATION
===================================================== */

/**
 * Attach base entity fields to new data.
 */
export function withEntityMetadata<
  T extends object
>(
  data: T,
  prefix?: string
): T & NewEntity {
  const entity = prefix
    ? createPrefixedEntity(prefix)
    : createEntity();

  return {
    ...data,
    ...entity,
  };
}

/**
 * Update an existing entity while preserving
 * id and createdAt.
 */
export function withUpdatedMetadata<
  T extends {
    id: string;
    createdAt: string;
  }
>(
  entity: T,
  updates: Partial<Omit<T, "id" | "createdAt">>
): T {
  return {
    ...entity,
    ...updates,
    updatedAt: getCurrentTimestamp(),
  };
}
