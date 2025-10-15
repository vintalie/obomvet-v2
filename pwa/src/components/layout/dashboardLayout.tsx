import Sidebar from "./sidebar";
import Header from "./header";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  tipo: "tutor" | "clinica";
  children: ReactNode;
}

export default function DashboardLayout({ tipo, children }: DashboardLayoutProps) {
  return (
    <div className="h-screen items-center content-center flex flex-col">
      <Header />
      <div className="flex w-[80%] my-14 h-[60vh] bg-white rounded-2xl shadow-2xl">
        <Sidebar tipo={tipo} />
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
