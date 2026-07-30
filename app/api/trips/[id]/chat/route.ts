import { auth } from "@/auth";
import { getTripFromId } from "@/lib/data/get-trip-from-id";
import { Itinerary, itinerarySchema } from "@/lib/schemas/itenerary";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  tool,
  toUIMessageStream,
  UIMessage,
} from "ai";

export function buildSystemPrompt(trip: {
  tripLocation: string;
  startDate: string;
  endDate: string;
  noOfPeople: number;
  budget: number;
  tripPreferences?: string | string[];
  foodPreferences?: string | string[];
  preferStayingIn?: string | string[];
  itinerary: Itinerary;
}) {
  const preferencesSummary = [
    trip.tripPreferences &&
      `Trip Style: ${Array.isArray(trip.tripPreferences) ? trip.tripPreferences.join(", ") : trip.tripPreferences}`,
    trip.foodPreferences &&
      `Food Preferences: ${Array.isArray(trip.foodPreferences) ? trip.foodPreferences.join(", ") : trip.foodPreferences}`,
    trip.preferStayingIn &&
      `Accommodation Style: ${Array.isArray(trip.preferStayingIn) ? trip.preferStayingIn.join(", ") : trip.preferStayingIn}`,
  ]
    .filter(Boolean)
    .join(" | ");
  return `You are an expert AI Travel Concierge assisting a user in customizing their travel itinerary.

          ### 📍 TRIP OVERVIEW & CONSTRAINTS
          - **Destination:** ${trip.tripLocation}
          - **Travel Dates:** ${trip.startDate} to ${trip.endDate}
          - **Party Size:** ${trip.noOfPeople} person(s)s
          - **Target Budget:** $${trip.budget} USD
          - **Preferences:** ${preferencesSummary || "None specified"}

          ---

          ### 🗺️ CURRENT ITINERARY STATE
          The user is currently viewing the following itinerary JSON:
          \`\`\`json
          ${JSON.stringify(trip.itinerary, null, 2)}
          \`\`\`

          ---

          ### 🎯 YOUR RESPONSIBILITIES & OPERATIONAL RULES

          1. **Assisting with Modifications:**
             - Whenever the user asks to modify, swap, add, remove, or rebalance activities or days (e.g. *"Make Day 2 cheaper"*, *"Swap dinner on Day 1 for seafood"*, *"Add a museum in the afternoon"*), **YOU MUST USE ONE OF YOUR AVAILABLE TOOLS** (\`proposeItineraryRevision\` or \`updateSpecificActivity\`).
             - Do NOT just write out proposed itinerary changes in plain markdown text. Always call a tool so the UI can generate a live interactive preview snapshot!

          2. **Data & Coordinate Integrity:**
             - Every activity MUST include realistic geographic coordinates (\`locationLatitude\` and \`locationLongitude\`) near ${trip.tripLocation} so the Leaflet map can render pins correctly.
             - Categories MUST be one of: \`"food"\`, \`"sightseeing"\`, \`"accommodation"\`, or \`"activity"\`.
             - Ensure \`timeSlot\` follows consistent formatting (e.g., \`"09:00 AM - 11:30 AM"\`).

          3. **Budget & Cost Calculations:**
             - Whenever you revise the itinerary, recalculate \`estimatedTotalCost\` by summing up all activity costs.
             - If the new total exceeds the target budget of $${trip.budget} USD, set \`exceptionCases.ranOutOfBudget: true\`.

          4. **Tone & Response Style:**
             - Be enthusiastic, helpful, and concise.
             - Accompany your tool call with a brief response explaining *what* was changed and *why* it fits their travel preferences.
          `;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { messages, currentItinerary, id }: { messages: UIMessage[]; currentItinerary: Itinerary; id: string } =
      await req.json();
    if (!messages || messages.length === 0 || !currentItinerary || !id) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), { status: 400 });
    }

    const trip = await getTripFromId(id);
    if (!trip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), { status: 404 });
    }

    const system = buildSystemPrompt({
      ...trip,
      itinerary: currentItinerary,
    });

    const result = streamText({
      model: google(process.env.LANGUAGE_MODEL || "gemini-2.5-flash"),
      messages: await convertToModelMessages(messages),
      system,
      tools: {
        proposeItineraryRevision: tool({
          description:
            "Proposes an updated multi-day itinerary when the user requests overall changes (e.g., 'Make day 2 more budget friendly', 'Add a beach afternoon').",
          inputSchema: itinerarySchema,
          execute: async (newItinerary: Itinerary) => {
            console.log("[AI Tool] proposeItineraryRevision executed:", newItinerary?.summary);
            return {
              summary: newItinerary.summary || "Updated itinerary revision",
              newItinerary,
            };
          },
        }),
        updateSpecificActivity: tool({
          description:
            "Updates a specific activity in the itinerary when the user requests a change to a single activity.",
          inputSchema: itinerarySchema,
          execute: async (newItinerary: Itinerary) => {
            console.log("[AI Tool] updateSpecificActivity executed:", newItinerary?.summary);
            return {
              summary: newItinerary.summary || "Updated itinerary activity",
              newItinerary,
            };
          },
        }),
      },
    });

    const response = createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream })
    });

    return response;
  } catch (error: any) {
    const isRateLimit =
      error?.status === 429 ||
      error?.statusCode === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.message?.toLowerCase().includes("rate limit") ||
      error?.message?.toLowerCase().includes("quota");

    if (isRateLimit) {
      return new Response(
        JSON.stringify({
          error:
            "AI rate limit reached (429). You have made too many requests. Please wait a moment and try again.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error in POST /api/chat:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
