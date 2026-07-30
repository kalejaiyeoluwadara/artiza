/**
 * Every trade Artiza lists, and the one place the taxonomy is defined —
 * {@link Trade} is derived from these keys, so adding a trade is this line and
 * nothing else. The backend `Trade` enum mirrors it exactly; the two are a
 * contract and drifting apart would 422 an artisan mid-form.
 *
 * The order is deliberate and not alphabetical: `TradeRail` walks it as-is, and
 * that rail is a market stall where the trades people actually search for
 * belong at the front. The `/join` dropdown sorts by label instead — thirty-odd
 * options in a `<select>` are scanned, not browsed.
 *
 * A trade is the *category* a customer filters on. The long tail lives in an
 * artisan's `services`, which is free text — "Marble" and "Grout repair" are
 * things a tiler does, not trades of their own. Keeping that split is what
 * stops the register fragmenting into thirty rails of one artisan each.
 */
export const TRADE_LABELS = {
  // The building trades — the spine of the register.
  plumber: "Plumber",
  electrician: "Electrician",
  carpenter: "Carpenter",
  tiler: "Tiler",
  painter: "Painter",
  bricklayer: "Bricklayer",
  welder: "Welder",
  roofer: "Roofer",
  "pop-installer": "POP installer",
  "aluminium-fabricator": "Aluminium fabricator",
  "borehole-driller": "Borehole driller",
  builder: "Builder",
  "iron-bender": "Iron bender",

  // Power, cooling and the things bolted to a house.
  "solar-installer": "Solar installer",
  "generator-technician": "Generator technician",
  "ac-technician": "AC technician",
  "cctv-installer": "CCTV installer",
  "satellite-installer": "Satellite installer",
  "appliance-repair": "Appliance repair",

  // Devices and design work.
  "phone-repair": "Phone repair",
  "computer-repair": "Computer repair",
  "graphic-artist": "Graphic artist",

  // Vehicles.
  "auto-mechanic": "Auto mechanic",
  "auto-electrician": "Auto electrician",
  "panel-beater": "Panel beater",
  vulcanizer: "Vulcanizer",
  transporter: "Transporter",

  // Home and personal services.
  laundry: "Laundry",
  cleaner: "Cleaner",
  fumigator: "Fumigator",
  gardener: "Gardener",
  upholsterer: "Upholsterer",
  "interior-decorator": "Interior decorator",
  tailor: "Tailor",
  hairstylist: "Hairstylist",
  barber: "Barber",
  caterer: "Caterer",
  "event-decorator": "Event decorator",
  photographer: "Photographer",

  // Building supplies. Not a hand trade, but the first call on any site — the
  // register is what Ilisan actually asks for, not a purist list of crafts.
  "building-materials": "Building materials",
  "cement-distributor": "Cement distributor",
  sawmiller: "Sawmiller",

  // The professions a build needs before and after the hand trades.
  architect: "Architect",
  surveyor: "Surveyor",
  "estate-agent": "Estate agent",
  lawyer: "Lawyer",

  /**
   * The escape hatch, and deliberately last in every list it appears in.
   *
   * An artisan whose trade is not above picks this and types it; `customTrade`
   * carries what they wrote, and {@link tradeName} shows that instead of this
   * label everywhere a trade is displayed. The closed list is what makes browse
   * work — rails, filters and illustrations are all built on it — so this keeps
   * the taxonomy intact rather than letting free text fragment the register,
   * while still listing the artisan under their real trade.
   */
  other: "Other",
} as const satisfies Record<string, string>;

export type Trade = keyof typeof TRADE_LABELS;

/**
 * Everything the ₦500 buys. Phone is the spine — call, WhatsApp and SMS all
 * hang off it — so only the handles that vary are stored per artisan.
 */
