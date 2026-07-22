"use client";

import { Header } from "@/components/header";
import LocationSearch from "@/components/location-input";

export default function CreateTripPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-center font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Where do you want to go?
          </h1>
          <LocationSearch />
        </div>
      </main>
    </div>
  );
}