"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, CalendarIcon, UsersIcon, WalletIcon, ArrowRightIcon, SparklesIcon, ChevronRightIcon } from "lucide-react";

const SAMPLE_TRIPS = [
  {
    id: "kyoto",
    title: "Kyoto Heritage & Culinary Journey",
    location: "Kyoto, Japan",
    image: "/images/travel_kyoto.jpg",
    duration: "7 Days",
    guests: "2 Guests",
    budget: "$1,850 USD",
    summary: "Historic temples, Arashiyama bamboo groves, artisanal matcha ceremonies, and evening izakaya dining across Gion.",
    highlights: [
      "Fushimi Inari Shrine early morning hike",
      "Arashiyama Bamboo Grove & Tenryu-ji",
      "Traditional Tea Ceremony in Gion",
      "Nishiki Market Street Food Tour",
    ],
  },
  {
    id: "amalfi",
    title: "Amalfi Coast & Capri Escapes",
    location: "Amalfi Coast, Italy",
    image: "/images/travel_amalfi.jpg",
    duration: "5 Days",
    guests: "2 Guests",
    budget: "$2,400 USD",
    summary: "Cliffside Positano villages, private boat excursions to Capri, limoncello tastings, and Mediterranean sunset dining.",
    highlights: [
      "Path of the Gods cliffside trek",
      "Private Capri boat tour & Blue Grotto",
      "Positano scenic coastal stroll",
      "Cliffs View Seafood Dinner in Ravello",
    ],
  },
  {
    id: "iceland",
    title: "Iceland Ring Road & Aurora Safaris",
    location: "Reykjavik, Iceland",
    image: "/images/travel_iceland.jpg",
    duration: "6 Days",
    guests: "4 Guests",
    budget: "$3,100 USD",
    summary: "Cascading waterfalls, black sand beaches, geothermal sky lagoon hot springs, and Northern Lights guided hunts.",
    highlights: [
      "Seljalandsfoss & Skogafoss Waterfalls",
      "Reynisfjara Black Sand Beach",
      "Sky Lagoon Geothermal Thermal Soak",
      "Chasing the Northern Lights in Vik",
    ],
  },
  {
    id: "paris",
    title: "Parisian Art, Wine & Castles",
    location: "Paris, France",
    image: "/images/travel_paris.jpg",
    duration: "5 Days",
    guests: "2 Guests",
    budget: "$2,200 USD",
    summary: "Louvre guided art walk, romantic Seine river cruise, Montmartre bakery tour, and day trip to Château de Versailles.",
    highlights: [
      "Louvre Museum after-hours tour",
      "Montmartre bakery & crepe crawl",
      "Seine River sunset dinner cruise",
      "Palace of Versailles hall of mirrors",
    ],
  },
  {
    id: "santorini",
    title: "Santorini Sunset & Caldera Cruise",
    location: "Santorini, Greece",
    image: "/images/travel_santorini.jpg",
    duration: "4 Days",
    guests: "2 Guests",
    budget: "$2,600 USD",
    summary: "Iconic white Oia cliffside architecture, volcanic wine tastings, catamaran sailing, and Red Beach relaxation.",
    highlights: [
      "Oia Sunset village photo walk",
      "Volcanic vineyard wine tasting",
      "Catamaran Caldera sailing tour",
      "Akrotiri prehistoric ruins & Red Beach",
    ],
  },
];

