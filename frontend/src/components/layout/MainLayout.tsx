import { useState, ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-20" : "ml-20 lg:ml-[280px]"
        )}
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
