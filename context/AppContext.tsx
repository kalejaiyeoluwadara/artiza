"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Worker {
  id: string;
  name: string;
  category: 'nanny' | 'tiler' | 'painter' | 'carpenter' | 'labourer' | 'electrician' | 'plumber';
  location: string;
  bio: string;
  phone: string; // WhatsApp number
  priceRange: string; // e.g. "₦3,000 - ₦5,000"
  rating: number;
  reviewsCount: number;
  photo: string; // Image path or base64 or placeholder style
  active: boolean;
  featured: boolean;
  skills: string[];
}

export interface Review {
  id: string;
  workerId: string;
  rating: number;
  text: string;
  reviewerName: string;
  reviewerId: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'seeker' | 'worker' | 'admin';
  workerProfileId?: string; // Ties to Worker.id if role is 'worker'
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  bgGradient: string; // Tailwind gradient classes for rich visual style
  textColor: string;
  active: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface AppContextType {
  currentUser: User;
  workers: Worker[];
  reviews: Review[];
  banners: Banner[];
  toasts: Toast[];
  isLoaded: boolean;
  currentRole: 'seeker' | 'worker' | 'admin';
  setRole: (role: 'seeker' | 'worker' | 'admin') => void;
  // Worker actions
  addWorker: (worker: Omit<Worker, "id" | "rating" | "reviewsCount" | "active">) => void;
  updateWorker: (workerId: string, updatedData: Partial<Worker>) => void;
  deleteWorker: (workerId: string) => void;
  toggleWorkerStatus: (workerId: string) => void;
  // Review actions
  addReview: (workerId: string, review: Omit<Review, "id" | "date" | "reviewerId" | "reviewerName">) => void;
  // Banner actions
  addBanner: (banner: Omit<Banner, "id">) => void;
  toggleBannerStatus: (bannerId: string) => void;
  deleteBanner: (bannerId: string) => void;
  // Toast actions
  addToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_WORKERS: Worker[] = [
  {
    id: "worker-1",
    name: "Tunde Bakare",
    category: "tiler",
    location: "Babcock University Area",
    bio: "Professional tiler with over 8 years of experience in floor, wall, and marble installation. Very precise and neat job guaranteed. I have completed projects in various estates around Ilisan and Sagamu.",
    phone: "2348031234567",
    priceRange: "₦5,000 - ₦8,000 / day",
    rating: 4.8,
    reviewsCount: 5,
    photo: "🎨", // We can use stylized icons or SVG avatars for premium look
    active: true,
    featured: true,
    skills: ["Floor Tiling", "Wall Tiling", "Marble Installation", "Floor Restoration"]
  },
  {
    id: "worker-2",
    name: "Chioma Okoye",
    category: "nanny",
    location: "Town Center",
    bio: "Kind, patient, and CPR-certified nanny. Specialized in early child care, feeding routines, homework assistance, and light educational activities. Fluent in English and Igbo.",
    phone: "2348029876543",
    priceRange: "₦3,500 - ₦5,000 / day",
    rating: 4.9,
    reviewsCount: 4,
    photo: "👶",
    active: true,
    featured: true,
    skills: ["Toddler Care", "Meal Prep", "First Aid", "Homework Tutoring"]
  },
  {
    id: "worker-3",
    name: "Abubakar Ibrahim",
    category: "labourer",
    location: "Toll Gate",
    bio: "Hardworking general labourer ready for site excavation, site cleanup, building material transport, and farm clearance. Prompt, strong, and highly reliable.",
    phone: "2348051112223",
    priceRange: "₦2,500 - ₦4,000 / day",
    rating: 4.5,
    reviewsCount: 3,
    photo: "🏗️",
    active: true,
    featured: false,
    skills: ["Site Excavation", "Load Lifting", "Land Clearing", "Cement Mixing"]
  },
  {
    id: "worker-4",
    name: "Segun Alao",
    category: "carpenter",
    location: "Irolu Road",
    bio: "Expert carpenter offering wooden cabinet creation, roof trusses installation, door fixing, and furniture restoration. Over 10 years of serving the Ilisan community.",
    phone: "2348062223334",
    priceRange: "₦6,000 - ₦10,000 / day",
    rating: 4.7,
    reviewsCount: 4,
    photo: "🔨",
    active: true,
    featured: true,
    skills: ["Cabinet Making", "Roof Framing", "Door Installation", "Furniture Repair"]
  },
  {
    id: "worker-5",
    name: "Funmi Adebayo",
    category: "painter",
    location: "Palace Area",
    bio: "Interior and exterior professional painter. Experienced in wall screeding, color mixing, decorative wallpaper pasting, and commercial projects. Very detailed and leaves no stains.",
    phone: "2348073334445",
    priceRange: "₦4,000 - ₦7,000 / day",
    rating: 4.6,
    reviewsCount: 3,
    photo: "🖌️",
    active: true,
    featured: false,
    skills: ["Wall Screeding", "Color Consulting", "Exterior Painting", "Wallpaper Pasting"]
  },
  {
    id: "worker-6",
    name: "Victor Umeh",
    category: "electrician",
    location: "Expressway Junction",
    bio: "Certified electrical technician. Handling domestic conduit/surface wiring, solar inverter installation, fusebox repair, and AC servicing. Safety is my number one priority.",
    phone: "2348084445556",
    priceRange: "₦5,000 - ₦9,000 / day",
    rating: 5.0,
    reviewsCount: 2,
    photo: "⚡",
    active: true,
    featured: true,
    skills: ["House Wiring", "Inverter Installation", "AC Repairs", "Circuit Diagnostics"]
  }
];

const INITIAL_REVIEWS: Review[] = [
  // Reviews for Tunde Bakare (worker-1)
  { id: "rev-1", workerId: "worker-1", rating: 5, text: "Excellent floor tiling in my living room. Very neat and punctual.", reviewerName: "Boluwatife A.", reviewerId: "seeker_1", date: "2026-05-10" },
  { id: "rev-2", workerId: "worker-1", rating: 4, text: "Good job, but finished one day late. Highly recommend though.", reviewerName: "Emeka N.", reviewerId: "seeker_2", date: "2026-05-14" },
  { id: "rev-3", workerId: "worker-1", rating: 5, text: "The best tiler in Ilisan. Clean lines and professional layout.", reviewerName: "Prof. Adesina", reviewerId: "seeker_3", date: "2026-05-18" },
  { id: "rev-4", workerId: "worker-1", rating: 5, text: "Very polite and reasonable pricing.", reviewerName: "Femi O.", reviewerId: "seeker_4", date: "2026-05-20" },
  { id: "rev-5", workerId: "worker-1", rating: 4, text: "Satisfactory work, did the wall tiles perfectly.", reviewerName: "Mama Titi", reviewerId: "seeker_5", date: "2026-05-22" },

  // Reviews for Chioma Okoye (worker-2)
  { id: "rev-6", workerId: "worker-2", rating: 5, text: "She is wonderful with my two toddlers. Very responsible and active.", reviewerName: "Dr. Mrs. Alabi", reviewerId: "seeker_1", date: "2026-05-02" },
  { id: "rev-7", workerId: "worker-2", rating: 5, text: "Chioma has been our nanny for 6 months. Absolutely trustworthy.", reviewerName: "Sarah K.", reviewerId: "seeker_3", date: "2026-05-11" },
  { id: "rev-8", workerId: "worker-2", rating: 4, text: "Very good with children, helper in homework.", reviewerName: "Abiola J.", reviewerId: "seeker_4", date: "2026-05-15" },
  { id: "rev-9", workerId: "worker-2", rating: 5, text: "Great nanny, highly clean and organized.", reviewerName: "Damilola A.", reviewerId: "seeker_5", date: "2026-05-25" },

  // Reviews for Abubakar (worker-3)
  { id: "rev-10", workerId: "worker-3", rating: 4, text: "Cleaned up my construction site quickly. Heavy lifter.", reviewerName: "Engr. Kabiru", reviewerId: "seeker_2", date: "2026-05-05" },
  { id: "rev-11", workerId: "worker-3", rating: 5, text: "Very strong boy, helped clear my whole farm in one day.", reviewerName: "Baba Yusuf", reviewerId: "seeker_3", date: "2026-05-08" },
  { id: "rev-12", workerId: "worker-3", rating: 4, text: "Reliable and fast.", reviewerName: "Yinka S.", reviewerId: "seeker_1", date: "2026-05-12" },

  // Reviews for Segun Alao (worker-4)
  { id: "rev-13", workerId: "worker-4", rating: 5, text: "Fixed our broken cabinet doors perfectly. Looks brand new.", reviewerName: "Mide F.", reviewerId: "seeker_1", date: "2026-05-01" },
  { id: "rev-14", workerId: "worker-4", rating: 4, text: "Good woodwork quality. Price is slightly on the high side.", reviewerName: "Deji O.", reviewerId: "seeker_2", date: "2026-05-07" },
  { id: "rev-15", workerId: "worker-4", rating: 5, text: "Made custom bedroom wardrobes. Very sturdy work.", reviewerName: "Pastor Kunle", reviewerId: "seeker_3", date: "2026-05-19" },
  { id: "rev-16", workerId: "worker-4", rating: 5, text: "Highly skilled and professional.", reviewerName: "Chinedu E.", reviewerId: "seeker_4", date: "2026-05-24" },

  // Reviews for Funmi Adebayo (worker-5)
  { id: "rev-17", workerId: "worker-5", rating: 5, text: "The paint job on our duplex was incredible. Beautiful screeding.", reviewerName: "Chief Osoba", reviewerId: "seeker_2", date: "2026-05-04" },
  { id: "rev-18", workerId: "worker-5", rating: 4, text: "Good painting, clean borders, neat floor.", reviewerName: "Yinka S.", reviewerId: "seeker_1", date: "2026-05-16" },
  { id: "rev-19", workerId: "worker-5", rating: 5, text: "Very friendly and has great color suggestions.", reviewerName: "Simi L.", reviewerId: "seeker_5", date: "2026-05-23" },

  // Reviews for Victor Umeh (worker-6)
  { id: "rev-20", workerId: "worker-6", rating: 5, text: "Fixed our solar inverter issue in 30 minutes. Extremely knowledgeable.", reviewerName: "Mrs. Bankole", reviewerId: "seeker_1", date: "2026-05-15" },
  { id: "rev-21", workerId: "worker-6", rating: 5, text: "Highly recommend for clean conduit house wiring. Excellent job.", reviewerName: "Engr. Davies", reviewerId: "seeker_3", date: "2026-05-26" }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: "banner-1",
    title: "Find Trusted Local Skilled Hands",
    subtitle: "Connecting Ilisan residents with vetted, community-reviewed nannies, tilers, painters, and general labourers.",
    bgGradient: "from-amber-500 to-orange-600",
    textColor: "text-white",
    active: true,
    ctaText: "Browse Workers",
    ctaLink: "/browse"
  },
  {
    id: "banner-2",
    title: "Are You a Skilled Artisan in Ilisan?",
    subtitle: "Grow your business and reach local clients easily. Set up your profile on IlisanHands today.",
    bgGradient: "from-blue-600 to-indigo-700",
    textColor: "text-white",
    active: true,
    ctaText: "Create Worker Profile",
    ctaLink: "/dashboard/worker"
  },
  {
    id: "banner-3",
    title: "Verified Community Reviews",
    subtitle: "Make hiring decisions with confidence using ratings and feedback left by fellow Ilisan residents.",
    bgGradient: "from-emerald-500 to-teal-600",
    textColor: "text-white",
    active: true,
    ctaText: "Learn How It Works",
    ctaLink: "/#how-it-works"
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Roles toggling simulation state
  const [currentRole, setCurrentRole] = useState<'seeker' | 'worker' | 'admin'>("seeker");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mock User Account simulation depending on selected role
  const getMockUser = (role: 'seeker' | 'worker' | 'admin'): User => {
    switch (role) {
      case "worker":
        return {
          id: "seeker_6", // Let's use seeker_6 as the worker user's log in
          name: "Chioma Okoye",
          email: "chioma.okoye@ilisanhands.ng",
          role: "worker",
          workerProfileId: "worker-2"
        };
      case "admin":
        return {
          id: "admin_1",
          name: "IlisanHands Admin",
          email: "admin@ilisanhands.ng",
          role: "admin"
        };
      case "seeker":
      default:
        return {
          id: "seeker_1",
          name: "Yinka Shonibare",
          email: "yinka.shonibare@gmail.com",
          role: "seeker"
        };
    }
  };

  const currentUser = getMockUser(currentRole);

  const safeParse = <T,>(value: string | null, fallback: T): T => {
    if (!value) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWorkers = localStorage.getItem("ilisan_workers");
      const storedReviews = localStorage.getItem("ilisan_reviews");
      const storedBanners = localStorage.getItem("ilisan_banners");
      const storedRole = localStorage.getItem("ilisan_current_role");

      setWorkers(safeParse(storedWorkers, INITIAL_WORKERS));
      setReviews(safeParse(storedReviews, INITIAL_REVIEWS));
      setBanners(safeParse(storedBanners, INITIAL_BANNERS));
      if (storedRole === "seeker" || storedRole === "worker" || storedRole === "admin") {
        setCurrentRole(storedRole);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save changes to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ilisan_workers", JSON.stringify(workers));
    }
  }, [workers, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ilisan_reviews", JSON.stringify(reviews));
    }
  }, [reviews, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ilisan_banners", JSON.stringify(banners));
    }
  }, [banners, isLoaded]);

  const setRole = (role: 'seeker' | 'worker' | 'admin') => {
    setCurrentRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("ilisan_current_role", role);
    }
    addToast(`Switched user view to ${role.toUpperCase()}`, "info");
  };

  // Toast Action Helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    // Auto remove toast
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Admin and Worker Actions
  const addWorker = (workerData: Omit<Worker, "id" | "rating" | "reviewsCount" | "active">) => {
    const newId = `worker-${Date.now()}`;
    const newWorker: Worker = {
      ...workerData,
      id: newId,
      rating: 5.0, // Default perfect rating for new workers
      reviewsCount: 0,
      active: true
    };
    setWorkers((prev) => [newWorker, ...prev]);
    addToast(`Worker profile created for ${workerData.name}!`, "success");
  };

  const updateWorker = (workerId: string, updatedData: Partial<Worker>) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, ...updatedData } : w))
    );
    addToast("Profile updated successfully!", "success");
  };

  const deleteWorker = (workerId: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    setReviews((prev) => prev.filter((r) => r.workerId !== workerId));
    addToast("Worker profile deleted.", "info");
  };

  const toggleWorkerStatus = (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const newStatus = !w.active;
          addToast(
            `${w.name} is now ${newStatus ? "Active & Discoverable" : "Inactive"}`,
            "info"
          );
          return { ...w, active: newStatus };
        }
        return w;
      })
    );
  };

  // Review Actions
  const addReview = (
    workerId: string,
    reviewData: Omit<Review, "id" | "date" | "reviewerId" | "reviewerName">
  ): boolean => {
    const alreadyReviewed = reviews.some(
      (r) => r.workerId === workerId && r.reviewerId === currentUser.id
    );
    if (alreadyReviewed) {
      addToast("You have already reviewed this worker.", "error");
      return false;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      workerId,
      rating: reviewData.rating,
      text: reviewData.text,
      reviewerName: currentUser.name,
      reviewerId: currentUser.id,
      date: new Date().toISOString().split("T")[0]
    };

    // Add review
    setReviews((prev) => [newReview, ...prev]);

    // Recalculate worker rating & review count
    setWorkers((prevWorkers) => {
      return prevWorkers.map((w) => {
        if (w.id === workerId) {
          const workerReviews = reviews.filter((r) => r.workerId === workerId);
          // Include the new review in recalculation
          const newCount = workerReviews.length + 1;
          const totalRatingSum = workerReviews.reduce((sum, r) => sum + r.rating, 0) + reviewData.rating;
          const newAvgRating = parseFloat((totalRatingSum / newCount).toFixed(1));

          return {
            ...w,
            rating: newAvgRating,
            reviewsCount: newCount
          };
        }
        return w;
      });
    });

    addToast("Thank you for your feedback! Review published.", "success");
    return true;
  };

  // Banner Actions
  const addBanner = (bannerData: Omit<Banner, "id">) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `banner-${Date.now()}`
    };
    setBanners((prev) => [...prev, newBanner]);
    addToast("Promotional banner added!", "success");
  };

  const toggleBannerStatus = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id === bannerId) {
          const newStatus = !b.active;
          addToast(
            `Banner is now ${newStatus ? "Visible" : "Hidden"} on home page.`,
            "info"
          );
          return { ...b, active: newStatus };
        }
        return b;
      })
    );
  };

  const deleteBanner = (bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    addToast("Banner deleted successfully.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        workers,
        reviews,
        banners,
        toasts,
        isLoaded,
        currentRole,
        setRole,
        addWorker,
        updateWorker,
        deleteWorker,
        toggleWorkerStatus,
        addReview,
        addBanner,
        toggleBannerStatus,
        deleteBanner,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
