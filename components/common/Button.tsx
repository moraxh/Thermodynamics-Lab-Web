import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'accent';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Button({ variant = 'primary', children, icon, className = '', ...props }: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-8 py-3 font-serif font-bold text-sm tracking-wider uppercase transition-all duration-300 transform clip-path-slant group overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-lab-black";
  
  const variants = {
    primary: "bg-lab-blue text-lab-white hover:bg-blue-700 hover:shadow-[0_0_20px_rgb(59_130_246_/_0.6)] border border-transparent",
    accent: "bg-transparent text-lab-yellow border border-lab-yellow hover:bg-lab-yellow hover:text-lab-black hover:shadow-[0_0_20px_rgb(246_195_8_/_0.6)]",
    outline: "bg-transparent text-lab-white border border-lab-gray-300 hover:border-lab-white hover:bg-lab-white/5",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon}
      </span>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-lab-white/20 to-transparent skew-x-12" />
    </button>
  );
};