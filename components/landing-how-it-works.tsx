"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, MapPinIcon, SlidersIcon, SparklesIcon, CheckCircleIcon } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Destination & Dates",
    description: "Enter where you want to go and your preferred travel window.",
    icon: MapPinIcon,
  },
  {
    number: "02",
    title: "Vibe & Budget",
    description: "Specify your party size, budget tier, and preferred travel pace.",
    icon: SlidersIcon,
  },
  {
    number: "03",
    title: "Instant AI Plan",
    description: "Kova builds a complete day-by-day itinerary with real map points and advisories.",
    icon: SparklesIcon,
  },
  {
    number: "04",
    title: "Refine & Embark",
    description: "Chat with Kova to customize details, save to your dashboard, and start exploring.",
    icon: CheckCircleIcon,
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 border-b border-border/40 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            From idea to complete itinerary in minutes
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            No complicated setup or long questionnaires. Kova asks only what matters to build your tailored master plan.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-2xs relative group hover:border-primary/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-primary/40 group-hover:text-primary transition-colors">
                      {step.number}
                    </span>
                    <div className="size-9 rounded-lg bg-muted flex items-center justify-center text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="size-4.5" />
                    </div>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            className="h-11 px-6 text-sm font-semibold cursor-pointer shadow-xs gap-2"
            nativeButton={false}
            render={<Link href="/create-trip" />}
          >
            Create Your First Trip Free
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
