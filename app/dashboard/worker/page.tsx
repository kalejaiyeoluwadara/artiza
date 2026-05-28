"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "../../../context/AppContext";
import DashboardGuard from "../../../components/dashboard/DashboardGuard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import { useToast } from "../../../hooks/useToast";
import { Star, Hammer, MapPin, Eye, EyeOff, Save, ShieldCheck, Plus, X } from "lucide-react";

export default function WorkerDashboard() {
  const { currentUser, workers, reviews, updateWorker, toggleWorkerStatus } = useApp();
  const toast = useToast();

  // Find this worker's profile
  const workerProfile = workers.find((w) => w.id === currentUser.workerProfileId);

  // Form states
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState<'nanny' | 'tiler' | 'painter' | 'carpenter' | 'labourer' | 'electrician' | 'plumber'>("nanny");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Populate form values when profile loads
  useEffect(() => {
    if (workerProfile) {
      setBio(workerProfile.bio);
      setCategory(workerProfile.category);
      setLocation(workerProfile.location);
      setPhone(workerProfile.phone);
      setPriceRange(workerProfile.priceRange);
      setSkills(workerProfile.skills);
    }
  }, [workerProfile]);

  if (!workerProfile) {
    return (
      <DashboardGuard allowedRoles={["worker"]}>
        <div className="mx-auto max-w-md px-4 py-16 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-rose-500 shadow-inner mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-zinc-800 tracking-tight">
            No Worker Profile Found
          </h2>
          <p className="text-xs text-zinc-500 font-semibold max-w-xs mt-1.5 leading-relaxed">
            Your worker profile is not fully registered in our database. Please contact an administrator to set up your profile first.
          </p>
        </div>
      </DashboardGuard>
    );
  }

  // Get reviews received by this worker
  const receivedReviews = reviews.filter((r) => r.workerId === workerProfile.id);

  // Add skill handler
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = newSkill.trim();
    if (!cleanSkill) return;

    if (skills.includes(cleanSkill)) {
      toast.info("Skill tag already exists!");
      return;
    }

    setSkills([...skills, cleanSkill]);
    setNewSkill("");
  };

  // Remove skill handler
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Profile Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorker(workerProfile.id, {
      bio,
      category,
      location,
      phone,
      priceRange,
      skills
    });
  };

  const categories = [
    { key: "nanny", label: "Nannies & Babysitters" },
    { key: "tiler", label: "Tilers & Floor Experts" },
    { key: "painter", label: "Painters & Decorators" },
    { key: "carpenter", label: "Carpenters & Woodworkers" },
    { key: "labourer", label: "General Labourers" },
    { key: "electrician", label: "Electricians & wiring" },
    { key: "plumber", label: "Plumbers" }
  ];

  const locations = [
    "Babcock University Area",
    "Irolu Road",
    "Palace Area",
    "Toll Gate",
    "Oke-Oyi",
    "Expressway Junction",
    "Town Center"
  ];

  return (
    <DashboardGuard allowedRoles={["worker"]}>
      <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Worker Profile Dashboard
            </h1>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">
              Manage your availability, edit skills portfolio, and track reviews from customers in Ilisan.
            </p>
          </div>
          
          <Button
            href={`/profile/${workerProfile.id}`}
            variant="outline"
            size="sm"
            className="font-bold cursor-pointer"
            leftIcon={<Eye className="h-4 w-4" />}
          >
            Preview Public Profile
          </Button>
        </div>

        {/* Availability controls banner */}
        <Card variant="glass" className={`mb-8 p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
          workerProfile.active 
            ? "bg-emerald-50/20 border-emerald-200/50 shadow-inner" 
            : "bg-amber-50/20 border-amber-200/50 shadow-inner"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              workerProfile.active ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20"
            }`}>
              {workerProfile.active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-extrabold text-zinc-800 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                Discovery Status: 
                <span className={workerProfile.active ? "text-emerald-600" : "text-amber-600"}>
                  {workerProfile.active ? "Online & Discoverable" : "Offline / Booked"}
                </span>
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                {workerProfile.active 
                  ? "Clients can search for you and contact you on WhatsApp." 
                  : "You are temporarily hidden from search listings."
                }
              </p>
            </div>
          </div>

          <Button
            variant={workerProfile.active ? "outline" : "primary"}
            size="sm"
            onClick={() => toggleWorkerStatus(workerProfile.id)}
            className="cursor-pointer font-bold w-full sm:w-auto"
          >
            {workerProfile.active ? "Go Offline" : "Go Online & Active"}
          </Button>
        </Card>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left / Profile Form column */}
          <div className="lg:col-span-2">
            <Card variant="default" className="p-6 border border-zinc-200/80 shadow-md">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-extrabold text-zinc-800 uppercase tracking-wider">
                  Edit Artisan Details
                </h2>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name (readonly) */}
                  <Input
                    label="Artisan Name (Vetted Identity)"
                    value={workerProfile.name}
                    disabled
                    containerClassName="opacity-75"
                  />

                  {/* Category select */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                      Skill Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-semibold"
                    >
                      {categories.map((cat) => (
                        <option key={cat.key} value={cat.key} className="font-semibold">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location select */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                      Coverage Neighborhood
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-semibold"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc} className="font-semibold">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* WhatsApp contact phone */}
                  <Input
                    label="WhatsApp Phone Number (e.g. 234803...)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Price range */}
                <Input
                  label="Daily Price Range Rate Quote (e.g. ₦3,500 - ₦5,000 / day)"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  required
                />

                {/* Bio text area */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bio-input" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                    Worker Bio Details
                  </label>
                  <textarea
                    id="bio-input"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-semibold"
                    required
                  />
                </div>

                {/* Skills tags interactive manager */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                    Manage Skill Tags
                  </label>
                  
                  {/* Add Tag row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill... (e.g. Baby CPR, Floor polishing)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 font-semibold"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddSkill}
                      className="font-bold cursor-pointer flex-shrink-0"
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add Tag
                    </Button>
                  </div>

                  {/* Tags list box */}
                  <div className="flex flex-wrap gap-1.5 mt-1 bg-zinc-50/50 border border-zinc-100 rounded-xl p-3">
                    {skills.length === 0 ? (
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">
                        No skill tags added yet. Write above to list specific skills.
                      </span>
                    ) : (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-0.5 active:scale-90"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Submit save changes */}
                <Button
                  type="submit"
                  variant="primary"
                  className="font-black cursor-pointer shadow-lg shadow-amber-500/10 mt-2.5"
                  rightIcon={<Save className="h-4.5 w-4.5" />}
                >
                  Save Profile Changes
                </Button>
              </form>
            </Card>
          </div>

          {/* Right / Reviews Received column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Rating Stats Card */}
            <Card variant="default" className="p-6 border border-zinc-200/80 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-0.5 mb-3">
                Rating Average
              </h3>
              <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-700 text-2xl font-black shadow-inner">
                {workerProfile.rating}
              </div>
              <div className="flex items-center gap-0.5 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(workerProfile.rating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-2.5">
                Vetted from {receivedReviews.length} client review{receivedReviews.length !== 1 ? "s" : ""}
              </p>
            </Card>

            {/* Reviews received list */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1.5 border-b border-zinc-100 pb-2">
                Recent Client Feedback
              </h3>

              {receivedReviews.length === 0 ? (
                <Card variant="flat" className="p-6 text-center border border-zinc-200/40 rounded-2xl min-h-[100px] flex items-center justify-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    No client reviews received yet.
                  </span>
                </Card>
              ) : (
                receivedReviews.map((rev) => (
                  <Card key={rev.id} variant="default" className="p-4.5 border border-zinc-100 shadow-sm flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-700 tracking-tight">
                          {rev.reviewerName}
                        </h4>
                        <span className="text-[9px] text-zinc-400 font-bold">
                          {rev.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= rev.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-zinc-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold italic">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardGuard>
  );
}
