"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { BannerSkeleton } from "../ui/LoadingSkeleton";

export const BannersCarousel: React.FC = () => {
  const { banners, isLoaded } = useApp();
  const activeBanners = banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Restart autoplay when active banners change
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [activeBanners.length]);

  const startAutoplay = () => {
    stopAutoplay();
    if (activeBanners.length > 1) {
      autoplayRef.current = setInterval(() => {
        handleNext();
      }, 6000);
    }
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  if (!isLoaded) return <BannerSkeleton />;

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  // Framer-motion animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-zinc-100 rounded-3xl h-[220px] sm:h-[260px] shadow-sm cursor-grab active:cursor-grabbing border border-zinc-200/50"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* Animated Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentBanner.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`absolute inset-0 w-full h-full flex flex-col justify-center p-6 sm:p-10 bg-gradient-to-br ${currentBanner.bgGradient}`}
        >
          <div className="max-w-md sm:max-w-xl flex flex-col gap-2.5 z-10 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 bg-white/10 px-2.5 py-1 rounded-full w-max backdrop-blur-sm border border-white/5">
              Ilisan Hands Update
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
              {currentBanner.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium drop-shadow-sm">
              {currentBanner.subtitle}
            </p>
            {currentBanner.ctaText && currentBanner.ctaLink && (
              <Link
                href={currentBanner.ctaLink}
                className="mt-2.5 w-max rounded-xl bg-white/95 px-5 py-2.5 text-xs font-bold text-zinc-900 shadow-lg shadow-black/10 transition-all hover:bg-white hover:scale-105 active:scale-95 border border-zinc-100/50"
              >
                {currentBanner.ctaText}
              </Link>
            )}
          </div>

          {/* Grid Background Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Control Buttons (Overlay) */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-90 transition-all border border-white/10 z-20 cursor-pointer"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-90 transition-all border border-white/10 z-20 cursor-pointer"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default BannersCarousel;
