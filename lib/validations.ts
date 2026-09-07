// lib/validations.ts

import type { InvoiceItem } from "./calculations";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldErrors {
  [key: string]: string;
}

/**
 * Indian GSTIN format validation.
 * Example: 03ABCDE1234F1Z5
 */
export function validateGSTIN(gstin: string): ValidationResult {
  const value = gstin.trim().toUpperCase();

  if (!value) {
    return {
      isValid: false,
      error: "GSTIN is required",
    };
  }

  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

  if (!gstinRegex.test(value)) {
    return {
      isValid: false,
      error: "Please enter a valid GSTIN",
    };
  }

  return { isValid: true };
}

/**
 * PAN validation.
 * Example: ABCDE1234F
 */
export function validatePAN(pan: string): ValidationResult {
  const value = pan.trim().toUpperCase();

  if (!value) {
    return {
      isValid: false,
      error: "PAN is required",
    };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!panRegex.test(value)) {
    return {
      isValid: false,
      error: "Please enter a valid PAN number",
    };
  }

  return { isValid: true };
}

/**
 * Extract PAN from GSTIN.
 */
export function getPANFromGSTIN(gstin: string): string {
  const value = gstin.trim().toUpperCase();

  if (value.length !== 15) {
    return "";
  }

  return value.substring(2, 12);
}

/**
 * Checks whether PAN matches GSTIN.
 */
export function isPANMatchingGSTIN(
  pan: string,
  gstin: string
): boolean {
  const normalizedPAN = pan.trim().toUpperCase();
  const gstinPAN = getPANFromGSTIN(gstin);

  return Boolean(
    normalizedPAN &&
      gstinPAN &&
      normalizedPAN === gstinPAN
  );
}

/**
 * Indian mobile number validation.
 */
export function validateMobileNumber(
  mobile: string
): ValidationResult {
  const cleaned = mobile.replace(/\D/g, "");

  let number = cleaned;

  if (number.startsWith("91") && number.length === 12) {
    number = number.slice(2);
  }

  if (!/^[6-9]\d{9}$/.test(number)) {
    return {
      isValid: false,
      error: "Please enter a valid 10-digit mobile number",
    };
  }

  return { isValid: true };
}

/**
 * Email validation.
 */
