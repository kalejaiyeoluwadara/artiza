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
 * Mobile only. Tab bars are used dozens of times a session, so there is
 * no transition animation here beyond colour — movement would make the
 * most-repeated action in the product feel slow.
 */
export function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="relative">
              {/* Active marker sits on the border, echoing the featured rule. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 bg-brass"
                style={{
                  opacity: active ? 1 : 0,
                  transition: "opacity 160ms var(--ease-out)",
                }}
              />
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`pressable flex min-h-14 flex-col items-center justify-center gap-1 py-2 ${
                  active ? "text-brass" : "text-smoke"
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
                <span className="type-label text-[0.625rem] text-current">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Desktop counterpart. Same destinations, same vocabulary. */
export function SiteHeader() {
  const isActive = useIsActive();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-300 items-center gap-8 px-6 md:px-10">
        <Link href="/" className="type-display text-h3 text-bone">
          Artiza
          <span className="text-brass">.</span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {TABS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`hover-surface rounded-sm border border-transparent px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      active ? "text-brass" : "text-smoke"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <span className="type-label ml-auto md:ml-0">Ilisan · Ogun</span>
      </div>
    </header>
  );
}
