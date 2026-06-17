import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile metadata
  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Creator";
  const email = user.email || "";

  return (
    <div className="flex min-h-screen bg-[#fff8f6] text-[#2b1613] relative overflow-hidden">
      {/* Background patterns */}
      <div className="grid-pattern" />
      <div className="noise-bg" />

      {/* Sidebar - Desktop & Mobile navigation wrapper */}
      <React.Suspense fallback={<div className="w-64 border-r border-[#ebbbb4]/40 bg-white/60" />}>
        <Sidebar name={name} email={email} />
      </React.Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {children}
      </div>
    </div>
  );
}
