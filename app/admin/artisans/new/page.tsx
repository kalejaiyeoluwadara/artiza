"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminHeader, AdminPage } from "../../../../components/admin/AdminShell";
import { ArtisanForm } from "../../../../components/admin/ArtisanForm";
import { blankDraft } from "../../../../lib/admin/artisan-draft";

export default function NewArtisanPage() {
  // Seeded once. Rebuilding it every render would reset the two pre-filled
  // contact lines the moment anything else on the page changed.
  const [initial] = useState(blankDraft);

  return (
    <AdminPage>
      <Link
        href="/admin/artisans"
        className="pressable caption -ml-1 mb-3 inline-flex items-center gap-0.5 font-semibold text-sub"
      >
        <ChevronLeft size={14} strokeWidth={2.4} />
        Register
      </Link>

      <AdminHeader
        title="Add an artisan"
        lede="Everything here except the contact block is public the moment you save."
      />

      <div className="mt-6">
        <ArtisanForm mode="create" initial={initial} />
      </div>
    </AdminPage>
  );
}
