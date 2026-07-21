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
  rating: number;
  reviewCount: number;
  /** Stored bare, formatted at render. */
  phone: string;
  /** The rest of the sealed detail — handles, hours, second line. */
  contact: Contact;
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
  reviews: Review[];
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

/** Price of one contact unlock, in kobo-free naira. */
export const UNLOCK_PRICE = 500;

/**
 * Photography lives on Unsplash until the team's own shoots land. Sources are
 * requested pre-sized so next/image has a sane original to work from — the
 * portrait crop is face-aware, work photos crop on the subject.
 */
const PHOTO_HOST = "https://images.unsplash.com/photo-";

function portrait(id: string): string {
  return `${PHOTO_HOST}${id}?w=400&h=400&fit=crop&crop=faces&auto=format&q=70`;
}

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

/** Promo rail on the home screen. Ordered — first one leads. */
export const BANNERS: Banner[] = [
  {
    id: "b-bundle",
    title: "3 unlocks for ₦1,200",
    body: "Line up a few artisans before the job starts.",
    cta: "Get the bundle",
    href: "/account",
    image: scene("1523413555809-0fb1d4da238d"),
  },
  {
    id: "b-vetted",
    title: "Visited, then listed",
    body: "Every artisan on Artiza was met in person in Ilisan.",
    cta: "See who's vetted",
    href: "/search",
    image: scene("1683115099191-51e617fc5ff1"),
  },
  {
    id: "b-solar",
    title: "Solar without the guesswork",
    body: "Installers who size the system before they quote it.",
    cta: "Browse installers",
    href: "/search",
    image: scene("1660330589257-813305a4a383"),
  },
];

