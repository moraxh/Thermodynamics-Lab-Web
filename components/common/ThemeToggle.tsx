"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { motion } from "motion/react";
import { useThemeAnimation } from "@/hooks/use-theme-animation";

interface ThemeToggleProps {
  showText?: boolean;
  className?: string;
  iconSize?: number;
}

export default function ThemeToggle({ 
  showText = false, 
  className = "", 
  iconSize = 20
}: ThemeToggleProps) {
  const { ref, toggleThemeWithAnimation, theme } = useThemeAnimation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to defer state update
    const rafId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className={`w-10 h-10 rounded-full bg-lab-gray-200 flex items-center justify-center text-lab-gray-400 ${className}`}
      >
        <div style={{ width: iconSize, height: iconSize }} />
      </button>
    );
  }

  const handleToggle = async () => {
    setIsAnimating(true);
    await toggleThemeWithAnimation();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor size={iconSize} />;
    }
    return theme === 'dark' ? <Sun size={iconSize} /> : <Moon size={iconSize} />;
  };

  const getButtonText = () => {
    if (theme === 'system') return 'Sistema';
    return theme === 'dark' ? 'Oscuro' : 'Claro';
  };

  return (
    <button
      ref={ref}
      onClick={handleToggle}
      disabled={isAnimating}
      className={`w-10 h-10 rounded-full bg-lab-gray-200 hover:bg-lab-blue flex items-center justify-center text-black dark:text-white transition-all duration-300 hover:scale-110 ${className}`}
      aria-label={`Cambiar tema a ${getButtonText()}`}
    >
      <motion.span
        animate={{ rotate: isAnimating ? 270 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {getIcon()}
      </motion.span>
      {showText && <span className="ml-2">{getButtonText()}</span>}
    </button>
  );
}
