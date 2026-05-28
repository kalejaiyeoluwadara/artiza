"use client";

import React from "react";
import { motion } from "framer-motion";
import Hero from "../components/landing/Hero";
import BannersCarousel from "../components/landing/BannersCarousel";
import CategoryGrid from "../components/landing/CategoryGrid";
import FeaturedWorkers from "../components/landing/FeaturedWorkers";
import HowItWorks from "../components/how-it-works/HowItWorks";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 pb-16"
    >
      {/* Hero Section */}
      <Hero />

      {/* Banner and Category Carousel Area */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <BannersCarousel />
      </div>

      {/* Category Grid Section */}
      <CategoryGrid />

      {/* Featured Workers Section */}
      <FeaturedWorkers />

      {/* How it Works Section */}
      <HowItWorks />
    </motion.div>
  );
}
