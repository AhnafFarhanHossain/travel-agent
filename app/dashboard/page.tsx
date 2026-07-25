"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MapPinIcon, CalendarIcon, UsersIcon, ArrowRightIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";

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

export default function DashboardPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Your Dashboard
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mt-0.5">
              Saved Trip Itineraries
            </h1>
          </div>

          <Button size="sm" nativeButton={false} render={<Link href="/create-trip" />} className="shadow-2xs">
            <PlusIcon className="size-4 mr-1.5" />
            Create Trip
          </Button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2Icon className="size-7 animate-spin text-primary mr-2" />
            <span className="text-sm font-medium">Fetching saved trips...</span>
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-8 bg-card/40">
            <div className="size-14 rounded-2xl bg-muted p-2 flex items-center justify-center mb-4 shadow-2xs border border-border/50">
              <Image src="/kova-icon.png" alt="Kova" width={40} height={40} className="size-10 object-contain rounded-lg" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              You don&apos;t have any trips created yet
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              Start planning your next getaway and generate a custom, day-by-day AI itinerary in seconds.
            </p>

            <Button className="mt-6" size="sm" nativeButton={false} render={<Link href="/create-trip" />}>
              <PlusIcon className="size-4 mr-1.5" />
              Create Trip Plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((t) => (
              <Card key={t._id} className="border-border/80 shadow-2xs hover:border-primary/50 hover:shadow-xs transition-all flex flex-col justify-between group">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="gap-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                      <MapPinIcon className="size-3 shrink-0" />
                      {t.tripLocation}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded border border-border/40">
                      ${t.budget.toLocaleString()} USD
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground mt-3 group-hover:text-primary transition-colors line-clamp-1">
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
                        <CalendarIcon className="size-3.5 text-primary shrink-0" />
                        {formatDate(t.startDate)}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <UsersIcon className="size-3.5 text-primary shrink-0" />
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
