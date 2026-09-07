"use client";

// components/layout/sidebar.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  UserRound,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  MessageSquareMore,
  ChevronDown,
  Calculator,
  FilePlus2,
  Truck,
  ClipboardList,
  Wallet,
  X,
  PanelLeftClose,
} from "lucide-react";

import {
  useState,
  type ReactNode,
} from "react";

/* =====================================================
   TYPES
===================================================== */

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface NavGroup {
  label: string;
  icon: ReactNode;
  items: NavItem[];
}

/* =====================================================
   NAVIGATION DATA
===================================================== */

const mainNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
];

const documentNavigation: NavGroup[] = [
  {
    label: "Sales",
    icon: <FileText size={20} />,
    items: [
      {
        label: "All Invoices",
        href: "/sales/invoices",
        icon: <Receipt size={18} />,
      },
      {
        label: "Create Invoice",
        href: "/sales/invoices/new",
        icon: <FilePlus2 size={18} />,
      },
      {
        label: "Credit Notes",
        href: "/sales/credit-notes",
        icon: <FileText size={18} />,
      },
      {
        label: "Debit Notes",
        href: "/sales/debit-notes",
        icon: <FilePlus2 size={18} />,
      },
      {
        label: "Delivery Challans",
        href: "/sales/delivery-challans",
        icon: <Truck size={18} />,
      },
    ],
  },
  {
    label: "Purchases",
    icon: <ShoppingCart size={20} />,
    items: [
      {
        label: "All Purchases",
        href: "/purchases",
        icon: <ClipboardList size={18} />,
      },
      {
        label: "Add Purchase",
        href: "/purchases/new",
        icon: <FilePlus2 size={18} />,
      },
    ],
  },
];

const businessNavigation: NavGroup[] = [
  {
    label: "Parties",
    icon: <Users size={20} />,
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: <UserRound size={18} />,
      },
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: <Users size={18} />,
      },
    ],
  },
  {
    label: "Products",
    icon: <Package size={20} />,
    items: [
      {
        label: "Products & Services",
        href: "/products",
        icon: <Package size={18} />,
      },
    ],
  },
  {
    label: "Payments",
    icon: <Wallet size={20} />,
    items: [
      {
        label: "All Payments",
        href: "/payments",
        icon: <CreditCard size={18} />,
      },
      {
        label: "Receivables",
        href: "/payments/receivables",
        icon: <Wallet size={18} />,
      },
      {
        label: "Payables",
        href: "/payments/payables",
        icon: <Wallet size={18} />,
      },
    ],
  },
];

const reportNavigation: NavGroup[] = [
  {
    label: "Reports",
    icon: <BarChart3 size={20} />,
    items: [
      {
        label: "Sales Report",
        href: "/reports/sales",
        icon: <BarChart3 size={18} />,
      },
      {
        label: "Purchase Report",
        href: "/reports/purchases",
        icon: <BarChart3 size={18} />,
      },
      {
        label: "GST Summary",
        href: "/reports/gst",
        icon: <Calculator size={18} />,
      },
    ],
  },
];

const bottomNavigation: NavItem[] = [
  {
    label: "Support & Feedback",
    href: "/support",
    icon: <MessageSquareMore size={20} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={20} />,
  },
];

/* =====================================================
   COMPONENT
===================================================== */

