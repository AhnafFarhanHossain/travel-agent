"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion } from "motion/react";
import {
  CompassIcon,
  ShieldAlertIcon,
  SlidersIcon,
  MessageSquareIcon,
  CheckIcon,
  SparklesIcon,
  ClockIcon,
  WalletIcon,
  CalculatorIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
} from "lucide-react";

// 21st.dev Spotlight Hover Card Wrapper
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all hover:border-border/90 ${className}`}
    >
      {/* Spotlight Radial Background Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--color-primary), 0.08), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function LandingFeatures() {
  // Interactive Trip Calculator State
  const [calcDays, setCalcDays] = useState(7);
  const [calcGuests, setCalcGuests] = useState(2);

  // Live Advisory Simulator State
  const [activeAdvisory, setActiveAdvisory] = useState<"sakura" | "heat" | "festival">("sakura");

  const hoursSaved = calcDays * 3.5;
  const estimatedBudget = Math.round(calcDays * calcGuests * 185);

  return (
    <section id="features" className="py-20 md:py-28 border-b border-border/40 bg-background relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <SparklesIcon className="size-3.5 text-primary" />
            <span>Next-Gen Travel Features</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built for seamless, stress-free travel discovery
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Experience 21st.dev inspired interactive tools designed to eliminate research paralysis and personalize every leg of your trip.
          </p>
        </div>

        {/* Bento Grid with Spotlight Effect */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Card 1: Intelligent Day-by-Day (7 cols) */}
          <SpotlightCard className="md:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <CompassIcon className="size-6" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                Intelligent Day-by-Day Structuring
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kova organizes your journey into logical morning, afternoon, and evening blocks. It calculates geographic proximity and real transit times so you spend less time commuting and more time enjoying.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckIcon className="size-3" />
                </div>
                <span>Proximity-based route ordering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckIcon className="size-3" />
                </div>
                <span>Custom pace (Relaxed to Packed)</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Interactive Smart Advisory Simulator (5 cols) */}
          <SpotlightCard className="md:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <ShieldAlertIcon className="size-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Interactive Simulator
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-foreground">
                Proactive AI Travel Advisories
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Click an advisory type below to test how Kova flags seasonal bottlenecks and crowd traps:
              </p>

              {/* Advisory Simulator Selector */}
              <div className="flex items-center gap-1.5 pt-1">
                {(["sakura", "heat", "festival"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveAdvisory(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      activeAdvisory === type
                        ? "bg-amber-500 text-white shadow-2xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type === "sakura" ? "Sakura Rush" : type === "heat" ? "Midday Heat" : "Local Festival"}
                  </button>
                ))}
              </div>

              {/* Live Advisory Banner Preview */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  {activeAdvisory === "sakura" && (
                    <span><strong>Sakura Surge Alert:</strong> Extreme crowd volume at Kyoto pagodas. Early 7:30 AM arrival auto-scheduled.</span>
                  )}
                  {activeAdvisory === "heat" && (
                    <span><strong>Summer Heat Warning:</strong> High afternoon temps. Indoor museum tours prioritized between 1 PM – 4 PM.</span>
                  )}
                  {activeAdvisory === "festival" && (
                    <span><strong>Festival Road Closure:</strong> Main avenue closed for parade. Transit rerouted to subway line 2.</span>
                  )}
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Live Interactive Trip Estimator (5 cols) */}
          <SpotlightCard className="md:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <CalculatorIcon className="size-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/30">
                  Live Calculator
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-foreground">
                Trip Savings Estimator
              </h3>

              {/* Sliders */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Trip Duration:</span>
                    <span className="text-foreground">{calcDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="14"
                    value={calcDays}
                    onChange={(e) => setCalcDays(Number(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Travelers:</span>
                    <span className="text-foreground">{calcGuests} Guests</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={calcGuests}
                    onChange={(e) => setCalcGuests(Number(e.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic Stats Output */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-lg border border-border bg-muted/40">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ClockIcon className="size-3 text-accent" /> Time Saved
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    ~{hoursSaved} hrs
                  </p>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-muted/40">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <WalletIcon className="size-3 text-accent" /> Est. Total Budget
                  </span>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    ${estimatedBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Conversational AI Refinements (7 cols) */}
          <SpotlightCard className="md:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="size-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <MessageSquareIcon className="size-6" />
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                Conversational AI Refinements
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Want to swap a museum for a beach day or find a vegan ramen spot nearby? Chat directly with Kova to instantly update your itinerary in real time.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="rounded-md bg-muted px-2.5 py-1 text-foreground font-mono text-[11px] border border-border/40">
                "Swap afternoon museum for a local coffee roast tour"
              </span>
              <span className="text-primary font-bold flex items-center gap-1">
                <CheckCircle2Icon className="size-3.5" /> Updated instantly
              </span>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
