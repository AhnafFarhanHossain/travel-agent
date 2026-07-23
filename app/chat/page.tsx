"use client";
import { useChat } from "@ai-sdk/react";
import { useState, useContext, type FormEvent } from "react";
import Link from "next/link";
import {
  MessageSquareIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  WalletIcon,
  CompassIcon,
  UtensilsIcon,
  Building2Icon,
  ArrowLeftIcon,
  SparklesIcon,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TripContext } from "@/context/trip-details";

function formatDate(iso: string) {
  if (!iso) return "Not set";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const ChatPage = () => {
  const { sendMessage, status, error, messages } = useChat();
  const [input, setInput] = useState("");
  const { tripData } = useContext(TripContext);

  const hasTripData = Boolean(tripData.location);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top Header & Temporary Trip Data Display */}
      <header className="border-b border-border bg-card/60 px-4 py-3 backdrop-blur shrink-0">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Link
            href="/create-trip"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-3.5" />
            Edit Trip Details
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <SparklesIcon className="size-3.5" />
            <span>Trip Data Loaded</span>
          </div>
        </div>

        {hasTripData ? (
          <div className="mx-auto mt-3 w-full max-w-3xl rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4 text-xs">
            <div className="flex items-center justify-between border-b border-primary/10 pb-2 mb-2.5">
              <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <MapPinIcon className="size-4 text-primary" />
                {tripData.location}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border">
                {formatDate(tripData.startDate)} – {formatDate(tripData.endDate)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <UsersIcon className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{tripData.noOfPeople} {tripData.noOfPeople === 1 ? "person" : "people"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <WalletIcon className="size-3.5 text-primary shrink-0" />
                <span className="truncate">${tripData.budget.toLocaleString()} USD</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CompassIcon className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{tripData.tripPreferences}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2Icon className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{tripData.preferStayingIn}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <UtensilsIcon className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{tripData.foodPreferences}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-2 w-full max-w-3xl text-center text-xs text-muted-foreground">
            No active trip created. <Link href="/create-trip" className="text-primary underline">Create a trip</Link> first to generate custom itineraries.
          </div>
        )}
      </header>

      <Conversation className="mx-auto w-full max-w-3xl px-4 pt-4 flex-1 min-h-0">
        <ConversationContent className="min-h-0 px-0 pb-28 pt-0">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description={
                hasTripData
                  ? `Ready to generate your trip to ${tripData.location}! Ask any questions or specify customized preferences below.`
                  : "Messages will appear here as the conversation progresses."
              }
              icon={<MessageSquareIcon className="size-6" />}
              title={hasTripData ? `Planning trip for ${tripData.location}` : "Start a conversation"}
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.role === "assistant" ? (
                    <MessageResponse>
                      {message.parts
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join("\n")}
                    </MessageResponse>
                  ) : (
                    message.parts
                      .filter((part) => part.type === "text")
                      .map((part, index) => (
                        <div key={`${message.id}-${index}`}>{part.text}</div>
                      ))
                  )}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form
        className="sticky bottom-0 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur shrink-0"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <Input
            aria-label="Message"
            className="h-11 flex-1"
            disabled={status !== "ready"}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder={
              hasTripData
                ? `Ask anything about your trip to ${tripData.location}...`
                : "Say something..."
            }
            value={input}
          />
          <Button disabled={status !== "ready" || !input.trim()} type="submit">
            Send
          </Button>
        </div>
        {error ? (
          <p className="mx-auto mt-2 w-full max-w-3xl text-sm text-destructive">
            {error.message}
          </p>
        ) : null}
      </form>
    </div>
  );
};

export default ChatPage;

