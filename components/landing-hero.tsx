"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CompassIcon,
  SparklesIcon,
  ArrowRightIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  WalletIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ClockIcon,
  UtensilsIcon,
  SunIcon,
  MoonIcon,
  SlidersIcon,
  EyeIcon,
} from "lucide-react";

const DYNAMIC_ROTATOR_TEXTS = [
  { text: "Foodies in Kyoto 🌸", location: "Kyoto, Japan", budget: 1850 },
  { text: "Amalfi Coast Explorers 🌊", location: "Amalfi Coast, Italy", budget: 2400 },
  { text: "Iceland Aurora Hunters 🌋", location: "Reykjavik, Iceland", budget: 3100 },
  { text: "Parisian Art Lovers 🏰", location: "Paris, France", budget: 2200 },
  { text: "Santorini Sunset Seekers 🌅", location: "Santorini, Greece", budget: 2600 },
];

const PROMPT_SUGGESTIONS = [
  { label: "🌸 7 Days in Kyoto", location: "Kyoto, Japan" },
  { label: "🌊 Amalfi Coast Getaway", location: "Amalfi Coast, Italy" },
  { label: "🌋 Iceland Lights Safari", location: "Reykjavik, Iceland" },
  { label: "🏰 Paris & Loire Valley", location: "Paris, France" },
];

// Interactive Sandbox Mock Itineraries Data
const SANDBOX_DATA: Record<number, { morning: string; morningDesc: string; afternoon: string; afternoonDesc: string; evening: string; eveningDesc: string; advisory: string }> = {
  1: {
    morning: "Fushimi Inari Early Shrine Hike",
    morningDesc: "Beat the crowds by walking up Mount Inari's 10,000 vermilion torii gates at sunrise.",
    afternoon: "Higashiyama Teahouse & Matcha Tasting",
    afternoonDesc: "Stroll preserved wooden streets, sample artisanal matcha, and visit Kiyomizu-dera Pagoda.",
    evening: "Pontocho Alley Izakaya Food Tour",
    eveningDesc: "Dine along the Kamogawa riverbank featuring charcoal yakitori and local craft sake.",
    advisory: "Sakura Surge Advisory: Early morning visit (before 8 AM) recommended for Fushimi Inari.",
  },
  2: {
    morning: "Arashiyama Bamboo Grove Walk",
    morningDesc: "Listen to the rustling bamboo stalks and explore the Zen gardens at Tenryu-ji Temple.",
    afternoon: "Sagano Romantic Train Ride",
    afternoonDesc: "Take a scenic open-air train through Hozukyo Ravine with mountain river vistas.",
    evening: "Gion Geisha District Evening Tour",
    eveningDesc: "Atmospheric evening stroll through lantern-lit alleyways and traditional machiya houses.",
    advisory: "Train Ticket Advisory: Sagano Romantic Railway tickets sell out early. Pre-booking advised.",
  },
  3: {
    morning: "Kinkaku-ji (Golden Pavilion) Visit",
    morningDesc: "Witness the top two floors covered in pure gold leaf reflecting over Mirror Pond.",
    afternoon: "Nishiki Market Street Food Exploration",
    afternoonDesc: "Taste fresh octopus skewers, tamagoyaki egg rolls, and seasonal dango desserts.",
    evening: "Gojo Craft Beer & Jazz Lounge",
    eveningDesc: "Unwind at an intimate riverside music lounge with Japanese craft pale ales.",
    advisory: "Market Crowd Tip: Visit Nishiki Market between 2 PM and 4 PM for shortest food stall queues.",
  },
};

