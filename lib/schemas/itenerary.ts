import { z } from 'zod';

export const itinerarySchema = z.object({
  tripTitle: z.string().describe('Catchy title for the itinerary'),
  summary: z.string().describe('A brief overview of the trip style'),
  estimatedTotalCost: z.number().describe('Calculated total cost in USD'),
  days: z.array(
    z.object({
      dayNumber: z.number(),
      theme: z.string().describe('Main theme of the day, e.g., Niche Photography & Cafes'),
      activities: z.array(
        z.object({
          timeSlot: z.string().describe('e.g. 09:00 AM - 11:30 AM'),
          title: z.string().describe('Name of the spot or activity'),
          description: z.string().describe('Why this spot was chosen based on user preferences'),
          locationName: z.string(),
          locationLatitude: z.number().describe('Latitude of the location'),
          locationLongitude: z.number().describe('Longitude of the location'),
          category: z.enum(['food', 'sightseeing', 'accommodation', 'activity']),
          estimatedCost: z.number(),
          bookingRequired: z.boolean(),
          bookingLink: z.string().optional().describe('URL or search query for booking'),
        })
      ),
    })
  ),
});

// Infer TypeScript type for frontend use
export type Itinerary = z.infer<typeof itinerarySchema>;