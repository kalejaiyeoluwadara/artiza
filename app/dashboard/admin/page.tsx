"use client";

import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import DashboardGuard from "../../../components/dashboard/DashboardGuard";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import { useToast } from "../../../hooks/useToast";
import {
  Users,
  Hammer,
  Layers,
  Star,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  UserPlus,
  Tv,
  CheckCircle,
  FileText
} from "lucide-react";

export default function AdminDashboard() {
  const {
    workers,
    reviews,
    banners,
    addWorker,
    deleteWorker,
    toggleWorkerStatus,
    addBanner,
    toggleBannerStatus,
    deleteBanner
  } = useApp();

  const toast = useToast();
  
  // Navigation tabs: 'workers' | 'banners' | 'users'
  const [activeTab, setActiveTab] = useState<'workers' | 'banners' | 'users'>("workers");

  const [deleteConfirm, setDeleteConfirm] = useState<
    | { type: "worker"; id: string; name: string }
    | { type: "banner"; id: string; title: string }
    | null
  >(null);

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "worker") {
      deleteWorker(deleteConfirm.id);
    } else {
      deleteBanner(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  // Worker creation form states
  const [wName, setWName] = useState("");
  const [wCategory, setWCategory] = useState<'nanny' | 'tiler' | 'painter' | 'carpenter' | 'labourer' | 'electrician' | 'plumber'>("nanny");
  const [wLocation, setWLocation] = useState("Babcock University Area");
  const [wPhone, setWPhone] = useState("");
  const [wPriceRange, setWPriceRange] = useState("₦4,000 - ₦6,000 / day");
  const [wBio, setWBio] = useState("");
  const [wSkills, setWSkills] = useState(""); // comma separated
  const [wPhoto, setWPhoto] = useState("🛠️"); // Emoji character as symbol avatar

  // Banner creation form states
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bCtaText, setBCtaText] = useState("View Details");
  const [bCtaLink, setBCtaLink] = useState("/browse");
  const [bGradient, setBGradient] = useState("from-amber-500 to-orange-600"); // gradient select

  // Submit new worker
  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wName || !wPhone || !wBio) {
      toast.error("Please fill in all required worker details.");
      return;
    }

    const skillsArray = wSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    addWorker({
      name: wName,
      category: wCategory,
      location: wLocation,
      phone: wPhone,
      priceRange: wPriceRange,
      bio: wBio,
      skills: skillsArray.length > 0 ? skillsArray : ["General Services"],
      photo: wPhoto,
      featured: false
    });

    // Reset Form
    setWName("");
    setWPhone("");
    setWBio("");
    setWSkills("");
    setWPhoto("🛠️");
  };

  // Submit new banner
  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bSubtitle) {
      toast.error("Please specify a banner title and subtitle.");
      return;
    }

    addBanner({
      title: bTitle,
      subtitle: bSubtitle,
      bgGradient: bGradient,
      textColor: "text-white",
      active: true,
      ctaText: bCtaText,
      ctaLink: bCtaLink
    });

    // Reset Form
    setBTitle("");
    setBSubtitle("");
    setBCtaText("View Details");
    setBCtaLink("/browse");
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

  const gradientOptions = [
    { value: "from-amber-500 to-orange-600", label: "Sunset Gold (Amber-Orange)" },
    { value: "from-blue-600 to-indigo-700", label: "Royal Blue (Blue-Indigo)" },
    { value: "from-emerald-500 to-teal-600", label: "Forest Mint (Emerald-Teal)" },
    { value: "from-rose-500 to-pink-600", label: "Plum Rose (Rose-Pink)" },
    { value: "from-zinc-700 to-slate-900", label: "Dark Iron (Zinc-Slate)" }
  ];

  const workerAvatars = ["🛠️", "🎨", "👶", "🏗️", "🔨", "🖌️", "⚡", "💧", "🧹", "👩‍🍳", "📦"];

  return (
    <DashboardGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-zinc-500 font-semibold mt-0.5">
            Overview site statistics, register offline workers, configure carousel promotion slides, and moderate reviews.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="flat" className="p-4 flex items-center gap-3 bg-zinc-50 border border-zinc-150">
            <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-zinc-800">{workers.length}</div>
              <div className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Workers</div>
            </div>
          </Card>

          <Card variant="flat" className="p-4 flex items-center gap-3 bg-zinc-50 border border-zinc-150">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="text-lg font-black text-zinc-800">{reviews.length}</div>
              <div className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Reviews</div>
            </div>
          </Card>

          <Card variant="flat" className="p-4 flex items-center gap-3 bg-zinc-50 border border-zinc-150">
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-zinc-800">{banners.length}</div>
              <div className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Banners</div>
            </div>
          </Card>

          <Card variant="flat" className="p-4 flex items-center gap-3 bg-zinc-50 border border-zinc-150">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-zinc-800">4</div>
              <div className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Mock Users</div>
            </div>
          </Card>
        </div>

        {/* Tab switcher navigation */}
        <div className="flex gap-1.5 border-b border-zinc-200/60 pb-3 mb-8 overflow-x-auto">
          <Button
            variant={activeTab === "workers" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("workers")}
            className="font-bold cursor-pointer flex-shrink-0"
            leftIcon={<Hammer className="h-4 w-4" />}
          >
            Manage Workers
          </Button>
          <Button
            variant={activeTab === "banners" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("banners")}
            className="font-bold cursor-pointer flex-shrink-0"
            leftIcon={<Tv className="h-4 w-4" />}
          >
            Carousel Banners
          </Button>
          <Button
            variant={activeTab === "users" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("users")}
            className="font-bold cursor-pointer flex-shrink-0"
            leftIcon={<Users className="h-4 w-4" />}
          >
            Mock Account Index
          </Button>
        </div>

        {/* Active Tab View */}
        <div>
          {/* Tab 1: Workers Management */}
          {activeTab === "workers" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Workers List Column */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1.5 mb-2">
                  Artisan Database ({workers.length})
                </h3>

                <div className="flex flex-col gap-3">
                  {workers.map((worker) => (
                    <Card
                      key={worker.id}
                      variant="default"
                      className="p-4 flex items-center justify-between gap-4 border border-zinc-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                          {worker.photo}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-zinc-800 tracking-tight flex items-center gap-1.5">
                            {worker.name}
                            <span className={`h-1.5 w-1.5 rounded-full ${worker.active ? "bg-emerald-500" : "bg-zinc-300"}`} />
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">
                              {worker.category}
                            </span>
                            <span className="text-zinc-300 text-[8px]">•</span>
                            <span className="text-[9px] font-semibold text-zinc-500 truncate max-w-[120px]">
                              {worker.location.split(" ")[0]}
                            </span>
                            <span className="text-zinc-300 text-[8px]">•</span>
                            <span className="text-[9px] font-black text-amber-600 flex items-center gap-0.5">
                              ⭐ {worker.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWorkerStatus(worker.id)}
                          className={`p-2 rounded-xl border border-zinc-100 transition-colors cursor-pointer ${
                            worker.active
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                          }`}
                          title={worker.active ? "Toggle Inactive" : "Toggle Active"}
                        >
                          {worker.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: "worker",
                              id: worker.id,
                              name: worker.name,
                            })
                          }
                          className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Delete Worker Profile"
                          aria-label={`Delete ${worker.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Offline Manual Creator Form Column */}
              <div className="lg:col-span-1">
                <Card variant="default" className="p-6 border border-zinc-200/80 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5 text-orange-500" />
                    <h3 className="text-sm font-extrabold text-zinc-800 uppercase tracking-wider">
                      Register Offline Worker
                    </h3>
                  </div>

                  <form onSubmit={handleCreateWorker} className="flex flex-col gap-4">
                    <Input
                      label="Worker Name"
                      placeholder="e.g. Emmanuel Adekunle"
                      value={wName}
                      onChange={(e) => setWName(e.target.value)}
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                        Category
                      </label>
                      <select
                        value={wCategory}
                        onChange={(e) => setWCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 font-semibold outline-none focus:border-amber-500"
                      >
                        {categories.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                        Location
                      </label>
                      <select
                        value={wLocation}
                        onChange={(e) => setWLocation(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 font-semibold outline-none focus:border-amber-500"
                      >
                        {locations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="WhatsApp phone (e.g. 23481234567)"
                      placeholder="e.g. 2348030001122"
                      value={wPhone}
                      onChange={(e) => setWPhone(e.target.value)}
                      required
                    />

                    <Input
                      label="Daily Price Range Rate"
                      placeholder="e.g. ₦3,000 - ₦5,000 / day"
                      value={wPriceRange}
                      onChange={(e) => setWPriceRange(e.target.value)}
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                        Select Avatar Symbol
                      </label>
                      <div className="flex flex-wrap gap-1.5 bg-zinc-50 border border-zinc-100 rounded-xl p-2.5">
                        {workerAvatars.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setWPhoto(emoji)}
                            className={`h-8 w-8 text-xl flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                              wPhoto === emoji
                                ? "bg-amber-500 border-amber-500 text-white scale-105 shadow-sm"
                                : "bg-white border-zinc-200 hover:bg-zinc-50"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                        Artisan Bio Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detailed professional bio..."
                        value={wBio}
                        onChange={(e) => setWBio(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-amber-500 font-semibold"
                        required
                      />
                    </div>

                    <Input
                      label="Specific Skills (comma separated)"
                      placeholder="e.g. Floor polishing, Granite tiling"
                      value={wSkills}
                      onChange={(e) => setWSkills(e.target.value)}
                    />

                    <Button type="submit" variant="primary" className="font-bold cursor-pointer mt-2" leftIcon={<Plus className="h-4 w-4" />}>
                      Register Worker
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: Banners Management */}
          {activeTab === "banners" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Banners List Column */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1.5 mb-2">
                  Active Banners Carousel ({banners.length})
                </h3>

                <div className="flex flex-col gap-4">
                  {banners.map((banner) => (
                    <Card
                      key={banner.id}
                      variant="default"
                      className="p-5 border border-zinc-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 flex gap-3">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${banner.bgGradient} flex items-center justify-center text-white text-xs font-bold border border-white/10 flex-shrink-0`} />
                        <div>
                          <h4 className="text-xs font-black text-zinc-800 flex items-center gap-2">
                            {banner.title}
                            <Badge variant={banner.active ? "success" : "neutral"} className="scale-90 font-bold">
                              {banner.active ? "Visible" : "Hidden"}
                            </Badge>
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-1 font-semibold leading-relaxed max-w-md line-clamp-2">
                            {banner.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleBannerStatus(banner.id)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            banner.active
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                              : "bg-zinc-50 border-zinc-150 text-zinc-400 hover:bg-zinc-150"
                          }`}
                        >
                          {banner.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: "banner",
                              id: banner.id,
                              title: banner.title,
                            })
                          }
                          className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                          aria-label={`Delete banner: ${banner.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Create Banner Column */}
              <div className="lg:col-span-1">
                <Card variant="default" className="p-6 border border-zinc-200/80 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <Tv className="h-5 w-5 text-orange-500" />
                    <h3 className="text-sm font-extrabold text-zinc-800 uppercase tracking-wider">
                      Create Carousel Slide
                    </h3>
                  </div>

                  <form onSubmit={handleCreateBanner} className="flex flex-col gap-4">
                    <Input
                      label="Slide Title"
                      placeholder="e.g. Independence Day Promo"
                      value={bTitle}
                      onChange={(e) => setBTitle(e.target.value)}
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="banner-subtitle" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                        Slide Subtitle description
                      </label>
                      <textarea
                        id="banner-subtitle"
                        rows={2}
                        placeholder="e.g. Hire tilers and decorators at 15% off..."
                        value={bSubtitle}
                        onChange={(e) => setBSubtitle(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-800 placeholder-zinc-400 outline-none focus:border-amber-500 font-semibold"
                        required
                      />
                    </div>

                    <Input
                      label="CTA Button Text"
                      placeholder="e.g. Find Out More"
                      value={bCtaText}
                      onChange={(e) => setBCtaText(e.target.value)}
                    />

                    <Input
                      label="CTA Button Redirect Link"
                      placeholder="e.g. /browse"
                      value={bCtaLink}
                      onChange={(e) => setBCtaLink(e.target.value)}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pl-1">
                        Background Visual Style
                      </label>
                      <select
                        value={bGradient}
                        onChange={(e) => setBGradient(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 font-semibold outline-none focus:border-amber-500"
                      >
                        {gradientOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preview Area */}
                    <div className="mt-2.5 pt-4 border-t border-zinc-50 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                        Live visual preview:
                      </span>
                      <div className={`rounded-xl p-4 bg-gradient-to-tr ${bGradient} text-white flex flex-col gap-1.5 shadow-sm`}>
                        <h4 className="text-xs font-black drop-shadow-sm truncate">
                          {bTitle || "Slide Title Preview"}
                        </h4>
                        <p className="text-[9px] opacity-90 leading-tight line-clamp-1 drop-shadow-sm font-semibold">
                          {bSubtitle || "Slide description subtitle text..."}
                        </p>
                      </div>
                    </div>

                    <Button type="submit" variant="primary" className="font-bold cursor-pointer mt-2" leftIcon={<Plus className="h-4 w-4" />}>
                      Create Banner
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 3: Users/Seekers list */}
          {activeTab === "users" && (
            <div className="max-w-xl mx-auto flex flex-col gap-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1.5 mb-2">
                Simulated Users Registry
              </h3>

              <div className="flex flex-col gap-3">
                {[
                  { name: "Yinka Shonibare", role: "seeker", email: "yinka.shonibare@gmail.com", desc: "Default client. Can write reviews and browses the market." },
                  { name: "Chioma Okoye", role: "worker", email: "chioma.okoye@ilisanhands.ng", desc: "Artisan profile linked. Vetted nanny service." },
                  { name: "Super Admin User", role: "admin", email: "admin@ilisanhands.ng", desc: "Main administrative account. Holds profile moderation controls." }
                ].map((usr) => (
                  <Card
                    key={usr.email}
                    variant="default"
                    className="p-5 border border-zinc-100 shadow-sm flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-150 flex items-center justify-center font-black text-xs text-zinc-600 shadow-inner">
                          {usr.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-zinc-800 tracking-tight">
                            {usr.name}
                          </h4>
                          <span className="text-[9px] font-semibold text-zinc-400">
                            {usr.email}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={
                          usr.role === "admin"
                            ? "danger"
                            : usr.role === "worker"
                            ? "primary"
                            : "success"
                        }
                        className="scale-90 font-bold"
                      >
                        {usr.role.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-[10.5px] text-zinc-500 leading-relaxed font-semibold pl-12 border-l border-zinc-50">
                      {usr.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
        size="sm"
      >
        <p className="text-sm text-zinc-600 font-semibold leading-relaxed">
          {deleteConfirm?.type === "worker"
            ? `Are you sure you want to permanently delete ${deleteConfirm.name}'s profile? All associated reviews will also be removed.`
            : deleteConfirm?.type === "banner"
            ? `Are you sure you want to delete the banner "${deleteConfirm.title}"? This cannot be undone.`
            : ""}
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            fullWidth
            className="font-bold cursor-pointer"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            className="font-bold cursor-pointer"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </DashboardGuard>
  );
}
