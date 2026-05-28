"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Hammer, ShieldAlert, Sparkles, User, Briefcase, Settings } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentRole, setRole, currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Workers", href: "/browse" }
  ];

  const dashboardLinks = [
    { name: "Seeker Panel", href: "/dashboard/seeker", role: "seeker" as const, icon: User },
    { name: "Worker Panel", href: "/dashboard/worker", role: "worker" as const, icon: Briefcase },
    { name: "Admin Panel", href: "/dashboard/admin", role: "admin" as const, icon: Settings }
  ];

  const isActive = (path: string) => pathname === path;

  const handleRoleChange = (role: 'seeker' | 'worker' | 'admin') => {
    setRole(role);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case "worker":
        return <Hammer className="h-4 w-4 text-blue-500" />;
      case "seeker":
      default:
        return <User className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
              Ilisan<span className="text-orange-500">Hands</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-zinc-50 text-zinc-950 font-semibold"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50/50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="hidden md:flex items-center gap-4">
          {/* Quick Dashboard Links */}
          <div className="flex items-center gap-1 border-r border-zinc-100 pr-4">
            {dashboardLinks.map((dash) => {
              const Icon = dash.icon;
              const active = isActive(dash.href);
              return (
                <Link
                  key={dash.href}
                  href={dash.href}
                  title={dash.name}
                  className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                    active
                      ? "bg-amber-50 text-amber-600"
                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>

          {/* Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
            >
              {getRoleIcon(currentRole)}
              <span className="capitalize">{currentRole} View</span>
              <span className="text-zinc-400 text-[10px]">▼</span>
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-zinc-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-20">
                  <div className="px-3 py-1.5 border-b border-zinc-100 mb-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Switch Role Profile
                    </p>
                    <p className="text-xs font-medium text-zinc-700 truncate mt-0.5">
                      {currentUser.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRoleChange("seeker")}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      currentRole === "seeker"
                        ? "bg-amber-50 text-amber-700 font-semibold"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Seeker (Customer)</span>
                  </button>
                  <button
                    onClick={() => handleRoleChange("worker")}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      currentRole === "worker"
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <Hammer className="h-4 w-4" />
                    <span>Worker (Artisan)</span>
                  </button>
                  <button
                    onClick={() => handleRoleChange("admin")}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      currentRole === "admin"
                        ? "bg-rose-50 text-rose-700 font-semibold"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Active Role Indicator */}
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 border border-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 capitalize">
            {getRoleIcon(currentRole)}
            <span>{currentRole}</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-zinc-100 p-2 text-zinc-600 hover:bg-zinc-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-100 bg-white py-4 px-4 shadow-inner md:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? "bg-zinc-50 text-zinc-950 font-bold"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-zinc-100 pt-4 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-3">
              Dashboards
            </p>
            <div className="grid grid-cols-3 gap-2">
              {dashboardLinks.map((dash) => {
                const Icon = dash.icon;
                const active = isActive(dash.href);
                return (
                  <Link
                    key={dash.href}
                    href={dash.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border border-zinc-100 transition-all ${
                      active
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "text-zinc-500 hover:bg-zinc-50"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span className="text-[9px] font-bold text-center">
                      {dash.name.split(" ")[0]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-3">
              Switch Simulation Mode
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => handleRoleChange("seeker")}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-left ${
                  currentRole === "seeker"
                    ? "bg-amber-50 text-amber-700 font-bold border border-amber-200"
                    : "text-zinc-600 bg-zinc-50/50"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Seeker Mode (Customer)</span>
              </button>
              <button
                onClick={() => handleRoleChange("worker")}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-left ${
                  currentRole === "worker"
                    ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                    : "text-zinc-600 bg-zinc-50/50"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Worker Mode (Chioma)</span>
              </button>
              <button
                onClick={() => handleRoleChange("admin")}
                className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-left ${
                  currentRole === "admin"
                    ? "bg-rose-50 text-rose-700 font-bold border border-rose-200"
                    : "text-zinc-600 bg-zinc-50/50"
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Control View</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
