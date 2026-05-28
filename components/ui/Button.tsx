"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  disabled,
  href,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600 hover:shadow-lg focus:ring-amber-500",
    secondary: "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 focus:ring-zinc-400",
    outline: "border border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 focus:ring-zinc-400",
    ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100 focus:ring-zinc-400",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5 rounded-2xl"
  };

  const widthStyle = fullWidth ? "w-full flex" : "";
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`;

  const content = (
    <>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />}
      {!isLoading && leftIcon && <span className="flex items-center flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex items-center flex-shrink-0">{rightIcon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={combinedClassName}
      {...props}
    >
      {content}
    </button>
  );
};
export default Button;
