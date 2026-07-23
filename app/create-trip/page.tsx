"use client";

import { useContext, useState, useCallback, useMemo } from "react";
import { use } from "react";
import { Header } from "@/components/header";
import LocationSearch from "@/components/location-input";
import PeopleInput from "@/components/people-input";
import BudgetInput from "@/components/budget-input";
import PreferencesInput from "@/components/preferences-input";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { TripContext } from "@/context/trip-details";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CheckIcon, ArrowRightIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";

const STEPS = [
  { key: "", label: "Location" },
  { key: "selectDuration", label: "Dates" },
  { key: "people", label: "People" },
  { key: "budget", label: "Budget" },
  { key: "preferences", label: "Preferences" },
] as const;

function StepIndicator({ current }: { current: string }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="w-full flex items-center justify-center">
      <nav aria-label="Trip creation progress" className="px-4">
      <ol className="mx-auto flex w-full max-w-full items-center">
        {STEPS.map((step, idx) => {
          const isComplete = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <li key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isComplete &&
                      !isCurrent &&
                      "bg-muted text-muted-foreground",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-[10px] font-medium leading-none sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px min-w-3 flex-1 sm:mx-2",
                    idx < activeIdx ? "bg-primary" : "bg-border",
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

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Calendar
        mode="single"
        selected={date}
        onSelect={(d) => {
          if (d) onSelect(d);
        }}
        disabled={disabled}
        startMonth={startMonth}
        className="w-full"
      />
    </div>
  );
}

function SelectDuration() {
  const { location, startDate, endDate, setStartDate, setEndDate } =
    useContext(TripContext);

  const [checkIn, setCheckIn] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined,
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined,
  );

  const checkInLocked = Boolean(checkIn);
  const checkOutLocked = Boolean(checkOut);

  const handleCheckIn = useCallback(
    (d: Date) => {
      setCheckIn(d);
      setStartDate(d.toISOString());
    },
    [setStartDate],
  );

  const handleCheckOut = useCallback(
    (d: Date) => {
      setCheckOut(d);
      setEndDate(d.toISOString());
    },
    [setEndDate],
  );

  const handleReset = useCallback(() => {
    setCheckIn(undefined);
    setCheckOut(undefined);
    setStartDate("");
    setEndDate("");
  }, [setStartDate, setEndDate]);

  const nightCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(
      0,
      Math.round(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
  }, [checkIn, checkOut]);

  const bothSelected = checkInLocked && checkOutLocked;
  const canProceed = bothSelected;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          When are you traveling?
        </h1>
        {location && (
          <p className="mt-1.5 text-sm text-muted-foreground">{location}</p>
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <DateCalendar
          label="Check-in"
          date={checkIn}
          onSelect={handleCheckIn}
          disabled={checkInLocked}
          startMonth={new Date()}
        />
        <DateCalendar
          label="Check-out"
          date={checkOut}
          onSelect={handleCheckOut}
          disabled={!checkIn || checkOutLocked}
          startMonth={checkIn ? new Date(checkIn) : new Date()}
        />
      </div>

      {bothSelected && (
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{nightCount}</span>{" "}
            {nightCount === 1 ? "night" : "nights"}
          </p>
        </div>
      )}

      <div className="flex w-full max-w-sm gap-3">
        {bothSelected ? (
          <>
            <Button
              className="flex-1 gap-2"
              variant="outline"
              type="button"
              onClick={handleReset}
            >
              <RotateCcwIcon className="size-3.5" />
              Reset dates
            </Button>
            <Link href="/create-trip?step=people" className="flex-1">
              <Button className="w-full gap-2" variant="default" type="button">
                Next
                <ArrowRightIcon className="size-3.5" />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/create-trip" className="flex-1">
              <Button className="w-full" variant="outline" type="button">
                Back
              </Button>
            </Link>
            <Button className="flex-1" variant="default" type="button" disabled>
              Next
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function SelectPeople() {
  const { location } = useContext(TripContext);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          Who's coming on this trip?
        </h1>
        {location && (
          <p className="mt-1.5 text-sm text-muted-foreground">{location}</p>
        )}
      </div>

      <div className="w-full max-w-md">
        <PeopleInput />
      </div>

      <div className="flex w-full max-w-sm gap-3">
        <Link href="/create-trip?step=selectDuration" className="flex-1">
          <Button className="w-full" variant="outline" type="button">
            Back
          </Button>
        </Link>
        <Link href="/create-trip?step=budget" className="flex-1">
          <Button className="w-full gap-2" variant="default" type="button">
            Next
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SelectBudget() {
  const { location } = useContext(TripContext);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          What is your trip budget?
        </h1>
        {location && (
          <p className="mt-1.5 text-sm text-muted-foreground">{location}</p>
        )}
      </div>

      <div className="w-full max-w-md">
        <BudgetInput />
      </div>

      <div className="flex w-full max-w-sm gap-3">
        <Link href="/create-trip?step=people" className="flex-1">
          <Button className="w-full" variant="outline" type="button">
            Back
          </Button>
        </Link>
        <Link href="/create-trip?step=preferences" className="flex-1">
          <Button className="w-full gap-2" variant="default" type="button">
            Next
            <ArrowRightIcon className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SelectPreferences() {
  const { location } = useContext(TripContext);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          What are your trip preferences?
        </h1>
        {location && (
          <p className="mt-1.5 text-sm text-muted-foreground">{location}</p>
        )}
      </div>

      <div className="w-full max-w-lg">
        <PreferencesInput />
      </div>

      <div className="flex w-full max-w-sm gap-3">
        <Link href="/create-trip?step=budget" className="flex-1">
          <Button className="w-full" variant="outline" type="button">
            Back
          </Button>
        </Link>
        <Link href="/chat" className="flex-1">
          <Button className="w-full gap-2" variant="default" type="button">
            Generate Trip
            <SparklesIcon className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function StepPlaceholder({
  title,
  description,
  prevStep,
}: {
  title: string;
  description: string;
  prevStep: string;
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Link href={`/create-trip${prevStep ? `?step=${prevStep}` : ""}`}>
        <Button variant="outline" type="button">
          Back
        </Button>
      </Link>
    </div>
  );
}

export default function CreateTripPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = use(searchParams);
  const { location } = useContext(TripContext);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <div className="pt-6 sm:pt-8">
        <StepIndicator current={step ?? ""} />
      </div>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-2xl">
          {step === "selectDuration" ? (
            <SelectDuration />
          ) : step === "people" ? (
            <SelectPeople />
          ) : step === "budget" ? (
            <SelectBudget />
          ) : step === "preferences" ? (
            <SelectPreferences />
          ) : (
            <div className="flex flex-col items-center gap-8">
              <div className="text-center">
                <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                  Where do you want to go?
                </h1>
              </div>
              <LocationSearch />
              <Link
                href={location ? "/create-trip?step=selectDuration" : "#"}
                className="w-full max-w-md"
              >
                <Button
                  className="w-full gap-2"
                  disabled={!location}
                  variant="default"
                  type="button"
                >
                  Next
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
