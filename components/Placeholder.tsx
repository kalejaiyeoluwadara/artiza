/**
 * Stands in for routes the bottom nav already points at. An empty screen
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
    <div className="mx-auto flex w-full max-w-300 flex-1 flex-col items-center justify-center px-6 pb-28 pt-16 text-center md:px-10 md:pb-20">
      <h1 className="type-display text-h2 text-bone">{title}</h1>
      <p className="mt-3 max-w-sm text-body text-smoke">{body}</p>
      <a
        href="/"
        className="pressable mt-6 rounded-sm bg-brass px-4 py-2.5 text-sm font-semibold text-ink hover-lift"
      >
        Browse artisans
      </a>
    </div>
  );
}
