"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRightIcon, SparklesIcon, LayoutDashboardIcon } from "lucide-react";

export function LandingFloatingDock() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-full border border-border/80 bg-background/90 backdrop-blur-xl shadow-2xl">
            {/* Left Brand Mark */}
            <Link href={session?.user ? "/dashboard" : "/"} className="flex items-center gap-2 pl-2">
              <Image
                src="/kova-icon.png"
                alt="Kova"
                width={26}
                height={26}
                className="size-6 rounded-md object-contain"
              />
              <span className="font-heading text-xs font-bold text-foreground hidden sm:inline-block">
                Kova AI
              </span>
            </Link>

            {/* Middle Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-[11px] font-medium text-muted-foreground border border-border/40">
              <SparklesIcon className="size-3 text-primary animate-pulse" />
              <span>Ready for your next trip?</span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="sm"
                className="h-8 px-4 text-xs font-semibold rounded-full cursor-pointer shadow-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                nativeButton={false}
                render={<Link href={session?.user ? "/dashboard" : "/signup"} />}
              >
                {session?.user ? (
                  <>
                    <LayoutDashboardIcon className="size-3.5" />
                    <span>Dashboard</span>
                  </>
                ) : (
                  <>
                    <span>Get Started Free</span>
                    <ArrowRightIcon className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
