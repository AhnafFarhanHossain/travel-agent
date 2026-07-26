import { z } from "zod";

export const itinerarySchema = z.object({
  tripTitle: z.string().describe("Catchy title for the itinerary"),
  summary: z.string().describe("A brief overview of the trip style"),
  estimatedTotalCost: z.number().describe("Calculated total cost in USD"),
  days: z.array(
    z.object({
      dayNumber: z.number(),
      theme: z.string().describe("Main theme of the day, e.g., Niche Photography & Cafes"),
      activities: z.array(
        z.object({
          timeSlot: z.string().describe("e.g. 09:00 AM - 11:30 AM"),
          title: z.string().describe("Name of the spot or activity"),
          description: z.string().describe("Why this spot was chosen based on user preferences"),
          locationName: z.string(),
          locationLatitude: z.number().describe("Latitude of the location"),
          locationLongitude: z.number().describe("Longitude of the location"),
          category: z.enum(["food", "sightseeing", "accommodation", "activity"]),
          estimatedCost: z.number(),
          bookingRequired: z.boolean(),
          bookingLink: z.string().optional().describe("URL or search query for booking"),
        }),
      ),
    }),
  ),
  exceptionCases: z
    .object({
      ranOutOfBudget: z.boolean().describe("Indicates if the budget was exceeded"),
      unrealisticBudget: z.boolean().describe("Indicates if the budget was unrealistic for the trip"),
      activitySiteClosedOnTripDay: z
        .boolean()
        .describe(
          "Indicates if any activity site is closed on the trip day (the day when the user is supposed to visit the site)",
        ),
      partySizeMismatches: z
        .boolean()
        .describe("Indicates if the number of travelers does not match the activity requirements"),
      contradictoryPreferences: z.boolean(
        `Indicates if the user's preferences contradict each other, e.g., wanting to visit a quiet nature spot but also wanting to attend a loud music festival on the same day`,
      ),
    })
    .optional(),
});

// Infer TypeScript type for frontend use
export type Itinerary = z.infer<typeof itinerarySchema>;