export function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>({
      Sales: true,
      Purchases: false,
      Parties: false,
      Products: false,
      Payments: false,
      Reports: false,
    });

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    if (href === "/sales/invoices") {
      return (
        pathname === "/sales/invoices" ||
        pathname.startsWith("/sales/invoices/")
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) =>
      isActive(item.href)
    );
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((previous) => ({
      ...previous,
      [label]: !previous[label],
    }));
  };

  const handleNavigation = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="
            fixed inset-0 z-40
            bg-black/50
            lg:hidden
          "
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-[280px]
          flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-300

          lg:translate-x-0

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="
          flex h-[72px]
          items-center
          justify-between
          border-b border-slate-100
          px-5
        ">
          <Link
            href="/dashboard"
            onClick={handleNavigation}
            className="
              flex items-center gap-3
            "
          >
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-blue-600
                text-lg font-bold text-white
                shadow-sm
              "
            >
              GST
            </div>

            <div>
              <h1
                className="
                  text-[17px]
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Smart GST
              </h1>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Business made simple
              </p>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="
              rounded-lg p-2
              text-slate-500
              hover:bg-slate-100
              lg:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className="
            flex-1 overflow-y-auto
            px-3 py-5
          "
        >
          {/* MAIN */}

          <NavigationLabel>
            OVERVIEW
          </NavigationLabel>

          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                onClick={handleNavigation}
              />
            ))}
          </div>

          {/* DOCUMENTS */}

          <NavigationLabel>
            TRANSACTIONS
          </NavigationLabel>

          <div className="space-y-1">
            {documentNavigation.map((group) => (
              <SidebarGroup
                key={group.label}
                group={group}
                isOpen={
                  openGroups[group.label] ??
                  isGroupActive(group)
                }
                active={isGroupActive(group)}
                pathname={pathname}
                onToggle={() =>
                  toggleGroup(group.label)
                }
                onNavigate={handleNavigation}
              />
            ))}
          </div>

          {/* BUSINESS */}

          <NavigationLabel>
            BUSINESS
          </NavigationLabel>

          <div className="space-y-1">
            {businessNavigation.map((group) => (
              <SidebarGroup
                key={group.label}
                group={group}
                isOpen={
                  openGroups[group.label] ??
                  isGroupActive(group)
                }
                active={isGroupActive(group)}
                pathname={pathname}
                onToggle={() =>
                  toggleGroup(group.label)
                }
                onNavigate={handleNavigation}
              />
            ))}
          </div>

          {/* REPORTS */}

          <NavigationLabel>
            ANALYTICS
          </NavigationLabel>

          <div className="space-y-1">
            {reportNavigation.map((group) => (
              <SidebarGroup
                key={group.label}
                group={group}
                isOpen={
                  openGroups[group.label] ??
                  isGroupActive(group)
                }
                active={isGroupActive(group)}
                pathname={pathname}
                onToggle={() =>
                  toggleGroup(group.label)
                }
                onNavigate={handleNavigation}
              />
            ))}
          </div>
        </nav>

        {/* =================================================
            BOTTOM NAVIGATION
        ================================================= */}

        <div
          className="
            border-t border-slate-100
            p-3
          "
        >
          <div className="space-y-1">
            {bottomNavigation.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                onClick={handleNavigation}
              />
            ))}
          </div>

          {/* Business Profile Mini Card */}

          <div
            className="
              mt-3
              rounded-xl
              border border-slate-200
              bg-slate-50
              p-3
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-9 w-9
                  shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-slate-900
                  text-sm font-semibold
                  text-white
                "
              >
                B
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate text-sm
                    font-semibold text-slate-800
                  "
                >
                  Your Business
                </p>

                <p
                  className="
                    truncate text-xs
                    text-slate-500
                  "
                >
                  GST Business Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =====================================================
   NAVIGATION LABEL
===================================================== */

function NavigationLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p
      className="
        mb-2 mt-6 px-3
        text-[10px]
        font-semibold
        tracking-[0.12em]
        text-slate-400
      "
    >
      {children}
    </p>
  );
}

/* =====================================================
   SINGLE NAVIGATION LINK
===================================================== */

function SidebarLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center gap-3
        rounded-lg px-3 py-2.5
        text-sm font-medium
        transition-all duration-200

        ${
          active
            ? `
              bg-blue-50
              text-blue-700
            `
            : `
              text-slate-600
              hover:bg-slate-50
              hover:text-slate-900
            `
        }
      `}
    >
      <span
        className={`
          transition-colors
          ${
            active
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }
        `}
      >
        {item.icon}
      </span>

      <span>{item.label}</span>
    </Link>
  );
}

/* =====================================================
   COLLAPSIBLE NAVIGATION GROUP
===================================================== */

function SidebarGroup({
  group,
  isOpen,
  active,
  pathname,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  isOpen: boolean;
  active: boolean;
  pathname: string;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`
          flex w-full items-center
          justify-between
          rounded-lg px-3 py-2.5
          text-sm font-medium
          transition-all duration-200

          ${
            active
              ? "text-blue-700"
              : `
                text-slate-600
                hover:bg-slate-50
                hover:text-slate-900
              `
          }
        `}
      >
        <span className="flex items-center gap-3">
          <span
            className={
              active
                ? "text-blue-600"
                : "text-slate-400"
            }
          >
            {group.icon}
          </span>

          {group.label}
        </span>

        <ChevronDown
          size={16}
          className={`
            text-slate-400
            transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </button>

      {isOpen && (
        <div
          className="
            ml-5 mt-1
            space-y-1
            border-l border-slate-100
            pl-3
          "
        >
          {group.items.map((item) => {
            const itemActive =
              pathname === item.href ||
              (item.href !== "/" &&
                pathname.startsWith(
                  `${item.href}/`
                ));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`
                  flex items-center gap-2.5
                  rounded-lg px-3 py-2
                  text-sm transition-colors

                  ${
                    itemActive
                      ? `
                        bg-blue-50
                        font-medium
                        text-blue-700
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-50
                        hover:text-slate-800
                      `
                  }
                `}
              >
                <span
                  className={
                    itemActive
                      ? "text-blue-500"
                      : "text-slate-400"
                  }
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
