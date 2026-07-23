"use client";

import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TripContext } from "@/context/trip-details";
import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon, UserIcon, UsersIcon } from "lucide-react";

export interface PeopleInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
}

const PRESETS = [
  { label: "Just me", count: 1 },
  { label: "2 People", count: 2 },
  { label: "4 People", count: 4 },
  { label: "6+ People", count: 6 },
] as const;

export default function PeopleInput({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  id = "people-input",
}: PeopleInputProps) {
  const tripContext = useContext(TripContext);

  const contextCount = tripContext?.noOfPeople ?? 0;
  const rawCount = value !== undefined ? value : contextCount;
  const count = rawCount > 0 ? rawCount : 1;

  const [isFocused, setIsFocused] = useState(false);
  const [rawInput, setRawInput] = useState(count.toString());

  const updateCount = (newVal: number) => {
    const clamped = Math.max(min, Math.min(max, newVal));
    setRawInput(clamped.toString());
    if (onChange) {
      onChange(clamped);
    } else if (tripContext?.setNoOfPeople) {
      tripContext.setNoOfPeople(clamped);
    }
  };

  const handleDecrement = () => {
    updateCount(count - 1);
  };

  const handleIncrement = () => {
    updateCount(count + 1);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setRawInput(count.toString());
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseInt(rawInput, 10);
    if (isNaN(parsed) || parsed < min) {
      updateCount(min);
    } else {
      updateCount(parsed);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(e.target.value);
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      if (onChange) {
        onChange(parsed);
      } else if (tripContext?.setNoOfPeople) {
        tripContext.setNoOfPeople(parsed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      updateCount(count + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      updateCount(count - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  const displayValue = isFocused
    ? rawInput
    : count === 1
      ? "Just me"
      : `${count} people`;

  return (
    <div className={cn("flex flex-col items-center gap-4 w-full max-w-sm mx-auto", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground text-center">
        How many people are going?
      </Label>

      <div className="flex items-center justify-center gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={count <= min}
          aria-label="Decrease number of people"
          className="size-10 rounded-xl shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <MinusIcon className="size-4" />
        </Button>

        <div className="relative flex-1 max-w-[200px]">
          <div className="relative flex items-center">
            {count === 1 ? (
              <UserIcon className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
            ) : (
              <UsersIcon className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
            )}
            <Input
              id={id}
              type={isFocused ? "number" : "text"}
              inputMode="numeric"
              min={min}
              max={max}
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              aria-label="Amount of people going on the trip"
              className="h-10 text-center font-medium text-sm pl-9 pr-3 rounded-xl border-border bg-background shadow-xs focus-visible:ring-2 transition-colors"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={count >= max}
          aria-label="Increase number of people"
          className="size-10 rounded-xl shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {PRESETS.map((preset) => {
          const isActive = count === preset.count;
          return (
            <Button
              key={preset.count}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => updateCount(preset.count)}
              className={cn(
                "rounded-full text-xs transition-colors cursor-pointer",
                isActive ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
