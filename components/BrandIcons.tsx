/**
 * Lucide dropped brand marks, and WhatsApp and Instagram are how people in
 * Ilisan actually recognise a channel — a generic speech bubble reads as
 * "some chat app". Drawn here at Lucide's 24-unit grid so they sit at the
 * same optical weight as the rest of the icon set.
 */

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.25 8.24a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.25 8.24-8.25Z" />
      <path d="M8.53 7.33c-.19-.42-.38-.43-.56-.44h-.48c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.71 2.75 4.22 3.74 2.09.82 2.51.66 2.97.62.46-.04 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.35-.76-1.85Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

/**
 * Snapchat's ghost, simplified.
 *
 * The real mark is a fussy silhouette that turns to mush at 16px, so this keeps
 * only what makes it recognisable — the domed head, the notched hem, the two
 * eyes — at the same optical weight as the other marks in this file.
 */
export function SnapchatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M12 2.4c3.02 0 5.05 2.2 5.05 5.2 0 .8-.05 1.6-.13 2.35.35.17.75.2 1.13.08.5-.16 1.02.1 1.18.6.16.5-.1 1.03-.6 1.19-.6.19-1.02.35-1.36.5.28.86.8 1.72 1.56 2.4.5.44 1.1.78 1.78.98.44.13.72.56.66 1.01-.06.46-.43.8-.89.83-.9.06-1.6.2-2.06.4-.13.35-.24.75-.35 1.1-.13.44-.57.72-1.02.65-.6-.1-1.2-.13-1.75-.05-.6.09-1.1.36-1.68.75-.42.28-.85.5-1.52.5s-1.1-.22-1.52-.5c-.58-.39-1.08-.66-1.68-.75-.55-.08-1.15-.05-1.75.05-.45.07-.89-.21-1.02-.65-.11-.35-.22-.75-.35-1.1-.46-.2-1.16-.34-2.06-.4a.94.94 0 0 1-.89-.83c-.06-.45.22-.88.66-1.01a4.9 4.9 0 0 0 1.78-.98c.76-.68 1.28-1.54 1.56-2.4-.34-.15-.76-.31-1.36-.5a.94.94 0 0 1-.6-1.19c.16-.5.68-.76 1.18-.6.38.12.78.09 1.13-.08a17.4 17.4 0 0 1-.13-2.35c0-3 2.03-5.2 5.05-5.2Z" />
    </svg>
  );
}
