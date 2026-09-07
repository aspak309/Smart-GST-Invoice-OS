"use client";

import { useState } from "react";

type MenuItem = {
  name: string;
  icon: string;
  description: string;
};

const menuSections: {
  title: string;
  items: MenuItem[];
}[] = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        icon: "⌂",
        description: "Your complete GST business overview",
      },
    ],
  },
  {
    title: "SALES & INVOICES",
    items: [
      {
        name: "Tax Invoice",
        icon: "▣",
        description: "Create a GST tax invoice",
      },
      {
        name: "Bill of Supply",
        icon: "▤",
        description: "Create a bill of supply",
      },
      {
        name: "Export Invoice",
        icon: "◎",
        description: "Create an export invoice",
      },
      {
        name: "SEZ Invoice",
        icon: "◇",
        description: "Create an SEZ supply invoice",
      },
    ],
  },
  {
    title: "ADJUSTMENTS",
    items: [
      {
        name: "Credit Note",
        icon: "↙",
        description: "Create a credit note",
      },
      {
        name: "Debit Note",
        icon: "↗",
        description: "Create a debit note",
      },
      {
        name: "Revised Invoice",
        icon: "⟳",
        description: "Create a revised invoice",
      },
    ],
  },
  {
    title: "GOODS MOVEMENT",
    items: [
      {
        name: "Delivery Challan",
        icon: "▱",
        description: "Create a delivery challan",
      },
      {
        name: "Stock Transfer",
        icon: "⇄",
        description: "Transfer goods between locations",
      },
      {
        name: "Job Work",
        icon: "⚒",
        description: "Manage job work movement",
      },
      {
        name: "E-Way Bill",
        icon: "▰",
        description: "Manage e-way bill workflow",
      },
    ],
  },
  {
    title: "PURCHASE",
    items: [
      {
        name: "Purchase Invoice",
        icon: "□",
        description: "Record a purchase invoice",
      },
      {
        name: "Import Purchase",
        icon: "↥",
        description: "Manage import purchase workflow",
      },
      {
        name: "Supplier Credit Note",
        icon: "←",
        description: "Record supplier credit note",
      },
      {
        name: "Supplier Debit Note",
        icon: "→",
        description: "Record supplier debit note",
      },
    ],
  },
  {
    title: "GST & COMPLIANCE",
    items: [
      {
        name: "E-Invoice",
        icon: "✓",
        description: "Manage e-invoice and IRN workflow",
      },
      {
        name: "Reverse Charge",
        icon: "↻",
        description: "Manage reverse charge transactions",
      },
      {
        name: "GST Validation",
        icon: "◇",
        description: "Validate GST-related information",
      },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      {
        name: "Customers",
        icon: "◉",
        description: "Manage customers",
      },
      {
        name: "Suppliers",
        icon: "○",
        description: "Manage suppliers",
      },
      {
        name: "Products & Services",
        icon: "□",
        description: "Manage products and services",
      },
      {
        name: "Payments",
        icon: "₹",
        description: "Manage payments and collections",
      },
      {
        name: "Reports",
        icon: "▥",
        description: "Business and GST reports",
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        name: "Help & Feedback",
        icon: "?",
        description: "Report a problem or request an update",
      },
      {
        name: "Settings",
        icon: "⚙",
        description: "Manage business and app settings",
      },
    ],
  },
];

