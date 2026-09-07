"use client";

// components/layout/header.tsx

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Search,
  FilePlus2,
  Users,
  Package,
  Receipt,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

/* =====================================================
   TYPES
===================================================== */

interface HeaderProps {
  onMenuClick?: () => void;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

/* =====================================================
   QUICK ACTIONS
===================================================== */

const quickActions: QuickAction[] = [
  {
    label: "Create Invoice",
    description: "Create a new GST invoice",
    href: "/sales/invoices/new",
    icon: <FilePlus2 size={18} />,
  },
  {
    label: "Add Customer",
    description: "Add a new customer",
    href: "/customers/new",
    icon: <Users size={18} />,
  },
  {
    label: "Add Product",
    description: "Add product or service",
    href: "/products/new",
    icon: <Package size={18} />,
  },
  {
    label: "Add Purchase",
    description: "Record a new purchase",
    href: "/purchases/new",
    icon: <Receipt size={18} />,
  },
];

/* =====================================================
   HEADER COMPONENT
===================================================== */

export function Header({
  onMenuClick,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchValue, setSearchValue] =
    useState("");

  const [quickMenuOpen, setQuickMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const quickMenuRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /* =====================================================
     CLOSE MENUS ON OUTSIDE CLICK
  ===================================================== */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target = event.target as Node;

      if (
        quickMenuRef.current &&
        !quickMenuRef.current.contains(target)
      ) {
        setQuickMenuOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =====================================================
     ESC KEY
  ===================================================== */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setQuickMenuOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <>
      <header
        className="
          fixed left-0 right-0 top-0 z-30
          h-[72px]
          border-b border-slate-200
          bg-white/95
          backdrop-blur
          lg:left-[280px]
        "
      >
        <div
          className="
            flex h-full
            items-center justify-between
            gap-3 px-4
            sm:px-6
          "
        >
          {/* =============================================
              LEFT AREA
          ============================================= */}

          <div className="flex items-center gap-3">
            {/* Mobile Menu */}

            <button
              type="button"
              onClick={onMenuClick}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-lg
                text-slate-600
                hover:bg-slate-100
                lg:hidden
              "
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            {/* Desktop Search */}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="
                hidden
                h-10 w-[280px]
                items-center
                gap-3
                rounded-lg
                border border-slate-200
                bg-slate-50
                px-3
                text-left
                text-sm text-slate-400
                transition-colors
                hover:border-slate-300
                hover:bg-white
                lg:flex
              "
            >
              <Search
                size={18}
                className="text-slate-400"
              />

              <span className="flex-1">
                Search anything...
              </span>

              <kbd
                className="
                  rounded border
                  border-slate-200
                  bg-white px-1.5 py-0.5
                  text-[10px]
                  text-slate-400
                "
              >
                ⌘ K
              </kbd>
            </button>

            {/* Mobile Search */}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-lg
                text-slate-600
                hover:bg-slate-100
                lg:hidden
              "
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* =============================================
              RIGHT AREA
          ============================================= */}

          <div className="flex items-center gap-2">
            {/* Quick Create */}

            <div
              ref={quickMenuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setQuickMenuOpen(
                    (previous) => !previous
                  )
                }
                className="
                  flex h-10 items-center
                  gap-2 rounded-lg
                  bg-blue-600 px-3
                  text-sm font-medium
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-blue-700
                  active:scale-[0.98]
                "
              >
                <Plus size={18} />

                <span className="hidden sm:block">
                  Create
                </span>

                <ChevronDown
                  size={15}
                  className="hidden sm:block"
                />
              </button>

              {quickMenuOpen && (
                <div
                  className="
                    absolute right-0 top-[calc(100%+10px)]
                    w-[280px]
                    overflow-hidden
                    rounded-xl
                    border border-slate-200
                    bg-white
                    p-2
                    shadow-xl
                  "
                >
                  <p
                    className="
                      px-3 pb-2 pt-1
                      text-[10px]
                      font-semibold
                      tracking-wider
                      text-slate-400
                    "
                  >
                    QUICK CREATE
                  </p>

                  {quickActions.map(
                    (action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={() =>
                          setQuickMenuOpen(false)
                        }
                        className="
                          flex items-center gap-3
                          rounded-lg p-3
                          transition-colors
                          hover:bg-slate-50
                        "
                      >
                        <span
                          className="
                            flex h-9 w-9
                            items-center justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                          "
                        >
                          {action.icon}
                        </span>

                        <span className="min-w-0">
                          <span
                            className="
                              block text-sm
                              font-medium text-slate-800
                            "
                          >
                            {action.label}
                          </span>

                          <span
                            className="
                              block truncate
                              text-xs text-slate-500
                            "
                          >
                            {action.description}
                          </span>
                        </span>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}

            <button
              type="button"
              className="
                relative
                flex h-10 w-10
                items-center justify-center
                rounded-lg
                text-slate-500
                transition-colors
                hover:bg-slate-100
                hover:text-slate-800
              "
              aria-label="Notifications"
            >
              <Bell size={20} />

              <span
                className="
                  absolute right-2 top-2
                  h-2 w-2
                  rounded-full
                  border-2 border-white
                  bg-red-500
                "
              />
            </button>

            {/* Profile */}

            <div
              ref={profileRef}
              className="
                relative ml-1
              "
            >
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (previous) => !previous
                  )
                }
                className="
                  flex items-center gap-2
                  rounded-lg p-1
                  transition-colors
                  hover:bg-slate-100
                "
              >
                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    bg-slate-900
                    text-sm font-semibold
                    text-white
                  "
                >
                  A
                </div>

                <div
                  className="
                    hidden text-left
                    xl:block
                  "
                >
                  <p
                    className="
                      max-w-[120px]
                      truncate text-sm
                      font-semibold text-slate-800
                    "
                  >
                    Your Business
                  </p>

                  <p
                    className="
                      text-[11px]
                      text-slate-500
                    "
                  >
                    Business Owner
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className="
                    hidden text-slate-400
                    xl:block
                  "
                />
              </button>

              {profileOpen && (
                <div
                  className="
                    absolute right-0 top-[calc(100%+10px)]
                    w-[220px]
                    overflow-hidden
                    rounded-xl
                    border border-slate-200
                    bg-white
                    p-2
                    shadow-xl
                  "
                >
                  <div
                    className="
                      border-b border-slate-100
                      px-3 py-3
                    "
                  >
                    <p
                      className="
                        text-sm font-semibold
                        text-slate-800
                      "
                    >
                      Your Business
                    </p>

                    <p
                      className="
                        mt-1 text-xs
                        text-slate-500
                      "
                    >
                      Manage your GST account
                    </p>
                  </div>

                  <div className="mt-2">
                    <Link
                      href="/settings"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        block rounded-lg px-3 py-2.5
                        text-sm text-slate-600
                        hover:bg-slate-50
                        hover:text-slate-900
                      "
                    >
                      Business Settings
                    </Link>

                    <Link
                      href="/support"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        block rounded-lg px-3 py-2.5
                        text-sm text-slate-600
                        hover:bg-slate-50
                        hover:text-slate-900
                      "
                    >
                      Help & Support
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          SEARCH MODAL
      ================================================= */}

      {searchOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-start
            justify-center
            bg-slate-950/40
            px-4 pt-24
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full max-w-2xl
              overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-2xl
            "
          >
            {/* Search Input */}

            <div
              className="
                flex items-center gap-3
                border-b border-slate-200
                px-4
              "
            >
              <Search
                size={21}
                className="text-slate-400"
              />

              <input
                autoFocus
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(
                    event.target.value
                  )
                }
                placeholder="Search invoices, customers, products..."
                className="
                  h-14 flex-1
                  border-none
                  bg-transparent
                  text-sm
                  text-slate-800
                  outline-none
                  placeholder:text-slate-400
                "
              />

              <button
                type="button"
                onClick={() =>
                  setSearchOpen(false)
                }
                className="
                  rounded-md
                  border border-slate-200
                  px-2 py-1
                  text-xs text-slate-500
                  hover:bg-slate-50
                "
              >
                ESC
              </button>
            </div>

            {/* Search Content */}

            <div
              className="
                max-h-[360px]
                overflow-y-auto
                p-4
              "
            >
              {!searchValue ? (
                <div className="py-10 text-center">
                  <Search
                    size={32}
                    className="
                      mx-auto mb-3
                      text-slate-300
                    "
                  />

                  <p
                    className="
                      text-sm font-medium
                      text-slate-600
                    "
                  >
                    Search your business data
                  </p>

                  <p
                    className="
                      mt-1 text-xs
                      text-slate-400
                    "
                  >
                    Find invoices, customers,
                    products and more
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p
                    className="
                      text-sm text-slate-500
                    "
                  >
                    Search functionality will connect
                    to your business data here.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}

            <div
              className="
                flex items-center
                justify-between
                border-t border-slate-100
                bg-slate-50
                px-4 py-3
                text-xs text-slate-400
              "
            >
              <span>
                Search across Smart GST
              </span>

              <span>
                Press ESC to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
    }
