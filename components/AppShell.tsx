"use client";

import { useState, type ReactNode } from "react";

export type AppModule = {
  id: string;
  title: string;
  description: string;
  icon: string;
  section: string;
};

type AppShellProps = {
  activeModuleId: string;
  onModuleChange: (moduleId: string) => void;
  children: ReactNode;
};

export const APP_MODULES: AppModule[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Complete business and GST overview",
    icon: "⌂",
    section: "MAIN",
  },

  {
    id: "tax-invoice",
    title: "Tax Invoice",
    description: "Create a GST tax invoice",
    icon: "▣",
    section: "SALES & INVOICES",
  },
  {
    id: "bill-of-supply",
    title: "Bill of Supply",
    description: "Create a bill of supply",
    icon: "▤",
    section: "SALES & INVOICES",
  },
  {
    id: "export-invoice",
    title: "Export Invoice",
    description: "Create an export invoice",
    icon: "◎",
    section: "SALES & INVOICES",
  },
  {
    id: "sez-invoice",
    title: "SEZ Invoice",
    description: "Create an SEZ supply invoice",
    icon: "◇",
    section: "SALES & INVOICES",
  },

  {
    id: "credit-note",
    title: "Credit Note",
    description: "Create and manage credit notes",
    icon: "↙",
    section: "ADJUSTMENTS",
  },
  {
    id: "debit-note",
    title: "Debit Note",
    description: "Create and manage debit notes",
    icon: "↗",
    section: "ADJUSTMENTS",
  },
  {
    id: "revised-invoice",
    title: "Revised Invoice",
    description: "Create a revised invoice",
    icon: "⟳",
    section: "ADJUSTMENTS",
  },

  {
    id: "delivery-challan",
    title: "Delivery Challan",
    description: "Manage goods movement documents",
    icon: "▱",
    section: "GOODS MOVEMENT",
  },
  {
    id: "stock-transfer",
    title: "Stock Transfer",
    description: "Transfer goods between locations",
    icon: "⇄",
    section: "GOODS MOVEMENT",
  },
  {
    id: "job-work",
    title: "Job Work",
    description: "Manage job work movement",
    icon: "⚒",
    section: "GOODS MOVEMENT",
  },
  {
    id: "e-way-bill",
    title: "E-Way Bill",
    description: "Prepare and manage E-Way Bill workflows",
    icon: "▰",
    section: "GOODS MOVEMENT",
  },

  {
    id: "purchase-invoice",
    title: "Purchase Invoice",
    description: "Record purchase transactions",
    icon: "□",
    section: "PURCHASE",
  },
  {
    id: "import-goods",
    title: "Import of Goods",
    description: "Manage imported goods transactions",
    icon: "⇣",
    section: "PURCHASE",
  },
  {
    id: "import-services",
    title: "Import of Services",
    description: "Manage imported service transactions",
    icon: "◫",
    section: "PURCHASE",
  },
  {
    id: "supplier-credit-note",
    title: "Supplier Credit Note",
    description: "Manage supplier credit adjustments",
    icon: "←",
    section: "PURCHASE",
  },
  {
    id: "supplier-debit-note",
    title: "Supplier Debit Note",
    description: "Manage supplier debit adjustments",
    icon: "→",
    section: "PURCHASE",
  },

  {
    id: "e-invoice",
    title: "E-Invoice",
    description: "Manage e-invoice and IRN workflow",
    icon: "✓",
    section: "GST & COMPLIANCE",
  },
  {
    id: "reverse-charge",
    title: "Reverse Charge",
    description: "Manage reverse charge transactions",
    icon: "↻",
    section: "GST & COMPLIANCE",
  },
  {
    id: "gst-validation",
    title: "GST Validation",
    description: "Validate GST information and documents",
    icon: "◇",
    section: "GST & COMPLIANCE",
  },

  {
    id: "customers",
    title: "Customers",
    description: "Manage customer records",
    icon: "◉",
    section: "BUSINESS",
  },
  {
    id: "suppliers",
    title: "Suppliers",
    description: "Manage supplier records",
    icon: "○",
    section: "BUSINESS",
  },
  {
    id: "products",
    title: "Products & Services",
    description: "Manage products and services",
    icon: "□",
    section: "BUSINESS",
  },
  {
    id: "payments",
    title: "Payments",
    description: "Manage payments and collections",
    icon: "₹",
    section: "BUSINESS",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Business and GST reports",
    icon: "▥",
    section: "BUSINESS",
  },

  {
    id: "support",
    title: "Help & Feedback",
    description: "Report problems and request updates",
    icon: "?",
    section: "SUPPORT",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Business and application settings",
    icon: "⚙",
    section: "SUPPORT",
  },
];

