"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Image as ImageIcon,
  Inbox,
  LayoutGrid,
  Users,
} from "lucide-react";

const SECTIONS = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutGrid,
    hint: "The register at a glance",
  },
  {
    href: "/admin/artisans",
    label: "Register",
    icon: Users,
    hint: "Add, edit and retire artisans",
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: Inbox,
    hint: "Artisans applying to join",
  },
  {
    href: "/admin/banners",
    label: "Promotions",
    icon: ImageIcon,
    hint: "The banner rail on the home screen",
  },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * The console's chrome.
 *
 * The customer app is mobile-first with a bottom tab bar; this is the opposite
 * job. Listing an artisan means typing a dozen fields and pushing photos
 * around, which happens at a desk — so the console leads with a persistent
 * sidebar and only collapses to a scrolling rail when the window is narrow.
 * Same tokens, same type scale: it is the same product, seen from behind.
 */
export function AdminShell({
  name,
  children,
}: {
  name?: string | null;
  children: React.ReactNode;
}) {
  const isActive = useIsActive();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-card px-3 py-5 lg:flex">
        <Link
          href="/admin"
          className="pressable flex items-center gap-2.5 px-2 text-lg font-extrabold tracking-tight text-ink"
        >
          <span className="relative size-7 overflow-hidden rounded-lg border border-line bg-canvas">
            <Image
              src="/icon-192.png"
              alt=""
              width={28}
              height={28}
              className="size-full object-cover"
            />
          </span>
          <span>
            Artiza<span className="text-accent">.</span>
          </span>
          <span className="caption ml-auto rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">
            Admin
          </span>
        </Link>

        <nav aria-label="Console" className="mt-6">
          <ul className="space-y-0.5">
            {SECTIONS.map(({ href, label, icon: Icon, hint }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`pressable flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-200 ease-out ${
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-ink hover-fill"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={2}
                      className={`mt-0.5 shrink-0 ${active ? "" : "text-sub"}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] font-semibold">
                        {label}
                      </span>
                      <span
                        className={`caption block truncate ${
                          active ? "text-accent/70" : ""
                        }`}
                      >
                        {hint}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-line pt-3">
          {name ? (
            <p className="caption px-3 pb-2 truncate">Signed in as {name}</p>
          ) : null}
          <Link
            href="/"
            className="pressable hover-fill flex items-center gap-2 rounded-2xl px-3 py-2 text-[0.9375rem] font-medium text-sub"
          >
            <ArrowUpRight size={16} strokeWidth={2.2} />
            View the app
          </Link>
        </div>
      </aside>

      {/* ── Narrow-window chrome ──────────────────────────────────────── */}
      <header className="chrome sticky top-0 z-40 border-b border-line lg:hidden">
        <div className="flex items-center gap-2 px-4 pt-3">
          <Link
            href="/admin"
            className="pressable flex items-center gap-2 text-base font-extrabold tracking-tight text-ink"
          >
            Artiza<span className="-ml-2 text-accent">.</span>
            <span className="caption rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">
              Admin
            </span>
          </Link>
          <Link
            href="/"
            className="pressable caption ml-auto flex items-center gap-1 font-semibold text-sub"
          >
            View the app
            <ArrowUpRight size={13} strokeWidth={2.4} />
          </Link>
        </div>

        <nav aria-label="Console" className="no-scrollbar overflow-x-auto">
          <ul className="flex gap-1 px-4 py-2.5">
            {SECTIONS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`pressable flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ease-out ${
                      active
                        ? "bg-accent-soft text-accent"
                        : "bg-fill text-sub"
                    }`}
                  >
                    <Icon size={15} strokeWidth={2.1} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * The heading every console page opens with: what this screen is, one line of
 * what it is for, and the page's single main action on the right.
 */
export function AdminHeader({
  title,
  lede,
  action,
}: {
  title: string;
  lede: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="title-lg text-ink">{title}</h1>
        <p className="mt-1.5 text-[0.9375rem] text-sub">{lede}</p>
      </div>
      {action}
    </div>
  );
}

/** The console's page gutter. Every screen sits inside one of these. */
export function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-20 sm:px-6 lg:pt-10">
      {children}
    </div>
  );
}
