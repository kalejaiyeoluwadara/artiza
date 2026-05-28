"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Worker } from "../../context/AppContext";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface WorkerCardProps {
  worker: Worker;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        variant="default"
        hoverEffect={true}
        className="flex flex-col h-full border border-zinc-100/80 shadow-sm"
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Avatar & Rating header */}
          <div className="flex items-start justify-between gap-4">
            <div className="h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              {worker.photo}
            </div>

            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-100/60 text-amber-700">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-black">{worker.rating}</span>
              <span className="text-[10px] text-zinc-400 font-semibold">
                ({worker.reviewsCount})
              </span>
            </div>
          </div>

          {/* Name & Category */}
          <h3 className="text-base font-extrabold text-zinc-800 mt-3 tracking-tight">
            {worker.name}
          </h3>

          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="category" categoryType={worker.category}>
              {worker.category.toUpperCase()}
            </Badge>
          </div>

          {/* Bio snippet */}
          <p className="text-xs text-zinc-500 font-medium line-clamp-2 mt-2 leading-relaxed">
            {worker.bio}
          </p>

          {/* Skills tags list */}
          <div className="mt-3 flex flex-wrap gap-1">
            {worker.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="text-[9px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200/40 rounded px-1.5 py-0.5"
              >
                {skill}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="text-[9px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-100 rounded px-1 py-0.5">
                +{worker.skills.length - 3} more
              </span>
            )}
          </div>

          {/* Location and pricing information */}
          <div className="mt-auto pt-4 border-t border-zinc-50 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <MapPin className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
              <span className="text-xs font-semibold truncate">{worker.location}</span>
            </div>
            
            <div className="flex justify-between items-center bg-zinc-50/50 rounded-lg p-2 border border-zinc-100/40 mt-1">
              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
                Price Range
              </span>
              <span className="text-xs font-black text-zinc-700">
                {worker.priceRange.split("/")[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <Button
            href={`/profile/${worker.id}`}
            variant="outline"
            size="sm"
            fullWidth
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            className="cursor-pointer font-bold text-xs"
          >
            Hire / View Profile
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
export default WorkerCard;
