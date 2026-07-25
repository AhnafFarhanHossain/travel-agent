"use client";

import { useContext, useCallback, useMemo, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import LocationSearch from "@/components/location-input";
import PeopleInput from "@/components/people-input";
import BudgetInput from "@/components/budget-input";
import PreferencesInput from "@/components/preferences-input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TripContext } from "@/context/trip-details";
import { generateTrip } from "@/lib/api/generateTrip";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  CheckIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  SparklesIcon,
  AlertCircleIcon,
  Loader2Icon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  WalletIcon,
  CompassIcon,
} from "lucide-react";

const STEPS = [
  { key: "", label: "Destination", subtitle: "Where should your next adventure begin?" },
  { key: "selectDuration", label: "Dates", subtitle: "When are you planning to travel?" },
  { key: "people", label: "Travelers", subtitle: "Who will be joining you on this journey?" },
  { key: "budget", label: "Budget", subtitle: "What is your target total budget?" },
  { key: "preferences", label: "Preferences", subtitle: "What experiences & accommodation do you prefer?" },
] as const;

function StepIndicator({ current }: { current: string }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="w-full flex items-center justify-center">
      <nav aria-label="Trip creation progress" className="px-4 w-full max-w-xl">
        <ol className="flex w-full items-center justify-between">
          {STEPS.map((step, idx) => {
            const isComplete = idx < activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <li key={step.key || "location"} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all shadow-2xs",
                      isComplete && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isComplete && !isCurrent && "bg-muted text-muted-foreground border border-border"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isComplete ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[11px] font-medium leading-none sm:block",
                      isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 min-w-4 flex-1 transition-colors rounded-full",
                      idx < activeIdx ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

function DateCalendar({
  label,
  date,
  onSelect,
  disabled,
  startMonth,
}: {
  label: string;
  date: Date | undefined;
  onSelect: (d: Date) => void;
  disabled: boolean;
  startMonth?: Date;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <Calendar
        mode="single"
        selected={date}
        onSelect={(d) => {
          if (d) onSelect(d);
        }}
        disabled={disabled}
        startMonth={startMonth}
        className="w-full border border-border/80 rounded-xl p-3 bg-background"
      />
    </div>
  );
}

function SelectLocation() {
  const router = useRouter();
  const { location, form } = useContext(TripContext);
  const locationError = form?.formState.errors.location?.message;

  const handleNext = async () => {
    if (!form) {
      if (location) router.push("/create-trip?step=selectDuration");
      return;
    }
    const isValid = await form.trigger("location");
    if (isValid) {
      router.push("/create-trip?step=selectDuration");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Where do you want to go?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md">
          Search any city or region, or select from popular destinations below.
        </p>
      </div>

      <LocationSearch />

      {locationError && (
        <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
          <AlertCircleIcon className="size-4 shrink-0" />
          {locationError}
        </p>
      )}

      <div className="w-full max-w-sm pt-2">
        <Button
          className="w-full h-11 gap-2 cursor-pointer text-sm font-semibold shadow-xs"
          disabled={!location}
          variant="default"
          type="button"
          onClick={handleNext}
        >
          Continue to Dates
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function SelectDuration() {
  const router = useRouter();
  const { location, startDate, endDate, setStartDate, setEndDate, form } =
    useContext(TripContext);

  const checkIn = useMemo(
    () => (startDate ? new Date(startDate) : undefined),
    [startDate]
  );
  const checkOut = useMemo(
    () => (endDate ? new Date(endDate) : undefined),
    [endDate]
  );

  const checkInLocked = Boolean(checkIn);
  const checkOutLocked = Boolean(checkOut);

  const handleCheckIn = useCallback(
    (d: Date) => {
      setStartDate(d.toISOString());
    },
    [setStartDate]
  );

  const handleCheckOut = useCallback(
    (d: Date) => {
      setEndDate(d.toISOString());
    },
    [setEndDate]
  );

  const handleReset = useCallback(() => {
    setStartDate("");
    setEndDate("");
  }, [setStartDate, setEndDate]);

  const nightCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(
      0,
      Math.round(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  }, [checkIn, checkOut]);

  const bothSelected = checkInLocked && checkOutLocked;

  const dateError =
    form?.formState.errors.startDate?.message ||
    form?.formState.errors.endDate?.message;

  const handleNext = async () => {
    if (!form) {
      if (bothSelected) router.push("/create-trip?step=people");
      return;
    }
    const isValid = await form.trigger(["startDate", "endDate"]);
    if (isValid) {
      router.push("/create-trip?step=people");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          When are you traveling?
        </h1>
        {location && (
          <Badge variant="outline" className="mt-2 text-xs font-semibold gap-1 bg-primary/10 text-primary border-primary/20">
            <MapPinIcon className="size-3" />
            {location}
          </Badge>
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6">
        <DateCalendar
          label="Check-in Date"
          date={checkIn}
          onSelect={handleCheckIn}
          disabled={checkInLocked}
          startMonth={new Date()}
        />
        <DateCalendar
          label="Check-out Date"
          date={checkOut}
          onSelect={handleCheckOut}
          disabled={!checkIn || checkOutLocked}
          startMonth={checkIn ? new Date(checkIn) : new Date()}
        />
      </div>

      {bothSelected && (
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs">
          <CalendarIcon className="size-3.5 text-primary" />
          <p className="text-muted-foreground">
            Duration: <span className="font-bold text-foreground">{nightCount}</span> {nightCount === 1 ? "night" : "nights"}
          </p>
        </div>
      )}

      {dateError && (
        <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
          <AlertCircleIcon className="size-4 shrink-0" />
          {dateError}
        </p>
      )}

      <div className="flex w-full max-w-sm gap-3 pt-2">
        {bothSelected ? (
          <>
            <Button
              className="flex-1 gap-1.5 h-11 text-xs cursor-pointer"
              variant="outline"
              type="button"
              onClick={handleReset}
            >
              <RotateCcwIcon className="size-3.5" />
              Reset Dates
            </Button>
            <Button
              className="flex-1 gap-1.5 h-11 text-xs font-semibold cursor-pointer shadow-xs"
              variant="default"
              type="button"
              onClick={handleNext}
            >
              Next: Travelers
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Link href="/create-trip" className="flex-1">
              <Button className="w-full h-11 text-xs" variant="outline" type="button">
                Back
              </Button>
            </Link>
            <Button className="flex-1 h-11 text-xs" variant="default" type="button" disabled>
              Next Step
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function SelectPeople() {
  const router = useRouter();
  const { location, form } = useContext(TripContext);
  const peopleError = form?.formState.errors.noOfPeople?.message;

  const handleNext = async () => {
    if (!form) {
      router.push("/create-trip?step=budget");
      return;
    }
    const isValid = await form.trigger("noOfPeople");
    if (isValid) {
      router.push("/create-trip?step=budget");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Who&apos;s coming on this trip?
        </h1>
        {location && (
          <Badge variant="outline" className="mt-2 text-xs font-semibold gap-1 bg-primary/10 text-primary border-primary/20">
            <MapPinIcon className="size-3" />
            {location}
          </Badge>
        )}
      </div>

      <div className="w-full max-w-md">
        <PeopleInput />
      </div>

      {peopleError && (
        <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
          <AlertCircleIcon className="size-4 shrink-0" />
          {peopleError}
        </p>
      )}

      <div className="flex w-full max-w-sm gap-3 pt-2">
        <Link href="/create-trip?step=selectDuration" className="flex-1">
          <Button className="w-full h-11 text-xs" variant="outline" type="button">
            Back
          </Button>
        </Link>
        <Button
          className="flex-1 gap-1.5 h-11 text-xs font-semibold cursor-pointer shadow-xs"
          variant="default"
          type="button"
          onClick={handleNext}
        >
          Next: Budget
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SelectBudget() {
  const router = useRouter();
  const { location, form } = useContext(TripContext);
  const budgetError = form?.formState.errors.budget?.message;

  const handleNext = async () => {
    if (!form) {
      router.push("/create-trip?step=preferences");
      return;
    }
    const isValid = await form.trigger("budget");
    if (isValid) {
      router.push("/create-trip?step=preferences");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          What is your total budget?
        </h1>
        {location && (
          <Badge variant="outline" className="mt-2 text-xs font-semibold gap-1 bg-primary/10 text-primary border-primary/20">
            <MapPinIcon className="size-3" />
            {location}
          </Badge>
        )}
      </div>

      <div className="w-full max-w-md">
        <BudgetInput />
      </div>

      {budgetError && (
        <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
          <AlertCircleIcon className="size-4 shrink-0" />
          {budgetError}
        </p>
      )}

      <div className="flex w-full max-w-sm gap-3 pt-2">
        <Link href="/create-trip?step=people" className="flex-1">
          <Button className="w-full h-11 text-xs" variant="outline" type="button">
            Back
          </Button>
        </Link>
        <Button
          className="flex-1 gap-1.5 h-11 text-xs font-semibold cursor-pointer shadow-xs"
          variant="default"
          type="button"
          onClick={handleNext}
        >
          Next: Preferences
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SelectPreferences() {
  const router = useRouter();
  const { location, form, tripData } = useContext(TripContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const prefError =
    form?.formState.errors.tripPreferences?.message ||
    form?.formState.errors.foodPreferences?.message ||
    form?.formState.errors.preferStayingIn?.message;

  const handleGenerate = async () => {
    if (!form) return;
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
      setIsGenerating(true);
      setApiError(null);
      const res = await generateTrip(tripData);
      if (res?.id) {
        router.push(`/trips/${res.id}`);
      } else {
        setApiError("Failed to retrieve generated trip ID.");
      }
    } catch (err: any) {
      console.error("Trip generation error:", err);
      setApiError(err?.message || "An unexpected error occurred while generating your trip.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Trip & Accommodation Style
        </h1>
        {location && (
          <Badge variant="outline" className="mt-2 text-xs font-semibold gap-1 bg-primary/10 text-primary border-primary/20">
            <MapPinIcon className="size-3" />
            {location}
          </Badge>
        )}
      </div>

      <div className="w-full max-w-lg text-left">
        <PreferencesInput />
      </div>

      {(prefError || apiError) && (
        <p className="text-xs text-destructive flex items-center gap-1.5 font-medium">
          <AlertCircleIcon className="size-4 shrink-0" />
          {prefError || apiError}
        </p>
      )}

      <div className="flex w-full max-w-sm gap-3 pt-2">
        <Link href="/create-trip?step=budget" className="flex-1">
          <Button className="w-full h-11 text-xs" variant="outline" type="button" disabled={isGenerating}>
            Back
          </Button>
        </Link>
        <Button
          className="flex-1 gap-2 h-11 text-xs font-semibold cursor-pointer shadow-xs"
          variant="default"
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Generating Itinerary...
            </>
          ) : (
            <>
              Generate Trip
              <CompassIcon className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function CreateTripPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = use(searchParams);

  return (
    <div className="flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <Header />

      <div className="pt-6 sm:pt-8 pb-4">
        <StepIndicator current={step ?? ""} />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex flex-col items-center justify-start">
        <Card className="w-full max-w-2xl border-border/80 shadow-xs rounded-2xl p-6 sm:p-8 bg-card">
          <CardContent className="p-0">
            {step === "selectDuration" ? (
              <SelectDuration />
            ) : step === "people" ? (
              <SelectPeople />
            ) : step === "budget" ? (
              <SelectBudget />
            ) : step === "preferences" ? (
              <SelectPreferences />
            ) : (
              <SelectLocation />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
