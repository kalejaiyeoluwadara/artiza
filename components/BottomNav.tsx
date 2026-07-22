"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  AccountIcon,
  BrowseIcon,
  SearchIcon,
  UnlockedIcon,
} from "./TabIcons";

const TABS = [
  { href: "/", label: "Browse", icon: BrowseIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/unlocked", label: "Unlocked", icon: UnlockedIcon },
  { href: "/account", label: "Account", icon: AccountIcon },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * The admin console brings its own chrome and is not one of these four
 * destinations, so both bars stand down inside it. Rendering the customer tab
 * bar there would offer a "you are here" that is never true.
 */
function useIsConsole(): boolean {
  return usePathname().startsWith("/admin");
}

/**
 * Mobile only. A solid card-coloured floor, not a translucent film:
 * photography scrolling underneath a blurred bar muddied both. The bar's
 * top corners are rounded and the shadow is lifted so it reads as a sheet
 * laid over the feed rather than a strip welded to the screen edge.
 *
 * Selection is a filled accent disc behind the icon — the strongest mark
 * a 21px glyph can carry — with the label below it in ink. Switching tabs
 * happens dozens of times a session, so the only transition is colour;
 * movement would slow the most-repeated action in the app.
 */
export function BottomNav() {
  const isActive = useIsActive();
  const inConsole = useIsConsole();

  if (inConsole) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-[1.75rem] bg-card shadow-[0_-10px_36px_-14px_rgba(0,0,0,0.45)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="pressable flex min-h-14 flex-col items-center justify-center gap-1 py-1.5"
              >
                {/* The filled disc carries the selection, so the icon itself
                    never has to grow or move to say "you are here". */}
                <span
                  className={`flex size-10 items-center justify-center rounded-full transition-colors duration-200 ease-out ${
                    active ? "bg-accent text-white" : "text-sub"
                  }`}
                >
                  <Icon size={21} active={active} />
                </span>
                <span
                  className={`text-[0.6875rem] transition-colors duration-200 ease-out ${
                    active ? "font-semibold text-ink" : "font-medium text-sub"
                  }`}
                >
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

/** Desktop counterpart. Same destinations, same names. */
export function SiteHeader() {
  const isActive = useIsActive();
  const inConsole = useIsConsole();

  if (inConsole) return null;

  return (
    <header className="chrome sticky top-0 z-50 hidden border-b border-line md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-8 px-6">
        <Link
          href="/"
          className="pressable flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-ink"
        >
          <div className="relative size-7 overflow-hidden rounded-lg border border-line bg-canvas shadow-xs">
            <Image
              src="/icon-192.png"
              alt="Artiza Logo"
              width={28}
              height={28}
              className="size-full object-cover"
            />
          </div>
          <span>
            Artiza<span className="text-accent">.</span>
          </span>
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