export function validateEmail(email: string): ValidationResult {
  const value = email.trim();

  if (!value) {
    return {
      isValid: false,
      error: "Email is required",
    };
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  return { isValid: true };
}

/**
 * Indian PIN code validation.
 */
export function validatePincode(
  pincode: string
): ValidationResult {
  const value = pincode.trim();

  if (!/^[1-9][0-9]{5}$/.test(value)) {
    return {
      isValid: false,
      error: "Please enter a valid 6-digit PIN code",
    };
  }

  return { isValid: true };
}

/**
 * HSN code validation.
 * Usually 4, 6 or 8 digits.
 */
export function validateHSN(
  hsn: string
): ValidationResult {
  const value = hsn.trim();

  if (!value) {
    return {
      isValid: false,
      error: "HSN code is required",
    };
  }

  if (!/^\d{4}(\d{2})?(\d{2})?$/.test(value)) {
    return {
      isValid: false,
      error:
        "HSN code must contain 4, 6, or 8 digits",
    };
  }

  return { isValid: true };
}

/**
 * SAC code validation.
 */
export function validateSAC(
  sac: string
): ValidationResult {
  const value = sac.trim();

  if (!value) {
    return {
      isValid: false,
      error: "SAC code is required",
    };
  }

  if (!/^\d{6}$/.test(value)) {
    return {
      isValid: false,
      error: "SAC code must contain 6 digits",
    };
  }

  return { isValid: true };
}

/**
 * Generic required text validation.
 */
export function validateRequired(
  value: unknown,
  fieldName = "This field"
): ValidationResult {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
}

/**
 * Positive number validation.
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName = "Value",
  allowZero = false
): ValidationResult {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (allowZero ? number < 0 : number <= 0) {
    return {
      isValid: false,
      error: allowZero
        ? `${fieldName} cannot be negative`
        : `${fieldName} must be greater than zero`,
    };
  }

  return { isValid: true };
}

/**
 * GST percentage validation.
 */
export function validateGSTRate(
  rate: unknown
): ValidationResult {
  const value = Number(rate);

  if (!Number.isFinite(value)) {
    return {
      isValid: false,
      error: "GST rate must be a valid number",
    };
  }

  if (value < 0 || value > 100) {
    return {
      isValid: false,
      error: "GST rate must be between 0 and 100",
    };
  }

  return { isValid: true };
}

/**
 * Invoice item validation.
 */
export function validateInvoiceItem(
  item: Partial<InvoiceItem>,
  index = 0
): FieldErrors {
  const errors: FieldErrors = {};
  const prefix = `items.${index}`;

  if (!item.productName?.trim()) {
    errors[`${prefix}.productName`] =
      "Product or service name is required";
  }

  const quantityValidation =
    validatePositiveNumber(
      item.quantity,
      "Quantity"
    );

  if (!quantityValidation.isValid) {
    errors[`${prefix}.quantity`] =
      quantityValidation.error!;
  }

  const rateValidation =
    validatePositiveNumber(
      item.rate,
      "Rate",
      true
    );

  if (!rateValidation.isValid) {
    errors[`${prefix}.rate`] =
      rateValidation.error!;
  }

  const gstValidation =
    validateGSTRate(item.gstRate);

  if (!gstValidation.isValid) {
    errors[`${prefix}.gstRate`] =
      gstValidation.error!;
  }

  if (
    item.discountPercentage !== undefined &&
    (Number(item.discountPercentage) < 0 ||
      Number(item.discountPercentage) > 100)
  ) {
    errors[`${prefix}.discountPercentage`] =
      "Discount must be between 0 and 100";
  }

  return errors;
}

/**
 * Validates all invoice items.
 */
export function validateInvoiceItems(
  items: Partial<InvoiceItem>[]
): FieldErrors {
  const errors: FieldErrors = {};

  if (!items || items.length === 0) {
    errors.items =
      "At least one product or service is required";

    return errors;
  }

  items.forEach((item, index) => {
    Object.assign(
      errors,
      validateInvoiceItem(item, index)
    );
  });

  return errors;
}

/**
 * Basic customer/supplier validation.
 */
export interface PartyValidationInput {
  name?: string;
  gstin?: string;
  mobile?: string;
  email?: string;
  address?: string;
  state?: string;
  pincode?: string;
}

export function validateParty(
  party: PartyValidationInput,
  options?: {
    requireGSTIN?: boolean;
    requireAddress?: boolean;
  }
): FieldErrors {
  const errors: FieldErrors = {};

  if (!party.name?.trim()) {
    errors.name = "Party name is required";
  }

  if (
    options?.requireGSTIN &&
    !party.gstin?.trim()
  ) {
    errors.gstin = "GSTIN is required";
  }

  if (party.gstin?.trim()) {
    const gstinValidation =
      validateGSTIN(party.gstin);

    if (!gstinValidation.isValid) {
      errors.gstin = gstinValidation.error!;
    }
  }

  if (party.mobile?.trim()) {
    const mobileValidation =
      validateMobileNumber(party.mobile);

    if (!mobileValidation.isValid) {
      errors.mobile = mobileValidation.error!;
    }
  }

  if (party.email?.trim()) {
    const emailValidation =
      validateEmail(party.email);

    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
  }

  if (
    options?.requireAddress &&
    !party.address?.trim()
  ) {
    errors.address = "Address is required";
  }

  if (
    options?.requireAddress &&
    !party.state?.trim()
  ) {
    errors.state = "State is required";
  }

  if (party.pincode?.trim()) {
    const pincodeValidation =
      validatePincode(party.pincode);

    if (!pincodeValidation.isValid) {
      errors.pincode = pincodeValidation.error!;
    }
  }

  return errors;
}

/**
 * Returns true if validation errors object is empty.
 */
export function hasValidationErrors(
  errors: FieldErrors
): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Returns first validation error.
 */
export function getFirstValidationError(
  errors: FieldErrors
): string | null {
  const firstKey = Object.keys(errors)[0];

  return firstKey
    ? errors[firstKey]
    : null;
    }
