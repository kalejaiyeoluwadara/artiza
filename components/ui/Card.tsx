import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "glass" | "flat";
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  hoverEffect = false,
  className = "",
  ...props
}) => {
  const baseStyles = "rounded-2xl transition-all duration-300 overflow-hidden";
  
  const variants = {
    default: "bg-white border border-zinc-100 shadow-sm shadow-zinc-100/50",
    outline: "border border-zinc-200 bg-transparent",
    glass: "bg-white/70 backdrop-blur-md border border-white/40 shadow-sm",
    flat: "bg-zinc-50 border border-zinc-100"
  };

  const hoverStyles = hoverEffect 
    ? "hover:-translate-y-1 hover:shadow-md hover:border-zinc-200/80 active:translate-y-0"
    : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
