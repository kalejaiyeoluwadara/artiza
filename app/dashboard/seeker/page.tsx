"use client";

import React from "react";
import Link from "next/link";
import { Star, MessageSquare, Briefcase, Mail, User, Sparkles } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import DashboardGuard from "../../../components/dashboard/DashboardGuard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function SeekerDashboard() {
  const { currentUser, reviews, workers } = useApp();

  // Find reviews written by this seeker
  const seekerReviews = reviews.filter((r) => r.reviewerId === currentUser.id);

  // Helper to find worker details for review reference
  const getWorkerName = (workerId: string) => {
    const w = workers.find((item) => item.id === workerId);
    return w ? w.name : "Unknown Artisan";
  };

  return (
    <DashboardGuard allowedRoles={["seeker"]}>
      <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Seeker Dashboard
            </h1>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">
              Welcome back, {currentUser.name}! Track and manage reviews you&apos;ve posted.
            </p>
          </div>
          <Button
            href="/browse"
            variant="primary"
            size="sm"
            className="font-bold cursor-pointer"
            leftIcon={<Briefcase className="h-4 w-4" />}
          >
            Find More Hands
          </Button>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* User profile card */}
          <Card variant="default" className="p-6 border border-zinc-200/85 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-800 tracking-tight">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Client Seeker
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-50">
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold">
                <MessageSquare className="h-4 w-4 text-zinc-400" />
                <span>{seekerReviews.length} Reviews Written</span>
              </div>
            </div>
          </Card>

          {/* Reviews list panel */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <h2 className="text-base font-black text-zinc-800 border-b border-zinc-100 pb-3 pl-1 tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Your Feedback History ({seekerReviews.length})
            </h2>

            {seekerReviews.length === 0 ? (
              <Card variant="flat" className="p-8 text-center border border-zinc-200/40 rounded-3xl min-h-[200px] flex flex-col justify-center items-center">
                <MessageSquare className="h-8 w-8 text-zinc-400 mb-2" />
                <h4 className="text-sm font-extrabold text-zinc-700">No Reviews Posted</h4>
                <p className="text-xs text-zinc-500 font-semibold max-w-xs mt-1 leading-relaxed">
                  You haven&apos;t left feedback for any artisans in Ilisan yet. Hired a worker? Leave a review on their profile page.
                </p>
                <Button
                  href="/browse"
                  variant="secondary"
                  size="sm"
                  className="mt-5 font-bold cursor-pointer"
                >
                  Browse Workers List
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {seekerReviews.map((rev) => (
                  <Card key={rev.id} variant="default" className="p-5 border border-zinc-100 shadow-sm flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Review for
                        </h4>
                        <Link
                          href={`/profile/${rev.workerId}`}
                          className="text-sm font-black text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          {getWorkerName(rev.workerId)}
                        </Link>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= rev.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-zinc-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                    
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-right">
                      Posted on {rev.date}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardGuard>
  );
}
