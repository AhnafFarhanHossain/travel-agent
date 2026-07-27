"use client";

import { createContext, useEffect } from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tripFormSchema,
  TripFormData,
  defaultTripValues,
  TripPreferences,
  FoodPreferences,
  PreferStayingIn,
} from "@/lib/schemas/trip";

type TripContextType = {
  location: string;
  startDate: string;
  endDate: string;
  noOfPeople: number;
  budget: number;
  tripPreferences: TripPreferences[];
  foodPreferences: FoodPreferences[];
  preferStayingIn: PreferStayingIn;

  /** Complete form dataset altogether */
  tripData: TripFormData;
  /** React Hook Form instance */
  form: UseFormReturn<TripFormData> | null;

  setLocation: (val: React.SetStateAction<string>) => void;
  setStartDate: (val: React.SetStateAction<string>) => void;
  setEndDate: (val: React.SetStateAction<string>) => void;
  setNoOfPeople: (val: React.SetStateAction<number>) => void;
  setBudget: (val: React.SetStateAction<number>) => void;
  setTripPreferences: (val: React.SetStateAction<TripPreferences[]>) => void;
  setFoodPreferences: (val: React.SetStateAction<FoodPreferences[]>) => void;
  setPreferStayingIn: (val: React.SetStateAction<PreferStayingIn>) => void;

  clearTripData: () => void;
};

const TripContext = createContext<TripContextType>({
  ...defaultTripValues,
  tripData: defaultTripValues,
  form: null,

  setLocation: () => {},
  setStartDate: () => {},
  setEndDate: () => {},
  setNoOfPeople: () => {},
  setBudget: () => {},
  setTripPreferences: () => {},
  setFoodPreferences: () => {},
  setPreferStayingIn: () => {},
  clearTripData: () => {},
});

const TripProvider = ({ children }: { children: React.ReactNode }) => {
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: defaultTripValues,
    mode: "onChange",
  });

  const tripData = form.watch();

  const setLocation = (val: React.SetStateAction<string>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("location")) : val;
    form.setValue("location", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const setStartDate = (val: React.SetStateAction<string>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("startDate")) : val;
    form.setValue("startDate", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const setEndDate = (val: React.SetStateAction<string>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("endDate")) : val;
    form.setValue("endDate", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const setNoOfPeople = (val: React.SetStateAction<number>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("noOfPeople")) : val;
    form.setValue("noOfPeople", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const setBudget = (val: React.SetStateAction<number>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("budget")) : val;
    form.setValue("budget", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const setTripPreferences = (val: React.SetStateAction<TripPreferences[]>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("tripPreferences")) : val;
    form.setValue("tripPreferences", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const setFoodPreferences = (val: React.SetStateAction<FoodPreferences[]>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("foodPreferences")) : val;
    form.setValue("foodPreferences", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const setPreferStayingIn = (val: React.SetStateAction<PreferStayingIn>) => {
    const nextVal = typeof val === "function" ? val(form.getValues("preferStayingIn")) : val;
    form.setValue("preferStayingIn", nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const clearTripData = () => {
    form.reset(defaultTripValues);
  };

  const contextValue: TripContextType = {
    location: tripData.location ?? "",
    startDate: tripData.startDate ?? "",
    endDate: tripData.endDate ?? "",
    noOfPeople: tripData.noOfPeople ?? 1,
    budget: tripData.budget ?? 1000,
    tripPreferences: Array.isArray(tripData.tripPreferences)
      ? tripData.tripPreferences
      : tripData.tripPreferences
      ? [tripData.tripPreferences]
      : [TripPreferences.niche],
    foodPreferences: Array.isArray(tripData.foodPreferences)
      ? tripData.foodPreferences
      : tripData.foodPreferences
      ? [tripData.foodPreferences]
      : [FoodPreferences.vegetarian],
    preferStayingIn: tripData.preferStayingIn ?? PreferStayingIn.hotel,
    tripData,
    form,
    setLocation,
    setStartDate,
    setEndDate,
    setNoOfPeople,
    setBudget,
    setTripPreferences,
    setFoodPreferences,
    setPreferStayingIn,
    clearTripData,
  };

  return (
    <FormProvider {...form}>
      <TripContext.Provider value={contextValue}>
        {children}
      </TripContext.Provider>
    </FormProvider>
  );
};

export { TripContext, TripProvider, TripPreferences, FoodPreferences, PreferStayingIn };
