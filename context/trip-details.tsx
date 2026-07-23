"use client";

import { createContext, useEffect, useState } from "react";

const STORAGE_KEY = "trip-details";

type TripContextType = {
  location: string;
  startDate: string;
  endDate: string;
  noOfPeople: number;
  budget: number;

  tripPreferences: TripPreferences;
  foodPreferences: FoodPreferences;
  preferStayingIn: PreferStayingIn;

  setLocation: React.Dispatch<React.SetStateAction<string>>;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  setNoOfPeople: React.Dispatch<React.SetStateAction<number>>;
  setBudget: React.Dispatch<React.SetStateAction<number>>;
  setTripPreferences: React.Dispatch<React.SetStateAction<TripPreferences>>;
  setFoodPreferences: React.Dispatch<React.SetStateAction<FoodPreferences>>;
  setPreferStayingIn: React.Dispatch<React.SetStateAction<PreferStayingIn>>;

  clearTripData: () => void;
};

enum TripPreferences {
  niche = "Niche",
  adventure = "Adventure",
  cultural = "Cultural",
  luxury = "Luxury",
  wellness = "Wellness",
  familyFriendly = "Family-Friendly",
  romantic = "Romantic",
  offTheBeatenPath = "Off-the-Beaten-Path",
  ecoTourism = "Eco-Tourism",
  historical = "Historical",
  beachVacation = "Beach Vacation",
  wildlifeSafari = "Wildlife Safari",
  foodAndCulinary = "Food and Culinary",
  roadTrip = "Road Trip",
  skiOrSnowboardTrip = "Ski or Snowboard Trip",
}

enum FoodPreferences {
  vegetarian = "Vegetarian",
  vegan = "Vegan",
  glutenFree = "Gluten-Free",
  dairyFree = "Dairy-Free",
  pescatarian = "Pescatarian",
  keto = "Keto",
  paleo = "Paleo",
  halal = "Halal",
  kosher = "Kosher",
  lowCarb = "Low-Carb",
  highProtein = "High-Protein",
  organic = "Organic",
}

enum PreferStayingIn {
  hotel = "Hotel",
  airbnb = "Airbnb",
  hostel = "Hostel",
  resort = "Resort",
}

const TripContext = createContext<TripContextType>({
  location: "",
  startDate: "",
  endDate: "",
  noOfPeople: 0,
  budget: 0,

  tripPreferences: TripPreferences.niche,
  foodPreferences: FoodPreferences.vegetarian,
  preferStayingIn: PreferStayingIn.hotel,

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

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed[key] ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(state: Record<string, unknown>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const TripProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [noOfPeople, setNoOfPeople] = useState(0);
  const [budget, setBudget] = useState(0);
  const [tripPreferences, setTripPreferences] = useState(TripPreferences.niche);
  const [foodPreferences, setFoodPreferences] = useState(FoodPreferences.vegetarian);
  const [preferStayingIn, setPreferStayingIn] = useState(PreferStayingIn.hotel);

  useEffect(() => {
    setLocation(readStorage("location", ""));
    setStartDate(readStorage("startDate", ""));
    setEndDate(readStorage("endDate", ""));
    setNoOfPeople(readStorage("noOfPeople", 0));
    setBudget(readStorage("budget", 0));
    setTripPreferences(readStorage("tripPreferences", TripPreferences.niche));
    setFoodPreferences(readStorage("foodPreferences", FoodPreferences.vegetarian));
    setPreferStayingIn(readStorage("preferStayingIn", PreferStayingIn.hotel));
  }, []);

  useEffect(() => {
    writeStorage({
      location,
      startDate,
      endDate,
      noOfPeople,
      budget,
      tripPreferences,
      foodPreferences,
      preferStayingIn,
    });
  }, [location, startDate, endDate, noOfPeople, budget, tripPreferences, foodPreferences, preferStayingIn]);

  const clearTripData = () => {
    setLocation("");
    setStartDate("");
    setEndDate("");
    setNoOfPeople(0);
    setBudget(0);
    setTripPreferences(TripPreferences.niche);
    setFoodPreferences(FoodPreferences.vegetarian);
    setPreferStayingIn(PreferStayingIn.hotel);
    clearStorage();
  };

  return (
    <TripContext.Provider value={{ location, startDate, endDate, noOfPeople, budget, tripPreferences, foodPreferences, preferStayingIn, setLocation, setStartDate, setEndDate, setNoOfPeople, setBudget, setTripPreferences, setFoodPreferences, setPreferStayingIn, clearTripData }}>
      {children}
    </TripContext.Provider>
  )
}

export { TripContext, TripProvider, TripPreferences, FoodPreferences, PreferStayingIn };