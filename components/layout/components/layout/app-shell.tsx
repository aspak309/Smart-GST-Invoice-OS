"use client";

// components/layout/app-shell.tsx

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

/* =====================================================
   TYPES
===================================================== */

interface AppShellProps {
  children: ReactNode;
}

/* =====================================================
   APP SHELL
===================================================== */

export function AppShell({
  children,
}: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /* ================================================
     LOCK BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN
  ================================================= */

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  /* ================================================
     CLOSE SIDEBAR ON DESKTOP RESIZE
  ================================================= */

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
      "
    >
      {/* =============================================
          SIDEBAR
      ============================================= */}

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* =============================================
          HEADER
      ============================================= */}

      <Header
        onMenuClick={() =>
          setMobileSidebarOpen(true)
        }
      />

      {/* =============================================
          MAIN CONTENT
      ============================================= */}

      <main
        className="
          min-h-screen
          pt-[72px]

          lg:ml-[280px]
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-4 py-5

            sm:px-6
            sm:py-6

            lg:px-8
            lg:py-8
          "
        >
          {children}
        </div>
      </main>
    </div>
  );
}

/* =====================================================
   PAGE CONTAINER
===================================================== */

/**
 * Optional reusable page wrapper.
 *
 * Usage:
 *
 * <PageContainer>
 *   <YourContent />
 * </PageContainer>
 */
export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        mx-auto w-full max-w-[1600px]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
