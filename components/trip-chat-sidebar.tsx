"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { Itinerary } from "@/lib/schemas/itenerary";
import { Snapshot } from "@/app/trips/types";
import { Button } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  SparklesIcon,
  XIcon,
  SendIcon,
  BotIcon,
  UserIcon,
  Loader2Icon,
  CheckCircle2Icon,
  EyeIcon,
  CheckIcon,
} from "lucide-react";
import { toast } from "sonner";

interface TripChatSidebarProps {
  tripId: string;
  destination: string;
  targetBudget: number;
  currentItinerary: Itinerary;
  activeSnapshot: Snapshot | null;
  snapshots: Snapshot[];
  isOpen: boolean;
  onClose: () => void;
  onProposeSnapshot: (newItinerary: Itinerary, summary: string) => void;
  onSelectSnapshot: (snapshot: Snapshot) => void;
  onApplySnapshot: (snapshot: Snapshot) => void;
}

const QUICK_PROMPTS = [
  "✨ Make Day 2 budget-friendly",
  "🍽️ Swap dinner for local street food",
  "🏛️ Add a cultural museum spot",
  "🏖️ Add a relaxed beach afternoon",
];

const isRateLimitError = (err: any) => {
  if (!err) return false;
  const status = err?.status || err?.statusCode || err?.cause?.status;
  if (status === 429) return true;
  const msg = (
    err?.message || (typeof err === "string" ? err : "")
  ).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted")
  );
};

