import React from "react";
import { User, Hammer, Search, MessageSquare, PhoneCall, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import Card from "../ui/Card";

export const HowItWorks: React.FC = () => {
  const seekerSteps = [
    {
      num: "01",
      title: "Search & Filter",
      desc: "Filter local workers in Ilisan by categories (tiler, painter, nanny) and locations.",
      icon: Search
    },
    {
      num: "02",
      title: "Verify Reputation",
      desc: "Check average ratings and detailed community feedback before calling them.",
      icon: MessageSquare
    },
    {
      num: "03",
      title: "Connect & Hire",
      desc: "Tap the WhatsApp button to chat directly. Agree on daily rates and get started.",
      icon: PhoneCall
    }
  ];

  const workerSteps = [
    {
      num: "01",
      title: "Setup Your Profile",
      desc: "Register your skill category, daily rate range, and active WhatsApp number.",
      icon: Hammer
    },
    {
      num: "02",
      title: "Receive Local Leads",
      desc: "Get discovered by Babcock staff, students, and town residents looking for services.",
      icon: TrendingUp
    },
    {
      num: "03",
      title: "Earn Top Ratings",
      desc: "Deliver high-quality work, collect stellar reviews, and get featured on top pages.",
      icon: ShieldCheck
    }
  ];

  return (
    <section id="how-it-works" className="py-12 px-4 max-w-7xl mx-auto w-full scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-black text-zinc-800 tracking-tight">
          How IlisanHands Works
        </h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Simple steps to hire workers or list your services in Ilisan town.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seeker column */}
        <Card variant="glass" className="p-6 sm:p-8 bg-amber-50/20 border-amber-200/50 shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-800 leading-tight">
                For Seekers
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Looking to hire skilled help</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {seekerSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex gap-4 items-start group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-amber-100 text-amber-600 font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-zinc-800 flex items-center gap-2">
                      <span className="text-amber-500 text-xs font-black">{step.num}</span>
                      {step.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-semibold">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Worker column */}
        <Card variant="glass" className="p-6 sm:p-8 bg-blue-50/20 border-blue-200/50 shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-800 leading-tight">
                For Workers
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Looking to sell artisan skills</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {workerSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex gap-4 items-start group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-blue-100 text-blue-600 font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-zinc-800 flex items-center gap-2">
                      <span className="text-blue-500 text-xs font-black">{step.num}</span>
                      {step.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-semibold">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
};
export default HowItWorks;
