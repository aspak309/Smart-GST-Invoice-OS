"use client";

import { useState } from "react";
import AppShell, {
  APP_MODULES,
} from "@/components/AppShell";

export default function Page() {
  const [activeModuleId, setActiveModuleId] =
    useState("dashboard");

  const activeModule =
    APP_MODULES.find(
      (module) => module.id === activeModuleId
    ) ?? APP_MODULES[0];

  return (
    <AppShell
      activeModuleId={activeModuleId}
      onModuleChange={setActiveModuleId}
    >
      {activeModuleId === "dashboard" ? (
        <Dashboard
          onOpenModule={setActiveModuleId}
        />
      ) : (
        <ModulePlaceholder
          title={activeModule.title}
          description={activeModule.description}
          icon={activeModule.icon}
        />
      )}
    </AppShell>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  onOpenModule,
}: {
  onOpenModule: (moduleId: string) => void;
}) {
  const quickActions = [
    {
      id: "tax-invoice",
      title: "Tax Invoice",
      description: "Create a regular GST tax invoice",
      icon: "▣",
    },
    {
      id: "bill-of-supply",
      title: "Bill of Supply",
      description: "Create a bill of supply",
      icon: "▤",
    },
    {
      id: "credit-note",
      title: "Credit Note",
      description: "Create an invoice adjustment",
      icon: "↙",
    },
    {
      id: "debit-note",
      title: "Debit Note",
      description: "Create a debit adjustment",
      icon: "↗",
    },
    {
      id: "delivery-challan",
      title: "Delivery Challan",
      description: "Create a goods movement document",
      icon: "▱",
    },
    {
      id: "purchase-invoice",
      title: "Purchase Invoice",
      description: "Record a purchase transaction",
      icon: "□",
    },
    {
      id: "e-way-bill",
      title: "E-Way Bill",
      description: "Manage goods movement compliance",
      icon: "▰",
    },
    {
      id: "e-invoice",
      title: "E-Invoice",
      description: "Prepare e-invoice workflow",
      icon: "✓",
    },
  ];

  const managementModules = [
    {
      id: "customers",
      title: "Customers",
      description: "Customer records",
      icon: "◉",
    },
    {
      id: "suppliers",
      title: "Suppliers",
      description: "Supplier records",
      icon: "○",
    },
    {
      id: "products",
      title: "Products & Services",
      description: "Product and service master",
      icon: "□",
    },
    {
      id: "payments",
      title: "Payments",
      description: "Payment tracking",
      icon: "₹",
    },
    {
      id: "reports",
      title: "Reports",
      description: "Business and GST reports",
      icon: "▥",
    },
    {
      id: "support",
      title: "Help & Feedback",
      description: "Problems and feature requests",
      icon: "?",
    },
  ];

  return (
    <div className="dashboard">
      <style jsx>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .hero {
          padding: 30px;
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            #081d38 0%,
            #0d55b1 100%
          );
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
          box-shadow: var(--shadow-lg);
        }

        .hero-content {
          max-width: 760px;
        }

        .hero-label {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.6px;
          color: rgba(255, 255, 255, 0.65);
        }

        .hero-title {
          margin-top: 9px;
          font-size: 31px;
          line-height: 1.12;
          font-weight: 900;
          letter-spacing: -0.9px;
        }

        .hero-text {
          margin-top: 10px;
          max-width: 720px;
          color: rgba(255, 255, 255, 0.76);
          font-size: 12px;
          line-height: 1.7;
        }

        .hero-action {
          flex-shrink: 0;
          min-height: 43px;
          padding: 0 17px;
          border-radius: 10px;
          border: 0;
          background: white;
          color: #0e58b6;
          font-size: 10px;
          font-weight: 900;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .hero-action:hover {
          background: #f4f8ff;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .stat {
          padding: 18px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 15px;
          box-shadow: var(--shadow-sm);
        }

        .stat-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 700;
        }

        .stat-value {
          margin-top: 7px;
          color: var(--text-primary);
          font-size: 22px;
          line-height: 1;
          font-weight: 900;
        }

        .stat-subtitle {
          margin-top: 10px;
          color: var(--text-muted);
          font-size: 9px;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 10px;
          font-weight: 900;
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }

        .section-heading h2 {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 850;
          letter-spacing: -0.3px;
        }

        .section-heading p {
          margin-top: 4px;
          color: var(--text-secondary);
          font-size: 10px;
        }

        .section-link {
          border: 0;
          background: transparent;
          color: var(--primary);
          font-size: 10px;
          font-weight: 800;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
        }

        .quick-card {
          position: relative;
          min-height: 146px;
          padding: 16px;
          text-align: left;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: white;
          box-shadow: var(--shadow-sm);
          transition:
            transform 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .quick-card:hover {
          transform: translateY(-2px);
          border-color: #a5c7f9;
          box-shadow: var(--shadow-md);
        }

        .quick-icon {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 17px;
        }

        .quick-title {
          margin-top: 14px;
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 900;
        }

        .quick-description {
          margin-top: 4px;
          max-width: 190px;
          color: var(--text-secondary);
          font-size: 9px;
          line-height: 1.55;
        }

        .quick-arrow {
          position: absolute;
          right: 14px;
          top: 14px;
          color: #9ba8b7;
          font-size: 15px;
        }

        .management-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .management-card {
          min-height: 65px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px;
          text-align: left;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: white;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .management-card:hover {
          border-color: #a9c8f7;
          background: #fcfdff;
        }

        .management-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #f0f5fb;
          color: #58718d;
          font-size: 13px;
        }

        .management-content {
          flex: 1;
          min-width: 0;
        }

        .management-title {
          color: var(--text-primary);
          font-size: 10px;
          font-weight: 900;
        }

        .management-description {
          margin-top: 3px;
          color: var(--text-muted);
          font-size: 8px;
        }

        .architecture {
          padding: 17px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid #d4e5fc;
          border-radius: 15px;
          background: #eef6ff;
        }

        .architecture-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: var(--primary);
          color: white;
          font-size: 15px;
        }

        .architecture h3 {
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 900;
        }

        .architecture p {
          margin-top: 4px;
          color: #62758b;
          font-size: 9px;
          line-height: 1.65;
        }

        @media (max-width: 1100px) {
          .quick-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .management-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .hero {
            padding: 23px;
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-title {
            font-size: 25px;
          }

          .stats,
          .quick-grid,
          .management-grid {
            grid-template-columns: 1fr;
          }

          .section-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">
            SMART GST BUSINESS OPERATING SYSTEM
          </div>

          <h2 className="hero-title">
            हर GST काम,
            <br />
            अपने अलग workflow में
          </h2>

          <p className="hero-text">
            यह system एक ही बड़े form में हर चीज़ डालने के
            बजाय अलग-अलग GST documents और business operations
            को अलग modules में रखेगा। पीछे common data और
            calculation architecture रहेगा।
          </p>
        </div>

        <button
          className="hero-action"
          onClick={() =>
            onOpenModule("tax-invoice")
          }
        >
          Create Tax Invoice →
        </button>
      </section>

      {/* STATS */}
      <section className="stats">
        <Stat
          label="Sales This Month"
          value="₹0.00"
          subtitle="No transactions yet"
          icon="₹"
        />

        <Stat
          label="GST Payable"
          value="₹0.00"
          subtitle="Current period"
          icon="GST"
        />

        <Stat
          label="Outstanding"
          value="₹0.00"
          subtitle="Receivables"
          icon="₹"
        />

        <Stat
          label="Documents"
          value="0"
          subtitle="Created so far"
          icon="#"
        />
      </section>

      {/* QUICK CREATE */}
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>What do you want to create?</h2>

            <p>
              सीधे वही GST document चुनें जिसकी आपको जरूरत है।
            </p>
          </div>

          <button
            className="section-link"
            onClick={() =>
              onOpenModule("tax-invoice")
            }
          >
            Open Tax Invoice →
          </button>
        </div>

        <div className="quick-grid">
          {quickActions.map((item) => (
            <button
              key={item.id}
              className="quick-card"
              onClick={() =>
                onOpenModule(item.id)
              }
            >
              <div className="quick-icon">
                {item.icon}
              </div>

              <div className="quick-title">
                {item.title}
              </div>

              <div className="quick-description">
                {item.description}
              </div>

              <div className="quick-arrow">
                →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* MANAGEMENT */}
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>Business Management</h2>

            <p>
              Business records और operations भी अलग modules में
              रहेंगे।
            </p>
          </div>
        </div>

        <div className="management-grid">
          {managementModules.map((item) => (
            <button
              key={item.id}
              className="management-card"
              onClick={() =>
                onOpenModule(item.id)
              }
            >
              <div className="management-icon">
                {item.icon}
              </div>

              <div className="management-content">
                <div className="management-title">
                  {item.title}
                </div>

                <div className="management-description">
                  {item.description}
                </div>
              </div>

              <span>›</span>
            </button>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE PRINCIPLE */}
      <section className="architecture">
        <div className="architecture-icon">
          ✓
        </div>

        <div>
          <h3>
            Separate screens, one connected system
          </h3>

          <p>
            Tax Invoice, Export, Import, Credit Note, Debit Note,
            Delivery Challan, E-Invoice, E-Way Bill, Purchase
            और बाकी features user interface में अलग रहेंगे,
            लेकिन data, validation, calculation और document
            relationships एक common architecture पर आधारित होंगे।
          </p>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   TEMPORARY MODULE SCREEN
========================================================= */

function ModulePlaceholder({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <section className="gst-card">
      <div className="gst-empty-state">
        <div className="gst-empty-state-inner">
          <div className="gst-empty-icon">
            {icon}
          </div>

          <h2>{title}</h2>

          <p>
            {description}
            <br />
            यह module अपने अलग workflow के साथ बनाया जाएगा।
          </p>

          <div
            style={{
              marginTop: "14px",
            }}
          >
            <span className="gst-status gst-status-info">
              MODULE FOUNDATION
            </span>
          </div>
        </div>
      </div>
    </section>
  );
              }
