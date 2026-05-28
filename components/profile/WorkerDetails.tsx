"use client";

import React from "react";
import { MessageSquare, MapPin, BadgePercent, Star, MessageCircleCode, AlertCircle } from "lucide-react";
import { Worker } from "../../context/AppContext";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { useToast } from "../../hooks/useToast";

interface WorkerDetailsProps {
  worker: Worker;
}

export const WorkerDetails: React.FC<WorkerDetailsProps> = ({ worker }) => {
  const toast = useToast();
  const isInactive = !worker.active;

  const handleWhatsAppContact = () => {
    if (isInactive) {
      toast.error("This worker is currently unavailable for hire.");
      return;
    }

    const cleanPhone = worker.phone.replace(/[^\d]/g, "");
    const message = encodeURIComponent(
      `Hello ${worker.name},\n\nI saw your skilled worker profile on IlisanHands for "${worker.category}" services. I would like to inquire about hiring you for an upcoming job.`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    const popup = window.open(whatsappUrl, "_blank");
    if (!popup) {
      toast.error("Pop-up blocked. Please allow pop-ups or tap the link again.");
    } else {
      toast.success(`Opening WhatsApp chat with ${worker.name}...`);
    }
  };

  return (
    <Card
      variant="default"
      className={`p-6 md:p-8 border shadow-md ${
        isInactive ? "border-zinc-200/80 opacity-90" : "border-zinc-200/80"
      }`}
    >
      {isInactive && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-amber-900">Currently Unavailable</p>
            <p className="text-xs font-semibold text-amber-800/80 mt-0.5 leading-relaxed">
              This worker profile is inactive and not accepting new hires at the moment.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-5xl shadow-md shadow-zinc-100 flex-shrink-0 mx-auto sm:mx-0">
          {worker.photo}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
                {worker.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge variant="category" categoryType={worker.category}>
                  {worker.category.toUpperCase()}
                </Badge>
                {worker.featured && worker.active && (
                  <Badge variant="primary" className="font-extrabold uppercase">
                    TOP CHOICE
                  </Badge>
                )}
                {isInactive && (
                  <Badge variant="neutral" className="font-extrabold uppercase">
                    Unavailable
                  </Badge>
                )}
              </div>
            </div>

            <div className="inline-flex self-center sm:self-auto items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 font-extrabold">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-black">{worker.rating}</span>
              <span className="text-[10px] text-zinc-400">/ 5.0</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-50">
            <div className="flex items-center gap-2.5 text-zinc-600 pl-0.5">
              <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="text-xs font-semibold">{worker.location}</span>
            </div>

            <div className="flex items-center gap-2.5 text-zinc-600 pl-0.5">
              <BadgePercent className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-lg">
                {worker.priceRange}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-0.5 mb-2.5">
          Professional Bio
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed font-semibold">
          {worker.bio}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-0.5 mb-3">
          Vetted Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {worker.skills.map((skill, index) => (
            <span
              key={index}
              className="text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200/40 rounded-xl px-3 py-1.5 hover:bg-zinc-100 hover:border-zinc-200 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-50">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={isInactive}
          className="font-black cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-60"
          onClick={handleWhatsAppContact}
          leftIcon={<MessageCircleCode className="h-5 w-5 fill-white text-emerald-500" />}
        >
          {isInactive ? "Contact Unavailable" : "Contact / Hire on WhatsApp"}
        </Button>
        {!isInactive && (
          <p className="text-[10px] text-zinc-400 font-bold text-center mt-2.5 uppercase tracking-wider">
            Opens a prefilled chat directly with the worker
          </p>
        )}
      </div>
    </Card>
  );
};
export default WorkerDetails;
