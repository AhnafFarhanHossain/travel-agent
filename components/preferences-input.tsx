"use client";

import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TripContext,
  TripPreferences,
  FoodPreferences,
  PreferStayingIn,
} from "@/context/trip-details";
import { cn } from "@/lib/utils";
import {
  CompassIcon,
  UtensilsIcon,
  Building2Icon,
  HomeIcon,
  BedIcon,
  SparklesIcon,
  HeartIcon,
  MountainIcon,
  LandmarkIcon,
  PalmtreeIcon,
  CameraIcon,
} from "lucide-react";

export interface PreferencesInputProps {
  tripPreferences?: TripPreferences;
  foodPreferences?: FoodPreferences;
  preferStayingIn?: PreferStayingIn;
  onTripPreferencesChange?: (val: TripPreferences) => void;
  onFoodPreferencesChange?: (val: FoodPreferences) => void;
  onPreferStayingInChange?: (val: PreferStayingIn) => void;
  className?: string;
}

const STAYING_OPTIONS = [
  { value: PreferStayingIn.hotel, label: "Hotel", icon: Building2Icon },
  { value: PreferStayingIn.airbnb, label: "Airbnb", icon: HomeIcon },
  { value: PreferStayingIn.hostel, label: "Hostel", icon: BedIcon },
  { value: PreferStayingIn.resort, label: "Resort", icon: SparklesIcon },
] as const;

const QUICK_TRIP_STYLES = [
  { value: TripPreferences.adventure, label: "Adventure", icon: MountainIcon },
  { value: TripPreferences.cultural, label: "Cultural", icon: LandmarkIcon },
  { value: TripPreferences.beachVacation, label: "Beach", icon: PalmtreeIcon },
  { value: TripPreferences.romantic, label: "Romantic", icon: HeartIcon },
  { value: TripPreferences.foodAndCulinary, label: "Culinary", icon: UtensilsIcon },
  { value: TripPreferences.offTheBeatenPath, label: "Explorer", icon: CameraIcon },
] as const;

export default function PreferencesInput({
  tripPreferences: propTripPref,
  foodPreferences: propFoodPref,
  preferStayingIn: propStayingPref,
  onTripPreferencesChange,
  onFoodPreferencesChange,
  onPreferStayingInChange,
  className,
}: PreferencesInputProps) {
  const tripContext = useContext(TripContext);

  const currentTripPref =
    propTripPref ?? tripContext?.tripPreferences ?? TripPreferences.adventure;
  const currentFoodPref =
    propFoodPref ?? tripContext?.foodPreferences ?? FoodPreferences.vegetarian;
  const currentStayingPref =
    propStayingPref ?? tripContext?.preferStayingIn ?? PreferStayingIn.hotel;

  const setTripPref = (val: TripPreferences) => {
    if (onTripPreferencesChange) {
      onTripPreferencesChange(val);
    } else if (tripContext?.setTripPreferences) {
      tripContext.setTripPreferences(val);
    }
  };

  const setFoodPref = (val: FoodPreferences) => {
    if (onFoodPreferencesChange) {
      onFoodPreferencesChange(val);
    } else if (tripContext?.setFoodPreferences) {
      tripContext.setFoodPreferences(val);
    }
  };

  const setStayingPref = (val: PreferStayingIn) => {
    if (onPreferStayingInChange) {
      onPreferStayingInChange(val);
    } else if (tripContext?.setPreferStayingIn) {
      tripContext.setPreferStayingIn(val);
    }
  };

  return (
    <div className={cn("flex flex-col gap-8 w-full max-w-lg mx-auto", className)}>
      {/* 1. Trip Style & Vibe */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CompassIcon className="size-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">
            Trip Style & Vibe
          </Label>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_TRIP_STYLES.map((style) => {
            const Icon = style.icon;
            const isActive = currentTripPref === style.value;
            return (
              <Button
                key={style.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setTripPref(style.value)}
                className={cn(
                  "rounded-full gap-1.5 text-xs transition-colors cursor-pointer",
                  isActive ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {style.label}
              </Button>
            );
          })}
        </div>

        <div className="pt-1">
          <Select
            value={currentTripPref}
            onValueChange={(v) => setTripPref(v as TripPreferences)}
          >
            <SelectTrigger className="w-full h-10 rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="More trip styles..." />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TripPreferences).map((pref) => (
                <SelectItem key={pref} value={pref}>
                  {pref}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. Accommodation Preference */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Building2Icon className="size-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">
            Accommodation Preference
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {STAYING_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = currentStayingPref === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStayingPref(opt.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer text-center",
                  isActive
                    ? "border-primary bg-primary/5 text-primary shadow-xs font-semibold"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                <span className="text-xs">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dietary & Food Preferences */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <UtensilsIcon className="size-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">
            Dietary & Food Preference
          </Label>
        </div>

        <Select
          value={currentFoodPref}
          onValueChange={(v) => setFoodPref(v as FoodPreferences)}
        >
          <SelectTrigger className="w-full h-10 rounded-xl border-border bg-background text-sm">
            <SelectValue placeholder="Select dietary preference..." />
          </SelectTrigger>
          <SelectContent>
            {Object.values(FoodPreferences).map((food) => (
              <SelectItem key={food} value={food}>
                {food}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
