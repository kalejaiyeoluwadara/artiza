import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "../../components/admin/AdminShell";
import { requireSession } from "../../lib/auth/session";

export const metadata: Metadata = {
  title: "Console — Artiza",
  // The console is a back office: nothing here belongs in a search result.
  robots: { index: false, follow: false },
};

/**
 * The second of three gates. `proxy.ts` keeps a customer from ever landing
 * here, this one holds if the cookie says one thing and the session another,
 * and the Nest API — which trusts neither — is the one that actually decides.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("/admin");

  if (session.user.role !== "admin") redirect("/");

  return <AdminShell name={session.user.name}>{children}</AdminShell>;
}
