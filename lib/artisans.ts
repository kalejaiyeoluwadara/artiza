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
