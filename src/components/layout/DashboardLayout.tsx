"use client";

import { useState } from "react";
import { Menu, X, Home, BarChart3, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-primary">Lumora</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary">
            <Home className="w-5 h-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <BarChart3 className="w-5 h-5" /> Analytics
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="w-5 h-5" /> Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
            <button className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}