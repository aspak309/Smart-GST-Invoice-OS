"use client";

import { useState } from "react";

type Module = {
  name: string;
  description: string;
  icon: string;
};

const modules: Module[] = [
  {
    name: "Tax Invoice",
    description: "Normal GST sales invoice",
    icon: "📄",
  },
  {
    name: "Bill of Supply",
    description: "For applicable non-tax supplies",
    icon: "🧾",
  },
  {
    name: "Export Invoice",
    description: "Export supply invoice",
    icon: "🌍",
  },
  {
    name: "SEZ Invoice",
    description: "SEZ supply workflow",
    icon: "🏢",
  },
  {
    name: "Credit Note",
    description: "Reduce or adjust an invoice",
    icon: "↩️",
  },
  {
    name: "Debit Note",
    description: "Increase or adjust an invoice",
    icon: "↪️",
  },
  {
    name: "Delivery Challan",
    description: "Goods movement document",
    icon: "🚚",
  },
  {
    name: "Stock Transfer",
    description: "Transfer goods between locations",
    icon: "🔄",
  },
  {
    name: "Purchase Invoice",
    description: "Record purchase transaction",
    icon: "🛒",
  },
  {
    name: "Import Purchase",
    description: "Import-related purchase workflow",
    icon: "🌐",
  },
  {
    name: "E-Way Bill",
    description: "E-Way Bill workflow",
    icon: "🚛",
  },
  {
    name: "E-Invoice",
    description: "E-Invoice / IRN workflow",
    icon: "🔐",
  },
  {
    name: "Payments",
    description: "Record and track payments",
    icon: "💳",
  },
  {
    name: "Customers",
    description: "Manage customers",
    icon: "👥",
  },
  {
    name: "Suppliers",
    description: "Manage suppliers",
    icon: "🏪",
  },
  {
    name: "Products & Services",
    description: "Manage items and services",
    icon: "📦",
  },
  {
    name: "Reports",
    description: "Business and GST reports",
    icon: "📊",
  },
  {
    name: "Help & Feedback",
    description: "Report problems and request updates",
    icon: "🆘",
  },
  {
    name: "Settings",
    description: "Business and application settings",
    icon: "⚙️",
  },
];

const categories = [
  {
    title: "Sales & Invoices",
    items: [
      "Tax Invoice",
      "Bill of Supply",
      "Export Invoice",
      "SEZ Invoice",
    ],
  },
  {
    title: "Adjustments",
    items: ["Credit Note", "Debit Note"],
  },
  {
    title: "Goods Movement",
    items: ["Delivery Challan", "Stock Transfer", "E-Way Bill"],
  },
  {
    title: "Purchase",
    items: ["Purchase Invoice", "Import Purchase"],
  },
  {
    title: "Compliance",
    items: ["E-Invoice"],
  },
  {
    title: "Management",
    items: [
      "Customers",
      "Suppliers",
      "Products & Services",
      "Payments",
      "Reports",
    ],
  },
  {
    title: "Support",
    items: ["Help & Feedback", "Settings"],
  },
];

