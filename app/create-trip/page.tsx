"use client";

import { useContext } from "react";
import { use } from "react";
import { Header } from "@/components/header";
import LocationSearch from "@/components/location-input";
import { Button } from "@/components/ui/button";
import { TripContext } from "@/context/trip-details";
import Link from "next/link";

export default function CreateTripPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = use(searchParams);
  const { location } = useContext(TripContext);

  if (step === "selectDuration") {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md">
            <h1 className="mb-6 text-center font-heading text-xl font-semibold text-foreground sm:text-2xl">
              How long is your trip?
            </h1>
            <p className="mb-4 text-center text-muted-foreground">
              {location ? `You selected: ${location}` : "No location selected"}
            </p>
            <p className="text-center text-muted-foreground">
              Duration selection coming soon...
            </p>
            <Link href="/create-trip">
              <Button className="mt-4 w-full" variant="outline" type="button">
                Back
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-center font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Where do you want to go?
          </h1>
          <LocationSearch />
          <Link href="/create-trip?step=selectDuration">
            <Button
              className="mt-4 w-full"
              disabled={false}
              variant="default"
              type="button"
            >
              Next
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
