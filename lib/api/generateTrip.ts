import { TripFormData } from "@/lib/schemas/trip";
import { Itinerary } from "@/lib/schemas/itenerary";

export interface GenerateTripResult {
  success: boolean;
  id: string;
  itinerary: Itinerary;
  trip?: any;
}

/**
 * Sends user trip constraints to `/api/generate-trip`
 * and returns the AI-generated structured itinerary object and saved trip ID.
 */
export async function generateTrip(tripData: TripFormData): Promise<GenerateTripResult> {
  const response = await fetch("/api/generate-trip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to generate trip plan");
  }

  const data: GenerateTripResult = await response.json();
  return data;
}
