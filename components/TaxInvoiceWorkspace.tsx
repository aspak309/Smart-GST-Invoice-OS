"use client";

import { useMemo, useState } from "react";

type Party = {
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
};

type InvoiceItem = {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  gstRate: number;
};

const STATES = [
  { name: "Jammu and Kashmir", code: "01" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Punjab", code: "03" },
  { name: "Chandigarh", code: "04" },
  { name: "Uttarakhand", code: "05" },
  { name: "Haryana", code: "06" },
  { name: "Delhi", code: "07" },
  { name: "Rajasthan", code: "08" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Bihar", code: "10" },
  { name: "Sikkim", code: "11" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Nagaland", code: "13" },
  { name: "Manipur", code: "14" },
  { name: "Mizoram", code: "15" },
  { name: "Tripura", code: "16" },
  { name: "Meghalaya", code: "17" },
  { name: "Assam", code: "18" },
  { name: "West Bengal", code: "19" },
  { name: "Jharkhand", code: "20" },
  { name: "Odisha", code: "21" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Gujarat", code: "24" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
  { name: "Maharashtra", code: "27" },
  { name: "Andhra Pradesh", code: "37" },
  { name: "Karnataka", code: "29" },
  { name: "Goa", code: "30" },
  { name: "Lakshadweep", code: "31" },
  { name: "Kerala", code: "32" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Puducherry", code: "34" },
  { name: "Andaman and Nicobar Islands", code: "35" },
  { name: "Telangana", code: "36" },
];

const GST_RATES = [0, 5, 12, 18, 28];

const EMPTY_PARTY: Party = {
  name: "",
  gstin: "",
  address: "",
  city: "",
  state: "",
  stateCode: "",
  pincode: "",
  phone: "",
  email: "",
};

function createItem(): InvoiceItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    hsnSac: "",
    quantity: 1,
    unit: "PCS",
    rate: 0,
    discount: 0,
    gstRate: 18,
  };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function isValidGSTIN(gstin: string) {
  return /^[0-9A-Z]{15}$/.test(
    gstin.trim().toUpperCase()
  );
}

function calculateItem(item: InvoiceItem) {
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const rate = Math.max(0, Number(item.rate) || 0);

  const gross = quantity * rate;

  const discount = Math.min(
    Math.max(0, Number(item.discount) || 0),
    gross
  );

  const taxableValue = Math.max(
    0,
    gross - discount
  );

  const gstAmount =
    taxableValue *
    ((Number(item.gstRate) || 0) / 100);

  return {
    gross,
    discount,
    taxableValue,
    gstAmount,
    total: taxableValue + gstAmount,
  };
}

export default function TaxInvoiceWorkspace() {
  const [invoiceNumber, setInvoiceNumber] =
    useState("INV-000001");

  const [invoiceDate, setInvoiceDate] =
    useState(
      new Date().toISOString().slice(0, 10)
    );

  const [seller, setSeller] =
    useState<Party>({
      ...EMPTY_PARTY,
      state: "Punjab",
      stateCode: "03",
    });

  const [buyer, setBuyer] =
    useState<Party>({
      ...EMPTY_PARTY,
    });

  const [items, setItems] = useState<
    InvoiceItem[]
  >([createItem()]);

  const [reverseCharge, setReverseCharge] =
    useState(false);

  const [notes, setNotes] =
    useState("");

  const [terms, setTerms] = useState(
    "Goods once sold are subject to applicable business terms."
  );

  const [savedMessage, setSavedMessage] =
    useState("");

  const supplyType =
    seller.stateCode &&
    buyer.stateCode &&
    seller.stateCode !== buyer.stateCode
      ? "INTER_STATE"
      : "INTRA_STATE";

  const calculatedItems = useMemo(() => {
    return items.map((item) => ({
      item,
      calculation: calculateItem(item),
    }));
  }, [items]);

  const totals = useMemo(() => {
    let gross = 0;
    let discount = 0;
    let taxable = 0;
    let tax = 0;

    calculatedItems.forEach((row) => {
      gross += row.calculation.gross;
      discount += row.calculation.discount;
      taxable += row.calculation.taxableValue;
      tax += row.calculation.gstAmount;
    });

    const cgst =
      supplyType === "INTRA_STATE"
        ? tax / 2
        : 0;

    const sgst =
      supplyType === "INTRA_STATE"
        ? tax / 2
        : 0;

    const igst =
      supplyType === "INTER_STATE"
        ? tax
        : 0;

    return {
      gross,
      discount,
      taxable,
      tax,
      cgst,
      sgst,
      igst,
      grandTotal: taxable + tax,
    };
  }, [calculatedItems, supplyType]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!invoiceNumber.trim()) {
      errors.push("Invoice number is required.");
    }

    if (!invoiceDate) {
      errors.push("Invoice date is required.");
    }

    if (!seller.name.trim()) {
      errors.push("Seller business name is required.");
    }

    if (!seller.gstin.trim()) {
      errors.push("Seller GSTIN is required.");
    } else if (!isValidGSTIN(seller.gstin)) {
      errors.push("Seller GSTIN format is invalid.");
    }

    if (!seller.stateCode) {
      errors.push("Seller state is required.");
    }

    if (!buyer.name.trim()) {
      errors.push("Buyer name is required.");
    }

    if (
      buyer.gstin.trim() &&
      !isValidGSTIN(buyer.gstin)
    ) {
      errors.push("Buyer GSTIN format is invalid.");
    }

    if (!buyer.stateCode) {
      errors.push("Buyer state is required.");
    }

    items.forEach((item, index) => {
      if (!item.description.trim()) {
        errors.push(
          `Item ${index + 1}: description is required.`
        );
      }

      if (!item.hsnSac.trim()) {
        errors.push(
          `Item ${index + 1}: HSN/SAC is required.`
        );
      }

      if (item.quantity <= 0) {
        errors.push(
          `Item ${index + 1}: quantity must be greater than zero.`
        );
      }

      if (item.rate < 0) {
        errors.push(
          `Item ${index + 1}: rate cannot be negative.`
        );
      }

      if (item.discount < 0) {
        errors.push(
          `Item ${index + 1}: discount cannot be negative.`
        );
      }

      if (
        item.discount >
        item.quantity * item.rate
      ) {
        errors.push(
          `Item ${index + 1}: discount cannot exceed gross value.`
        );
      }
    });

    return errors;
  }, [
    invoiceNumber,
    invoiceDate,
    seller,
    buyer,
    items,
  ]);

  function updateSeller(
    field: keyof Party,
    value: string
  ) {
    setSeller((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateBuyer(
    field: keyof Party,
    value: string
  ) {
    setBuyer((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateItem(
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function selectPartyState(
    target: "seller" | "buyer",
    stateName: string
  ) {
    const selectedState = STATES.find(
      (state) => state.name === stateName
    );

    if (target === "seller") {
      setSeller((current) => ({
        ...current,
        state: stateName,
        stateCode:
          selectedState?.code || "",
      }));
    } else {
      setBuyer((current) => ({
        ...current,
        state: stateName,
        stateCode:
          selectedState?.code || "",
      }));
    }
  }

  function addItem() {
    setItems((current) => [
      ...current,
      createItem(),
    ]);
  }

  function removeItem(id: string) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (item) => item.id !== id
      );
    });
  }

  function saveDraft() {
    const draft = {
      documentType: "TAX_INVOICE",
      invoiceNumber,
      invoiceDate,
      seller,
      buyer,
      items,
      reverseCharge,
      notes,
      terms,
      supplyType,
      totals,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        `smart-gst-tax-invoice-${invoiceNumber}`,
        JSON.stringify(draft)
      );

      setSavedMessage(
        "Draft saved in this browser."
      );

      window.setTimeout(() => {
        setSavedMessage("");
      }, 3000);
    } catch {
      setSavedMessage(
        "Draft could not be saved."
      );
    }
  }

  function validateInvoice() {
    if (validationErrors.length === 0) {
      window.alert(
        "Invoice validation passed."
      );
      return;
    }

    window.alert(
      validationErrors
        .slice(0, 10)
        .map((error) => `• ${error}`)
        .join("\n")
    );
  }

  return (
    <div className="tax-workspace">
      <style jsx>{`
        .tax-workspace {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .workspace-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .kicker {
          color: var(--primary);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .workspace-header h2 {
          margin-top: 5px;
          font-size: 25px;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }

        .workspace-header p {
          margin-top: 5px;
          color: var(--text-secondary);
          font-size: 11px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .panel {
          padding: 20px;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .panel-heading {
          margin-bottom: 17px;
        }

        .panel-heading h3 {
          font-size: 14px;
          font-weight: 850;
        }

        .panel-heading p {
          margin-top: 4px;
          color: var(--text-secondary);
          font-size: 10px;
        }

        .document-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 18px;
        }

        .party-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .party-card {
          padding: 15px;
          border: 1px solid #e4eaf1;
          border-radius: 14px;
          background: #fbfcfe;
        }

        .party-heading {
          margin-bottom: 14px;
        }

        .party-heading h4 {
          font-size: 12px;
          font-weight: 900;
        }

        .party-heading p {
          margin-top: 3px;
          color: var(--text-muted);
          font-size: 9px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .form-grid.three {
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field-label {
          display: block;
          margin-bottom: 6px;
          color: #526276;
          font-size: 10px;
          font-weight: 800;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          padding: 10px 11px;
          border: 1px solid var(--border-strong);
          border-radius: 9px;
          background: #fcfdff;
          color: var(--text);
          font-size: 11px;
        }

        .field textarea {
          min-height: 90px;
          resize: vertical;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: var(--primary);
          background: white;
          box-shadow:
            0 0 0 3px
            rgba(23,109,245,.09);
        }

        .supply-box {
          min-height: 39px;
          padding: 0 11px;
          border: 1px solid #d1e3ff;
          border-radius: 9px;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .supply-box strong {
          color: #135ec5;
          font-size: 10px;
        }

        .supply-box span {
          color: #60728a;
          font-size: 9px;
          font-weight: 700;
        }

        .toggle-row {
          margin-top: 15px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        .toggle-label {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: var(--text);
          font-size: 10px;
          font-weight: 800;
        }

        .toggle-label input {
          margin-top: 1px;
        }

        .toggle-description {
          display: block;
          margin-top: 2px;
          color: var(--text-muted);
          font-size: 8px;
          font-weight: 500;
        }

        .items-scroll {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 12px;
        }

        .items-head,
        .item-row {
          min-width: 1120px;
          display: grid;
          grid-template-columns:
            28px
            1.6fr
            .75fr
            .55fr
            .55fr
            .72fr
            .72fr
            .57fr
            .9fr
            .9fr
            32px;
          gap: 7px;
          align-items: center;
          padding: 8px;
        }

        .items-head {
          background: #f7f9fc;
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .3px;
        }

        .item-row {
          border-bottom: 1px solid #edf1f5;
        }

        .item-row:last-child {
          border-bottom: 0;
        }

        .item-row input,
        .item-row select {
          width: 100%;
          min-width: 0;
          padding: 7px 8px;
          border: 1px solid #dce4ec;
          border-radius: 7px;
          background: white;
          color: var(--text);
          font-size: 9px;
          outline: none;
        }

        .item-row input:focus,
        .item-row select:focus {
          border-color: var(--primary);
        }

        .item-index {
          text-align: center;
          color: #7b8999;
          font-size: 9px;
          font-weight: 800;
        }

        .calculated {
          overflow: hidden;
          color: #53657a;
          white-space: nowrap;
          font-size: 9px;
          text-overflow: ellipsis;
        }

        .calculated.strong {
          color: #17263a;
          font-weight: 900;
        }

        .remove {
          width: 28px;
          height: 28px;
          border: 1px solid #e0e6ed;
          border-radius: 7px;
          background: white;
          color: var(--danger);
          font-size: 16px;
        }

        .remove:disabled {
          color: #b7c1cb;
        }

        .add-item {
          margin-top: 12px;
          padding: 9px 13px;
          border: 1px dashed #a9c8f4;
          border-radius: 9px;
          background: #f4f9ff;
          color: var(--primary);
          font-size: 10px;
          font-weight: 900;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(310px, .8fr);
          gap: 18px;
        }

        .total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 8px 0;
          color: var(--text-secondary);
          font-size: 10px;
        }

        .total-row strong {
          color: var(--text);
          font-weight: 800;
        }

        .divider {
          height: 1px;
          margin: 8px 0;
          background: var(--border);
        }

        .grand-total {
          margin-top: 8px;
          padding: 12px;
          border: 1px solid #d6e7ff;
          border-radius: 10px;
          background: var(--primary-light);
          color: #1558b1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 900;
        }

        .grand-total strong {
          font-size: 17px;
        }

        .validation {
          padding: 14px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          border: 1px solid #efd8a7;
          border-radius: 13px;
          background: var(--warning-light);
        }

        .validation-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--warning);
          color: white;
          font-size: 12px;
          font-weight: 900;
        }

        .validation h3 {
          font-size: 11px;
          font-weight: 900;
        }

        .validation p {
          margin-top: 3px;
          color: #7b6849;
          font-size: 9px;
        }

        .validation ul {
          margin: 6px 0 0;
          padding-left: 17px;
          color: #725d38;
          font-size: 9px;
          line-height: 1.7;
        }

        .preview-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .preview-heading h3 {
          margin-top: 5px;
          font-size: 15px;
          font-weight: 850;
        }

        .preview-status {
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 8px;
          font-weight: 900;
        }

        .preview-status.ready {
          color: var(--success);
          background: var(--success-light);
        }

        .preview-status.warning {
          color: var(--warning);
          background: var(--warning-light);
        }

        .invoice-preview {
          overflow: hidden;
          border: 1px solid #dbe4ed;
          border-radius: 10px;
          background: white;
        }

        .invoice-top {
          padding: 22px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #e4e9ef;
        }

        .invoice-label {
          color: #66768a;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .preview-business-name {
          margin-top: 7px;
          color: #17263a;
          font-size: 18px;
          font-weight: 900;
        }

        .muted-line {
          margin-top: 3px;
          color: #79889a;
          font-size: 8px;
        }

        .invoice-meta {
          min-width: 175px;
        }

        .invoice-meta-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 5px 0;
          border-bottom: 1px dotted #d9e1e9;
          font-size: 8px;
        }

        .invoice-meta-row:last-child {
          border-bottom: 0;
        }

        .invoice-meta-row span {
          color: #7c899a;
        }

        .invoice-meta-row strong {
          color: #19283b;
        }

        .preview-parties {
          display: grid;
          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(190px, .8fr);
          gap: 20px;
          padding: 17px 22px;
          border-bottom: 1px solid #e4e9ef;
        }

        .preview-label {
          margin-bottom: 5px;
          color: #7c8998;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .preview-party-name {
          color: #1b2b3f;
          font-size: 10px;
          font-weight: 900;
        }

        .preview-line {
          margin-top: 3px;
          color: #78889a;
          font-size: 8px;
        }

        .preview-items {
          overflow-x: auto;
        }

        .preview-items-head,
        .preview-items-row {
          min-width: 760px;
          display: grid;
          grid-template-columns:
            25px
            1.7fr
            .7fr
            .7fr
            .8fr
            .95fr
            .75fr
            .95fr;
          gap: 8px;
          align-items: center;
          padding: 9px 16px;
        }

        .preview-items-head {
          background: #f7f9fc;
          color: #7b8898;
          font-size: 7px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .preview-items-row {
          border-top: 1px solid #edf1f5;
          color: #506177;
          font-size: 8px;
        }

        .preview-items-row strong {
          color: #1c2b3d;
        }

        .preview-bottom {
          padding: 18px 22px;
          display: grid;
          grid-template-columns:
            minmax(0, 1.3fr)
            minmax(240px, .8fr);
          gap: 25px;
          border-top: 1px solid #e4e9ef;
        }

        .preview-small-heading {
          margin-bottom: 5px;
          color: #7b8998;
          font-size: 7px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .preview-small-text {
          margin-bottom: 12px;
          color: #68798c;
          font-size: 8px;
          line-height: 1.6;
        }

        .preview-total-box {
          width: 100%;
          max-width: 280px;
          justify-self: end;
        }

        .preview-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 5px 0;
          color: #69798e;
          font-size: 8px;
        }

        .preview-total-row strong {
          color: #27364a;
        }

        .preview-final-total {
          margin-top: 7px;
          padding: 10px;
          border-radius: 8px;
          background: var(--primary-light);
          color: #1558b1;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          font-weight: 900;
        }

        .preview-final-total strong {
          font-size: 13px;
        }

        .invoice-footer {
          padding: 10px 22px;
          border-top: 1px solid #e4e9ef;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          color: #9aa6b4;
          font-size: 7px;
        }

        .saved-message {
          padding: 9px 12px;
          border-radius: 9px;
          background: var(--success-light);
          color: var(--success);
          font-size: 9px;
          font-weight: 800;
        }

        @media (max-width: 1050px) {
          .document-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 800px) {
          .workspace-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }

          .party-grid,
          .document-grid,
          .form-grid.three {
            grid-template-columns: 1fr;
          }

          .preview-parties,
          .preview-bottom {
            grid-template-columns: 1fr;
          }

          .preview-total-box {
            justify-self: stretch;
            max-width: none;
          }
        }

        @media (max-width: 520px) {
          .panel {
            padding: 14px;
          }

          .workspace-header h2 {
            font-size: 21px;
          }

          .invoice-top {
            flex-direction: column;
          }

          .invoice-meta {
            min-width: 0;
          }

          .invoice-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="workspace-header">
        <div>
          <div className="kicker">
            SALES & INVOICES / TAX INVOICE
          </div>

          <h2>Create Tax Invoice</h2>

          <p>
            Create a structured GST tax invoice with live
            calculations and validation.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="gst-btn gst-btn-secondary"
            onClick={validateInvoice}
          >
            Validate Invoice
          </button>

          <button
            className="gst-btn gst-btn-primary"
            onClick={saveDraft}
          >
            Save Draft
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="saved-message">
          {savedMessage}
        </div>
      )}

      {/* DOCUMENT DETAILS */}

      <section className="panel">
        <div className="panel-heading">
          <h3>Invoice Details</h3>

          <p>
            Basic document information and automatically detected
            supply type.
          </p>
        </div>

        <div className="document-grid">
          <Field
            label="Invoice Number"
            value={invoiceNumber}
            onChange={setInvoiceNumber}
            placeholder="INV-000001"
          />

          <Field
            label="Invoice Date"
            type="date"
            value={invoiceDate}
            onChange={setInvoiceDate}
          />

          <div>
            <label className="field-label">
              Supply Type
            </label>

            <div className="supply-box">
              <strong>
                {supplyType === "INTRA_STATE"
                  ? "Intra-State"
                  : "Inter-State"}
              </strong>

              <span>
                {supplyType === "INTRA_STATE"
                  ? "CGST + SGST"
                  : "IGST"}
              </span>
            </div>
          </div>
        </div>

        <div className="party-grid">
          {/* SELLER */}

          <div className="party-card">
            <div className="party-heading">
              <h4>Seller / Supplier</h4>

              <p>
                Your registered business information
              </p>
            </div>

            <div className="form-grid">
              <Field
                label="Business Name *"
                value={seller.name}
                onChange={(value) =>
                  updateSeller("name", value)
                }
                placeholder="Business legal/trade name"
              />

              <Field
                label="GSTIN *"
                value={seller.gstin}
                onChange={(value) =>
                  updateSeller(
                    "gstin",
                    value.toUpperCase()
                  )
                }
                placeholder="15-character GSTIN"
              />

              <Field
                label="Address"
                value={seller.address}
                onChange={(value) =>
                  updateSeller(
                    "address",
                    value
                  )
                }
                placeholder="Business address"
                full
              />

              <Field
                label="City"
                value={seller.city}
                onChange={(value) =>
                  updateSeller(
                    "city",
                    value
                  )
                }
                placeholder="City"
              />

              <StateSelect
                label="State *"
                value={seller.state}
                onChange={(value) =>
                  selectPartyState(
                    "seller",
                    value
                  )
                }
              />

              <Field
                label="State Code"
                value={seller.stateCode}
                onChange={(value) =>
                  updateSeller(
                    "stateCode",
                    value
                  )
                }
                placeholder="03"
              />

              <Field
                label="Pincode"
                value={seller.pincode}
                onChange={(value) =>
                  updateSeller(
                    "pincode",
                    value
                  )
                }
                placeholder="Pincode"
              />

              <Field
                label="Phone"
                value={seller.phone}
                onChange={(value) =>
                  updateSeller(
                    "phone",
                    value
                  )
                }
                placeholder="Phone"
              />

              <Field
                label="Email"
                value={seller.email}
                onChange={(value) =>
                  updateSeller(
                    "email",
                    value
                  )
                }
                placeholder="Email"
              />
            </div>
          </div>

          {/* BUYER */}

          <div className="party-card">
            <div className="party-heading">
              <h4>Buyer / Recipient</h4>

              <p>
                Customer billing information
              </p>
            </div>

            <div className="form-grid">
              <Field
                label="Customer Name *"
                value={buyer.name}
                onChange={(value) =>
                  updateBuyer(
                    "name",
                    value
                  )
                }
                placeholder="Customer or company name"
              />

              <Field
                label="GSTIN"
                value={buyer.gstin}
                onChange={(value) =>
                  updateBuyer(
                    "gstin",
                    value.toUpperCase()
                  )
                }
                placeholder="GSTIN if registered"
              />

              <Field
                label="Address"
                value={buyer.address}
                onChange={(value) =>
                  updateBuyer(
                    "address",
                    value
                  )
                }
                placeholder="Billing address"
                full
              />

              <Field
                label="City"
                value={buyer.city}
                onChange={(value) =>
                  updateBuyer(
                    "city",
                    value
                  )
                }
                placeholder="City"
              />

              <StateSelect
                label="State *"
                value={buyer.state}
                onChange={(value) =>
                  selectPartyState(
                    "buyer",
                    value
                  )
                }
              />

              <Field
                label="State Code"
                value={buyer.stateCode}
                onChange={(value) =>
                  updateBuyer(
                    "stateCode",
                    value
                  )
                }
                placeholder="State code"
              />

              <Field
                label="Pincode"
                value={buyer.pincode}
                onChange={(value) =>
                  updateBuyer(
                    "pincode",
                    value
                  )
                }
                placeholder="Pincode"
              />

              <Field
                label="Phone"
                value={buyer.phone}
                onChange={(value) =>
                  updateBuyer(
                    "phone",
                    value
                  )
                }
                placeholder="Phone"
              />

              <Field
                label="Email"
                value={buyer.email}
                onChange={(value) =>
                  updateBuyer(
                    "email",
                    value
                  )
                }
                placeholder="Email"
              />
            </div>
          </div>
        </div>

        <div className="toggle-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={reverseCharge}
              onChange={(event) =>
                setReverseCharge(
                  event.target.checked
                )
              }
            />

            <div>
              Reverse Charge
              <span className="toggle-description">
                Mark this only when the transaction is
                actually covered by reverse-charge provisions.
              </span>
            </div>
          </label>
        </div>
      </section>

      {/* ITEMS */}

      <section className="panel">
        <div className="panel-heading">
          <h3>Items / Services</h3>

          <p>
            Add unlimited invoice line items. Each line is
            calculated independently.
          </p>
        </div>

        <div className="items-scroll">
          <div className="items-head">
            <div>#</div>
            <div>Description</div>
            <div>HSN/SAC</div>
            <div>Qty</div>
            <div>Unit</div>
            <div>Rate</div>
            <div>Discount</div>
            <div>GST</div>
            <div>Taxable</div>
            <div>Total</div>
            <div />
          </div>

          {calculatedItems.map(
            ({ item, calculation }, index) => (
              <div
                className="item-row"
                key={item.id}
              >
                <div className="item-index">
                  {index + 1}
                </div>

                <input
                  value={item.description}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Product / service"
                />

                <input
                  value={item.hsnSac}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "hsnSac",
                      event.target.value
                    )
                  }
                  placeholder="HSN/SAC"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "quantity",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <select
                  value={item.unit}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "unit",
                      event.target.value
                    )
                  }
                >
                  <option>PCS</option>
                  <option>NOS</option>
                  <option>KG</option>
                  <option>LTR</option>
                  <option>MTR</option>
                  <option>BOX</option>
                  <option>SET</option>
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "rate",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.discount}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "discount",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <select
                  value={item.gstRate}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "gstRate",
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  {GST_RATES.map(
                    (rate) => (
                      <option
                        key={rate}
                        value={rate}
                      >
                        {rate}%
                      </option>
                    )
                  )}
                </select>

                <div className="calculated">
                  {formatMoney(
                    calculation.taxableValue
                  )}
                </div>

                <div className="calculated strong">
                  {formatMoney(
                    calculation.total
                  )}
                </div>

                <button
                  className="remove"
                  onClick={() =>
                    removeItem(item.id)
                  }
                  disabled={
                    items.length === 1
                  }
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>

        <button
          className="add-item"
          onClick={addItem}
        >
          + Add Item
        </button>
      </section>

      {/* NOTES + SUMMARY */}

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-heading">
            <h3>Notes & Terms</h3>

            <p>
              Optional information that will appear in the
              invoice preview.
            </p>
          </div>

          <Field
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Additional notes"
            textarea
          />

          <div style={{ height: 13 }} />

          <Field
            label="Terms & Conditions"
            value={terms}
            onChange={setTerms}
            placeholder="Terms and conditions"
            textarea
          />
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h3>Invoice Summary</h3>

            <p>
              {supplyType === "INTRA_STATE"
                ? "CGST + SGST"
                : "IGST"}
            </p>
          </div>

          <div className="total-row">
            <span>Gross Value</span>
            <strong>
              {formatMoney(totals.gross)}
            </strong>
          </div>

          <div className="total-row">
            <span>Discount</span>
            <strong>
              - {formatMoney(totals.discount)}
            </strong>
          </div>

          <div className="total-row">
            <span>Taxable Value</span>
            <strong>
              {formatMoney(totals.taxable)}
            </strong>
          </div>

          {supplyType === "INTRA_STATE" ? (
            <>
              <div className="total-row">
                <span>CGST</span>
                <strong>
                  {formatMoney(totals.cgst)}
                </strong>
              </div>

              <div className="total-row">
                <span>SGST</span>
                <strong>
                  {formatMoney(totals.sgst)}
                </strong>
              </div>
            </>
          ) : (
            <div className="total-row">
              <span>IGST</span>
              <strong>
                {formatMoney(totals.igst)}
              </strong>
            </div>
          )}

          <div className="divider" />

          <div className="grand-total">
            <span>Grand Total</span>

            <strong>
              {formatMoney(
                totals.grandTotal
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* VALIDATION */}

      {validationErrors.length > 0 && (
        <section className="validation">
          <div className="validation-icon">
            !
          </div>

          <div>
            <h3>
              Invoice needs attention
            </h3>

            <p>
              Fix these items before treating the invoice
              as ready.
            </p>

            <ul>
              {validationErrors
                .slice(0, 8)
                .map((error) => (
                  <li key={error}>
                    {error}
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      {/* LIVE PREVIEW */}

      <section className="panel">
        <div className="preview-heading">
          <div>
            <div className="kicker">
              LIVE PREVIEW
            </div>

            <h3>
              Tax Invoice
            </h3>
          </div>

          <span
            className={`preview-status ${
              validationErrors.length === 0
                ? "ready"
                : "warning"
            }`}
          >
            {validationErrors.length === 0
              ? "Ready for review"
              : "Needs attention"}
          </span>
        </div>

        <div className="invoice-preview">
          <div className="invoice-top">
            <div>
              <div className="invoice-label">
                TAX INVOICE
              </div>

              <div className="preview-business-name">
                {seller.name ||
                  "Your Business Name"}
              </div>

              <div className="muted-line">
                {seller.address ||
                  "Business address"}
              </div>

              <div className="muted-line">
                {seller.city
                  ? `${seller.city}, ${seller.state}`
                  : seller.state ||
                    "City, State"}
              </div>

              <div className="muted-line">
                GSTIN:{" "}
                {seller.gstin ||
                  "GSTIN"}
              </div>
            </div>

            <div className="invoice-meta">
              <div className="invoice-meta-row">
                <span>
                  Invoice No.
                </span>

                <strong>
                  {invoiceNumber}
                </strong>
              </div>

              <div className="invoice-meta-row">
                <span>
                  Invoice Date
                </span>

                <strong>
                  {invoiceDate}
                </strong>
              </div>

              <div className="invoice-meta-row">
                <span>
                  Supply Type
                </span>

                <strong>
                  {supplyType ===
                  "INTRA_STATE"
                    ? "Intra-State"
                    : "Inter-State"}
                </strong>
              </div>

              <div className="invoice-meta-row">
                <span>
                  Reverse Charge
                </span>

                <strong>
                  {reverseCharge
                    ? "YES"
                    : "NO"}
                </strong>
              </div>
            </div>
          </div>

          <div className="preview-parties">
            <div>
              <div className="preview-label">
                Bill To
              </div>

              <div className="preview-party-name">
                {buyer.name ||
                  "Customer Name"}
              </div>

              <div className="preview-line">
                {buyer.address ||
                  "Customer address"}
              </div>

              <div className="preview-line">
                {buyer.city
                  ? `${buyer.city}, ${buyer.state}`
                  : buyer.state ||
                    "City, State"}
              </div>

              <div className="preview-line">
                GSTIN:{" "}
                {buyer.gstin ||
                  "Not provided"}
              </div>

              <div className="preview-line">
                Place of Supply:{" "}
                {buyer.state ||
                  "Not selected"}
              </div>
            </div>

            <div>
              <div className="preview-label">
                Tax Mode
              </div>

              <div className="preview-party-name">
                {supplyType ===
                "INTRA_STATE"
                  ? "CGST + SGST"
                  : "IGST"}
              </div>

              <div className="preview-line">
                Tax amount:{" "}
                {formatMoney(
                  totals.tax
                )}
              </div>
            </div>
          </div>

          <div className="preview-items">
            <div className="preview-items-head">
              <span>#</span>
              <span>
                Description
              </span>
              <span>
                HSN/SAC
              </span>
              <span>
                Qty
              </span>
              <span>
                Rate
              </span>
              <span>
                Taxable
              </span>
              <span>
                Tax
              </span>
              <span>
                Total
              </span>
            </div>

            {calculatedItems.map(
              (
                { item, calculation },
                index
              ) => (
                <div
                  className="preview-items-row"
                  key={item.id}
                >
                  <span>
                    {index + 1}
                  </span>

                  <span>
                    {item.description ||
                      "Item"}
                  </span>

                  <span>
                    {item.hsnSac ||
                      "—"}
                  </span>

                  <span>
                    {formatNumber(
                      item.quantity
                    )}{" "}
                    {item.unit}
                  </span>

                  <span>
                    {formatMoney(
                      item.rate
                    )}
                  </span>

                  <span>
                    {formatMoney(
                      calculation.taxableValue
                    )}
                  </span>

                  <span>
                    {formatMoney(
                      calculation.gstAmount
                    )}
                  </span>

                  <strong>
                    {formatMoney(
                      calculation.total
                    )}
                  </strong>
                </div>
              )
            )}
          </div>

          <div className="preview-bottom">
            <div>
              <div className="preview-small-heading">
                Notes
              </div>

              <p className="preview-small-text">
                {notes ||
                  "No additional notes."}
              </p>

              <div className="preview-small-heading">
                Terms & Conditions
              </div>

              <p className="preview-small-text">
                {terms}
              </p>
            </div>

            <div className="preview-total-box">
              <div className="preview-total-row">
                <span>
                  Taxable Value
                </span>

                <strong>
                  {formatMoney(
                    totals.taxable
                  )}
                </strong>
              </div>

              {supplyType ===
              "INTRA_STATE" ? (
                <>
                  <div className="preview-total-row">
                    <span>
                      CGST
                    </span>

                    <strong>
                      {formatMoney(
                        totals.cgst
                      )}
                    </strong>
                  </div>

                  <div className="preview-total-row">
                    <span>
                      SGST
                    </span>

                    <strong>
                      {formatMoney(
                        totals.sgst
                      )}
                    </strong>
                  </div>
                </>
              ) : (
                <div className="preview-total-row">
                  <span>
                    IGST
                  </span>

                  <strong>
                    {formatMoney(
                      totals.igst
                    )}
                  </strong>
                </div>
              )}

              <div className="preview-final-total">
                <span>
                  Grand Total
                </span>

                <strong>
                  {formatMoney(
                    totals.grandTotal
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="invoice-footer">
            <span>
              SMART GST
            </span>

            <span>
              Live application preview
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   REUSABLE FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  full = false,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  full?: boolean;
  textarea?: boolean;
}) {
  return (
    <div
      className={`field ${
        full ? "full" : ""
      }`}
    >
      <label className="field-label">
        {label}
      </label>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

/* =========================================================
   STATE FIELD
========================================================= */

function StateSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >
        <option value="">
          Select state
        </option>

        {STATES.map((state) => (
          <option
            key={state.code}
            value={state.name}
          >
            {state.name}
          </option>
        ))}
      </select>
    </div>
  );
}
