import Link from "next/link";

/**
 * Stands in for routes the tab bar already points at. An empty screen
 * is an invitation to act, so each one says what to do next.
 */
export function Placeholder({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-28 pt-16 text-center md:pb-16">
      <h1 className="title text-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-sub">
        {body}
      </p>
      <Link
        href="/"
        className="pressable hover-dim mt-6 rounded-full bg-accent px-5 py-2.5 text-[0.9375rem] font-semibold text-white"
      >
        Browse artisans
      </Link>
    </div>
  );
}
