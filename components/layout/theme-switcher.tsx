"use client";

import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div className="h-9 w-9" />;
  }

  return (
    <ThemeTogglerButton
      variant="ghost"
      size="sm"
      modes={["light", "dark", "system"]}
    />
  );
};

export { ThemeSwitcher };
