// app/(dashboard)/layout.tsx

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/* =====================================================
   TYPES
===================================================== */

interface DashboardLayoutProps {
  children: ReactNode;
}

/* =====================================================
   DASHBOARD LAYOUT
===================================================== */

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
