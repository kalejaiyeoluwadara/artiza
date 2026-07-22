import Image from "next/image";
import { Artisan, TRADE_LABELS } from "../lib/artisans";
import { TRADE_TINTS, TradeIllustration } from "./TradeIllustration";

/**
 * An artisan's cover: the first photo of their own work, or — when the team
 * hasn't shot them yet — the trade's illustration on its tint.
 *
 * The fallback used to be a stock photograph of somebody else's plumbing. It
 * looked like evidence and wasn't, which is the one thing a vetting product
 * cannot afford: every photo on a card has to be a picture of work this
 * artisan actually did. The illustration reads as a placeholder on purpose.
 *
 * Both branches fill a relatively-positioned parent, so every call site keeps
 * the aspect box, `overflow-hidden` and scrim it already had.
 */
export function ArtisanCover({
  artisan,
  sizes,
  priority,
  className = "",
}: {
  artisan: Artisan;
  /** Passed straight to next/image. Ignored when there is no photo. */
  sizes: string;
  priority?: boolean;
  /** Photo-only styling — the object fit and any hover transform. */
  className?: string;
}) {
  const photo = artisan.work[0];

  if (photo) {
    return (
      <Image
        src={photo}
        alt={`${TRADE_LABELS[artisan.trade]} work by ${artisan.name}`}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <div
      // Decorative: the trade is already named in text on every card that
      // uses this, so announcing it again would just be noise.
      aria-hidden
      style={{ background: TRADE_TINTS[artisan.trade] }}
      className="absolute inset-0 flex items-center justify-center [&>svg]:size-14"
    >
      <TradeIllustration trade={artisan.trade} />
    </div>
  );
}