export default function Home() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const selectedModule = modules.find(
    (module) => module.name === activeModule
  );

  function openModule(name: string) {
    setActiveModule(name);
    setMobileMenu(false);
  }

  return (
    <div className="app-shell">
      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <div>
          <div className="brand-title">SMART GST</div>
          <div className="brand-subtitle">Business OS</div>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">GST</div>

          <div>
            <div className="brand-title">SMART GST</div>
            <div className="brand-subtitle">Business OS</div>
          </div>
        </div>

        <div className="sidebar-content">
          <button
            className={`nav-item ${
              activeModule === "Dashboard" ? "nav-active" : ""
            }`}
            onClick={() => openModule("Dashboard")}
          >
            <span>⌂</span>
            <span>Dashboard</span>
          </button>

          {categories.map((category) => (
            <div className="nav-group" key={category.title}>
              <div className="nav-group-title">{category.title}</div>

              {category.items.map((item) => (
                <button
                  key={item}
                  className={`nav-item ${
                    activeModule === item ? "nav-active" : ""
                  }`}
                  onClick={() => openModule(item)}
                >
                  <span>
                    {modules.find((module) => module.name === item)?.icon ||
                      "•"}
                  </span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="support-box">
            <div className="support-title">Need Help?</div>
            <div className="support-text">
              Report a problem or send your feedback.
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <div className="topbar-small">GST BILLING WORKSPACE</div>

            <h1>
              {activeModule === "Dashboard"
                ? "Business Dashboard"
                : activeModule}
            </h1>

            <p>
              {activeModule === "Dashboard"
                ? "Manage every GST business document from separate modules."
                : selectedModule?.description ||
                  "Dedicated workspace for this business feature."}
            </p>
          </div>

          <div className="topbar-actions">
            <button
              className="secondary-button"
              onClick={() => openModule("Help & Feedback")}
            >
              🆘 Help
            </button>

            <button
              className="primary-button"
              onClick={() => openModule("Tax Invoice")}
            >
              + Create Tax Invoice
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="content">
          {activeModule === "Dashboard" ? (
            <>
              {/* HERO */}
              <section className="hero-card">
                <div>
                  <div className="hero-label">SMART GST BUSINESS OS</div>

                  <h2>
                    हर GST काम के लिए
                    <br />
                    अलग और साफ़ workflow
                  </h2>

                  <p>
                    Tax Invoice, Credit Note, Debit Note, Delivery Challan,
                    Export, Purchase, E-Invoice और बाकी business workflows को
                    अलग-अलग modules में manage करने के लिए बनाया गया system।
                  </p>
                </div>

                <button
                  className="hero-button"
                  onClick={() => openModule("Tax Invoice")}
                >
                  Create First Invoice →
                </button>
              </section>

              {/* STATS */}
              <section className="stats-grid">
                <StatCard
                  title="Total Sales"
                  value="₹0.00"
                  text="This month"
                  icon="₹"
                />

                <StatCard
                  title="GST Payable"
                  value="₹0.00"
                  text="Current period"
                  icon="GST"
                />

                <StatCard
                  title="Outstanding"
                  value="₹0.00"
                  text="Receivables"
                  icon="₹"
                />

                <StatCard
                  title="Documents"
                  value="0"
                  text="Created"
                  icon="#"
                />
              </section>

              {/* DOCUMENT CREATION */}
              <section>
                <div className="section-heading">
                  <div>
                    <h3>What do you want to create?</h3>
                    <p>सीधे वही document चुनें जिसकी आपको जरूरत है।</p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => openModule("Tax Invoice")}
                  >
                    Open workspace →
                  </button>
                </div>

                <div className="document-grid">
                  {modules.slice(0, 8).map((module) => (
                    <button
                      key={module.name}
                      className="document-card"
                      onClick={() => openModule(module.name)}
                    >
                      <div className="document-icon">{module.icon}</div>

                      <div className="document-name">{module.name}</div>

                      <div className="document-description">
                        {module.description}
                      </div>

                      <div className="document-arrow">→</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* COMPLETE MODULES */}
              <section>
                <div className="section-heading">
                  <div>
                    <h3>All Business Modules</h3>
                    <p>
                      हर feature का अपना अलग page और workflow रहेगा।
                    </p>
                  </div>
                </div>

                <div className="all-modules">
                  {modules.map((module) => (
                    <button
                      key={module.name}
                      className="module-row"
                      onClick={() => openModule(module.name)}
                    >
                      <div className="module-row-icon">{module.icon}</div>

                      <div className="module-row-text">
                        <div className="module-row-name">
                          {module.name}
                        </div>

                        <div className="module-row-description">
                          {module.description}
                        </div>
                      </div>

                      <div className="module-row-arrow">›</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* ARCHITECTURE */}
              <section className="architecture-card">
                <div className="architecture-icon">🛡️</div>

                <div>
                  <h3>Built on one common GST engine</h3>

                  <p>
                    User interface में सभी काम अलग रहेंगे, लेकिन calculation,
                    customer data, products, GST rules, documents और reports
                    एक मजबूत common engine से connected होंगे।
                  </p>
                </div>
              </section>
            </>
          ) : (
            <ModuleWorkspace
              moduleName={activeModule}
              description={
                selectedModule?.description ||
                "Dedicated workspace for this module."
              }
            />
          )}
        </div>
      </main>

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #f4f7fb;
          color: #122033;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button {
          font: inherit;
        }

        .app-shell {
          min-height: 100vh;
          background: #f4f7fb;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 270px;
          background: #071b35;
          color: #fff;
          z-index: 100;
          display: flex;
          flex-direction: column;
        }

        .sidebar-brand {
          height: 82px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .brand-logo {
          width: 43px;
          height: 43px;
          border-radius: 13px;
          background: linear-gradient(135deg, #1e7aff, #0754cc);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .brand-title {
          font-weight: 900;
          letter-spacing: 0.5px;
          font-size: 16px;
        }

        .brand-subtitle {
          margin-top: 2px;
          color: #9fb0c6;
          font-size: 11px;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 14px 11px 20px;
        }

        .nav-group {
          margin-top: 17px;
        }

        .nav-group-title {
          color: #70859f;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
          padding: 0 11px 7px;
          text-transform: uppercase;
        }

        .nav-item {
          width: 100%;
          border: 0;
          background: transparent;
          color: #b6c4d5;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 38px;
          padding: 8px 11px;
          border-radius: 10px;
          text-align: left;
          cursor: pointer;
          font-size: 12px;
          transition: 0.18s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .nav-active {
          background: #146ef5 !important;
          color: #fff !important;
          box-shadow: 0 7px 18px rgba(20, 110, 245, 0.22);
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .support-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 13px;
          padding: 13px;
        }

        .support-title {
          font-size: 12px;
          font-weight: 800;
        }

        .support-text {
          margin-top: 4px;
          color: #91a4bc;
          font-size: 10px;
          line-height: 1.5;
        }

        .main-area {
          margin-left: 270px;
          min-height: 100vh;
        }

        .topbar {
          min-height: 95px;
          background: #fff;
          border-bottom: 1px solid #e3e9f1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px 32px;
        }

        .topbar-small {
          color: #126bf2;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .topbar h1 {
          margin: 5px 0 0;
          font-size: 25px;
          line-height: 1.2;
          letter-spacing: -0.6px;
        }

        .topbar p {
          margin: 5px 0 0;
          color: #728198;
          font-size: 12px;
        }

        .topbar-actions {
          display: flex;
          gap: 10px;
        }

        .primary-button,
        .secondary-button,
        .hero-button,
        .text-button {
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 800;
        }

        .primary-button {
          background: #146ef5;
          color: #fff;
          padding: 11px 16px;
          box-shadow: 0 7px 18px rgba(20, 110, 245, 0.18);
        }

        .secondary-button {
          background: #f6f8fb;
          color: #26364c;
          padding: 11px 15px;
          border: 1px solid #e0e6ef;
        }

        .content {
          max-width: 1500px;
          margin: 0 auto;
          padding: 28px 32px 50px;
        }

        .hero-card {
          border-radius: 20px;
          background: linear-gradient(135deg, #0d284c, #0d4fa7);
          color: #fff;
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          box-shadow: 0 18px 35px rgba(9, 42, 83, 0.14);
        }

        .hero-label {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.7px;
          opacity: 0.72;
        }

        .hero-card h2 {
          margin: 9px 0;
          font-size: 31px;
          line-height: 1.15;
          letter-spacing: -0.8px;
        }

        .hero-card p {
          max-width: 700px;
          color: rgba(255, 255, 255, 0.76);
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
        }

        .hero-button {
          flex-shrink: 0;
          background: #fff;
          color: #0b55b7;
          padding: 13px 17px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin: 20px 0 30px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #e3e9f1;
          border-radius: 16px;
          padding: 19px;
        }

        .stat-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: start;
        }

        .stat-title {
          font-size: 11px;
          color: #718096;
          font-weight: 700;
        }

        .stat-value {
          margin-top: 7px;
          font-size: 23px;
          font-weight: 900;
        }

        .stat-text {
          margin-top: 10px;
          font-size: 10px;
          color: #98a5b7;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #eaf2ff;
          color: #146ef5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 11px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          margin: 28px 0 13px;
        }

        .section-heading h3 {
          margin: 0;
          font-size: 18px;
        }

        .section-heading p {
          margin: 4px 0 0;
          color: #77869a;
          font-size: 11px;
        }

        .text-button {
          background: transparent;
          color: #126bf2;
          padding: 7px;
          font-size: 11px;
        }

        .document-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .document-card {
          position: relative;
          border: 1px solid #e3e9f1;
          background: #fff;
          border-radius: 16px;
          padding: 17px;
          min-height: 150px;
          text-align: left;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .document-card:hover {
          transform: translateY(-2px);
          border-color: #9dc2ff;
          box-shadow: 0 10px 22px rgba(22, 75, 145, 0.08);
        }

        .document-icon {
          width: 39px;
          height: 39px;
          border-radius: 11px;
          background: #eff5ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .document-name {
          margin-top: 15px;
          font-size: 13px;
          font-weight: 900;
          color: #15253b;
        }

        .document-description {
          margin-top: 4px;
          color: #7a8799;
          font-size: 10px;
          line-height: 1.5;
        }

        .document-arrow {
          position: absolute;
          right: 15px;
          top: 15px;
          color: #a1afc0;
        }

        .all-modules {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .module-row {
          display: flex;
          align-items: center;
          gap: 11px;
          background: #fff;
          border: 1px solid #e3e9f1;
          border-radius: 13px;
          padding: 12px;
          text-align: left;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .module-row:hover {
          border-color: #a9caff;
          background: #fbfdff;
        }

        .module-row-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #f0f5ff;
          font-size: 15px;
          flex-shrink: 0;
        }

        .module-row-text {
          flex: 1;
          min-width: 0;
        }

        .module-row-name {
          font-size: 11px;
          font-weight: 900;
        }

        .module-row-description {
          margin-top: 2px;
          font-size: 9px;
          color: #8491a3;
        }

        .module-row-arrow {
          color: #a3afbf;
          font-size: 18px;
        }

        .architecture-card {
          margin-top: 22px;
          background: #edf5ff;
          border: 1px solid #d7e8ff;
          border-radius: 16px;
          display: flex;
          align-items: start;
          gap: 13px;
          padding: 18px;
        }

        .architecture-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #146ef5;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .architecture-card h3 {
          margin: 0;
          font-size: 13px;
        }

        .architecture-card p {
          margin: 5px 0 0;
          color: #62738a;
          font-size: 11px;
          line-height: 1.6;
        }

        .module-workspace {
          background: #fff;
          border: 1px solid #e3e9f1;
          border-radius: 18px;
          padding: 26px;
        }

        .module-workspace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
        }

        .module-workspace-header h2 {
          margin: 0;
          font-size: 22px;
        }

        .module-workspace-header p {
          margin: 5px 0 0;
          color: #78879a;
          font-size: 11px;
        }

        .module-placeholder {
          min-height: 330px;
          border: 1px dashed #c9d5e4;
          border-radius: 15px;
          background: #f9fbfd;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 30px;
        }

        .module-placeholder-inner {
          max-width: 550px;
        }

        .module-placeholder-icon {
          font-size: 40px;
        }

        .module-placeholder h3 {
          margin: 14px 0 7px;
          font-size: 18px;
        }

        .module-placeholder p {
          margin: 0;
          color: #7c8999;
          font-size: 11px;
          line-height: 1.7;
        }

        .mobile-header {
          display: none;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .document-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .all-modules {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .mobile-header {
            display: flex;
            position: sticky;
            top: 0;
            z-index: 90;
            height: 64px;
            background: #fff;
            border-bottom: 1px solid #e3e9f1;
            padding: 0 16px;
            align-items: center;
            justify-content: space-between;
          }

          .mobile-menu-button {
            width: 40px;
            height: 40px;
            border: 1px solid #dbe3ed;
            border-radius: 10px;
            background: #fff;
            cursor: pointer;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: 0.22s ease;
          }

          .sidebar-open {
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

          .hero-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-card h2 {
            font-size: 25px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .document-grid,
          .all-modules {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 500px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .hero-card {
            padding: 22px;
          }

          .topbar h1 {
            font-size: 21px;
          }
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------
   STAT CARD
------------------------------------------------------- */

function StatCard({
  title,
  value,
  text,
  icon,
}: {
  title: string;
  value: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
        </div>

        <div className="stat-icon">{icon}</div>
      </div>

      <div className="stat-text">{text}</div>
    </div>
  );
}

/* -------------------------------------------------------
   MODULE WORKSPACE
------------------------------------------------------- */

function ModuleWorkspace({
  moduleName,
  description,
}: {
  moduleName: string;
  description: string;
}) {
  const module = modules.find((item) => item.name === moduleName);

  return (
    <section className="module-workspace">
      <div className="module-workspace-header">
        <div>
          <h2>
            {module?.icon} {moduleName}
          </h2>

          <p>{description}</p>
        </div>

        <div
          style={{
            padding: "7px 10px",
            borderRadius: 8,
            background: "#eef5ff",
            color: "#146ef5",
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          DEDICATED MODULE
        </div>
      </div>

      <div className="module-placeholder">
        <div className="module-placeholder-inner">
          <div className="module-placeholder-icon">
            {module?.icon || "📄"}
          </div>

          <h3>{moduleName} Workspace</h3>

          <p>
            यह module बाकी documents से अलग रहेगा। इसका अपना form, validation,
            GST logic, data handling, preview और output workflow बनाया जाएगा।
            अभी हम foundation तैयार कर रहे हैं ताकि आगे जोड़ने वाले features
            आपस में गड़बड़ न हों।
          </p>
        </div>
      </div>
    </section>
  );
}
