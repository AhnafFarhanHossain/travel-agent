"use client";

import { useContext } from "react";
import { TripContext } from "@/context/trip-details";
import type { TripFormData } from "@/lib/schemas/trip";

export function useTripData() {
  try {
    const { tripData } = useContext(TripContext);
    if (!tripData || Object.keys(tripData).length === 0) {
      throw new Error("Trip data is not available. Please ensure you are within the TripProvider context.");
    }
  
    // check if all required fields are present
    const requiredFields: Array<keyof TripFormData> = [
      "location",
      "startDate",
      "endDate",
      "noOfPeople",
      "budget",
      "tripPreferences",
      "foodPreferences",
      "preferStayingIn",
    ];
  
    for (const field of requiredFields) {
      if (!tripData[field]) {
        throw new Error(`Required field "${field}" is missing from trip data.`);
      }
    }
    return tripData;
  } catch (error) {
    console.error("Error in useTripData:", error);
    throw new Error("useTripData must be used within a TripProvider context.");
  }
}
