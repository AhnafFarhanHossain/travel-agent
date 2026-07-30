import { Itinerary } from "@/lib/schemas/itenerary";

export interface Snapshot {
  id: string;
  description: string;
  timestamp: string | undefined;
  itinerary: Itinerary;
  status: "draft" | "applied";
}
