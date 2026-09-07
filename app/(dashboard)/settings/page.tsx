"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";

const SETTINGS_KEY = "smart_gst_settings";

interface BusinessSettings {
  businessName: string;
  legalName: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  invoicePrefix: string;
  invoiceStartNumber: string;
  financialYear: string;
}

const defaultSettings: BusinessSettings = {
  businessName: "",
  legalName: "",
  gstin: "",
  pan: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  invoicePrefix: "INV",
  invoiceStartNumber: "1",
  financialYear: "2025-26",
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<BusinessSettings>(defaultSettings);

  const [activeTab, setActiveTab] =
    useState<"business" | "invoice" | "app">(
      "business"
    );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        SETTINGS_KEY
      );

      if (stored) {
        const parsed = JSON.parse(stored);

        setSettings({
          ...defaultSettings,
          ...parsed,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateField = (
    field: keyof BusinessSettings,
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2
          className="animate-spin text-blue-600"
          size={32}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-12">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your business profile and Smart GST preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : saved ? (
            <CheckCircle2 size={17} />
          ) : (
            <Save size={17} />
          )}

          {saving
            ? "Saving..."
            : saved
            ? "Saved"
            : "Save Settings"}
        </button>

      </div>

      {/* TABS */}

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">

        <TabButton
          active={activeTab === "business"}
          onClick={() =>
            setActiveTab("business")
          }
          icon={<Building2 size={17} />}
          label="Business Profile"
        />

        <TabButton
          active={activeTab === "invoice"}
          onClick={() =>
            setActiveTab("invoice")
          }
          icon={<FileText size={17} />}
          label="Invoice Settings"
        />

        <TabButton
          active={activeTab === "app"}
          onClick={() =>
            setActiveTab("app")
          }
          icon={<Settings2 size={17} />}
          label="App Settings"
        />

      </div>

      {/* BUSINESS PROFILE */}

      {activeTab === "business" && (
        <div className="space-y-6">

          <section className="rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Business Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Basic information about your business.
                  </p>
                </div>

              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              <InputField
                label="Business Name"
                value={settings.businessName}
                onChange={(value) =>
                  updateField(
                    "businessName",
                    value
                  )
                }
                placeholder="MD Asgar Manufacturing"
              />

              <InputField
                label="Legal Business Name"
                value={settings.legalName}
                onChange={(value) =>
                  updateField(
                    "legalName",
                    value
                  )
                }
                placeholder="Enter legal name"
              />

              <InputField
                label="GSTIN"
                value={settings.gstin}
                onChange={(value) =>
                  updateField(
                    "gstin",
                    value.toUpperCase()
                  )
                }
                placeholder="03XXXXXXXXXXXXXX"
                maxLength={15}
              />

              <InputField
                label="PAN Number"
                value={settings.pan}
                onChange={(value) =>
                  updateField(
                    "pan",
                    value.toUpperCase()
                  )
                }
                placeholder="ABCDE1234F"
                maxLength={10}
              />

              <InputField
                label="Email Address"
                type="email"
                value={settings.email}
                onChange={(value) =>
                  updateField("email", value)
                }
                placeholder="business@example.com"
              />

              <InputField
                label="Phone Number"
                type="tel"
                value={settings.phone}
                onChange={(value) =>
                  updateField("phone", value)
                }
                placeholder="+91 98765 43210"
              />

            </div>

          </section>

          {/* ADDRESS */}

          <section className="rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5 sm:p-6">
              <h2 className="font-bold text-slate-800">
                Business Address
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                This address can be used on invoices and GST documents.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Complete Address
                </label>

                <textarea
                  value={settings.address}
                  onChange={(event) =>
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="Enter complete business address"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>

              <InputField
                label="City"
                value={settings.city}
                onChange={(value) =>
                  updateField("city", value)
                }
                placeholder="Ludhiana"
              />

              <InputField
                label="State"
                value={settings.state}
                onChange={(value) =>
                  updateField("state", value)
                }
                placeholder="Punjab"
              />

              <InputField
                label="PIN Code"
                value={settings.pincode}
                onChange={(value) =>
                  updateField("pincode", value)
                }
                placeholder="141003"
                maxLength={6}
              />

            </div>

          </section>

        </div>
      )}

      {/* INVOICE SETTINGS */}

      {activeTab === "invoice" && (
        <div className="space-y-6">

          <section className="rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Invoice Numbering
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Configure how your invoice numbers are generated.
                  </p>
                </div>

              </div>

            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              <InputField
                label="Invoice Prefix"
                value={settings.invoicePrefix}
                onChange={(value) =>
                  updateField(
                    "invoicePrefix",
                    value.toUpperCase()
                  )
                }
                placeholder="INV"
              />

              <InputField
                label="Starting Invoice Number"
                type="number"
                value={settings.invoiceStartNumber}
                onChange={(value) =>
                  updateField(
                    "invoiceStartNumber",
                    value
                  )
                }
                placeholder="1"
              />

              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Financial Year
                </label>

                <select
                  value={settings.financialYear}
                  onChange={(event) =>
                    updateField(
                      "financialYear",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="2024-25">
                    FY 2024-25
                  </option>

                  <option value="2025-26">
                    FY 2025-26
                  </option>

                  <option value="2026-27">
                    FY 2026-27
                  </option>

                  <option value="2027-28">
                    FY 2027-28
                  </option>
                </select>

              </div>

            </div>

          </section>

          {/* PREVIEW */}

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              Invoice Preview
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-800">
              {settings.invoicePrefix || "INV"}-
              {settings.financialYear || "2025-26"}-
              {String(
                settings.invoiceStartNumber || "1"
              ).padStart(4, "0")}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Example of how the invoice number will appear.
            </p>

          </section>

        </div>
      )}

      {/* APP SETTINGS */}

      {activeTab === "app" && (
        <div className="space-y-6">

          <section className="rounded-2xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5 sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Data & Privacy
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Your business data is stored locally in this app.
                  </p>
                </div>

              </div>

            </div>

            <div className="divide-y divide-slate-100">

              <SettingInfo
                title="Local Data Storage"
                description="Invoices, customers and business information are stored in your application storage."
                status="Active"
              />

              <SettingInfo
                title="GST Calculation"
                description="GST values are calculated automatically based on the selected tax rates."
                status="Enabled"
              />

              <SettingInfo
                title="Document Management"
                description="Business documents remain organized in their separate modules."
                status="Enabled"
              />

            </div>

          </section>

          <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5 sm:p-6">

            <h3 className="font-bold text-amber-900">
              Important
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Keep regular backups of important business data. Settings saved here are used throughout Smart GST for your business profile and documents.
            </p>

          </section>

        </div>
      )}

    </div>
  );
}

/* =============================================
   TAB BUTTON
============================================= */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =============================================
   INPUT FIELD
============================================= */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
      />
    </div>
  );
}

/* =============================================
   SETTING INFO
============================================= */

function SettingInfo({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

      <div>
        <h3 className="text-sm font-semibold text-slate-700">
          {title}
        </h3>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
        {status}
      </span>

    </div>
  );
      }
