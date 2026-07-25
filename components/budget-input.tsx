"use client";

import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TripContext } from "@/context/trip-details";
import { cn } from "@/lib/utils";
import { DollarSignIcon, MinusIcon, PlusIcon, WalletIcon } from "lucide-react";

export interface BudgetInputProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  id?: string;
}

const PRESETS = [
  { label: "Economy ($500)", amount: 500, description: "Budget-friendly & essential comfort" },
  { label: "Moderate ($1,500)", amount: 1500, description: "Balanced mix of comfort & activities" },
  { label: "Luxury ($3,500)", amount: 3500, description: "Premium stays & upscale experiences" },
  { label: "Ultra ($5,000+)", amount: 5000, description: "Uncompromising luxury & exclusive travel" },
] as const;

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function getBudgetCategory(amount: number): string {
  if (amount < 800) return "Economy — Essential & budget-conscious";
  if (amount < 2500) return "Moderate — Balanced comfort & value";
  if (amount < 4500) return "Luxury — Upscale stays & fine dining";
  return "Ultra — Premium & exclusive experiences";
}

export default function BudgetInput({
  value,
  onChange,
  min = 100,
  max = 50000,
  step = 100,
  className,
  id = "budget-input",
}: BudgetInputProps) {
  const tripContext = useContext(TripContext);

  const contextBudget = tripContext?.budget ?? 0;
  const rawBudget = value !== undefined ? value : contextBudget;
  const budget = rawBudget > 0 ? rawBudget : 1000;

  const [isFocused, setIsFocused] = useState(false);
  const [rawInput, setRawInput] = useState(budget.toString());

  const updateBudget = (newVal: number) => {
    const clamped = Math.max(min, Math.min(max, newVal));
    setRawInput(clamped.toString());
    if (onChange) {
      onChange(clamped);
    } else if (tripContext?.setBudget) {
      tripContext.setBudget(clamped);
    }
  };

  const handleDecrement = () => {
    updateBudget(budget - step);
  };

  const handleIncrement = () => {
    updateBudget(budget + step);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setRawInput(budget.toString());
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseInt(rawInput, 10);
    if (isNaN(parsed) || parsed < min) {
      updateBudget(min);
    } else {
      updateBudget(parsed);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setRawInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      if (onChange) {
        onChange(parsed);
      } else if (tripContext?.setBudget) {
        tripContext.setBudget(parsed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      updateBudget(budget + step);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      updateBudget(budget - step);
    } else if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  const displayValue = isFocused ? rawInput : formatCurrency(budget);

  return (
    <div className={cn("flex flex-col items-center gap-4 w-full max-w-md mx-auto", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground text-center">
        What is your estimated total budget?
      </Label>

      <div className="flex items-center justify-center gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={budget <= min}
          aria-label={`Decrease budget by ${step}`}
          className="size-10 rounded-xl shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <MinusIcon className="size-4" />
        </Button>

        <div className="relative flex-1 max-w-[220px]">
          <div className="relative flex items-center">
            {isFocused ? (
              <DollarSignIcon className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
            ) : (
              <WalletIcon className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
            )}
            <Input
              id={id}
              type={isFocused ? "number" : "text"}
              inputMode="numeric"
              min={min}
              max={max}
              step={step}
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              aria-label="Trip budget amount in USD"
              className="h-10 text-center font-semibold text-base pl-9 pr-3 rounded-xl border-border bg-background shadow-xs focus-visible:ring-2 transition-colors"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={budget >= max}
          aria-label={`Increase budget by ${step}`}
          className="size-10 rounded-xl shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center min-h-[1.25rem]">
        {getBudgetCategory(budget)}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {PRESETS.map((preset) => {
          const isActive = Math.abs(budget - preset.amount) < step / 2;
          return (
            <Button
              key={preset.amount}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => updateBudget(preset.amount)}
              title={preset.description}
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
