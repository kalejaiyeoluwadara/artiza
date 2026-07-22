"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Share, PlusSquare, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  // Which platform this is doesn't change while the page is open, so it is
  // read rather than stored — but only after hydration, since the server has
  // no user agent to match against.
  const hydrated = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);
  const isIOS =
    hydrated &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !("MSStream" in window);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (isStandalone) {
      return;
    }

    // 2. Register service worker for PWA
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err);
      });
    }

    // 4. Check dismissal memory (don't show if dismissed within 7 days)
    const dismissedAt = localStorage.getItem("artiza-pwa-dismissed");
    if (dismissedAt) {
      const parsedDate = new Date(dismissedAt);
      const diffDays = Math.ceil(
        Math.abs(new Date().getTime() - parsedDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 7) {
        return;
      }
    }

    // Both paths schedule the prompt, so one handle covers both — and it is
    // declared out here rather than inside the listener, because a cleanup
    // returned from an event handler is never called by anything.
    let promptTimer: ReturnType<typeof setTimeout> | undefined;

    // 5. Listen for beforeinstallprompt (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Present prompt after a short initial viewing window.
      clearTimeout(promptTimer);
      promptTimer = setTimeout(() => setShowPrompt(true), 8000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. iOS has no beforeinstallprompt, so it gets a plain delay instead.
    if (isIOS) {
      promptTimer = setTimeout(() => setShowPrompt(true), 10000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      clearTimeout(promptTimer);
    };
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback if event hasn't fired yet
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install outcome: ${outcome}`);

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("artiza-pwa-dismissed", new Date().toISOString());
    setShowPrompt(false);
    setShowIOSInstructions(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <div className="fixed inset-x-0 bottom-20 z-[90] mx-auto flex max-w-md flex-col px-4 sm:bottom-6">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <button
              onClick={handleDismiss}
              aria-label="Close install prompt"
              className="pressable absolute top-3.5 right-3.5 flex size-8 items-center justify-center rounded-full bg-fill text-sub hover:text-ink"
            >
              <X className="size-4" />
            </button>

            {!showIOSInstructions ? (
              <div>
                <div className="flex items-start gap-3.5 pr-6">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas shadow-sm">
                    <Image
                      src="/icon-192.png"
                      alt="Artiza App Icon"
                      width={48}
                      height={48}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="headline font-bold text-ink">
                      Install Artiza App
                    </h3>
                    <p className="caption mt-0.5 leading-relaxed text-sub">
                      Add to your home screen for 1-tap artisan unlocks, offline access, and instant updates in Ilisan.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2.5">
                  <button
                    onClick={handleDismiss}
                    className="pressable flex-1 rounded-full bg-fill py-2.5 text-center text-sm font-semibold text-ink"
                  >
                    Not now
                  </button>
                  <button
                    onClick={handleInstallClick}
                    className="pressable flex-1 rounded-full bg-accent py-2.5 text-center text-sm font-semibold text-white shadow-sm"
                  >
                    Install App
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3.5 pr-6">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas shadow-sm">
                    <Image
                      src="/icon-192.png"
                      alt="Artiza App Icon"
                      width={48}
                      height={48}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="headline font-bold text-ink">
                      How to Install on iOS
                    </h3>
                    <div className="caption mt-2 space-y-2 text-sub">
                      <p className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                          1
                        </span>
                        <span>
                          Tap the <Share className="inline size-4 text-accent" /> Share button in Safari navigation.
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                          2
                        </span>
                        <span>
                          Scroll down and tap <PlusSquare className="inline size-4 text-ink" /> <b>&quot;Add to Home Screen&quot;</b>.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleDismiss}
                    className="pressable w-full rounded-full bg-accent py-2.5 text-center text-sm font-semibold text-white shadow-sm"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