const SECTION_ORDER = [
  "MAIN",
  "SALES & INVOICES",
  "ADJUSTMENTS",
  "GOODS MOVEMENT",
  "PURCHASE",
  "GST & COMPLIANCE",
  "BUSINESS",
  "SUPPORT",
];

export default function AppShell({
  activeModuleId,
  onModuleChange,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeModule =
    APP_MODULES.find(
      (module) => module.id === activeModuleId
    ) ?? APP_MODULES[0];

  function changeModule(moduleId: string) {
    onModuleChange(moduleId);
    setMobileOpen(false);
  }

  return (
    <div className="app-shell">
      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <div className="mobile-brand-logo">
            GST
          </div>

          <div>
            <strong>SMART GST</strong>
            <span>Business OS</span>
          </div>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() =>
            setMobileOpen((current) => !current)
          }
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "×" : "☰"}
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`app-sidebar ${
          mobileOpen ? "open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            GST
          </div>

          <div>
            <div className="sidebar-title">
              SMART GST
            </div>

            <div className="sidebar-subtitle">
              BUSINESS OPERATING SYSTEM
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SECTION_ORDER.map((section) => {
            const sectionItems = APP_MODULES.filter(
              (module) =>
                module.section === section
            );

            if (!sectionItems.length) {
              return null;
            }

            return (
              <div
                className="sidebar-section"
                key={section}
              >
                <div className="sidebar-section-title">
                  {section}
                </div>

                <div className="sidebar-items">
                  {sectionItems.map((module) => {
                    const active =
                      module.id === activeModuleId;

                    return (
                      <button
                        key={module.id}
                        className={`sidebar-item ${
                          active ? "active" : ""
                        }`}
                        onClick={() =>
                          changeModule(module.id)
                        }
                      >
                        <span className="sidebar-item-icon">
                          {module.icon}
                        </span>

                        <span className="sidebar-item-title">
                          {module.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-system-status">
            <span className="status-dot" />

            <div>
              <strong>System Ready</strong>
              <small>Smart GST Workspace</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <section className="app-main">
        {/* TOP BAR */}
        <header className="app-topbar">
          <div className="topbar-page-info">
            <div className="topbar-kicker">
              SMART GST WORKSPACE
            </div>

            <div className="topbar-title">
              {activeModule.title}
            </div>

            <div className="topbar-description">
              {activeModule.description}
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="topbar-help-button"
              onClick={() =>
                changeModule("support")
              }
            >
              ?
              <span>Help & Feedback</span>
            </button>

            <div className="topbar-profile">
              <div className="profile-avatar">
                A
              </div>

              <div className="profile-info">
                <strong>Admin</strong>
                <span>Workspace Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="app-content">
          {children}
        </div>
      </section>

      <style jsx>{`
        .app-shell {
          min-height: 100vh;
          width: 100%;
          background: var(--background);
        }

        /* ================================================
           SIDEBAR
        ================================================ */

        .app-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 272px;
          z-index: 100;
          display: flex;
          flex-direction: column;
          background: var(--sidebar-bg);
          color: white;
          border-right: 1px solid
            rgba(255, 255, 255, 0.05);
          transition: transform 0.25s ease;
        }

        .sidebar-brand {
          height: 82px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
        }

        .sidebar-logo {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: linear-gradient(
            135deg,
            #257cff,
            #0c56c9
          );
          color: white;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.7px;
          box-shadow:
            0 8px 22px
            rgba(20, 110, 245, 0.22);
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.3px;
        }

        .sidebar-subtitle {
          margin-top: 3px;
          color: #8ea3be;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 15px 10px 20px;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #2a3c54;
          border-radius: 10px;
        }

        .sidebar-section {
          margin-bottom: 18px;
        }

        .sidebar-section-title {
          padding: 0 11px 7px;
          color: #6f849e;
          font-size: 8px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .sidebar-items {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-item {
          width: 100%;
          min-height: 38px;
          padding: 8px 11px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #b8c5d6;
          text-align: left;
          font-size: 11px;
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }

        .sidebar-item:hover {
          background: var(--sidebar-hover);
          color: white;
        }

        .sidebar-item.active {
          background: var(--sidebar-active);
          color: white;
          box-shadow:
            inset 3px 0 0 #3c8cff,
            0 6px 15px
            rgba(4, 18, 38, 0.12);
        }

        .sidebar-item-icon {
          width: 20px;
          flex-shrink: 0;
          text-align: center;
          font-size: 14px;
        }

        .sidebar-item-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar-bottom {
          padding: 12px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.07);
        }

        .sidebar-system-status {
          min-height: 48px;
          padding: 9px 10px;
          border: 1px solid
            rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.035);
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .sidebar-system-status strong {
          display: block;
          color: #dbe5f1;
          font-size: 10px;
          font-weight: 800;
        }

        .sidebar-system-status small {
          display: block;
          margin-top: 3px;
          color: #8093ab;
          font-size: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #22bb72;
          box-shadow:
            0 0 0 4px
            rgba(34, 187, 114, 0.08);
        }

        /* ================================================
           MAIN
        ================================================ */

        .app-main {
          min-height: 100vh;
          margin-left: 272px;
        }

        .app-topbar {
          min-height: 92px;
          padding: 17px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: white;
          border-bottom: 1px solid var(--border);
        }

        .topbar-page-info {
          min-width: 0;
        }

        .topbar-kicker {
          color: var(--primary);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .topbar-title {
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-primary);
          font-size: 24px;
          line-height: 1.1;
          font-weight: 850;
          letter-spacing: -0.5px;
        }

        .topbar-description {
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-secondary);
          font-size: 11px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 17px;
          flex-shrink: 0;
        }

        .topbar-help-button {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: white;
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 800;
        }

        .topbar-help-button:hover {
          background: #f8fafc;
          border-color: var(--border-dark);
          color: var(--text-primary);
        }

        .topbar-profile {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .profile-avatar {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf2ff;
          color: var(--primary-dark);
          font-size: 11px;
          font-weight: 900;
        }

        .profile-info strong {
          display: block;
          color: var(--text-primary);
          font-size: 10px;
        }

        .profile-info span {
          display: block;
          margin-top: 2px;
          color: var(--text-muted);
          font-size: 8px;
        }

        .app-content {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 26px 30px 45px;
        }

        /* ================================================
           MOBILE
        ================================================ */

        .mobile-header {
          display: none;
        }

        .mobile-overlay {
          display: none;
        }

        @media (max-width: 820px) {
          .mobile-header {
            height: 64px;
            padding: 0 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 90;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .mobile-brand-logo {
            width: 35px;
            height: 35px;
            border-radius: 10px;
            background: var(--primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            font-weight: 900;
          }

          .mobile-brand strong {
            display: block;
            font-size: 12px;
            font-weight: 900;
          }

          .mobile-brand span {
            display: block;
            margin-top: 2px;
            color: var(--text-muted);
            font-size: 8px;
          }

          .mobile-menu-button {
            width: 39px;
            height: 39px;
            border: 1px solid var(--border);
            border-radius: 10px;
            background: white;
            color: var(--text-primary);
            font-size: 18px;
          }

          .app-sidebar {
            transform: translateX(-100%);
            box-shadow:
              12px 0 35px
              rgba(7, 26, 51, 0.15);
          }

          .app-sidebar.open {
            transform: translateX(0);
          }

          .mobile-overlay {
            position: fixed;
            inset: 0;
            display: block;
            z-index: 95;
            border: 0;
            background: rgba(7, 18, 35, 0.28);
          }

          .app-main {
            margin-left: 0;
          }

          .app-topbar {
            min-height: 82px;
            padding: 15px 16px;
          }

          .topbar-help-button span,
          .profile-info {
            display: none;
          }

          .topbar-right {
            gap: 8px;
          }

          .app-content {
            padding: 18px 16px 35px;
          }
        }

        @media (max-width: 520px) {
          .topbar-title {
            font-size: 20px;
          }

          .topbar-description {
            max-width: 235px;
          }

          .topbar-help-button {
            display: none;
          }

          .app-content {
            padding: 15px 12px 30px;
          }
        }
      `}</style>
    </div>
  );
}
