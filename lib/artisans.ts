export type Trade =
  | "plumber"
  | "solar-installer"
  | "tiler"
  | "carpenter"
  | "electrician"
  | "painter"
  | "laundry";

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
  /** Paid promotion. Ranks higher, gets a solid brass rule. */
  featured: boolean;
  /** Month the Artiza team visited and verified them. */
  verifiedSince: string;
  note: string;
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
    featured: true,
    verifiedSince: "Mar 2026",
    note: "Floor, wall and marble. Works clean and clears the site after.",
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
    featured: true,
    verifiedSince: "Feb 2026",
    note: "Inverter sizing, panel mounting and battery swaps. Certified.",
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
    featured: false,
    verifiedSince: "Jan 2026",
    note: "Wardrobes, roof trusses and door hanging. Quotes before starting.",
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
    featured: false,
    verifiedSince: "Feb 2026",
    note: "Burst pipes, pumps and soakaway. Answers late calls.",
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
    featured: false,
    verifiedSince: "Apr 2026",
    note: "Screeding and exterior work. Covers floors before she starts.",
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
    featured: false,
    verifiedSince: "Jan 2026",
    note: "Pickup and delivery within Ilisan. Two-day turnaround.",
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
    featured: false,
    verifiedSince: "Mar 2026",
    note: "House wiring and fusebox faults. Tests everything before leaving.",
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
    featured: false,
    verifiedSince: "May 2026",
    note: "Bathroom and kitchen tiling. Newer to the register, priced lower.",
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
