"use client";

import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  CheckIcon,
  UsersIcon,
  LeafIcon,
  CarIcon,
  SnowflakeIcon,
  FishIcon,
  FlameIcon,
  DumbbellIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

export interface PreferencesInputProps {
  tripPreferences?: TripPreferences | TripPreferences[];
  foodPreferences?: FoodPreferences | FoodPreferences[];
  preferStayingIn?: PreferStayingIn;
  onTripPreferencesChange?: (val: TripPreferences[]) => void;
  onFoodPreferencesChange?: (val: FoodPreferences[]) => void;
  onPreferStayingInChange?: (val: PreferStayingIn) => void;
  className?: string;
}

const STAYING_OPTIONS = [
  { value: PreferStayingIn.hotel, label: "Hotel", icon: Building2Icon },
  { value: PreferStayingIn.airbnb, label: "Airbnb", icon: HomeIcon },
  { value: PreferStayingIn.hostel, label: "Hostel", icon: BedIcon },
  { value: PreferStayingIn.resort, label: "Resort", icon: SparklesIcon },
] as const;

const TRIP_STYLE_OPTIONS: {
  value: TripPreferences;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: TripPreferences.letTheAIPick,
    label: "Let the AI Pick",
    icon: SparklesIcon,
  },
  { value: TripPreferences.adventure, label: "Adventure", icon: MountainIcon },
  { value: TripPreferences.cultural, label: "Cultural", icon: LandmarkIcon },
  { value: TripPreferences.beachVacation, label: "Beach", icon: PalmtreeIcon },
  { value: TripPreferences.romantic, label: "Romantic", icon: HeartIcon },
  {
    value: TripPreferences.foodAndCulinary,
    label: "Culinary",
    icon: UtensilsIcon,
  },
  {
    value: TripPreferences.offTheBeatenPath,
    label: "Explorer",
    icon: CameraIcon,
  },
  { value: TripPreferences.luxury, label: "Luxury", icon: SparklesIcon },
  { value: TripPreferences.wellness, label: "Wellness", icon: HeartIcon },
  {
    value: TripPreferences.familyFriendly,
    label: "Family-Friendly",
    icon: UsersIcon,
  },
  { value: TripPreferences.ecoTourism, label: "Eco-Tourism", icon: LeafIcon },
  {
    value: TripPreferences.historical,
    label: "Historical",
    icon: LandmarkIcon,
  },
  {
    value: TripPreferences.wildlifeSafari,
    label: "Wildlife Safari",
    icon: CompassIcon,
  },
  { value: TripPreferences.roadTrip, label: "Road Trip", icon: CarIcon },
  {
    value: TripPreferences.skiOrSnowboardTrip,
    label: "Ski & Snowboard",
    icon: SnowflakeIcon,
  },
  { value: TripPreferences.niche, label: "Niche", icon: SparklesIcon },
];