export function LandingSampleItineraries() {
  const [activeId, setActiveId] = useState("kyoto");

  return (
    <section id="itineraries" className="py-20 md:py-28 border-b border-border/40 bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <SparklesIcon className="size-3.5 text-primary" />
            <span>21st.dev Expandable Cards Showcase</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Explore AI itineraries across top destinations
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Click or hover any destination card to expand its complete itinerary preview and highlight breakdown.
          </p>
        </div>

        {/* 21st.dev Expandable Card Deck (Desktop) */}
        <div className="hidden lg:flex gap-4 h-[440px] w-full">
          {SAMPLE_TRIPS.map((trip) => {
            const isExpanded = activeId === trip.id;
            return (
              <motion.div
                key={trip.id}
                onClick={() => setActiveId(trip.id)}
                layout
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border border-border/80 shadow-md transition-all ${
                  isExpanded ? "flex-[3.5] bg-card" : "flex-[1] bg-muted/30 hover:flex-[1.2]"
                }`}
              >
                {/* Background Image */}
                <Image
                  src={trip.image}
                  alt={trip.title}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    isExpanded ? "opacity-35 brightness-75 scale-105" : "opacity-75 brightness-90 hover:opacity-100"
                  }`}
                  sizes="(max-width: 1200px) 100vw, 35vw"
                  priority
                />

                {/* Overlay Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Collapsed State Title View */}
                {!isExpanded && (
                  <div className="absolute bottom-6 left-4 right-4 text-white z-10 flex flex-col items-start gap-2">
                    <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-semibold">
                      {trip.duration}
                    </Badge>
                    <h3 className="font-heading text-base font-bold line-clamp-1">
                      {trip.location.split(",")[0]}
                    </h3>
                    <div className="flex items-center text-[11px] text-white/80 font-medium">
                      <span>Explore</span>
                      <ChevronRightIcon className="size-3.5 ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Expanded State Rich Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 p-7 h-full flex flex-col justify-between text-white"
                  >
                    <div className="space-y-3 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground text-xs font-semibold gap-1">
                          <MapPinIcon className="size-3" /> {trip.location}
                        </Badge>
                        <span className="text-xs bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full font-mono font-medium">
                          {trip.budget}
                        </span>
                      </div>

                      <h3 className="font-heading text-2xl font-extrabold text-white">
                        {trip.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2">
                        {trip.summary}
                      </p>

                      {/* Stats Pills */}
                      <div className="flex items-center gap-4 text-xs text-white/80 border-y border-white/20 py-2.5">
                        <span className="flex items-center gap-1 font-medium">
                          <CalendarIcon className="size-3.5" /> {trip.duration}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <UsersIcon className="size-3.5" /> {trip.guests}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <WalletIcon className="size-3.5" /> {trip.budget}
                        </span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                          Top Experiences
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-xs text-white/90">
                          {trip.highlights.slice(0, 4).map((h, i) => (
                            <div key={i} className="flex items-center gap-1.5 truncate">
                              <span className="size-1.5 rounded-full bg-primary shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3">
                      <Button
                        size="md"
                        className="px-5 text-xs font-semibold cursor-pointer shadow-md gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                        nativeButton={false}
                        render={
                          <Link href={`/create-trip?location=${encodeURIComponent(trip.location)}`} />
                        }
                      >
                        Plan a Trip to {trip.location.split(",")[0]}
                        <ArrowRightIcon className="size-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile View: Vertical Stacked Selector */}
        <div className="flex lg:hidden flex-col gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {SAMPLE_TRIPS.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setActiveId(trip.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                  activeId === trip.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground border border-border/60"
                }`}
              >
                {trip.location.split(",")[0]}
              </button>
            ))}
          </div>

          {/* Selected Mobile Card */}
          {(() => {
            const trip = SAMPLE_TRIPS.find((t) => t.id === activeId) || SAMPLE_TRIPS[0];
            return (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md space-y-4">
                <div className="relative h-48 w-full">
                  <Image src={trip.image} alt={trip.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <Badge className="bg-primary text-primary-foreground text-[10px] mb-1">
                      {trip.duration}
                    </Badge>
                    <h3 className="font-heading text-lg font-bold">{trip.title}</h3>
                  </div>
                </div>
                <div className="p-4 pt-0 space-y-3 text-xs">
                  <p className="text-muted-foreground leading-relaxed">{trip.summary}</p>
                  <Button
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5"
                    nativeButton={false}
                    render={
                      <Link href={`/create-trip?location=${encodeURIComponent(trip.location)}`} />
                    }
                  >
                    Plan Trip to {trip.location.split(",")[0]}
                    <ArrowRightIcon className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
