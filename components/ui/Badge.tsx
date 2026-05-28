import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" | "category";
  categoryType?: 'nanny' | 'tiler' | 'painter' | 'carpenter' | 'labourer' | 'electrician' | 'plumber';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  categoryType,
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border";
  
  const variants = {
    primary: "bg-amber-50 text-amber-700 border-amber-200/60",
    secondary: "bg-zinc-100 text-zinc-700 border-zinc-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200/60",
    danger: "bg-red-50 text-red-700 border-red-200/60",
    neutral: "bg-zinc-50 text-zinc-500 border-zinc-100",
    category: ""
  };

  const getCategoryStyles = (cat?: string) => {
    switch (cat) {
      case "nanny":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      case "tiler":
        return "bg-sky-50 text-sky-700 border-sky-200/60";
      case "painter":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      case "carpenter":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "labourer":
        return "bg-slate-100 text-slate-700 border-slate-200/60";
      case "electrician":
        return "bg-yellow-50 text-yellow-800 border-yellow-200/60";
      case "plumber":
        return "bg-teal-50 text-teal-700 border-teal-200/60";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200";
    }
  };

  const variantStyle = variant === "category" && categoryType
    ? getCategoryStyles(categoryType)
    : variants[variant];

  return (
    <span
      className={`${baseStyles} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
export default Badge;
