"use client";

import React from "react";
import { Filter, RotateCcw, Award, MapPin, DollarSign, ListFilter } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface WorkerFilterProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  clearFilters: () => void;
}

export const WorkerFilter: React.FC<WorkerFilterProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedRating,
  setSelectedRating,
  maxPrice,
  setMaxPrice,
  clearFilters
}) => {
  const categories = [
    { key: "all", label: "All Categories" },
    { key: "nanny", label: "Nannies & Babysitters" },
    { key: "tiler", label: "Tilers & Floor Experts" },
    { key: "painter", label: "Painters & Decorators" },
    { key: "carpenter", label: "Carpenters & Woodworkers" },
    { key: "labourer", label: "General Labourers" },
    { key: "electrician", label: "Electricians & wiring" },
    { key: "plumber", label: "Plumbers & Pipes" }
  ];

  const locations = [
    "All Locations",
    "Babcock University Area",
    "Irolu Road",
    "Palace Area",
    "Toll Gate",
    "Oke-Oyi",
    "Expressway Junction",
    "Town Center"
  ];

  const ratingOptions = [
    { label: "Any Rating", value: 0 },
    { label: "4.0+ Stars", value: 4.0 },
    { label: "4.5+ Stars", value: 4.5 },
    { label: "5.0 Stars", value: 5.0 }
  ];

  return (
    <Card variant="default" className="p-6 border border-zinc-200/80 shadow-sm flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <h3 className="text-sm font-extrabold text-zinc-800 flex items-center gap-2">
          <Filter className="h-4 w-4 text-orange-500" />
          Filter Workers
        </h3>
        <button
          onClick={clearFilters}
          className="text-xs font-bold text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
          <ListFilter className="h-3.5 w-3.5 text-zinc-400" />
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-semibold"
        >
          {categories.map((cat) => (
            <option key={cat.key} value={cat.key} className="font-semibold text-zinc-700">
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
          Neighborhood
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-semibold"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc} className="font-semibold text-zinc-700">
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing Range Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center pl-0.5 pr-0.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
            Max Daily Price
          </label>
          <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-lg">
            {maxPrice === 15000 ? "Any Price" : `₦${maxPrice.toLocaleString()}`}
          </span>
        </div>
        <input
          type="range"
          min="2000"
          max="15000"
          step="500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 font-bold px-0.5">
          <span>₦2k</span>
          <span>₦8k</span>
          <span>₦15k</span>
        </div>
      </div>

      {/* Ratings Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
          <Award className="h-3.5 w-3.5 text-zinc-400" />
          Minimum Rating
        </label>
        <div className="flex flex-col gap-1.5">
          {ratingOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 px-3.5 py-2.5 text-xs font-bold text-zinc-600 cursor-pointer hover:bg-zinc-50 transition-colors ${
                selectedRating === opt.value
                  ? "border-amber-200 bg-amber-50/30 text-amber-700"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="ratingFilter"
                checked={selectedRating === opt.value}
                onChange={() => setSelectedRating(opt.value)}
                className="h-4 w-4 accent-orange-500 cursor-pointer"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
};
export default WorkerFilter;
