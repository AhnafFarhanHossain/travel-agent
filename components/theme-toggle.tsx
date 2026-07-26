"use client";

import { useTheme } from "@teispace/next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-xs"
        className="size-8 text-muted-foreground opacity-50"
        aria-label="Toggle theme"
      >
        <SunIcon className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="size-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <SunIcon className="size-4 text-amber-400" /> : <MoonIcon className="size-4 text-foreground" />}
    </Button>
  );
}