const FOOD_PREFERENCE_OPTIONS: {
  value: FoodPreferences;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: FoodPreferences.vegetarian, label: "Vegetarian", icon: LeafIcon },
  { value: FoodPreferences.vegan, label: "Vegan", icon: LeafIcon },
  { value: FoodPreferences.glutenFree, label: "Gluten-Free", icon: CheckIcon },
  { value: FoodPreferences.dairyFree, label: "Dairy-Free", icon: CheckIcon },
  { value: FoodPreferences.pescatarian, label: "Pescatarian", icon: FishIcon },
  { value: FoodPreferences.keto, label: "Keto", icon: FlameIcon },
  { value: FoodPreferences.paleo, label: "Paleo", icon: FlameIcon },
  { value: FoodPreferences.halal, label: "Halal", icon: CheckIcon },
  { value: FoodPreferences.kosher, label: "Kosher", icon: CheckIcon },
  { value: FoodPreferences.lowCarb, label: "Low-Carb", icon: CheckIcon },
  {
    value: FoodPreferences.highProtein,
    label: "High-Protein",
    icon: DumbbellIcon,
  },
  { value: FoodPreferences.organic, label: "Organic", icon: SparklesIcon },
];

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
  const [showAllStyles, setShowAllStyles] = useState(false);

  const rawTripPref = propTripPref ?? tripContext?.tripPreferences;
  const currentTripPref: TripPreferences[] = React.useMemo(() => {
    if (Array.isArray(rawTripPref)) return rawTripPref;
    if (rawTripPref) return [rawTripPref as TripPreferences];
    return [TripPreferences.adventure];
  }, [rawTripPref]);

  const rawFoodPref = propFoodPref ?? tripContext?.foodPreferences;
  const currentFoodPref: FoodPreferences[] = React.useMemo(() => {
    if (Array.isArray(rawFoodPref)) return rawFoodPref;
    if (rawFoodPref) return [rawFoodPref as FoodPreferences];
    return [FoodPreferences.vegetarian];
  }, [rawFoodPref]);

  const currentStayingPref =
    propStayingPref ?? tripContext?.preferStayingIn ?? PreferStayingIn.hotel;

  const toggleTripPref = (value: TripPreferences) => {
    const isSelected = currentTripPref.includes(value);
    let updated: TripPreferences[];
    if (isSelected) {
      updated = currentTripPref.filter((p) => p !== value);
    } else {
      updated = [...currentTripPref, value];
    }
    if (onTripPreferencesChange) {
      onTripPreferencesChange(updated);
    } else if (tripContext?.setTripPreferences) {
      tripContext.setTripPreferences(updated);
    }
  };

  const toggleFoodPref = (value: FoodPreferences) => {
    const isSelected = currentFoodPref.includes(value);
    let updated: FoodPreferences[];
    if (isSelected) {
      updated = currentFoodPref.filter((p) => p !== value);
    } else {
      updated = [...currentFoodPref, value];
    }
    if (onFoodPreferencesChange) {
      onFoodPreferencesChange(updated);
    } else if (tripContext?.setFoodPreferences) {
      tripContext.setFoodPreferences(updated);
    }
  };

  const setStayingPref = (val: PreferStayingIn) => {
    if (onPreferStayingInChange) {
      onPreferStayingInChange(val);
    } else if (tripContext?.setPreferStayingIn) {
      tripContext.setPreferStayingIn(val);
    }
  };

  const visibleTripStyles = showAllStyles
    ? TRIP_STYLE_OPTIONS
    : TRIP_STYLE_OPTIONS.slice(0, 8);

  return (
    <div
      className={cn("flex flex-col gap-8 w-full max-w-lg mx-auto", className)}
    >
      {/* 1. Trip Style & Vibe */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CompassIcon className="size-4 text-muted-foreground" />
            <Label className="text-sm font-semibold text-foreground">
              Trip Style & Vibe
            </Label>
          </div>
          {currentTripPref.length > 0 && (
            <Badge
              variant="secondary"
              className="text-[11px] font-normal px-2 py-0.5 rounded-full"
            >
              {currentTripPref.length} selected
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleTripStyles.map((style) => {
            const Icon = style.icon;
            const isActive = currentTripPref.includes(style.value);
            return (
              <Button
                key={style.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTripPref(style.value)}
                className={cn(
                  "rounded-full gap-1.5 text-xs transition-all cursor-pointer",
                  isActive
                    ? "shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                <Icon className="size-3.5" />
                {style.label}
                {isActive && <CheckIcon className="size-3 shrink-0 ml-0.5" />}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAllStyles(!showAllStyles)}
          className="w-full text-xs text-muted-foreground hover:text-foreground justify-center gap-1 h-8 mt-0.5 cursor-pointer"
        >
          {showAllStyles ? (
            <>
              Show fewer styles <ChevronUpIcon className="size-3.5" />
            </>
          ) : (
            <>
              More styles ({TRIP_STYLE_OPTIONS.length - 8} more){" "}
              <ChevronDownIcon className="size-3.5" />
            </>
          )}
        </Button>
      </div>

      {/* 2. Accommodation Preference */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Building2Icon className="size-4 text-muted-foreground" />
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
                    ? "border-foreground bg-foreground text-background shadow-xs font-semibold"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsIcon className="size-4 text-muted-foreground" />
            <Label className="text-sm font-semibold text-foreground">
              Dietary & Food Preferences
            </Label>
          </div>
          {currentFoodPref.length > 0 && (
            <Badge
              variant="secondary"
              className="text-[11px] font-normal px-2 py-0.5 rounded-full"
            >
              {currentFoodPref.length} selected
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {FOOD_PREFERENCE_OPTIONS.map((food) => {
            const Icon = food.icon;
            const isActive = currentFoodPref.includes(food.value);
            return (
              <Button
                key={food.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFoodPref(food.value)}
                className={cn(
                  "rounded-full gap-1.5 text-xs transition-all cursor-pointer",
                  isActive
                    ? "shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                <Icon className="size-3.5" />
                {food.label}
                {isActive && <CheckIcon className="size-3 shrink-0 ml-0.5" />}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
