export type Trade =
  | "plumber"
  | "solar-installer"
  | "tiler"
  | "carpenter"
  | "electrician"
  | "painter"
  | "laundry";

export interface Review {
  author: string;
  rating: number;
  /** Relative, e.g. "2 weeks ago" — set by the team on import. */
  when: string;
  text: string;
}

/**
 * Everything the ₦500 buys. Phone is the spine — call, WhatsApp and SMS all
 * hang off it — so only the handles that vary are stored per artisan.
 */
export interface Contact {
  /** Only set when WhatsApp lives on a different line to the main number. */
  whatsapp?: string;
  /** Handle without the @. */
  instagram?: string;
  email?: string;
  /** Second line, e.g. a shop landline or apprentice.  */
  altPhone?: string;
  /** Typical reply window, set by the team at verification. */
  respondsIn: string;
  /** Working days and hours, in the artisan's own words. */
  availability: string;
}

export interface Artisan {
  id: string;
  name: string;
  trade: Trade;
  /** Area within Ilisan. */
  location: string;
  yearsExperience: number;
  /** Jobs unlocked through Artiza — the credibility signal. */
  jobsCompleted: number;
  /** Contact unlocks in the last 30 days. Drives the trending rail. */
  recentUnlocks: number;
  rating: number;
  reviewCount: number;
  /** Square portrait. Shot by the team on the verification visit. */
  photo: string;
  /** Past work. First one is the card cover, the rest are thumbnails. */
  work: string[];
  /** Paid promotion. Ranks higher, carries a Featured badge. */
  featured: boolean;
  /** Month the Artiza team visited and verified them. */
  verifiedSince: string;
  note: string;
  /** What this artisan actually takes on. Shown in the detail sheet. */
  services: string[];
  /** Typical reply window. Public — it informs the decision to pay. */
  respondsIn: string;
  /** Working days and hours, in the artisan's own words. Public. */
  availability: string;
}

/**
 * The half the ₦500 buys. Deliberately a separate type fetched from a separate
 * endpoint: the browser is never sent an artisan's number until it has been
 * paid for, so there is nothing in the page source to read past the paywall.
 */
export interface SealedDetails {
  phone: string;
  contact: Contact;
}

export const TRADE_LABELS: Record<Trade, string> = {
  plumber: "Plumber",
  "solar-installer": "Solar installer",
  tiler: "Tiler",
  carpenter: "Carpenter",
  electrician: "Electrician",
  painter: "Painter",
  laundry: "Laundry",
};

/**
 * Rail labels. The tile is only 4.75rem wide, so anything that would wrap
 * gets shortened here rather than truncated at render — a clipped trade
 * name is worse than a shorter true one.
 */
export const TRADE_SHORT_LABELS: Record<Trade, string> = {
  ...TRADE_LABELS,
  "solar-installer": "Solar",
};

/** Price of one contact unlock, in kobo-free naira. */
export const UNLOCK_PRICE = 500;

/**
 * Photography lives on Unsplash until the team's own shoots land. Sources are
 * requested pre-sized so next/image has a sane original to work from — the
 * portrait crop is face-aware, work photos crop on the subject.
 */
const PHOTO_HOST = "https://images.unsplash.com/photo-";

function scene(id: string): string {
  return `${PHOTO_HOST}${id}?w=1200&h=800&fit=crop&auto=format&q=70`;
}

/** Fallback cover when an artisan has no portfolio photos yet. */
export const TRADE_COVERS: Record<Trade, string> = {
  plumber: scene("1676210134188-4c05dd172f89"),
  "solar-installer": scene("1660330589257-813305a4a383"),
  tiler: scene("1523413555809-0fb1d4da238d"),
  carpenter: scene("1590880795696-20c7dfadacde"),
  electrician: scene("1621905252472-943afaa20e20"),
  painter: scene("1567113463300-102a7eb3cb26"),
  laundry: scene("1548768041-2fceab4c0b85"),
};

export interface Banner {
  id: string;
  /** Two or three words. The banner is a picture with a label, not a poster. */
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
}

/** Rating floors offered in the filter sheet. `null` is "any". */
export const RATING_FLOORS = [4, 4.5, 4.8] as const;

export interface Filters {
  trade: Trade | null;
  minRating: number | null;
}

export const NO_FILTERS: Filters = { trade: null, minRating: null };

/** How many filters are actually narrowing the register — drives the badge. */
export function activeFilterCount(filters: Filters): number {
  return Object.values(filters).filter((v) => v !== null).length;
}

export function filterArtisans(list: Artisan[], filters: Filters): Artisan[] {
  return list.filter(
    (a) =>
      (!filters.trade || a.trade === filters.trade) &&
      (!filters.minRating || a.rating >= filters.minRating),
  );
}

/** Featured first, then by jobs completed. Promotion is the only lever. */
export function rankArtisans(list: Artisan[]): Artisan[] {
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.jobsCompleted - a.jobsCompleted;
  });
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** `verifiedSince` as a sortable month count. "Mar 2026" → 24315. */
function verifiedMonth(artisan: Artisan): number {
  const [month, year] = artisan.verifiedSince.split(" ");
  return Number(year) * 12 + Math.max(0, MONTHS.indexOf(month));
}

/** How many artisans a discovery rail carries before it stops. */
const RAIL_SIZE = 6;

