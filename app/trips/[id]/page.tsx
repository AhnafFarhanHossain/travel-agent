"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Itinerary } from "@/lib/schemas/itenerary";
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  WalletIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  ClockIcon,
  CompassIcon,
  PlusIcon,
  AlertTriangleIcon,
  Loader2Icon,
  MapIcon,
  XIcon,
} from "lucide-react";

const TripMap = dynamic(
  () => import("@/components/trip-map").then((m) => ({ default: m.TripMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-muted/40">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface TripData {
  _id: string;
  tripLocation: string;
  startDate: string;
  endDate: string;
  noOfPeople: number;
  budget: number;
  tripPreferences?: string | string[];
  foodPreferences?: string | string[];
  preferStayingIn?: string | string[];
  itinerary: Itinerary;
  createdAt?: string;
}

interface FlatActivity {
  key: string;
  dayNumber: number;
  dayTheme: string;
  timeSlot: string;
  title: string;
  description: string;
  locationName: string;
  locationLatitude: number;
  locationLongitude: number;
  category: string;
  estimatedCost: number;
  bookingRequired: boolean;
  bookingLink?: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getCategoryName(category: string) {
  switch (category) {
    case "food":
      return "Dining";
    case "sightseeing":
      return "Sightseeing";
    case "accommodation":
      return "Stay";
    case "activity":
    default:
      return "Experience";
  }
}

function getCategoryDot(category: string) {
  switch (category) {
    case "food":
      return "bg-orange-600";
    case "sightseeing":
      return "bg-cyan-700";
    case "accommodation":
      return "bg-violet-600";
    case "activity":
    default:
      return "bg-green-700";
  }
}

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/trips/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load trip itinerary details.");
        }
        const data = await res.json();
        if (data.trip) {
          setTrip(data.trip);
        } else {
          setError("Trip not found.");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load trip.";
        console.error("Error loading trip:", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTrip();
    }
  }, [id]);

  const flatActivities = useMemo<FlatActivity[]>(() => {
    if (!trip?.itinerary?.days) return [];
    const result: FlatActivity[] = [];
    for (const day of trip.itinerary.days) {
      for (const act of day.activities || []) {
        console.log("[flatActivities] act:", JSON.stringify({
          title: act.title,
          lat: act.locationLatitude,
          lng: act.locationLongitude,
          latType: typeof act.locationLatitude,
          lngType: typeof act.locationLongitude,
        }));
        result.push({
          key: `d${day.dayNumber}-${act.timeSlot}-${act.title}`,
          dayNumber: day.dayNumber,
          dayTheme: day.theme,
          ...act,
        });
      }
    }
    return result;
  }, [trip]);

  const handleActivityHover = useCallback((key: string | null) => {
    setActiveKey(key);
  }, []);

  const handleActivityClick = useCallback((key: string) => {
    console.log("[handleActivityClick] key:", key);
    setActiveKey(key);
    setMapOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground mb-3" />
          <h2 className="text-sm font-medium text-foreground">
            Loading Itinerary...
          </h2>
        </div>
      </div>
    );
  }

  if (error || !trip || !trip.itinerary) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-4">
            <AlertTriangleIcon className="size-5" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Itinerary Unavailable
          </h2>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            {error || "We couldn't load the requested trip plan."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              <ArrowLeftIcon className="size-3.5 mr-1.5" />
              Dashboard
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/create-trip" />}
            >
              <PlusIcon className="size-3.5 mr-1.5" />
              Create Trip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { itinerary } = trip;
  const daysList = itinerary.days || [];

  return (
    <div className="flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        {/* Document Header — full width */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="gap-1 text-xs font-normal">
              <MapPinIcon className="size-3 text-muted-foreground" />
              {trip.tripLocation}
            </Badge>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {itinerary.tripTitle || `Trip to ${trip.tripLocation}`}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mt-2">
            {itinerary.summary}
          </p>

          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <CalendarIcon className="size-3.5" /> Dates
              </span>
              <p className="font-semibold text-foreground text-md sm:text-lg">
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <WalletIcon className="size-3.5" /> Est. Cost
              </span>
              <p className="font-semibold text-foreground text-md sm:text-lg">
                $
                {itinerary.estimatedTotalCost?.toLocaleString() ||
                  trip.budget.toLocaleString()}{" "}
                USD
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <UsersIcon className="size-3.5" /> Party
              </span>
              <p className="font-semibold text-foreground text-md sm:text-lg">
                {trip.noOfPeople} {trip.noOfPeople === 1 ? "Person" : "People"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <CompassIcon className="size-3.5" /> Total Days
              </span>
              <p className="font-semibold text-foreground text-md sm:text-lg">
                {daysList.length} Days Planned
              </p>
            </div>
          </div>
        </div>

        {/* Split-screen body */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left: itinerary timeline */}
            <div className="flex-1 min-w-0 space-y-10">
              {daysList.map((day) => (
                <section key={`day-${day.dayNumber}`} className="space-y-5">
                  <div className="flex items-baseline justify-between border-b border-border/80 pb-2">
                    <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                      <span>Day {day.dayNumber}</span>
                      <span className="text-muted-foreground font-normal text-sm">
                        — {day.theme}
                      </span>
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {day.activities?.length || 0} activities
                    </span>
                  </div>

                  <div className="space-y-5 pl-2 sm:pl-4 border-l-2 border-border/60">
                    {day.activities?.map((act, actIdx) => {
                      const actKey = `d${day.dayNumber}-${act.timeSlot}-${act.title}`;
                      const isActive = activeKey === actKey;

                      return (
                        <div
                          key={`act-${day.dayNumber}-${actIdx}`}
                          className={`relative pl-5 space-y-2 rounded-lg p-3 -ml-3 transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-primary/5 ring-1 ring-primary/20"
                              : "hover:bg-muted/40"
                          }`}
                          onMouseEnter={() => handleActivityHover(actKey)}
                          onMouseLeave={() => handleActivityHover(null)}
                          onClick={() => handleActivityClick(actKey)}
                        >
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[21px] top-4 size-2.5 rounded-full border-2 border-background transition-colors ${
                              isActive ? "bg-primary" : "bg-border"
                            }`}
                          />

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono text-muted-foreground flex items-center gap-1">
                              <ClockIcon className="size-3" />
                              {act.timeSlot}
                            </span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                              <span
                                className={`size-1.5 rounded-full ${getCategoryDot(act.category)}`}
                              />
                              {getCategoryName(act.category)}
                            </span>
                            {act.bookingRequired && (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                • Booking Suggested
                              </span>
                            )}
                          </div>

                          <h3 className="font-heading text-base font-semibold text-foreground">
                            {act.title}
                          </h3>

                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <MapPinIcon className="size-3 text-muted-foreground shrink-0" />
                            {act.locationName}
                          </p>

                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-0.5">
                            {act.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs pt-1">
                            {act.estimatedCost !== undefined && (
                              <span className="font-mono font-medium text-foreground">
                                ${act.estimatedCost} USD
                              </span>
                            )}

                            {act.bookingLink ? (
                              <a
                                href={
                                  act.bookingLink.startsWith("http")
                                    ? act.bookingLink
                                    : `https://www.google.com/search?q=${encodeURIComponent(act.bookingLink || act.title)}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Reserve Details
                                <ExternalLinkIcon className="size-3" />
                              </a>
                            ) : (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${act.title} ${act.locationName}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Map
                                <ExternalLinkIcon className="size-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Right: sticky map (desktop) */}
            <div className="hidden lg:block lg:w-[45%] xl:w-[50%] flex-shrink-0">
              <div className="sticky top-24">
                <div className="h-[calc(100dvh-8rem)]">
                  <TripMap activities={flatActivities} activeKey={activeKey} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile map toggle button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="size-12 rounded-full shadow-lg"
          onClick={() => setMapOpen(!mapOpen)}
        >
          {mapOpen ? (
            <XIcon className="size-5" />
          ) : (
            <MapIcon className="size-5" />
          )}
        </Button>
      </div>

      {/* Mobile map overlay */}
      {mapOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="absolute inset-x-4 top-20 bottom-24 rounded-xl overflow-hidden border border-border shadow-xl">
            <TripMap activities={flatActivities} activeKey={activeKey} />
          </div>
          <div className="absolute top-4 right-4">
            <Button
              size="icon"
              variant="outline"
              className="size-9 rounded-full bg-background/90 backdrop-blur"
              onClick={() => setMapOpen(false)}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
