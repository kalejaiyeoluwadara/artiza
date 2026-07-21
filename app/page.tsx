import { Hexagon, MapPin, Star } from "lucide-react";
import {
  ARTISANS,
  Artisan,
  TRADE_LABELS,
  UNLOCK_PRICE,
} from "../lib/artisans";
import { SealedContact } from "../components/SealedContact";
import { ArtisanBrowser } from "../components/ArtisanBrowser";

export default function HomePage() {
  // The hero opens on a real record, not a mock illustration — the whole
  // proposition is legible in one card.
  const lead = ARTISANS[0];
  const trades = Object.keys(TRADE_LABELS).length;
  const jobs = ARTISANS.reduce((sum, a) => sum + a.jobsCompleted, 0);

  return (
    <div className="mx-auto w-full max-w-300 px-6 pb-28 pt-10 md:px-10 md:pb-20 md:pt-16">
      <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <p className="type-label flex items-center gap-2">
            <MapPin size={12} strokeWidth={2.5} className="text-brass" />
            Ilisan, Ogun State
          </p>

          <h1 className="type-display mt-4 text-h1 text-bone sm:text-display">
            Hands you can check
            <br />
            before you call.
          </h1>

          <p className="mt-5 max-w-lg text-body text-smoke">
            Every artisan on Artiza has been visited in person, put on record,
            and rated by the people who hired them. Read the record for free.
            Pay ₦{UNLOCK_PRICE} when you want the number.
          </p>

          {/* The register strip: what the vetting has actually produced. */}
          <dl className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
            <Fact value={ARTISANS.length} label="on record" />
            <Rule />
            <Fact value={trades} label="trades" />
            <Rule />
            <Fact value={jobs} label="jobs done" />
          </dl>
        </div>

        <div className="lg:col-span-5">
          <LeadRecord lead={lead} />
        </div>
      </section>

      <ArtisanBrowser />
    </div>
  );
}

function LeadRecord({ lead }: { lead: Artisan }) {
  return (
    <figure className="relative overflow-hidden rounded-sm border border-line bg-ash p-5">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-brass" aria-hidden />

      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="type-label">Record {lead.id.toUpperCase()}</span>
        <span className="type-label flex items-center gap-1 text-brass">
          <Hexagon size={11} strokeWidth={2.5} fill="currentColor" />
          Verified {lead.verifiedSince}
        </span>
      </figcaption>

      <h2 className="type-display mt-4 text-h2 text-bone">{lead.name}</h2>
      <p className="type-label mt-1 text-brass">
        {TRADE_LABELS[lead.trade]} · {lead.location}
      </p>

      <p className="mt-4 text-sm text-smoke">{lead.note}</p>

      <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-line bg-line">
        <Cell label="Rating">
          <Star
            size={12}
            strokeWidth={2.5}
            fill="currentColor"
            className="text-brass"
          />
          {lead.rating.toFixed(1)}
        </Cell>
        <Cell label="Experience">{lead.yearsExperience} yrs</Cell>
        <Cell label="Jobs">{lead.jobsCompleted}</Cell>
      </dl>

      <div className="mt-5">
        <SealedContact phone={lead.phone} name={lead.name} />
      </div>
    </figure>
  );
}

function Fact({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="type-figure text-h3 text-bone">{value}</dd>
      <span aria-hidden className="type-label">
        {label}
      </span>
    </div>
  );
}

function Rule() {
  return <span aria-hidden className="h-3 w-px bg-line" />;
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ash px-2 py-3 text-center">
      <dt className="type-label">{label}</dt>
      <dd className="type-figure mt-1 flex items-center justify-center gap-1 text-sm text-bone">
        {children}
      </dd>
    </div>
  );
}