/**
 * Most unlocked in the last 30 days. Demand, not reputation — a good artisan
 * with a quiet month drops out, which is the whole point of the rail.
 */
export function trendingArtisans(list: Artisan[]): Artisan[] {
  return [...list]
    .sort((a, b) => b.recentUnlocks - a.recentUnlocks)
    .slice(0, RAIL_SIZE);
}

/**
 * Newest to the register. Cut by an age window rather than a fixed count, so
 * the rail empties out in a quiet month instead of calling a January listing new.
 */
export function newArtisans(list: Artisan[]): Artisan[] {
  if (list.length === 0) return [];
  const newest = Math.max(...list.map(verifiedMonth));
  return [...list]
    .filter((a) => newest - verifiedMonth(a) < 4)
    .sort((a, b) => verifiedMonth(b) - verifiedMonth(a))
    .slice(0, RAIL_SIZE);
}

/** Minimum reviews before a rating is worth ranking on. */
const RATED_THRESHOLD = 15;

/**
 * Highest rated, but only among artisans with enough reviews to mean it —
 * a 5.0 off three jobs isn't a top rating, it's a small sample.
 */
export function topRatedArtisans(list: Artisan[]): Artisan[] {
  return [...list]
    .filter((a) => a.reviewCount >= RATED_THRESHOLD)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, RAIL_SIZE);
}

/**
 * Splits a stored number into display groups: +234 803 123 4567.
 * The seal masks everything after the first group of the subscriber number.
 */
export function phoneGroups(phone: string): string[] {
  const rest = phone.replace(/^234/, "");
  return [`+234`, rest.slice(0, 3), rest.slice(3, 6), rest.slice(6, 10)];
}

/** One flat string for links and copy: +2348031234567. */
export function phoneE164(phone: string): string {
  return `+${phone}`;
}

/** Display form for a secondary line: +234 803 123 4567. */
export function formatPhone(phone: string): string {
  return phoneGroups(phone).join(" ");
}

export type ChannelKind =
  | "call"
  | "whatsapp"
  | "sms"
  | "instagram"
  | "email"
  | "alt";

export interface Channel {
  kind: ChannelKind;
  /** Button label — a verb, since every channel is an action. */
  label: string;
  /** What the channel actually resolves to, shown once unlocked. */
  value: string;
  href: string;
  /** Opens off-platform in a new tab rather than handing off to the OS. */
  external?: boolean;
}

/**
 * Every way to reach an artisan, ordered by how people in Ilisan actually
 * make first contact: WhatsApp, then a call, then everything else. Channels
 * the artisan doesn't have simply don't appear — no dead buttons.
 */
export function channelsFor(
  artisan: Pick<Artisan, "name">,
  details: SealedDetails,
): Channel[] {
  const { contact, phone } = details;
  const whatsapp = contact.whatsapp ?? phone;

  const channels: Channel[] = [
    {
      kind: "whatsapp",
      label: "WhatsApp",
      value: formatPhone(whatsapp),
      href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Hi ${artisan.name.split(" ")[0]}, I found you on Artiza.`,
      )}`,
      external: true,
    },
    {
      kind: "call",
      label: "Call",
      value: formatPhone(phone),
      href: `tel:${phoneE164(phone)}`,
    },
    {
      kind: "sms",
      label: "Text",
      value: formatPhone(phone),
      href: `sms:${phoneE164(phone)}`,
    },
  ];

  if (contact.instagram) {
    channels.push({
      kind: "instagram",
      label: "Instagram",
      value: `@${contact.instagram}`,
      href: `https://instagram.com/${contact.instagram}`,
      external: true,
    });
  }

  if (contact.email) {
    channels.push({
      kind: "email",
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
    });
  }

  if (contact.altPhone) {
    channels.push({
      kind: "alt",
      label: "Second line",
      value: formatPhone(contact.altPhone),
      href: `tel:${phoneE164(contact.altPhone)}`,
    });
  }

  return channels;
}

/**
 * A vCard so the contact lands in the phone's address book, not just the
 * browser. Escapes per RFC 6350 and keeps CRLF line endings — iOS is strict.
 */
export function vCardFor(artisan: Artisan, details: SealedDetails): string {
  const esc = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const [first, ...rest] = artisan.name.split(" ");
  const last = rest.join(" ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(artisan.name)}`,
    `ORG:${esc(TRADE_LABELS[artisan.trade])} · Ilisan`,
    `TITLE:${esc(TRADE_LABELS[artisan.trade])}`,
    `TEL;TYPE=CELL:${phoneE164(details.phone)}`,
  ];

  if (details.contact.altPhone) {
    lines.push(`TEL;TYPE=WORK:${phoneE164(details.contact.altPhone)}`);
  }
  if (details.contact.email) lines.push(`EMAIL:${esc(details.contact.email)}`);
  if (details.contact.instagram) {
    lines.push(`URL:https://instagram.com/${details.contact.instagram}`);
  }

  lines.push(
    `ADR;TYPE=WORK:;;${esc(artisan.location)};Ilisan;Ogun State;;Nigeria`,
    `NOTE:${esc(`Verified by Artiza, ${artisan.verifiedSince}. ${artisan.note}`)}`,
    "END:VCARD",
  );

  return lines.join("\r\n");
}
