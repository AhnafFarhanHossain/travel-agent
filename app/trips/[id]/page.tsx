"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  AlertCircleIcon,
  HelpCircleIcon,
  Loader2Icon,
  MapIcon,
  XIcon,
  Trash2Icon,
  InfoIcon,
  SparklesIcon,
  CheckIcon,
  Undo2Icon,
  PrinterIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Snapshot } from "../types";
import { TripChatSidebar } from "@/components/trip-chat-sidebar";
import { generateTripPDF } from "@/lib/export-pdf";
import { useTheme } from "@teispace/next-themes";

const TripMap = dynamic(() => import("@/components/trip-map").then((m) => ({ default: m.TripMap })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl bg-muted/40">
      <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

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
  groundingMetadata?: string;
  safetyRating?: string;
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ id?: string }>;
}) {
  const { id: paramId } = use(params);
  const searchParamsObj = searchParams ? use(searchParams) : undefined;
  const id = paramId || searchParamsObj?.id || "";
  const router = useRouter();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Snapshots state for AI trip customization
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeSnapshot, setActiveSnapshot] = useState<Snapshot | null>(null);
  const [savedItinerary, setSavedItinerary] = useState<Itinerary | null>(null);

  const { theme, resolvedTheme } = useTheme();
  const activeKey = selectedKey ?? hoveredKey;

  // Derived current itinerary (active preview or saved plan)
  const currentItinerary = activeSnapshot?.itinerary || trip?.itinerary;

  const handleExportPDF = useCallback(() => {
    if (!trip || !currentItinerary) return;
    try {
      const isDarkMode =
        (resolvedTheme || theme) === "dark" ||
        (typeof document !== "undefined" && document.documentElement.classList.contains("dark"));

      generateTripPDF({
        tripLocation: trip.tripLocation,
        startDate: formatDate(trip.startDate),
        endDate: formatDate(trip.endDate),
        noOfPeople: trip.noOfPeople,
        budget: trip.budget,
        itinerary: currentItinerary,
        isDarkMode,
      });

      toast.success("PDF exported successfully!");
    } catch (err: any) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to export PDF.");
    }
  }, [trip, currentItinerary, resolvedTheme, theme]);

  async function handleDeleteTrip() {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/trips/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete trip");
      }

      toast.success("Trip deleted successfully");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error deleting trip:", err);
      toast.error(err.message || "Failed to delete trip");
      setIsDeleting(false);
    }
  }

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
          setSavedItinerary(data.trip.itinerary);
          const initialSnapshot: Snapshot = {
            id: `snap-original-${data.trip._id}`,
            description: "Original Plan",
            timestamp: data.trip.createdAt,
            itinerary: data.trip.itinerary,
            status: "applied",
          };
          setActiveSnapshot(initialSnapshot);
          setSnapshots([initialSnapshot]);
        } else {
          setError("Trip not found.");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load trip.";
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
    if (!currentItinerary?.days) return [];
    const result: FlatActivity[] = [];
    for (const day of currentItinerary.days) {
      for (const act of day.activities || []) {
        result.push({
          key: `d${day.dayNumber}-${act.timeSlot}-${act.title}`,
          dayNumber: day.dayNumber,
          dayTheme: day.theme,
          ...act,
        });
      }
    }
    return result;
  }, [currentItinerary]);

  const handleActivityHover = useCallback((key: string | null) => {
    setHoveredKey(key);
  }, []);

  const handleActivityClick = useCallback((key: string | null) => {
    if (key === null) {
      setSelectedKey(null);
      return;
    }
    setSelectedKey((prev) => (prev === key ? null : key));
    setMapOpen(true);
  }, []);

  // AI Snapshot handlers
  const handleProposeSnapshot = useCallback((newItinerary: Itinerary, summary: string) => {
    if (!newItinerary) return;
    setSnapshots((prev) => {
      const existing = prev.find(
        (s) => s.itinerary && JSON.stringify(s.itinerary) === JSON.stringify(newItinerary)
      );
      if (existing) {
        setActiveSnapshot(existing);
        return prev;
      }
      const newSnap: Snapshot = {
        id: `snap-ai-${Date.now()}`,
        description: summary || "AI Revision",
        timestamp: new Date().toISOString(),
        itinerary: newItinerary,
        status: "draft",
      };
      setActiveSnapshot(newSnap);
      return [newSnap, ...prev];
    });
  }, []);

  const handleSelectSnapshot = useCallback((snapshot: Snapshot) => {
    setActiveSnapshot(snapshot);
  }, []);

  const handleApplySnapshot = async (snapshot: Snapshot) => {
    if (!snapshot || !snapshot.itinerary) {
      toast.error("No valid itinerary to apply.");
      return;
    }

    try {
      setIsApplying(true);
      const res = await fetch(`/api/trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itinerary: snapshot.itinerary }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Failed to parse response" }));
        if (res.status === 429) {
          throw new Error("AI Rate Limit Exceeded (429). Please wait a moment before saving changes.");
        }
        throw new Error(data?.message || "Failed to save itinerary changes");
      }

      const updatedSnap: Snapshot = {
        ...snapshot,
        status: "applied",
      };

      setSavedItinerary(snapshot.itinerary);
      setActiveSnapshot(updatedSnap);
      setSnapshots((prev) => {
        const exists = prev.some((s) => s.id === snapshot.id);
        if (exists) {
          return prev.map((s) => (s.id === snapshot.id ? updatedSnap : { ...s, status: s.status === "applied" ? "draft" : s.status }));
        }
        return [updatedSnap, ...prev.map((s) => ({ ...s, status: s.status === "applied" ? "draft" : s.status }))];
      });

      if (trip) {
        setTrip({ ...trip, itinerary: snapshot.itinerary });
      }

      toast.success("Itinerary revision applied and saved!", {
        description: "Your trip plan in the database has been updated.",
      });
    } catch (err: any) {
      console.error("Error applying snapshot:", err);
      toast.error(err.message || "Failed to apply itinerary changes");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDiscardSnapshot = () => {
    if (savedItinerary) {
      const originalSnap = snapshots.find((s) => s.status === "applied") || {
        id: `snap-saved-${Date.now()}`,
        description: "Saved Plan",
        timestamp: new Date().toISOString(),
        itinerary: savedItinerary,
        status: "applied",
      };
      setActiveSnapshot(originalSnap);
      toast.info("Reverted preview back to saved plan.");
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

  if (error || !trip || !currentItinerary) {
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

  const daysList = currentItinerary.days || [];
  const exceptions = currentItinerary.exceptionCases || null;

  const activeExceptionsList = [
    exceptions?.ranOutOfBudget && {
      key: "ranOutOfBudget",
      title: "Budget Exceeded",
      description: `The calculated itinerary total ($${currentItinerary.estimatedTotalCost?.toLocaleString()} USD) exceeds your target budget ($${trip.budget.toLocaleString()} USD).`,
      icon: WalletIcon,
    },
    exceptions?.unrealisticBudget && {
      key: "unrealisticBudget",
      title: "Unrealistic Budget",
      description: `The allocated budget ($${trip.budget.toLocaleString()} USD) is tight for ${trip.tripLocation} and ${trip.noOfPeople} traveler(s).`,
      icon: AlertCircleIcon,
    },
    exceptions?.activitySiteClosedOnTripDay && {
      key: "activitySiteClosedOnTripDay",
      title: "Venue Closure Advisory",
      description: "One or more planned activity sites may be closed on your scheduled trip dates.",
      icon: ClockIcon,
    },
    exceptions?.partySizeMismatches && {
      key: "partySizeMismatches",
      title: "Party Size Advisory",
      description: `Certain venues or activities in this plan may have capacity constraints for your party of ${trip.noOfPeople}.`,
      icon: UsersIcon,
    },
    exceptions?.contradictoryPreferences && {
      key: "contradictoryPreferences",
      title: "Conflicting Preferences",
      description: "Some selected travel preferences conflict. The AI created a balanced compromise plan.",
      icon: HelpCircleIcon,
    },
  ].filter(Boolean) as {
    key: string;
    title: string;
    description: string;
    icon: any;
  }[];

  const hasActiveExceptions = activeExceptionsList.length > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        {/* Document Header — full width with stat cards */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 print:hidden">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeftIcon className="size-3.5" />
                Back
              </Link>
              <span className="text-border">•</span>
              <Badge
                variant="secondary"
                className="gap-1.5 text-xs font-medium bg-muted text-foreground border-border/60"
              >
                <MapPinIcon className="size-3 text-muted-foreground shrink-0" />
                {trip.tripLocation}
              </Badge>
              {hasActiveExceptions && (
                <Badge
                  variant="outline"
                  className="gap-1 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                >
                  <AlertTriangleIcon className="size-3 shrink-0" />
                  {activeExceptionsList.length} {activeExceptionsList.length === 1 ? "Advisory" : "Advisories"}
                </Badge>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                className="gap-1.5 font-medium border-border/80"
                onClick={handleExportPDF}
              >
                <PrinterIcon className="size-3.5 text-primary" />
                <span>Export PDF</span>
              </Button>

              <Button
                variant={sidebarOpen ? "default" : "outline"}
                size="xs"
                className="gap-1.5 font-medium border-border/80"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <SparklesIcon className="size-3.5 text-primary" />
                <span>{sidebarOpen ? "Close AI" : "Customize with AI"}</span>
              </Button>

              <Button
                variant="outline"
                size="xs"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border-border/80"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2Icon className="size-3.5 mr-1 text-destructive" />
                Delete
              </Button>
            </div>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {currentItinerary.tripTitle || `Trip to ${trip.tripLocation}`}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl mt-2">
            {currentItinerary.summary}
          </p>

          {/* Dynamic Exception Cases Banner & Cards */}
          {hasActiveExceptions && (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <h3 className="font-heading text-sm font-bold">
                  AI Planning Advisories ({activeExceptionsList.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {activeExceptionsList.map((exc) => {
                  const Icon = exc.icon;
                  return (
                    <div
                      key={exc.key}
                      className="flex items-start gap-2.5 bg-background/80 p-3 rounded-lg border border-amber-500/20 text-xs shadow-2xs"
                    >
                      <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">{exc.title}</span>
                        <p className="text-muted-foreground leading-relaxed">{exc.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stat Cards Grid */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" /> Dates
              </span>
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <WalletIcon className="size-3.5 text-muted-foreground shrink-0" /> Est. Cost
              </span>
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                ${currentItinerary.estimatedTotalCost?.toLocaleString() || trip.budget.toLocaleString()} USD
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <UsersIcon className="size-3.5 text-muted-foreground shrink-0" /> Party Size
              </span>
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                {trip.noOfPeople} {trip.noOfPeople === 1 ? "Person" : "People"}
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 space-y-1 shadow-2xs">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <CompassIcon className="size-3.5 text-muted-foreground shrink-0" /> Duration
              </span>
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                {daysList.length} Days Planned
              </p>
            </div>
          </div>
        </div>

        {/* Split-screen body */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left: itinerary timeline */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Draft Snapshot Banner */}
              {activeSnapshot?.status === "draft" && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs print:hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <SparklesIcon className="size-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                        Previewing AI Draft Revision
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{activeSnapshot.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="xs"
                      variant="outline"
                      className="text-xs border-border/80 bg-background"
                      onClick={handleDiscardSnapshot}
                    >
                      <Undo2Icon className="size-3.5 mr-1" />
                      Discard
                    </Button>
                    <Button size="xs" disabled={isApplying} onClick={() => handleApplySnapshot(activeSnapshot)}>
                      {isApplying ? (
                        <Loader2Icon className="size-3.5 animate-spin mr-1" />
                      ) : (
                        <CheckIcon className="size-3.5 mr-1" />
                      )}
                      Apply to Trip
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-muted-foreground bg-muted/50 border border-border/60 rounded-lg px-3.5 py-2.5 flex items-center gap-2 shadow-2xs print:hidden">
                <InfoIcon className="size-4 text-primary shrink-0" />
                <span>
                  <strong className="font-semibold text-foreground">Tip:</strong> Click on any activity below to view it
                  in the map!
                </span>
              </p>

              <div className="space-y-10">
                {daysList.map((day) => (
                  <section key={`day-${day.dayNumber}`} className="space-y-5">
                    <div className="flex items-baseline justify-between border-b border-border/80 pb-2">
                      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                        <span>Day {day.dayNumber}</span>
                        <span className="text-muted-foreground font-normal text-sm">— {day.theme}</span>
                      </h2>
                      <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded border border-border/40">
                        {day.activities?.length || 0} activities
                      </span>
                    </div>

                    <div className="space-y-3">
                      {day.activities?.map((act, actIdx) => {
                        const actKey = `d${day.dayNumber}-${act.timeSlot}-${act.title}`;
                        const isSelected = selectedKey === actKey;
                        const isHovered = hoveredKey === actKey;
                        const isActive = activeKey === actKey;

                        return (
                          <div
                            key={`act-${day.dayNumber}-${actIdx}`}
                            className={`rounded-xl border p-4 space-y-2 transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-foreground/40 bg-accent/60 shadow-2xs"
                                : isActive
                                  ? "border-border bg-muted/40"
                                  : "border-border/80 bg-card hover:border-foreground/20 hover:shadow-2xs"
                            }`}
                            onMouseEnter={() => handleActivityHover(actKey)}
                            onMouseLeave={() => handleActivityHover(null)}
                            onClick={() => handleActivityClick(actKey)}
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono text-muted-foreground flex items-center gap-1 font-medium">
                                <ClockIcon className="size-3" />
                                {act.timeSlot}
                              </span>
                              <span className="text-muted-foreground/40">•</span>
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                <span className={`size-1.5 rounded-full ${getCategoryDot(act.category)}`} />
                                {getCategoryName(act.category)}
                              </span>
                              {isSelected && (
                                <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 gap-1">
                                  <MapPinIcon className="size-2.5" /> Locked on Map
                                </Badge>
                              )}
                              {act.bookingRequired && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 px-1.5 h-4 text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                                >
                                  Booking Suggested
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-heading text-base font-bold text-foreground">{act.title}</h3>

                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                              <MapPinIcon className="size-3 text-muted-foreground shrink-0" />
                              {act.locationName}
                            </p>

                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-0.5">
                              {act.description}
                            </p>

                            <div className="flex items-center flex-wrap gap-4 text-xs pt-1">
                              {act.estimatedCost !== undefined && (
                                <span className="font-mono font-semibold text-foreground">
                                  ${act.estimatedCost} USD
                                </span>
                              )}

                              {act.bookingLink && (
                                <a
                                  href={
                                    act.bookingLink.startsWith("http")
                                      ? act.bookingLink
                                      : `https://www.google.com/search?q=${encodeURIComponent(act.bookingLink || act.title)}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline print:text-primary print:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Reserve Details
                                  <ExternalLinkIcon className="size-3" />
                                </a>
                              )}

                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${act.title} ${act.locationName} ${trip.tripLocation}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline print:text-primary print:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Google Maps
                                <ExternalLinkIcon className="size-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* Right: sticky map (desktop) */}
            <div className="hidden lg:block lg:w-[45%] xl:w-[50%] flex-shrink-0 print:hidden">
              <div className="sticky top-24">
                <div className="h-[calc(100dvh-8rem)]">
                  <TripMap activities={flatActivities} activeKey={activeKey} onSelectActivity={handleActivityClick} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile map toggle button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50 print:hidden">
        <Button size="icon" className="size-12 rounded-full shadow-lg" onClick={() => setMapOpen(!mapOpen)}>
          {mapOpen ? <XIcon className="size-5" /> : <MapIcon className="size-5" />}
        </Button>
      </div>

      {/* Mobile map overlay */}
      {mapOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm print:hidden">
          <div className="absolute inset-x-4 top-20 bottom-24 rounded-xl overflow-hidden border border-border shadow-xl">
            <TripMap activities={flatActivities} activeKey={activeKey} onSelectActivity={handleActivityClick} />
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

      {/* AI Chat Sidebar */}
      <TripChatSidebar
        tripId={trip?._id || id}
        destination={trip.tripLocation}
        targetBudget={trip.budget}
        currentItinerary={currentItinerary}
        activeSnapshot={activeSnapshot}
        snapshots={snapshots}
        isOpen={sidebarOpen}
        isApplying={isApplying}
        onClose={() => setSidebarOpen(false)}
        onProposeSnapshot={handleProposeSnapshot}
        onSelectSnapshot={handleSelectSnapshot}
        onApplySnapshot={handleApplySnapshot}
      />

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setShowDeleteDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your trip to{" "}
              <span className="font-semibold text-foreground">{trip?.tripLocation}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDeleteTrip}>
              {isDeleting ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Trip"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
