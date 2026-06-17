"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Home,
  FolderKanban,
  Dna,
  FileText,
  LayoutTemplate,
  Share2,
  Settings,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";

interface SidebarProps {
  name: string;
  email: string;
}

export function Sidebar({ name, email }: SidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const navItems = [
    { id: "overview", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "workspaces", label: "Projects", icon: FolderKanban, href: "/dashboard?tab=workspaces" },
    { id: "dna", label: "DNA Library", icon: Dna, href: "/dashboard?tab=dna" },
    { id: "research", label: "Research Library", icon: FileText, href: "/dashboard?tab=research" },
    { id: "templates", label: "Templates", icon: LayoutTemplate, href: "/dashboard?tab=templates" },
    { id: "exports", label: "Exports", icon: Share2, href: "/dashboard?tab=exports" },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard?tab=settings" },
  ];

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[#ebbbb4]/40 bg-white/60 backdrop-blur-md px-4 py-6 relative z-20">
        {/* Brand */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <Link href="/" className="text-xl font-extrabold tracking-tighter text-[#bc0100] font-display hover:opacity-90 transition-opacity">
            TubeBoost
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#fff0ee] text-[#bc0100] shadow-sm"
                    : "text-[#603e39] hover:bg-[#ffe9e6]/80 hover:text-[#bc0100]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#bc0100]" : "text-[#956d67]/60"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Credits Indicator */}
        <div className="mx-2 mb-4 p-3 bg-gradient-to-tr from-[#fff0ee] to-white rounded-xl border border-[#ebbbb4]/35 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#603e39]">
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#bc0100]" /> AI Credits</span>
            <span className="text-[#bc0100] font-extrabold">85 / 100</span>
          </div>
          <div className="w-full bg-[#fff8f6] h-1.5 rounded-full overflow-hidden border border-[#ebbbb4]/20">
            <div className="bg-gradient-to-r from-[#FF0000] to-[#FF6B00] w-[85%] h-full" />
          </div>
        </div>

        {/* User Card & Sign Out */}
        <div className="border-t border-[#ebbbb4]/30 pt-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0ee] border border-[#ebbbb4]/40">
              <User className="h-4 w-4 text-[#bc0100]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-[#2b1613]">{name}</p>
              <p className="text-xs text-[#603e39]/70 truncate">{email}</p>
            </div>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-[#603e39] hover:bg-red-50 hover:text-red-600 gap-3 text-sm font-bold cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="flex md:hidden h-14 items-center justify-between border-b border-[#ebbbb4]/40 bg-white/80 backdrop-blur-md px-4 relative z-20">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lg font-extrabold tracking-tighter text-[#bc0100] font-display">
            TubeBoost
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`p-2 rounded-lg transition-colors ${
                  isActive ? "text-[#bc0100] bg-[#fff0ee]" : "text-[#603e39] hover:text-[#bc0100]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
          <form action={signOut} className="inline">
            <button type="submit" className="p-2 text-[#603e39] hover:text-red-600 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>
    </>
  );
}