export interface Contact {
  /** Only set when WhatsApp lives on a different line to the main number. */
  whatsapp?: string;
  /** Handle without the @. */
  instagram?: string;
  /** Page or profile name — the part after `facebook.com/`. */
  facebook?: string;
  /** Handle without the @. */
  snapchat?: string;
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
  /** What they call it, when `trade` is `other`. See {@link tradeName}. */
  customTrade?: string;
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

/**
 * What to call an artisan's trade, on screen.
 *
 * Always this, never a bare `TRADE_LABELS[artisan.trade]` — that renders the
 * word "Other" at an artisan whose trade is the one thing the row exists to
 * say. Filter chips and rail tiles are the exception and stay on the raw
 * label, because there the subject really is the category and not a person.
 */
export function tradeName(artisan: {
  trade: Trade;
  customTrade?: string;
}): string {
  return artisan.trade === "other" && artisan.customTrade
    ? artisan.customTrade
    : TRADE_LABELS[artisan.trade];
}

/**
 * Rail labels. The tile is only 4.75rem wide, so anything that would wrap
 * gets shortened here rather than truncated at render — a clipped trade
 * name is worse than a shorter true one. Only the labels that need it appear;
 * everything else falls through to its full name.
 */
export const TRADE_SHORT_LABELS: Record<Trade, string> = {
  ...TRADE_LABELS,
  "solar-installer": "Solar",
  "generator-technician": "Generator",
  "ac-technician": "AC",
  "aluminium-fabricator": "Aluminium",
  "pop-installer": "POP",
  "borehole-driller": "Borehole",
  "cctv-installer": "CCTV",
  "satellite-installer": "Satellite",
  "appliance-repair": "Appliance",
  "phone-repair": "Phone",
  "computer-repair": "Computer",
  "auto-mechanic": "Mechanic",
  "auto-electrician": "Auto elec",
  "panel-beater": "Panel",
  "interior-decorator": "Interior",
  "event-decorator": "Events",
  upholsterer: "Upholstery",
  photographer: "Photo",
  "graphic-artist": "Graphics",
  "iron-bender": "Iron",
  transporter: "Transport",
  "building-materials": "Materials",
  "cement-distributor": "Cement",
  "estate-agent": "Estate",
};

/** Price of one contact unlock, in kobo-free naira. */
export const UNLOCK_PRICE = 500;

/** What a banner is saying — renders as the eyebrow label over its title. */
export type BannerType = "offer" | "announcement" | "feature" | "tip";

/** The eyebrow label each type shows, and the order they list in the console. */
export const BANNER_TYPES: { value: BannerType; label: string }[] = [
  { value: "offer", label: "Offer" },
  { value: "announcement", label: "Announcement" },
  { value: "feature", label: "Feature" },
  { value: "tip", label: "Tip" },
];

/** Uppercase eyebrow the billboard sets over the title. */
export function bannerTypeLabel(type: BannerType): string {
  return (BANNER_TYPES.find((t) => t.value === type)?.label ?? "Offer").toUpperCase();
}

export interface Banner {
  id: string;
  /** The eyebrow label over the title. Offer is the historical default. */
  type: BannerType;
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

/**
 * Featured first, then by jobs completed.
 *
 * @deprecated Superseded by `rankArtisans` in `lib/home-rails.ts`, which caps
 * promotion at one lead slot and rotates artisans level on record. Sorting
 * every featured artisan to the front was fine when the register had a spread
 * of completed jobs to fall back on; on the live register almost every artisan
 * is on zero, so the fallback never fires and this returns the promoted block
 * followed by whatever order the API replied in. Only the unrouted
 * `BrowseScreen` still calls it.
 */
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
export function verifiedMonth(artisan: Artisan): number {
  const [month, year] = artisan.verifiedSince.split(" ");
  return Number(year) * 12 + Math.max(0, MONTHS.indexOf(month));
}

/** How many artisans a discovery rail carries before it stops. */
const RAIL_SIZE = 6;

/*
 * The three selectors below are superseded by `composeHome` in
 * `lib/home-rails.ts` and survive only for the unrouted `BrowseScreen`.
 *
 * Do not reach for them on home. Each one sorts the whole register in
 * isolation and takes the top six, which is what produced the repetition they
 * were reported for: `trendingArtisans` and home's Top 10 ranked on the very
 * same key, making trending a strict prefix of the ten, and all three fall
 * back to the API's `featured: -1` order the moment their key ties — which,
 * on a register where sixteen of seventeen artisans sit on zero unlocks and
 * zero reviews, is nearly always.
 */

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
  | "facebook"
  | "snapchat"
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

  // The socials, in the order they are actually worth to an artisan: Instagram
  // is where the work is, Facebook is where the customers are, Snapchat is a
  // long way third. All optional, and a channel an artisan doesn't have simply
  // isn't drawn.
  if (contact.instagram) {
    channels.push({
      kind: "instagram",
      label: "Instagram",
      value: `@${contact.instagram}`,
      href: `https://instagram.com/${contact.instagram}`,
      external: true,
    });
  }

  if (contact.facebook) {
    channels.push({
      kind: "facebook",
      label: "Facebook",
      // Not prefixed with an @: a Facebook page is a name, not a handle, and
      // "@Tunde Tiles Ilisan" is a thing nobody has ever written down.
      value: contact.facebook,
      href: `https://facebook.com/${contact.facebook}`,
      external: true,
    });
  }

  if (contact.snapchat) {
    channels.push({
      kind: "snapchat",
      label: "Snapchat",
      value: `@${contact.snapchat}`,
      href: `https://snapchat.com/add/${contact.snapchat}`,
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
    `ORG:${esc(tradeName(artisan))} · Ilisan`,
    `TITLE:${esc(tradeName(artisan))}`,
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
