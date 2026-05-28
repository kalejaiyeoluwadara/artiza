import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-50 border-t border-zinc-200/60 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand/Description */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/10">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-zinc-800">
                Ilisan<span className="text-orange-500">Hands</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              IlisanHands is the local directory and skills hub for Ilisan, Nigeria. 
              We connect Babcock University students, staff, and general town residents 
              with trusted, community-vetted artisans and manual labourers.
            </p>
          </div>

          {/* Categories Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Popular Services
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/browse?category=nanny" className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
                  Nannies & Babysitters
                </Link>
              </li>
              <li>
                <Link href="/browse?category=tiler" className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
                  Tilers & Floor Experts
                </Link>
              </li>
              <li>
                <Link href="/browse?category=carpenter" className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
                  Carpenters & Woodworkers
                </Link>
              </li>
              <li>
                <Link href="/browse?category=electrician" className="text-sm text-zinc-500 hover:text-orange-500 transition-colors">
                  Electricians & Technicians
                </Link>
              </li>
            </ul>
          </div>

          {/* Location details */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Our Coverage
            </h4>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Serving all neighborhoods in Ilisan, Ogun State: Babcock University Campus, 
              Palace Road, Toll Gate, Oke-Oyi, and Irolu Road axis.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-200/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            &copy; {currentYear} IlisanHands. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for the Ilisan Community
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