export function TripChatSidebar({
  tripId,
  destination,
  targetBudget,
  currentItinerary,
  activeSnapshot,
  snapshots,
  isOpen,
  onClose,
  onProposeSnapshot,
  onSelectSnapshot,
  onApplySnapshot,
}: TripChatSidebarProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storageKey = `trip_chat_${tripId}`;
  const [intialMessages, setInitialMessages] = useState<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/trips/${tripId}/chat`,
        body: {
          id: tripId,
          currentItinerary,
        },
      }),
    [tripId, currentItinerary],
  );

  const { messages, sendMessage, status, error, regenerate, clearError } =
    useChat({
      id: tripId,
      messages: intialMessages,
      transport,
      onFinish(event: any) {
        const message = event?.message || event;
        const parts = message?.parts || [];
        const toolInvocations =
          message?.toolInvocations || (message as any)?.toolCalls || [];

        for (const toolCall of toolInvocations) {
          const result = toolCall.result || toolCall.output || toolCall.args;
          if (result?.newItinerary) {
            onProposeSnapshot(
              result.newItinerary,
              result.summary || "AI Proposed Revision",
            );
            toast.success("New itinerary revision proposed!", {
              description:
                "Preview or apply it directly on your trip timeline.",
            });
          }
        }

        for (const part of parts) {
          const result = part.result || part.output || part.args;
          if (result?.newItinerary) {
            onProposeSnapshot(
              result.newItinerary,
              result.summary || "AI Proposed Revision",
            );
          }
        }
      },
      onError(error: any) {
        console.error("Chat error:", error);
        if (isRateLimitError(error)) {
          const msg =
            error?.message ||
            "AI rate limit reached (429). Please wait a moment before trying again.";
          setRateLimitError(msg);
          toast.error("AI Rate Limit Reached (429)", {
            description:
              "You've sent too many requests. Please wait a moment and try again.",
          });
        } else {
          toast.error("Failed to process request", {
            description:
              error?.message || "Please check your network connection.",
          });
        }
      },
    });

  // set the previous messages with AI to messages for persistent data
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  const isLoading = status === "streaming" || status === "submitted";

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setRateLimitError(null);
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: text.trim() }],
    });
    setInputText("");
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex h-[82vh] max-h-[600px] flex-col bg-background/90 backdrop-blur-xl shadow-2xl border border-border/40 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px] sm:rounded-3xl"
      aria-label="AI Travel Assistant"
    >
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-7 items-center justify-center rounded-full bg-muted/60">
            <SparklesIcon className="size-3.5 text-amber-500" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground leading-none">
              AI Concierge
            </div>
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {destination}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
          title="Close"
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      {snapshots.length > 0 && (
        <div className="border-b border-border/20 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {snapshots.map((snap, idx) => {
              const isActive = activeSnapshot?.id === snap.id;
              return (
                <button
                  key={snap.id}
                  type="button"
                  onClick={() => onSelectSnapshot(snap)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {snap.status === "draft" ? "Draft" : "Saved"}{" "}
                  {snapshots.length - idx}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted/50">
              <BotIcon className="size-5 text-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Ask for a revision
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Adjust budget, pace, or activities.
            </p>
          </div>
        ) : (
          messages.map((m: UIMessage) => {
            const isUser = m.role === "user";
            const parts = (m as any).parts || [];
            const toolInvocations = (m as any).toolInvocations || [];

            let textContent = (m as any).content || "";
            if (!textContent && parts.length > 0) {
              textContent = parts
                .filter((p: any) => p.type === "text" && p.text)
                .map((p: any) => p.text)
                .join("\n");
            }

            const toolCalls = [
              ...toolInvocations,
              ...parts.filter(
                (p: any) =>
                  p.toolName === "proposeItineraryRevision" ||
                  p.toolName === "updateSpecificActivity" ||
                  (p.type && p.type.includes("tool")),
              ),
            ];

            return (
              <Message key={m.id} from={m.role}>
                <div
                  className={`flex gap-3 text-sm ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs ${
                      isUser
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {isUser ? (
                      <UserIcon className="size-3.5" />
                    ) : (
                      <BotIcon className="size-3.5" />
                    )}
                  </div>

                  <div className="max-w-[85%] space-y-2">
                    {textContent && (
                      <MessageContent
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed border ${
                          isUser
                            ? "border-transparent bg-foreground text-background"
                            : "border-border/40 bg-muted/20 text-foreground"
                        }`}
                      >
                        {textContent}
                      </MessageContent>
                    )}

                    {toolCalls.map((toolCall: any, tIdx: number) => {
                      const result =
                        toolCall.result || toolCall.output || toolCall.args;
                      const newItinerary: Itinerary | undefined =
                        result?.newItinerary;
                      const summaryText = result?.summary || "Revision ready";

                      return (
                        <div
                          key={`tool-${tIdx}`}
                          className="rounded-2xl border border-border/40 bg-muted/15 p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                            <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                            Revision
                          </div>

                          {summaryText && (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {summaryText}
                            </p>
                          )}

                          {newItinerary && (
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Estimated total</span>
                              <span className="font-medium text-foreground">
                                $
                                {newItinerary.estimatedTotalCost?.toLocaleString()}{" "}
                                USD
                              </span>
                            </div>
                          )}

                          {newItinerary &&
                            activeSnapshot?.status === "draft" && (
                              <div className="flex gap-2 pt-1">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="h-7 flex-1 rounded-full border-border/60 bg-background text-xs"
                                  onClick={() =>
                                    onProposeSnapshot(newItinerary, summaryText)
                                  }
                                >
                                  <EyeIcon className="mr-1 size-3.5" />
                                  Preview
                                </Button>
                                <Button
                                  size="xs"
                                  className="h-7 flex-1 rounded-full text-xs"
                                  onClick={() => {
                                    onProposeSnapshot(
                                      newItinerary,
                                      summaryText,
                                    );
                                  }}
                                >
                                  <CheckIcon className="mr-1 size-3.5" />
                                  Apply
                                </Button>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Message>
            );
          })
        )}

        {isLoading && (
          <div className="flex w-fit items-center gap-2 rounded-full border border-border/40 bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
            <Loader2Icon className="size-3.5 animate-spin text-foreground" />
            Thinking
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/30 bg-background p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask for a revision..."
            className="w-full rounded-full border border-border/40 bg-muted/30 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-foreground/15"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputText.trim()}
            className="absolute right-1.5 size-7 rounded-full bg-foreground text-background hover:opacity-90 disabled:opacity-30"
          >
            <SendIcon className="size-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
