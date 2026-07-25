"use client";

import React, { useState, useEffect, useTransition } from "react";
import { LocationResult, searchLocations } from "@/lib/actions/countries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPinIcon, XIcon, Loader2Icon, CompassIcon } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";
import { TripContext } from "@/context/trip-details";

const POPULAR_DESTINATIONS = [
  { formatted: "Tokyo, Japan", city: "Tokyo", country: "Japan", flag: "https://flagcdn.com/w40/jp.png" },
  { formatted: "Paris, France", city: "Paris", country: "France", flag: "https://flagcdn.com/w40/fr.png" },
  { formatted: "Rome, Italy", city: "Rome", country: "Italy", flag: "https://flagcdn.com/w40/it.png" },
  { formatted: "New York, USA", city: "New York", country: "United States", flag: "https://flagcdn.com/w40/us.png" },
  { formatted: "Bali, Indonesia", city: "Bali", country: "Indonesia", flag: "https://flagcdn.com/w40/id.png" },
  { formatted: "London, UK", city: "London", country: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png" },
];

export default function LocationSearch() {
  const { location, setLocation } = useContext(TripContext);
  const [searchTerm, setSearchTerm] = useState(location || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(
      location
        ? { formatted: location, city: location, country: "", flag: "" }
        : null
    );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (location && !selectedLocation) {
      setSearchTerm(location);
      setSelectedLocation({ formatted: location, city: location, country: "", flag: "" });
    }
  }, [location, selectedLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedLocation) return;

    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setResults([]);
    }
  };

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed || selectedLocation) return;

    const timer = setTimeout(() => {
      startTransition(async () => {
        const matches = await searchLocations(trimmed);
        setResults(matches);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedLocation]);

  const handleSelect = (loc: LocationResult) => {
    setSelectedLocation(loc);
    setSearchTerm(loc.formatted);
    setLocation(loc.formatted);
    setResults([]);
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchTerm("");
    setLocation("");
    setResults([]);
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPinIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary shrink-0" />
            <Input
              id="location-search"
              type="text"
              placeholder="Search destination (e.g. Paris, Tokyo, Barcelona)..."
              value={searchTerm}
              onChange={handleInputChange}
              readOnly={Boolean(selectedLocation)}
              className={cn(
                "h-12 pl-10 pr-4 text-sm rounded-xl border-border bg-background shadow-2xs focus-visible:ring-primary",
                selectedLocation && "bg-muted font-medium"
              )}
            />
          </div>

          {selectedLocation && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClearSelection}
              className="size-12 rounded-xl border-border hover:bg-muted cursor-pointer shrink-0"
              aria-label="Clear selection"
            >
              <XIcon className="size-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        {searchTerm.trim() && !selectedLocation && (
          <ul className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-lg scrollbar-none">
            {isPending ? (
              <li className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin text-primary" />
                Searching destinations...
              </li>
            ) : results.length > 0 ? (
              results.map((item, idx) => (
                <li
                  key={`${item.city}-${item.country}-${idx}`}
                  onClick={() => handleSelect(item)}
                  role="option"
                  aria-selected={false}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-xs sm:text-sm transition-colors hover:bg-accent/60 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border/60"
                >
                  {item.flag ? (
                    <img
                      src={item.flag}
                      alt={item.country}
                      className="w-4 h-2.5 rounded-2xs object-cover shrink-0"
                    />
                  ) : (
                    <MapPinIcon className="size-3.5 text-primary shrink-0" />
                  )}
                  <span className="flex-1 truncate">
                    <span className="font-semibold text-foreground">{item.city}</span>
                    <span className="text-muted-foreground">, {item.country}</span>
                  </span>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs text-muted-foreground">
                No matching location found. Press Enter to use &quot;{searchTerm}&quot;
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Popular Destination Quick Cards */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <CompassIcon className="size-3.5 text-primary" />
          <span>Popular Destinations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {POPULAR_DESTINATIONS.map((dest) => {
            const isSelected = selectedLocation?.formatted === dest.formatted;
            return (
              <button
                key={dest.formatted}
                type="button"
                onClick={() => handleSelect(dest)}
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border/80 bg-card hover:border-primary/40 hover:bg-accent/40 text-foreground"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dest.flag}
                  alt={dest.country}
                  className="w-4 h-3 rounded-2xs object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight">{dest.city}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{dest.country}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
