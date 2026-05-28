"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles } from "lucide-react";

export const Hero: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = [
    { key: "nanny", label: "Nannies & Babysitters" },
    { key: "tiler", label: "Tilers & Floor Experts" },
    { key: "painter", label: "Painters & Decorators" },
    { key: "carpenter", label: "Carpenters & Woodworkers" },
    { key: "labourer", label: "General Labourers" },
    { key: "electrician", label: "Electricians & Wiring" },
    { key: "plumber", label: "Plumbers" }
  ];

  const filteredSuggestions = searchQuery
    ? categories.filter((c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/browse");
    }
  };

  const selectSuggestion = (label: string) => {
    setSearchQuery(label);
    setShowSuggestions(false);
    router.push(`/browse?q=${encodeURIComponent(label)}`);
  };

  return (
    <section className="relative py-12 md:py-20 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Visual Background Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-orange-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/50 px-3.5 py-1 text-xs font-bold text-amber-700 mb-6 animate-fade-in">
        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
        <span>Verified Skilled Labour in Ilisan-Remo</span>
      </div>

      {/* Headlines */}
      <h1 className="max-w-3xl text-3xl sm:text-5xl font-black leading-[1.15] text-zinc-900 tracking-tight">
        Find Reliable, Trusted <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
          Skilled Hands
        </span>{" "}
        in Ilisan Instantly
      </h1>

      <p className="mt-4 max-w-lg text-sm sm:text-base text-zinc-500 leading-relaxed font-medium">
        Connecting Babcock University students, staff, and Ilisan residents with rated, verified local labourers, nannies, tilers, and painters.
      </p>

      {/* Main Search Panel */}
      <div className="mt-8 w-full max-w-xl relative z-30">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white border border-zinc-200/80 shadow-lg shadow-zinc-100/80"
        >
          {/* Input field */}
          <div className="relative flex-1 w-full flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="What service do you need? (e.g. tiler, nanny...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none"
            />
          </div>

          {/* Location indicator */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-zinc-100 px-4 text-zinc-500">
            <MapPin className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-semibold text-zinc-700">Ilisan</span>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm px-6 py-3 hover:from-amber-600 hover:to-orange-600 active:scale-[0.97] transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Find Hands
          </button>
        </form>

        {/* Autocomplete Suggestions Box */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSuggestions(false)}
            />
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-xl text-left z-20 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.key}
                  onClick={() => selectSuggestion(suggestion.label)}
                  className="flex items-center w-full gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Search className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Popular Quick Links */}
      <div className="mt-5 flex flex-wrap justify-center items-center gap-2 max-w-md">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">
          Popular:
        </span>
        {categories.slice(0, 4).map((cat) => (
          <button
            key={cat.key}
            onClick={() => router.push(`/browse?category=${cat.key}`)}
            className="rounded-full bg-zinc-50 border border-zinc-200/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200/50 active:scale-95 transition-all cursor-pointer"
          >
            {cat.label.split(" ")[0]}
          </button>
        ))}
      </div>
    </section>
  );
};
export default Hero;
