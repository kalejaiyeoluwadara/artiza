"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Search, KeyRound, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Browse", icon: LayoutGrid },
  { href: "/search", label: "Search", icon: Search },
  { href: "/unlocked", label: "Unlocked", icon: KeyRound },
  { href: "/account", label: "Account", icon: User },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Mobile only. Translucent material floating over content. Switching
 * tabs happens dozens of times a session, so the only transition is
 * colour — movement would slow the most-repeated action in the app.
 */
export function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Primary"
      className="chrome fixed inset-x-0 bottom-0 z-50 border-t border-line md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`pressable flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 ${
                  active ? "text-accent" : "text-sub"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.3 : 1.8} />
                <span className="text-[0.6875rem] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Desktop counterpart. Same destinations, same names. */
export function SiteHeader() {
  const isActive = useIsActive();

  return (
    <header className="chrome sticky top-0 z-50 hidden border-b border-line md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-8 px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-ink"
        >
          Artiza<span className="text-accent">.</span>
        </Link>

        <nav aria-label="Primary" className="ml-auto">
          <ul className="flex items-center gap-1">
            {TABS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`pressable hover-fill rounded-full px-3.5 py-1.5 text-sm font-medium ${
                      active ? "bg-accent-soft text-accent" : "text-sub"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <span className="caption">Ilisan · Ogun</span>
      </div>
    </header>
  );
}
