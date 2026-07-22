"use client";

import React, { useState, useEffect, useTransition } from "react";
import { LocationResult, searchLocations } from "@/lib/actions/countries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPinIcon, XIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";
import { TripContext } from "@/context/trip-details";

export default function LocationSearch() {
  const { location, setLocation } = useContext(TripContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const handleSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setSearchTerm(location.formatted);
    setLocation(location.formatted);
    setResults([]);
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPinIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location-search"
              type="text"
              placeholder="Type a city or country..."
              value={searchTerm}
              onChange={handleInputChange}
              readOnly={Boolean(selectedLocation)}
              className={cn("h-10 pl-9", selectedLocation && "bg-muted")}
            />
          </div>

          {selectedLocation && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClearSelection}
              className="size-10 cursor-pointer"
              aria-label="Clear selection"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>

        {searchTerm.trim() && !selectedLocation && (
          <ul className="absolute z-50 mt-4 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-md scrollbar-none">
            {isPending ? (
              <li className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Searching...
              </li>
            ) : results.length > 0 ? (
              results.map((item, idx) => (
                <li
                  key={`${item.city}-${item.country}-${idx}`}
                  onClick={() => handleSelect(item)}
                  role="option"
                  aria-selected={false}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-accent/50 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border"
                >
                  <Image
                    src={item.flag}
                    alt={item.country}
                    width={12}
                    height={6}
                    className="rounded-xs"
                  />
                  <span className="flex-1 truncate">
                    <span className="font-medium">{item.city}</span>
                    <span className="text-muted-foreground">
                      , {item.country}
                    </span>
                  </span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2.5 text-sm text-muted-foreground">
                No results found
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