export const ARTISANS: Artisan[] = [
  {
    id: "a-01",
    name: "Tunde Bakare",
    trade: "tiler",
    location: "Babcock Road",
    yearsExperience: 8,
    jobsCompleted: 34,
    rating: 4.8,
    reviewCount: 21,
    phone: "2348031234567",
    contact: {
      instagram: "tundetiles_ilisan",
      email: "tunde.bakare@artiza.ng",
      respondsIn: "Usually replies within an hour",
      availability: "Mon–Sat, 8am–6pm",
    },
    photo: portrait("1522529599102-193c0d76b5b6"),
    work: [
      scene("1523413555809-0fb1d4da238d"),
      scene("1547414857-c9f61632b250"),
      scene("1595814432848-830b880ecf0e"),
    ],
    featured: true,
    verifiedSince: "Mar 2026",
    note: "Floor, wall and marble. Works clean and clears the site after.",
    services: ["Floor tiling", "Wall tiling", "Marble", "Grout repair"],
    reviews: [
      {
        author: "Boluwatife A.",
        rating: 5,
        when: "2 weeks ago",
        text: "Did my living room floor in two days. Lines are dead straight and he swept up before leaving.",
      },
      {
        author: "Emeka N.",
        rating: 4,
        when: "1 month ago",
        text: "Good work overall. Finished a day later than he said, but the finish is solid.",
      },
      {
        author: "Prof. Adesina",
        rating: 5,
        when: "2 months ago",
        text: "Third job I've given him. Consistent every time.",
      },
    ],
  },
  {
    id: "a-02",
    name: "Victor Umeh",
    trade: "solar-installer",
    location: "Expressway Junction",
    yearsExperience: 6,
    jobsCompleted: 41,
    rating: 4.9,
    reviewCount: 28,
    phone: "2348084445556",
    contact: {
      whatsapp: "2348084445557",
      instagram: "umehsolar",
      email: "victor@umehsolar.ng",
      altPhone: "2348084445558",
      respondsIn: "Usually replies same day",
      availability: "Mon–Sat, 7:30am–7pm",
    },
    photo: portrait("1645395375692-502558949baa"),
    work: [
      scene("1660330589257-813305a4a383"),
      scene("1624397640148-949b1732bb0a"),
      scene("1663321508309-4ceb96a3c791"),
    ],
    featured: true,
    verifiedSince: "Feb 2026",
    note: "Inverter sizing, panel mounting and battery swaps. Certified.",
    services: ["Inverter sizing", "Panel mounting", "Battery swap", "Fault diagnosis"],
    reviews: [
      {
        author: "Mrs. Bankole",
        rating: 5,
        when: "3 weeks ago",
        text: "Found the fault in our inverter in about half an hour after two other people failed.",
      },
      {
        author: "Engr. Davies",
        rating: 5,
        when: "1 month ago",
        text: "Sized and mounted a 3.5kVA system. Explained the load maths clearly before quoting.",
      },
    ],
  },
  {
    id: "a-03",
    name: "Segun Alao",
    trade: "carpenter",
    location: "Irolu Road",
    yearsExperience: 12,
    jobsCompleted: 57,
    rating: 4.7,
    reviewCount: 39,
    phone: "2348062223334",
    contact: {
      instagram: "alaowoodworks",
      email: "segunalao.works@gmail.com",
      respondsIn: "Usually replies within 2 hours",
      availability: "Mon–Fri, 8am–5pm",
    },
    photo: portrait("1688240817677-d28b8e232dd4"),
    work: [
      scene("1590880795696-20c7dfadacde"),
      scene("1683115099191-51e617fc5ff1"),
      scene("1683115098516-9b8d5c643b5b"),
    ],
    featured: false,
    verifiedSince: "Jan 2026",
    note: "Wardrobes, roof trusses and door hanging. Quotes before starting.",
    services: ["Wardrobes", "Roof trusses", "Door hanging", "Furniture repair"],
    reviews: [
      {
        author: "Mide F.",
        rating: 5,
        when: "1 month ago",
        text: "Rebuilt our kitchen cabinet doors. Looks better than the original.",
      },
      {
        author: "Deji O.",
        rating: 4,
        when: "2 months ago",
        text: "Quality woodwork. Slightly pricier than others but you can see where it goes.",
      },
    ],
  },
  {
    id: "a-04",
    name: "Kehinde Salami",
    trade: "plumber",
    location: "Town Centre",
    yearsExperience: 9,
    jobsCompleted: 46,
    rating: 4.6,
    reviewCount: 30,
    phone: "2348027771234",
    contact: {
      altPhone: "2348027771235",
      respondsIn: "Usually picks up first try",
      availability: "Daily, 7am–8pm · emergencies any time",
    },
    photo: portrait("1562173650-f61426fbe683"),
    work: [
      scene("1676210134188-4c05dd172f89"),
      scene("1620653713380-7a34b773fef8"),
      scene("1517646287270-a5a9ca602e5c"),
    ],
    featured: false,
    verifiedSince: "Feb 2026",
    note: "Burst pipes, pumps and soakaway. Answers late calls.",
    services: ["Burst pipes", "Pump install", "Soakaway", "Tap and cistern"],
    reviews: [
      {
        author: "Yinka S.",
        rating: 5,
        when: "1 week ago",
        text: "Called him at 9pm for a burst pipe and he came. Fixed it same night.",
      },
      {
        author: "Simi L.",
        rating: 4,
        when: "3 weeks ago",
        text: "Sorted our pump. Neat work, fair price.",
      },
    ],
  },
  {
    id: "a-05",
    name: "Funmi Adebayo",
    trade: "painter",
    location: "Palace Area",
    yearsExperience: 7,
    jobsCompleted: 23,
    rating: 4.6,
    reviewCount: 16,
    phone: "2348073334445",
    contact: {
      instagram: "funmi.finishes",
      email: "funmi.adebayo@artiza.ng",
      respondsIn: "Usually replies within an hour",
      availability: "Mon–Sat, 8am–6pm",
    },
    photo: portrait("1620424037570-15137a4a562d"),
    work: [
      scene("1567113463300-102a7eb3cb26"),
      scene("1562259949-e8e7689d7828"),
      scene("1572627614522-1c56af1d9d72"),
    ],
    featured: false,
    verifiedSince: "Apr 2026",
    note: "Screeding and exterior work. Covers floors before she starts.",
    services: ["Screeding", "Interior painting", "Exterior painting", "Wallpaper"],
    reviews: [
      {
        author: "Chief Osoba",
        rating: 5,
        when: "1 month ago",
        text: "Painted the whole duplex. Covered every floor before starting, not a single stain.",
      },
      {
        author: "Damilola A.",
        rating: 4,
        when: "2 months ago",
        text: "Good finish and helpful with colour choices.",
      },
    ],
  },
  {
    id: "a-06",
    name: "Bisi Ogunleye",
    trade: "laundry",
    location: "Toll Gate",
    yearsExperience: 5,
    jobsCompleted: 62,
    rating: 4.9,
    reviewCount: 44,
    phone: "2348091112223",
    contact: {
      instagram: "bisilaundry_ilisan",
      email: "bisilaundry@gmail.com",
      respondsIn: "Usually replies within 30 minutes",
      availability: "Mon–Sun, 7am–7pm · pickup by request",
    },
    photo: portrait("1534470717-233b39a41c54"),
    work: [
      scene("1548768041-2fceab4c0b85"),
      scene("1582735689369-4fe89db7114c"),
      scene("1523212727988-82c430c79c8e"),
    ],
    featured: false,
    verifiedSince: "Jan 2026",
    note: "Pickup and delivery within Ilisan. Two-day turnaround.",
    services: ["Wash and fold", "Ironing", "Pickup and delivery", "Duvets"],
    reviews: [
      {
        author: "Sarah K.",
        rating: 5,
        when: "5 days ago",
        text: "Picks up Monday, back Wednesday, folded properly. Never lost an item.",
      },
      {
        author: "Abiola J.",
        rating: 5,
        when: "3 weeks ago",
        text: "Did our duvets and curtains. Came back smelling clean, not chemical.",
      },
    ],
  },
  {
    id: "a-07",
    name: "Musa Danjuma",
    trade: "electrician",
    location: "Babcock Road",
    yearsExperience: 11,
    jobsCompleted: 38,
    rating: 4.7,
    reviewCount: 25,
    phone: "2348055556667",
    contact: {
      whatsapp: "2348055556668",
      email: "musa.danjuma@artiza.ng",
      respondsIn: "Usually replies within 2 hours",
      availability: "Daily, 8am–8pm · call-outs after hours",
    },
    photo: portrait("1621905252507-b35492cc74b4"),
    work: [
      scene("1621905252472-943afaa20e20"),
      scene("1607472586893-edb57bdc0e39"),
      scene("1585704032915-c3400ca199e7"),
    ],
    featured: false,
    verifiedSince: "Mar 2026",
    note: "House wiring and fusebox faults. Tests everything before leaving.",
    services: ["House wiring", "Fusebox faults", "Socket install", "AC wiring"],
    reviews: [
      {
        author: "Femi O.",
        rating: 5,
        when: "2 weeks ago",
        text: "Traced a fault the last electrician created. Tested every socket before he left.",
      },
      {
        author: "Chinedu E.",
        rating: 4,
        when: "1 month ago",
        text: "Rewired two rooms. Tidy conduit work.",
      },
    ],
  },
  {
    id: "a-08",
    name: "Chuka Nwosu",
    trade: "tiler",
    location: "Irolu Road",
    yearsExperience: 4,
    jobsCompleted: 12,
    rating: 4.4,
    reviewCount: 9,
    phone: "2348038889990",
    contact: {
      instagram: "chukatiles",
      respondsIn: "Usually replies within an hour",
      availability: "Mon–Sat, 9am–6pm",
    },
    photo: portrait("1684916929613-2a93a0173e8e"),
    work: [
      scene("1547414857-c9f61632b250"),
      scene("1523413555809-0fb1d4da238d"),
      scene("1594471190088-bcf3898f56ba"),
    ],
    featured: false,
    verifiedSince: "May 2026",
    note: "Bathroom and kitchen tiling. Newer to the register, priced lower.",
    services: ["Bathroom tiling", "Kitchen splashback", "Small repairs"],
    reviews: [
      {
        author: "Mama Titi",
        rating: 5,
        when: "1 week ago",
        text: "Did our bathroom for a good price. Young but careful.",
      },
      {
        author: "Kunle A.",
        rating: 4,
        when: "3 weeks ago",
        text: "Neat job on the kitchen splashback. Asked questions rather than guessing.",
      },
    ],
  },
];

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
export function channelsFor(artisan: Artisan): Channel[] {
  const { contact } = artisan;
  const whatsapp = contact.whatsapp ?? artisan.phone;

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
      value: formatPhone(artisan.phone),
      href: `tel:${phoneE164(artisan.phone)}`,
    },
    {
      kind: "sms",
      label: "Text",
      value: formatPhone(artisan.phone),
      href: `sms:${phoneE164(artisan.phone)}`,
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
export function vCardFor(artisan: Artisan): string {
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
    `TEL;TYPE=CELL:${phoneE164(artisan.phone)}`,
  ];

  if (artisan.contact.altPhone) {
    lines.push(`TEL;TYPE=WORK:${phoneE164(artisan.contact.altPhone)}`);
  }
  if (artisan.contact.email) lines.push(`EMAIL:${esc(artisan.contact.email)}`);
  if (artisan.contact.instagram) {
    lines.push(`URL:https://instagram.com/${artisan.contact.instagram}`);
  }

  lines.push(
    `ADR;TYPE=WORK:;;${esc(artisan.location)};Ilisan;Ogun State;;Nigeria`,
    `NOTE:${esc(`Verified by Artiza, ${artisan.verifiedSince}. ${artisan.note}`)}`,
    "END:VCARD",
  );

  return lines.join("\r\n");
}
