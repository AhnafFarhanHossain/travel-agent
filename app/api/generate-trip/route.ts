import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getHotelData } from "@/lib/google-hotels-api";
import { Trip } from "@/lib/models/Trip";
import { itinerarySchema } from "@/lib/schemas/itenerary";
import { google, GoogleProviderMetadata } from "@ai-sdk/google";
import { generateText, Output, tool } from "ai";
import z from "zod";

// search hotel tool
const hotelAvailabilityTool = tool({
  description:
    "Searches Google via Serper.dev for real-time room availability, rates, and booking links for a specified resort or hotel. Use this tool every time before creating a trip plan to ensure the information is accurate and up-to-date.",
  inputSchema: z.object({
    hotelName: z
      .string()
      .describe('Name of the hotel or resort (e.g. "Grand Hyatt Bali")'),
    checkInDate: z.string().describe("Arrival date in YYYY-MM-DD format"),
    checkOutDate: z.string().describe("Departure date in YYYY-MM-DD format"),
    guests: z.number().optional().default(2).describe("Number of adult guests"),
    budget: z
      .number()
      .optional()
      .default(0)
      .describe("Total budget for the trip"),
  }),
  execute: async (params) => {
    return await getHotelData({
      hotelName: params.hotelName,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      budget: params.budget || 0,
      guests: params.guests || 2,
    });
  },
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    const tripDetails = await req.json();
    if (!tripDetails || !tripDetails.location) {
      return Response.json(
        { message: "Bad Request: Location and trip details are required." },
        { status: 400 },
      );
    }

    const foodPref = Array.isArray(tripDetails.foodPreferences)
      ? tripDetails.foodPreferences.join(", ")
      : tripDetails.foodPreferences || "No specific preference";

    const tripPref = Array.isArray(tripDetails.tripPreferences)
      ? tripDetails.tripPreferences.join(", ")
      : tripDetails.tripPreferences || "General sightseeing";

    const stayPref = Array.isArray(tripDetails.preferStayingIn)
      ? tripDetails.preferStayingIn.join(", ")
      : tripDetails.preferStayingIn || "Hotel";

    let durationText = tripDetails.duration;
    if (!durationText && tripDetails.startDate && tripDetails.endDate) {
      const start = new Date(tripDetails.startDate);
      const end = new Date(tripDetails.endDate);
      const diffDays = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      );
      durationText = `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }

    const { output: itinerary, providerMetadata } = await generateText({
      model: google(process.env.LANGUAGE_MODEL as string),
      output: Output.object({
        schema: itinerarySchema,
      }),
      system: `You are an expert travel planner. Create a detailed daily trip plan structured strictly according to the provided JSON schema. NEVER deviate from the schema. Ensure that the trip plan is realistic, feasible, exciting, and tailored to the user's preferences. Make sensible assumptions for activity costs and timing. Provide realistic location names and helpful booking query hints. Daily budget should not exceed the total budget divided by the number of days. If the budget is too low for the trip, indicate this in the exceptionCases section. Ensure that all activities are suitable for the number of travelers and their preferences. Avoid suggesting activities that are closed on the specified dates. Make sure to check the URL's of the booking links and provide accurate information. If any preferences contradict each other, highlight this in the exceptionCases section. Use the appropriate tools like web search to verify the availability of activities and their costs. Make sure every information is up to date and accurate`,
      prompt: `
        Generate a trip plan based on these user constraints:
        - Location: ${tripDetails.location}
        - Duration: ${durationText || "3 days"}
        - Dates: ${tripDetails.startDate || "Upcoming"} to ${tripDetails.endDate || "Upcoming"}
        - Number of Travelers: ${tripDetails.noOfPeople || 1}
        - Total Budget: $${tripDetails.budget || 1000} USD
        - Dietary Preferences: ${foodPref}
        - Activity/Spot Preferences: ${tripPref}
        - Accommodation Preferences: ${stayPref}
      `,
      tools: {
        searchHotelData: hotelAvailabilityTool,
      },
      stopWhen: ({ steps }) => steps.length >= 3,
    });

    const newTrip = await Trip.create({
      userId: session?.user?.id || null,
      tripLocation: tripDetails.location,
      startDate: tripDetails.startDate
        ? new Date(tripDetails.startDate)
        : new Date(),
      endDate: tripDetails.endDate ? new Date(tripDetails.endDate) : new Date(),
      noOfPeople: tripDetails.noOfPeople || 1,
      budget: tripDetails.budget || 1000,
      tripPreferences: tripDetails.tripPreferences,
      foodPreferences: tripDetails.foodPreferences,
      preferStayingIn: tripDetails.preferStayingIn,
      itinerary: itinerary,
    });

    return Response.json({
      success: true,
      id: newTrip._id.toString(),
      itinerary,
      trip: newTrip,
    });
  } catch (error: any) {
    console.error("Error generating trip:", error);
    return Response.json(
      { message: error?.message || "Error generating trip." },
      { status: 500 },
    );
  }
}
