import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Menu } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8F5F0] text-[#1F2937]">
      {/* Sidebar - Desktop + Mobile */}
      <Sidebar 
        isMobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          onMobileMenuClick={() => setMobileOpen(true)} 
        />
        <main className="flex-1 p-4 md:p-6 overflow-x-auto bg-[#F8F5F0]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}