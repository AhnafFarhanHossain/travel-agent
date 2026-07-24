"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Itinerary } from "@/lib/schemas/itenerary";
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  WalletIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
  ClockIcon,
  Share2Icon,
  PrinterIcon,
  MessageSquareIcon,
  PlusIcon,
  AlertTriangleIcon,
  Loader2Icon,
  CompassIcon,
} from "lucide-react";
import { toast } from "sonner";

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

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

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
      } catch (err: any) {
        console.error("Error loading trip:", err);
        setError(err.message || "Failed to load trip.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTrip();
    }
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Itinerary link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground mb-3" />
          <h2 className="text-sm font-medium text-foreground">Loading Itinerary...</h2>
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
          <h2 className="text-base font-semibold text-foreground">Itinerary Unavailable</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            {error || "We couldn't load the requested trip plan."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
              <ArrowLeftIcon className="size-3.5 mr-1.5" />
              Dashboard
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/create-trip" />}>
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

      <main className="flex-1 pb-24">
        <article className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
          {/* Document Header */}
          <div className="space-y-4 border-b border-border pb-8">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                <MapPinIcon className="size-3 text-muted-foreground" />
                {trip.tripLocation}
              </Badge>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {itinerary.tripTitle || `Trip to ${trip.tripLocation}`}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              {itinerary.summary}
            </p>

            {/* Trip Summary Grid */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <CalendarIcon className="size-3.5 text-muted-foreground" /> Dates
                </span>
                <p className="font-semibold text-foreground text-md sm:text-lg">
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <WalletIcon className="size-3.5 text-muted-foreground" /> Est. Cost
                </span>
                <p className="font-semibold text-foreground text-md sm:text-lg">
                  ${itinerary.estimatedTotalCost?.toLocaleString() || trip.budget.toLocaleString()} USD
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <UsersIcon className="size-3.5 text-muted-foreground" /> Party
                </span>
                <p className="font-semibold text-foreground text-md sm:text-lg">
                  {trip.noOfPeople} {trip.noOfPeople === 1 ? "Person" : "People"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <CompassIcon className="size-3.5 text-muted-foreground" /> Total Days
                </span>
                <p className="font-semibold text-foreground text-md sm:text-lg">
                  {daysList.length} Days Planned
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Navigation */}
          <div className="pt-8 space-y-8">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border pb-3 mb-8 overflow-x-auto">
                <TabsList className="bg-muted/50 p-1 rounded-lg">
                  <TabsTrigger value="overview" className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer">
                    All Days
                  </TabsTrigger>
                  {daysList.map((day) => (
                    <TabsTrigger
                      key={`tab-day-${day.dayNumber}`}
                      value={`day-${day.dayNumber}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
                    >
                      Day {day.dayNumber}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* All Days Overview */}
              <TabsContent value="overview" className="space-y-12 mt-0">
                {daysList.map((day) => (
                  <section key={`overview-day-${day.dayNumber}`} className="space-y-6">
                    <div className="flex items-baseline justify-between border-b border-border/80 pb-2">
                      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                        <span>Day {day.dayNumber}</span>
                        <span className="text-muted-foreground font-normal text-sm">— {day.theme}</span>
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {day.activities?.length || 0} activities
                      </span>
                    </div>

                    {/* Timeline Activity Rows */}
                    <div className="space-y-6 pl-2 sm:pl-4 border-l-2 border-border/60">
                      {day.activities?.map((act, actIdx) => (
                        <div key={`act-${day.dayNumber}-${actIdx}`} className="space-y-2 relative pl-4">
                          <div className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-border border-2 border-background" />

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono text-muted-foreground flex items-center gap-1">
                              <ClockIcon className="size-3" />
                              {act.timeSlot}
                            </span>
                            <span className="text-muted-foreground/40">•</span>
                            <Badge variant="outline" className="text-[11px] font-normal py-0 px-2">
                              {getCategoryName(act.category)}
                            </Badge>
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
                              >
                                Map
                                <ExternalLinkIcon className="size-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </TabsContent>

              {/* Single Day View */}
              {daysList.map((day) => (
                <TabsContent key={`tab-content-day-${day.dayNumber}`} value={`day-${day.dayNumber}`} className="space-y-6 mt-0">
                  <div className="border-b border-border pb-3">
                    <span className="text-xs text-muted-foreground font-mono">Day {day.dayNumber}</span>
                    <h2 className="font-heading text-xl font-bold text-foreground mt-0.5">{day.theme}</h2>
                  </div>

                  <div className="space-y-6 pl-2 sm:pl-4 border-l-2 border-border/60">
                    {day.activities?.map((act, actIdx) => (
                      <div key={`tab-act-${day.dayNumber}-${actIdx}`} className="space-y-2 relative pl-4">
                        <div className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-border border-2 border-background" />

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono text-muted-foreground flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {act.timeSlot}
                          </span>
                          <span className="text-muted-foreground/40">•</span>
                          <Badge variant="outline" className="text-[11px] font-normal py-0 px-2">
                            {getCategoryName(act.category)}
                          </Badge>
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
                            >
                              Map
                              <ExternalLinkIcon className="size-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </article>
      </main>
    </div>
  );
}