const allMenuItems = menuSections.flatMap((section) => section.items);

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const activeInfo =
    allMenuItems.find((item) => item.name === activePage) ??
    menuSections[0].items[0];

  const goTo = (page: string) => {
    setActivePage(page);
    setMobileSidebar(false);
  };

  return (
    <div className="app-root">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: #f5f7fb;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          color: #172238;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app-root {
          min-height: 100vh;
          background: #f5f7fb;
        }

        /* SIDEBAR */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 272px;
          background: #071a33;
          color: white;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform 0.25s ease;
        }

        .brand-area {
          height: 82px;
          padding: 17px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: linear-gradient(135deg, #1d7cff, #0751c5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.7px;
          box-shadow: 0 8px 20px rgba(0, 90, 220, 0.22);
        }

        .brand-name {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.4px;
        }

        .brand-subtitle {
          margin-top: 2px;
          color: #91a7c1;
          font-size: 10px;
        }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 13px 10px 15px;
        }

        .nav-section {
          margin-bottom: 17px;
        }

        .nav-section-title {
          padding: 0 11px 7px;
          color: #6f849e;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .nav-button {
          width: 100%;
          min-height: 38px;
          padding: 8px 11px;
          margin-bottom: 2px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #b8c5d6;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          font-size: 11px;
          transition: 0.18s ease;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.055);
          color: white;
        }

        .nav-button.active {
          background: #146ef5;
          color: white;
          box-shadow: 0 8px 20px rgba(20, 110, 245, 0.22);
        }

        .nav-icon {
          width: 20px;
          text-align: center;
          font-size: 14px;
          opacity: 0.95;
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .support-preview {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.045);
          border-radius: 13px;
          padding: 13px;
        }

        .support-preview-title {
          font-size: 11px;
          font-weight: 900;
        }

        .support-preview-text {
          margin-top: 4px;
          color: #90a4be;
          font-size: 9px;
          line-height: 1.55;
        }

        /* MAIN */
        .main-area {
          margin-left: 272px;
          min-height: 100vh;
        }

        .mobile-header {
          display: none;
        }

        .topbar {
          min-height: 94px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 18px 31px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .topbar-kicker {
          color: #116af1;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .topbar-title {
          margin: 5px 0 3px;
          font-size: 24px;
          line-height: 1.15;
          letter-spacing: -0.7px;
        }

        .topbar-description {
          margin: 0;
          color: #78869a;
          font-size: 11px;
        }

        .topbar-actions {
          display: flex;
          gap: 8px;
        }

        .button-secondary,
        .button-primary {
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 900;
        }

        .button-secondary {
          border: 1px solid #dce4ed;
          color: #34445a;
          background: white;
        }

        .button-primary {
          border: 0;
          color: white;
          background: #146ef5;
          box-shadow: 0 7px 17px rgba(20, 110, 245, 0.18);
        }

        .content {
          max-width: 1540px;
          margin: 0 auto;
          padding: 28px 31px 50px;
        }

        /* DASHBOARD */
        .hero {
          border-radius: 21px;
          padding: 30px;
          color: white;
          background: linear-gradient(135deg, #0a2242, #0d57b5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          box-shadow: 0 18px 38px rgba(7, 37, 79, 0.14);
        }

        .hero-label {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.55px;
          color: rgba(255, 255, 255, 0.68);
        }

        .hero-title {
          margin: 9px 0 8px;
          font-size: 31px;
          line-height: 1.1;
          letter-spacing: -0.9px;
        }

        .hero-text {
          margin: 0;
          max-width: 730px;
          color: rgba(255, 255, 255, 0.76);
          font-size: 12px;
          line-height: 1.7;
        }

        .hero-button {
          flex-shrink: 0;
          border: 0;
          border-radius: 10px;
          background: white;
          color: #0e59b9;
          padding: 13px 16px;
          font-size: 10px;
          font-weight: 900;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin: 18px 0 28px;
        }

        .stat-card {
          border: 1px solid #e1e7ef;
          background: white;
          border-radius: 15px;
          padding: 18px;
        }

        .stat-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .stat-label {
          color: #748398;
          font-size: 10px;
          font-weight: 700;
        }

        .stat-value {
          margin-top: 7px;
          font-size: 22px;
          font-weight: 900;
        }

        .stat-subtitle {
          margin-top: 10px;
          color: #99a5b4;
          font-size: 9px;
        }

        .stat-icon {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background: #edf4ff;
          color: #146ef5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }

        .section {
          margin-top: 26px;
        }

        .section-head {
          margin-bottom: 12px;
        }

        .section-head h2 {
          margin: 0;
          font-size: 17px;
        }

        .section-head p {
          margin: 4px 0 0;
          color: #7c8999;
          font-size: 10px;
        }

        .document-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .document-card {
          position: relative;
          min-height: 145px;
          border: 1px solid #e1e8f0;
          background: white;
          border-radius: 15px;
          padding: 16px;
          text-align: left;
          transition: 0.18s ease;
        }

        .document-card:hover {
          transform: translateY(-2px);
          border-color: #9dc1f7;
          box-shadow: 0 10px 23px rgba(17, 74, 142, 0.07);
        }

        .document-card-icon {
          width: 39px;
          height: 39px;
          border-radius: 11px;
          background: #eef5ff;
          color: #1269ef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .document-card-name {
          margin-top: 14px;
          font-size: 12px;
          font-weight: 900;
        }

        .document-card-description {
          margin-top: 4px;
          color: #7c899a;
          font-size: 9px;
          line-height: 1.5;
        }

        .document-card-arrow {
          position: absolute;
          right: 14px;
          top: 14px;
          color: #a1adbc;
        }

        .all-modules {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
        }

        .module-card {
          min-height: 63px;
          padding: 10px 11px;
          border: 1px solid #e2e8ef;
          border-radius: 12px;
          background: white;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          transition: 0.18s ease;
        }

        .module-card:hover {
          border-color: #a3c3f4;
        }

        .module-card-icon {
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #f0f5fb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .module-card-main {
          flex: 1;
          min-width: 0;
        }

        .module-card-name {
          font-size: 10px;
          font-weight: 900;
        }

        .module-card-description {
          margin-top: 2px;
          color: #8592a2;
          font-size: 8px;
        }

        .module-card-arrow {
          color: #a7b2c0;
          font-size: 17px;
        }

        .architecture {
          margin-top: 20px;
          border: 1px solid #d5e6ff;
          background: #edf5ff;
          border-radius: 15px;
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .architecture-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #146ef5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }

        .architecture h3 {
          margin: 0;
          font-size: 12px;
        }

        .architecture p {
          margin: 4px 0 0;
          color: #62748a;
          font-size: 9px;
          line-height: 1.65;
        }

        /* EMPTY MODULE */
        .empty-module {
          border: 1px solid #e1e8f0;
          background: white;
          border-radius: 17px;
          min-height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .empty-module-inner {
          max-width: 560px;
        }

        .empty-module-icon {
          width: 62px;
          height: 62px;
          border-radius: 17px;
          background: #edf4ff;
          color: #146ef5;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .empty-module h2 {
          margin: 16px 0 6px;
          font-size: 22px;
        }

        .empty-module p {
          margin: 0;
          color: #77869a;
          font-size: 11px;
          line-height: 1.7;
        }

        .empty-module-badge {
          display: inline-flex;
          margin-top: 16px;
          padding: 7px 10px;
          border-radius: 20px;
          background: #f0f5fb;
          color: #617187;
          font-size: 9px;
          font-weight: 900;
        }

        /* MOBILE */
        @media (max-width: 1100px) {
          .stats-grid,
          .document-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .all-modules {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .mobile-header {
            height: 64px;
            display: flex;
            position: sticky;
            top: 0;
            z-index: 90;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            padding: 0 16px;
            align-items: center;
            justify-content: space-between;
          }

          .mobile-brand-name {
            font-size: 14px;
            font-weight: 900;
          }

          .mobile-brand-subtitle {
            margin-top: 2px;
            color: #8290a1;
            font-size: 9px;
          }

          .mobile-menu {
            width: 40px;
            height: 40px;
            border: 1px solid #dbe3ed;
            border-radius: 10px;
            background: white;
          }

          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-area {
            margin-left: 0;
          }

          .topbar {
            padding: 18px 16px;
            align-items: flex-start;
          }

          .topbar-actions {
            display: none;
          }

          .content {
            padding: 18px 16px 40px;
          }

          .hero {
            flex-direction: column;
            align-items: flex-start;
            padding: 22px;
          }

          .hero-title {
            font-size: 25px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .document-grid,
          .all-modules {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .topbar-title {
            font-size: 21px;
          }
        }
      `}</style>

      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <div>
          <div className="mobile-brand-name">SMART GST</div>
          <div className="mobile-brand-subtitle">Business OS</div>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMobileSidebar((value) => !value)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileSidebar ? "open" : ""}`}>
        <div className="brand-area">
          <div className="brand-logo">GST</div>

          <div>
            <div className="brand-name">SMART GST</div>
            <div className="brand-subtitle">Business OS</div>
          </div>
        </div>

        <div className="sidebar-scroll">
          {menuSections.map((section) => (
            <div className="nav-section" key={section.title}>
              <div className="nav-section-title">{section.title}</div>

              {section.items.map((item) => (
                <button
                  key={item.name}
                  className={`nav-button ${
                    activePage === item.name ? "active" : ""
                  }`}
                  onClick={() => goTo(item.name)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="support-preview">
            <div className="support-preview-title">
              Need Help?
            </div>
            <div className="support-preview-text">
              Problems, feedback and update requests will have a
              dedicated support workflow.
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-kicker">
              SMART GST BUSINESS WORKSPACE
            </div>

            <h1 className="topbar-title">
              {activePage === "Dashboard"
                ? "Business Dashboard"
                : activePage}
            </h1>

            <p className="topbar-description">
              {activePage === "Dashboard"
                ? "Every GST workflow stays separate, clear and organized."
                : activeInfo.description}
            </p>
          </div>

          <div className="topbar-actions">
            <button
              className="button-secondary"
              onClick={() => goTo("Help & Feedback")}
            >
              Help & Feedback
            </button>

            <button
              className="button-primary"
              onClick={() => goTo("Tax Invoice")}
            >
              + Create Tax Invoice
            </button>
          </div>
        </header>

        <div className="content">
          {activePage === "Dashboard" ? (
            <Dashboard
              onCreateInvoice={() => goTo("Tax Invoice")}
              onOpenModule={goTo}
            />
          ) : (
            <ModulePlaceholder
              item={activeInfo}
              onBack={() => goTo("Dashboard")}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  onCreateInvoice,
  onOpenModule,
}: {
  onCreateInvoice: () => void;
  onOpenModule: (name: string) => void;
}) {
  const quickDocuments = [
    {
      name: "Tax Invoice",
      icon: "▣",
      description: "Normal GST sales invoice",
    },
    {
      name: "Bill of Supply",
      icon: "▤",
      description: "Applicable non-tax invoice",
    },
    {
      name: "Credit Note",
      icon: "↙",
      description: "Invoice adjustment",
    },
    {
      name: "Delivery Challan",
      icon: "▱",
      description: "Goods movement",
    },
    {
      name: "Export Invoice",
      icon: "◎",
      description: "Export supply",
    },
    {
      name: "Purchase Invoice",
      icon: "□",
      description: "Purchase transaction",
    },
    {
      name: "E-Way Bill",
      icon: "▰",
      description: "Goods movement compliance",
    },
    {
      name: "E-Invoice",
      icon: "✓",
      description: "IRN / e-invoice workflow",
    },
  ];

  const allItems = allMenuItems.filter(
    (item) => item.name !== "Dashboard"
  );

  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-label">
            SMART GST BUSINESS OPERATING SYSTEM
          </div>

          <h2 className="hero-title">
            हर GST काम के लिए
            <br />
            अलग और साफ़ workflow
          </h2>

          <p className="hero-text">
            Tax Invoice, Bill of Supply, Credit Note, Debit Note,
            Delivery Challan, Export, Purchase, E-Invoice, E-Way
            Bill और दूसरे business workflows अलग modules में
            manage करने के लिए foundation।
          </p>
        </div>

        <button
          className="hero-button"
          onClick={onCreateInvoice}
        >
          Create Tax Invoice →
        </button>
      </section>

      <section className="stats-grid">
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

      <section className="section">
        <div className="section-head">
          <h2>What do you want to create?</h2>
          <p>
            जिस प्रकार का document चाहिए, सीधे उसी module को
            खोलें।
          </p>
        </div>

        <div className="document-grid">
          {quickDocuments.map((document) => (
            <button
              key={document.name}
              className="document-card"
              onClick={() => onOpenModule(document.name)}
            >
              <div className="document-card-icon">
                {document.icon}
              </div>

              <div className="document-card-name">
                {document.name}
              </div>

              <div className="document-card-description">
                {document.description}
              </div>

              <div className="document-card-arrow">→</div>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>All Modules</h2>
          <p>
            हर business function को अलग module के रूप में रखा गया
            है।
          </p>
        </div>

        <div className="all-modules">
          {allItems.map((item) => (
            <button
              key={item.name}
              className="module-card"
              onClick={() => onOpenModule(item.name)}
            >
              <div className="module-card-icon">
                {item.icon}
              </div>

              <div className="module-card-main">
                <div className="module-card-name">
                  {item.name}
                </div>

                <div className="module-card-description">
                  {item.description}
                </div>
              </div>

              <div className="module-card-arrow">›</div>
            </button>
          ))}
        </div>
      </section>

      <section className="architecture">
        <div className="architecture-icon">✓</div>

        <div>
          <h3>
            Separate modules. One connected business engine.
          </h3>

          <p>
            User interface में Tax Invoice, Purchase, Credit Note,
            Delivery Challan, E-Invoice और बाकी workflows अलग
            रहेंगे। पीछे common data, calculation और validation
            architecture रहेगा ताकि पूरे system को आगे बड़े
            business workflows तक बढ़ाया जा सके।
          </p>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  label,
  value,
  subtitle,
  icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-head">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>

        <div className="stat-icon">{icon}</div>
      </div>

      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
}

/* =========================================================
   MODULE PLACEHOLDER
========================================================= */

function ModulePlaceholder({
  item,
  onBack,
}: {
  item: MenuItem;
  onBack: () => void;
}) {
  return (
    <section className="empty-module">
      <div className="empty-module-inner">
        <div className="empty-module-icon">{item.icon}</div>

        <h2>{item.name}</h2>

        <p>
          {item.description}
          <br />
          इस module को बाकी modules से अलग dedicated workflow
          के रूप में बनाया जाएगा।
        </p>

        <div className="empty-module-badge">
          MODULE FOUNDATION READY
        </div>

        <div style={{ marginTop: 18 }}>
          <button
            className="button-secondary"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}
