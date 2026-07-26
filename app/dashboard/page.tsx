"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ArrowRightIcon,
  Loader2Icon,
  Trash2Icon,
  SearchIcon,
  CompassIcon,
  WalletIcon,
  XIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
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

interface SavedTrip {
  _id: string;
  tripLocation: string;
  startDate: string;
  endDate: string;
  noOfPeople: number;
  budget: number;
  itinerary?: {
    tripTitle?: string;
    summary?: string;
  };
  createdAt?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
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

function getTripDurationDays(startDateStr?: string, endDateStr?: string): number {
  if (!startDateStr || !endDateStr) return 0;
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "upcoming" | "past">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "budget-desc" | "budget-asc">("newest");
  const [tripToDelete, setTripToDelete] = useState<SavedTrip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true);
        const res = await fetch("/api/trips");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.trips)) {
            setTrips(data.trips);
          }
        }
      } catch (err) {
        console.error("Error loading trips:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, []);

  async function handleDeleteTrip() {
    if (!tripToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/trips/${tripToDelete._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete trip");
      }

      setTrips((prev) => prev.filter((t) => t._id !== tripToDelete._id));
      toast.success("Trip deleted successfully");
      setTripToDelete(null);
    } catch (err: any) {
      console.error("Error deleting trip:", err);
      toast.error(err.message || "Failed to delete trip");
    } finally {
      setIsDeleting(false);
    }
  }

  // Calculate summary metrics
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
    const totalDays = trips.reduce(
      (acc, t) => acc + getTripDurationDays(t.startDate, t.endDate),
      0
    );
    const totalGuests = trips.reduce((acc, t) => acc + (t.noOfPeople || 1), 0);
    return { totalTrips, totalBudget, totalDays, totalGuests };
  }, [trips]);

  // Filter & sort trips
  const filteredTrips = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return trips
      .filter((t) => {
        // Search filter
        const query = searchQuery.toLowerCase().trim();
        if (query) {
          const locationMatch = t.tripLocation?.toLowerCase().includes(query);
          const titleMatch = t.itinerary?.tripTitle?.toLowerCase().includes(query);
          const summaryMatch = t.itinerary?.summary?.toLowerCase().includes(query);
          if (!locationMatch && !titleMatch && !summaryMatch) return false;
        }

        // Timing filter
        if (selectedFilter === "upcoming") {
          const startDate = t.startDate ? new Date(t.startDate) : null;
          if (startDate && startDate < today) return false;
        } else if (selectedFilter === "past") {
          const endDate = t.endDate ? new Date(t.endDate) : null;
          if (endDate && endDate >= today) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || a.startDate).getTime() - new Date(b.createdAt || b.startDate).getTime();
        }
        if (sortBy === "budget-desc") {
          return (b.budget || 0) - (a.budget || 0);
        }
        if (sortBy === "budget-asc") {
          return (a.budget || 0) - (b.budget || 0);
        }
        return 0;
      });
  }, [trips, searchQuery, selectedFilter, sortBy]);

  return (
    <div className="flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/80 mb-2">
              <CompassIcon className="size-3 text-muted-foreground" />
              <span>Your Travel Hub</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Saved Trip Itineraries
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Access all your AI-generated travel plans, manage custom day-by-day itineraries, or start building a new getaway.
            </p>
          </div>

          <Button size="sm" nativeButton={false} render={<Link href="/create-trip" />} className="shadow-xs self-start md:self-auto shrink-0">
            <PlusIcon className="size-4 mr-1.5" />
            Create Trip Plan
          </Button>
        </div>

        {/* Stats Summary Bar (Rendered when user has trips) */}
        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CompassIcon className="size-3.5 text-muted-foreground shrink-0" /> Saved Trips
              </span>
              <p className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                {stats.totalTrips}
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" /> Days Planned
              </span>
              <p className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                {stats.totalDays} {stats.totalDays === 1 ? "Day" : "Days"}
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <UsersIcon className="size-3.5 text-muted-foreground shrink-0" /> Total Guests
              </span>
              <p className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                {stats.totalGuests}
              </p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1 shadow-2xs">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <WalletIcon className="size-3.5 text-muted-foreground shrink-0" /> Total Budget
              </span>
              <p className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                ${stats.totalBudget.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        {!loading && trips.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search location or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-card border-border/80"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs & Sort Dropdown */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedFilter === "all"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({trips.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("upcoming")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedFilter === "upcoming"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setSelectedFilter("past")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    selectedFilter === "past"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Past
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="h-8 rounded-lg border border-border/80 bg-card px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget-desc">Budget: High to Low</option>
                <option value="budget-asc">Budget: Low to High</option>
              </select>
            </div>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded-full bg-muted" />
                  <div className="h-5 w-16 rounded bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </div>
                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-8 bg-card/40">
            <div className="size-16 rounded-2xl bg-muted/60 p-3 flex items-center justify-center mb-4 border border-border/60 shadow-2xs">
              <Image src="/kova-icon.png" alt="Kova" width={48} height={48} className="size-10 object-contain rounded-lg" />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              You don&apos;t have any saved trips yet
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              Start planning your next getaway and generate a custom, day-by-day AI itinerary tailored to your preferences.
            </p>

            <Button className="mt-6" size="sm" nativeButton={false} render={<Link href="/create-trip" />}>
              <PlusIcon className="size-4 mr-1.5" />
              Create Trip Plan
            </Button>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 p-12 text-center my-8 bg-card">
            <SearchIcon className="size-8 text-muted-foreground mb-3" />
            <h3 className="font-heading text-base font-semibold text-foreground">
              No trips match your search or filter
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Try adjusting your search terms or clearing the selected filter.
            </p>
            <Button
              variant="outline"
              size="xs"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((t) => {
              const durationDays = getTripDurationDays(t.startDate, t.endDate);
              const activeExceptionsCount = Object.values(t.itinerary?.exceptionCases || {}).filter(Boolean).length;
              return (
                <Card
                  key={t._id}
                  className="border-border/80 shadow-2xs hover:border-foreground/20 hover:shadow-xs transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="gap-1 text-xs font-medium bg-muted text-foreground border-border/60"
                        >
                          <MapPinIcon className="size-3 shrink-0 text-muted-foreground" />
                          {t.tripLocation}
                        </Badge>
                        {durationDays > 0 && (
                          <Badge variant="outline" className="text-[11px] font-medium bg-background text-muted-foreground border-border/60">
                            {durationDays} {durationDays === 1 ? "Day" : "Days"}
                          </Badge>
                        )}
                        {activeExceptionsCount > 0 && (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            title={`${activeExceptionsCount} AI planning advisory notice(s)`}
                          >
                            <AlertTriangleIcon className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            Advisory ({activeExceptionsCount})
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border/40">
                          ${t.budget.toLocaleString()} USD
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTripToDelete(t);
                          }}
                          aria-label="Delete trip"
                          title="Delete trip"
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground mt-3 transition-colors line-clamp-1">
                      {t.itinerary?.tripTitle || `Trip to ${t.tripLocation}`}
                    </CardTitle>

                    <CardDescription className="text-xs line-clamp-2 mt-1.5 text-muted-foreground leading-relaxed">
                      {t.itinerary?.summary || `Plan for ${t.noOfPeople} traveler(s)`}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3 mt-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium">
                          <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
                          {formatDate(t.startDate)}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <UsersIcon className="size-3.5 text-muted-foreground shrink-0" />
                          {t.noOfPeople} {t.noOfPeople === 1 ? "guest" : "guests"}
                        </span>
                      </div>

                      <Link
                        href={`/trips/${t._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        View Itinerary
                        <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog
        open={!!tripToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setTripToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your trip to{" "}
              <span className="font-semibold text-foreground">
                {tripToDelete?.tripLocation}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteTrip}
            >
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