export function LandingHero() {
  const [rotatorIndex, setRotatorIndex] = useState(0);
  const [targetLocation, setTargetLocation] = useState("");
  
  // Interactive Sandbox Controls
  const [activeDay, setActiveDay] = useState(1);
  const [guestCount, setGuestCount] = useState(2);
  const [pace, setPace] = useState<"relaxed" | "balanced" | "packed">("balanced");
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Auto-rotate text every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setRotatorIndex((prev) => (prev + 1) % DYNAMIC_ROTATOR_TEXTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentData = SANDBOX_DATA[activeDay] || SANDBOX_DATA[1];

  // Dynamic budget calculation based on guest count & pace multiplier
  const paceMultiplier = pace === "relaxed" ? 0.85 : pace === "packed" ? 1.25 : 1.0;
  const basePricePerPerson = 925;
  const computedBudget = Math.round(basePricePerPerson * guestCount * paceMultiplier);

  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 border-b border-border/40 bg-gradient-to-b from-background via-muted/15 to-background">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/8 dark:bg-primary/12 blur-3xl rounded-full pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          {/* Animated Kokonut UI Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-2xs backdrop-blur-md"
          >
            <SparklesIcon className="size-3.5 text-primary animate-pulse" />
            <span>Next-Gen AI Travel Assistant</span>
          </motion.div>

          {/* Dynamic Rotator Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Plan tailor-made trips for{" "}
            <span className="block h-[1.25em] relative overflow-hidden text-primary">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatorIndex}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute left-0 right-0 inline-block font-extrabold"
                >
                  {DYNAMIC_ROTATOR_TEXTS[rotatorIndex].text}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-normal">
            Kova turns research chaos into structured, day-by-day itineraries tailored to your dates, group size, budget, and travel speed.
          </p>

          {/* Interactive Search Input Box */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl bg-card/90 border border-border/90 rounded-2xl p-2.5 shadow-lg space-y-2.5 backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Where to next? (e.g. Kyoto, Amalfi Coast, Iceland)"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="pl-10 h-11 text-sm border-transparent bg-muted/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary transition-all"
                />
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto h-11 px-6 text-sm font-semibold cursor-pointer shadow-xs gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                nativeButton={false}
                render={
                  <Link
                    href={
                      targetLocation.trim()
                        ? `/create-trip?location=${encodeURIComponent(targetLocation.trim())}`
                        : "/signup"
                    }
                  />
                }
              >
                <span>Build Itinerary</span>
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar text-xs">
              <span className="text-muted-foreground font-medium shrink-0 px-1">Try:</span>
              {PROMPT_SUGGESTIONS.map((item) => (
                <button
                  key={item.location}
                  onClick={() => setTargetLocation(item.location)}
                  className="inline-flex items-center rounded-lg border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all shrink-0 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-emerald-500" />
              Free to get started
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-emerald-500" />
              Instant AI day-by-day plans
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-emerald-500" />
              Real-time travel advisories
            </span>
          </div>
        </div>

        {/* 21st.dev / Kokonut UI Interactive Live Sandbox Engine */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 md:mt-16 max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border/90 bg-card p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Interactive Sandbox Top Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold gap-1">
                    <SparklesIcon className="size-3" /> Live Sandbox Preview
                  </Badge>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    Kyoto Cultural & Culinary Master Plan
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="size-3 text-muted-foreground" /> Kyoto, Japan
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="size-3 text-muted-foreground" /> 7-Day Trip
                  </span>
                </p>
              </div>

              {/* Interactive Controls Widget */}
              <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
                {/* Party Size Buttons */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 text-xs">
                  <UsersIcon className="size-3.5 text-muted-foreground ml-1.5 mr-0.5" />
                  {[1, 2, 4].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setGuestCount(cnt)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        guestCount === cnt
                          ? "bg-background text-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cnt} {cnt === 1 ? "Guest" : "Guests"}
                    </button>
                  ))}
                </div>

                {/* Pace Selection */}
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 text-xs">
                  <SlidersIcon className="size-3.5 text-muted-foreground ml-1.5 mr-0.5" />
                  {(["relaxed", "balanced", "packed"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPace(p)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                        pace === p
                          ? "bg-background text-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Live Computed Budget Badge */}
                <motion.div
                  key={computedBudget}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary flex items-center gap-1.5"
                >
                  <WalletIcon className="size-3.5 text-primary" />
                  <span>${computedBudget.toLocaleString()} USD</span>
                </motion.div>
              </div>
            </div>

            {/* Interactive Day Tabs */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((dayNum) => (
                  <button
                    key={dayNum}
                    onClick={() => {
                      setActiveDay(dayNum);
                      setSelectedActivity(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeDay === dayNum
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground border border-border/60 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>Day {dayNum}</span>
                    {activeDay === dayNum && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                💡 Click any day or option to see dynamic recalculations
              </span>
            </div>

            {/* Smart Advisory Notice */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300"
              >
                <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">AI Advisory Warning:</span> {currentData.advisory}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Day Itinerary Timeline Nodes */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeDay}-${guestCount}-${pace}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Morning */}
                <div
                  onClick={() => setSelectedActivity(currentData.morning)}
                  className={`rounded-xl border p-4 space-y-2 cursor-pointer transition-all ${
                    selectedActivity === currentData.morning
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/70 bg-background hover:border-border/90 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                      <SunIcon className="size-3" /> Morning • 8:30 AM
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                      {pace === "relaxed" ? "3.5h" : pace === "packed" ? "1.5h" : "2.5h"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {currentData.morning}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {currentData.morningDesc}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-primary font-medium">
                    <span>${Math.round(45 * guestCount * paceMultiplier)} USD approx</span>
                    <EyeIcon className="size-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Afternoon */}
                <div
                  onClick={() => setSelectedActivity(currentData.afternoon)}
                  className={`rounded-xl border p-4 space-y-2 cursor-pointer transition-all ${
                    selectedActivity === currentData.afternoon
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border/70 bg-background hover:border-border/90 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wide flex items-center gap-1">
                      <UtensilsIcon className="size-3" /> Afternoon • 1:00 PM
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                      {pace === "relaxed" ? "4.0h" : pace === "packed" ? "2.0h" : "3.0h"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {currentData.afternoon}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {currentData.afternoonDesc}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-accent font-medium">
                    <span>${Math.round(85 * guestCount * paceMultiplier)} USD approx</span>
                    <EyeIcon className="size-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Evening */}
                <div
                  onClick={() => setSelectedActivity(currentData.evening)}
                  className={`rounded-xl border p-4 space-y-2 cursor-pointer transition-all ${
                    selectedActivity === currentData.evening
                      ? "border-purple-500 bg-purple-500/5 shadow-sm"
                      : "border-border/70 bg-background hover:border-border/90 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide flex items-center gap-1">
                      <MoonIcon className="size-3" /> Evening • 7:00 PM
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                      2.5h
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {currentData.evening}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {currentData.eveningDesc}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    <span>${Math.round(110 * guestCount * paceMultiplier)} USD approx</span>
                    <EyeIcon className="size-3 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
