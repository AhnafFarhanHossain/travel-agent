import { auth } from "@/auth";
import { google } from "@ai-sdk/google";
import { UIMessage, streamText, convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream } from "ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ message: "Unauthorized. Please log in to access chat." }, { status: 401 });
  }
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response("Bad Request: 'messages' field is required", {
        status: 400,
      });
    }

    // Send the message to the AI SDK
    const result = streamText({
      model: google.languageModel("gemini-3.5-flash"),
      messages: await convertToModelMessages(messages),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
