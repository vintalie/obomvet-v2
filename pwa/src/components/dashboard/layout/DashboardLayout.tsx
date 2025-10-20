import { ReactNode } from "react";
import DashboardTopbar from "./DashboardTopbar";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function DashboardLayout({ sidebar, children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <DashboardTopbar />
      <div className="flex flex-1">
        <DashboardSidebar>{sidebar}</DashboardSidebar>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
