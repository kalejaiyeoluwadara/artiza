"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Baby, LayoutGrid, Paintbrush, Hammer, HardHat, Zap, Droplet } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../ui/Card";
import { CategoryGridSkeleton } from "../ui/LoadingSkeleton";

interface CategoryItem {
  key: 'nanny' | 'tiler' | 'painter' | 'carpenter' | 'labourer' | 'electrician' | 'plumber';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
}

const categoryMeta: CategoryItem[] = [
  { key: "nanny", label: "Nannies", icon: Baby, color: "bg-rose-50 border-rose-100 text-rose-500", hoverColor: "hover:border-rose-300" },
  { key: "tiler", label: "Tilers", icon: LayoutGrid, color: "bg-sky-50 border-sky-100 text-sky-500", hoverColor: "hover:border-sky-300" },
  { key: "painter", label: "Painters", icon: Paintbrush, color: "bg-indigo-50 border-indigo-100 text-indigo-500", hoverColor: "hover:border-indigo-300" },
  { key: "carpenter", label: "Carpenters", icon: Hammer, color: "bg-amber-50 border-amber-100 text-amber-500", hoverColor: "hover:border-amber-300" },
  { key: "labourer", label: "Labourers", icon: HardHat, color: "bg-slate-100 border-slate-200 text-slate-600", hoverColor: "hover:border-slate-400" },
  { key: "electrician", label: "Electricians", icon: Zap, color: "bg-yellow-50 border-yellow-100 text-yellow-600", hoverColor: "hover:border-yellow-300" },
  { key: "plumber", label: "Plumbers", icon: Droplet, color: "bg-teal-50 border-teal-100 text-teal-600", hoverColor: "hover:border-teal-300" }
];

export const CategoryGrid: React.FC = () => {
  const router = useRouter();
  const { workers, isLoaded } = useApp();

  const getCategoryCount = (key: CategoryItem["key"]) =>
    workers.filter((w) => w.active && w.category === key).length;

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto w-full">
      <div className="text-center sm:text-left mb-8">
        <h2 className="text-2xl font-black text-zinc-800 tracking-tight">
          Browse by Service Category
        </h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Select a category to view active registered artisans in Ilisan.
        </p>
      </div>

      {!isLoaded ? (
        <CategoryGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categoryMeta.map((cat) => {
            const Icon = cat.icon;
            const count = getCategoryCount(cat.key);
            return (
              <button
                key={cat.key}
                onClick={() => router.push(`/browse?category=${cat.key}`)}
                className="group text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl cursor-pointer"
                aria-label={`Browse ${cat.label}, ${count} available`}
              >
                <Card
                  variant="default"
                  className="flex flex-col items-center p-5 border border-zinc-100/60 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:bg-amber-50/10 group-hover:border-amber-200"
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${cat.color} group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-zinc-700 group-hover:text-amber-600 transition-colors">
                    {cat.label}
                  </h3>
                  <span className="mt-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {count} {count === 1 ? "worker" : "workers"}
                  </span>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
export default CategoryGrid;
