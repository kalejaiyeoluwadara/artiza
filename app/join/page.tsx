import type { Metadata } from "next";
import { JoinForm } from "../../components/join/JoinForm";

export const metadata: Metadata = {
  title: "Join Artiza",
  description:
    "Artiza helps customers in and beyond Ilisan find trusted artisans and skilled professionals. Confirm your details and your profile goes live. Artiza never takes a cut of your job.",
  // The claim link is sent one-to-one over WhatsApp, not published. Keeping it
  // out of search results means the register grows through the team rather
  // than through whoever finds the form.
  robots: { index: false, follow: false },
};

/**
 * The founding-artisan claim link — `artizahq.com/join`.
 *
 * The team meets an artisan, works with them, and sends this rather than asking
 * fourteen questions over WhatsApp. Everything about the page follows from who
 * is on the other end: someone who has never heard of Artiza, on a phone, on
 * data they are paying for, who was told this takes two minutes. So there is no
 * account to make, no verification to wait for, and nothing on the page that
 * isn't either a question or the reason it's being asked.
 */
export default function JoinPage() {
  return <JoinForm />;
}
