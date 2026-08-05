"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { Itinerary } from "@/lib/schemas/itenerary";
import { Snapshot } from "@/app/trips/types";
import { Button } from "@/components/ui/button";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
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
  RefreshCwIcon,
  CheckIcon,
  Maximize2Icon,
  Minimize2Icon,
  AlertTriangleIcon,
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
  isApplying?: boolean;
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
  const msg = (err?.message || (typeof err === "string" ? err : "")).toLowerCase();
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
  isApplying = false,
  onClose,
  onProposeSnapshot,
  onSelectSnapshot,
  onApplySnapshot,
}: TripChatSidebarProps) {
  const [inputText, setInputText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
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

  const { messages, sendMessage, status, error, regenerate, clearError } = useChat({
    id: tripId,
    messages: intialMessages,
    transport,
    onFinish(event: any) {
      const message = event?.message || event;
      const parts = message?.parts || [];
      const toolInvocations = message?.toolInvocations || (message as any)?.toolCalls || [];

      for (const toolCall of toolInvocations) {
        const result = toolCall.result || toolCall.output || toolCall.args;
        if (result?.newItinerary) {
          onProposeSnapshot(result.newItinerary, result.summary || "AI Proposed Revision");
          toast.success("New itinerary revision proposed!", {
            description: "Preview or apply it directly on your trip timeline.",
          });
        }
      }

      for (const part of parts) {
        const result = part.result || part.output || part.args;
        if (result?.newItinerary) {
          onProposeSnapshot(result.newItinerary, result.summary || "AI Proposed Revision");
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
          description: "You've sent too many requests. Please wait a moment and try again.",
        });
      } else {
        toast.error("Failed to process request", {
          description: error?.message || "Please check your network connection.",
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
      className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-background/40 backdrop-blur-xl shadow-2xl transition-all duration-300 print:hidden ${
        isExpanded
          ? "h-[92vh] sm:h-[640px] sm:w-[540px] sm:bottom-6 sm:right-6 sm:left-auto sm:rounded-3xl sm:border sm:border-border/40"
          : "h-[82vh] max-h-[600px] sm:h-[520px] sm:w-[420px] sm:bottom-6 sm:right-6 sm:left-auto sm:rounded-3xl sm:border sm:border-border/40"
      }`}
      aria-label="AI Travel Assistant"
    >
      {/* Mobile Touch Bar Drag Handle */}
      <div className="w-10 h-1 bg-muted/60 rounded-full mx-auto my-2 sm:hidden" />

      {/* Ultra-Minimal Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-amber-500" />
          <span className="font-heading text-sm font-bold text-foreground">AI Concierge</span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">{destination}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full text-muted-foreground hover:text-foreground hidden sm:flex"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2Icon className="size-3.5" /> : <Maximize2Icon className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onClose}
            title="Close Assistant"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Snapshot Revisions Strip */}
      {snapshots.length > 0 && (
        <div className="px-4 py-1.5 bg-muted/10 border-b border-border/20">
          <Suggestions className="gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0 flex items-center gap-1 pr-1">
              <RefreshCwIcon className="size-3 text-muted-foreground" />
              Revisions:
            </span>
            {snapshots.map((snap, idx) => {
              const isActive = activeSnapshot?.id === snap.id;
              return (
                <Suggestion
                  key={snap.id}
                  suggestion={`#${snapshots.length - idx} ${snap.status === "draft" ? "(Draft)" : "(Saved)"}`}
                  onClick={() => onSelectSnapshot(snap)}
                  variant={isActive ? "default" : "outline"}
                  size="xs"
                  className={`text-[11px] h-6 px-2.5 font-medium border-none rounded-full ${
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                />
              );
            })}
          </Suggestions>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-3 px-2 py-8">
            <div className="size-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
              <BotIcon className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">How can I adjust your itinerary?</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Ask to rebalance budget, swap activities, or refine daily pacing.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m: UIMessage) => {
            const isUser = m.role === "user";
            const parts = (m as any).parts || [];
            const rawToolInvocations = (m as any).toolInvocations || [];

            let textContent = (m as any).content || "";
            if (!textContent && parts.length > 0) {
              textContent = parts
                .filter((p: any) => p.type === "text" && p.text)
                .map((p: any) => p.text)
                .join("\n");
            }

            const toolCallsFromParts = parts
              .filter(
                (p: any) =>
                  p.type === "tool-invocation" || (p.type && typeof p.type === "string" && p.type.startsWith("tool-")),
              )
              .map((p: any) => p.toolInvocation || p);

            const combinedToolCalls = [...rawToolInvocations, ...toolCallsFromParts];
            const seenToolIds = new Set<string>();
            const toolCalls: any[] = [];
            for (const tc of combinedToolCalls) {
              const inv = tc.toolInvocation || tc;
              const id = inv.toolCallId || inv.id || (inv.args ? JSON.stringify(inv.args) : null);
              if (id && !seenToolIds.has(id)) {
                seenToolIds.add(id);
                toolCalls.push(tc);
              } else if (!id) {
                toolCalls.push(tc);
              }
            }

            return (
              <Message key={m.id} from={m.role}>
                <div className={`flex gap-3 text-sm ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`size-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                      isUser ? "bg-foreground text-background" : "bg-muted text-foreground"
                    }`}
                  >
                    {isUser ? <UserIcon className="size-3.5" /> : <BotIcon className="size-3.5" />}
                  </div>

                  <div className="space-y-2 max-w-[85%]">
                    {/* Ultra-Minimal Text Bubble */}
                    {textContent && (
                      <MessageContent
                        className={`px-4 py-2.5 text-sm leading-relaxed border-none ${
                          isUser
                            ? "bg-foreground text-background rounded-2xl font-medium"
                            : "text-foreground rounded-2xl bg-muted/20"
                        }`}
                      >
                        {textContent}
                      </MessageContent>
                    )}

                    {/* Minimal Tool Call Card */}
                    {toolCalls.map((toolCall: any, tIdx: number) => {
                      const inv = toolCall.toolInvocation || toolCall;
                      const result = inv.result || inv.output || inv.args;
                      const newItinerary: Itinerary | undefined = result?.newItinerary || inv.args?.newItinerary;
                      const summaryText =
                        result?.summary || inv.args?.summary || inv.summary || "Itinerary revision generated";

                      if (!newItinerary) {
                        return (
                          <div key={`tool-${tIdx}`} className="rounded-2xl bg-muted/20 p-3.5 space-y-1 text-left">
                            <span className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                              <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                              {summaryText}
                            </span>
                          </div>
                        );
                      }

                      const existingSnap = snapshots.find(
                        (s) => s.itinerary && JSON.stringify(s.itinerary) === JSON.stringify(newItinerary),
                      );

                      const isApplied =
                        (existingSnap && existingSnap.status === "applied") ||
                        (activeSnapshot?.status === "applied" &&
                          JSON.stringify(activeSnapshot?.itinerary) === JSON.stringify(newItinerary));

                      const isPreviewing =
                        activeSnapshot &&
                        JSON.stringify(activeSnapshot.itinerary) === JSON.stringify(newItinerary);

                      return (
                        <div key={`tool-${tIdx}`} className="rounded-2xl bg-muted/20 p-3.5 space-y-2 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                              <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                              Revision Proposed
                            </span>
                            {isApplied && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Applied
                              </span>
                            )}
                          </div>

                          {summaryText && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{summaryText}</p>
                          )}

                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            <span className="text-muted-foreground text-[11px]">New Est. Total:</span>
                            <span className="font-bold text-foreground">
                              ${newItinerary.estimatedTotalCost?.toLocaleString()} USD
                            </span>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button
                              size="xs"
                              variant={isPreviewing ? "default" : "outline"}
                              disabled={isApplying}
                              className={`flex-1 text-xs h-7 rounded-full ${
                                isPreviewing ? "" : "border-none bg-background text-foreground"
                              }`}
                              onClick={() => {
                                if (existingSnap) {
                                  onSelectSnapshot(existingSnap);
                                } else {
                                  onProposeSnapshot(newItinerary, summaryText);
                                }
                              }}
                            >
                              <EyeIcon className="size-3.5 mr-1" />
                              {isPreviewing ? "Previewing" : "Preview"}
                            </Button>
                            <Button
                              size="xs"
                              className="flex-1 text-xs h-7 rounded-full"
                              disabled={isApplying || isApplied}
                              variant={isApplied ? "secondary" : "default"}
                              onClick={() => {
                                const snapToApply: Snapshot = existingSnap || {
                                  id: `snap-ai-${Date.now()}`,
                                  description: summaryText,
                                  timestamp: new Date().toISOString(),
                                  itinerary: newItinerary,
                                  status: "draft",
                                };
                                onApplySnapshot(snapToApply);
                              }}
                            >
                              <CheckIcon className="size-3.5 mr-1" />
                              {isApplied ? "Applied" : "Apply"}
                            </Button>
                          </div>
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg w-fit">
            <Loader2Icon className="size-3.5 animate-spin text-primary" />
            <span>AI Concierge is thinking...</span>
          </div>
        )}

        {(rateLimitError || isRateLimitError(error)) && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
              <span className="flex items-center gap-1.5">
                <AlertTriangleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                AI Rate Limit Reached (429)
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {rateLimitError ||
                error?.message ||
                "You have hit the AI request rate limit. Please wait a moment before sending another message."}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {regenerate && (
                <Button
                  size="xs"
                  variant="outline"
                  className="text-xs h-7 border-amber-500/30 bg-background text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 rounded-full"
                  onClick={() => {
                    setRateLimitError(null);
                    if (clearError) clearError();
                    regenerate();
                  }}
                >
                  <RefreshCwIcon className="size-3 mr-1" />
                  Retry Request
                </Button>
              )}
              <Button
                size="xs"
                variant="ghost"
                className="text-xs h-7 text-muted-foreground hover:text-foreground rounded-full"
                onClick={() => setRateLimitError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 border-t border-border/20 bg-muted/10">
        <Suggestions className="gap-1.5">
          {QUICK_PROMPTS.map((promptText, idx) => (
            <Suggestion
              key={`qp-${idx}`}
              suggestion={promptText}
              onClick={() => handleSend(promptText)}
              variant="outline"
              size="xs"
              className="text-xs h-6.5 border-none bg-background text-muted-foreground hover:text-foreground shrink-0 rounded-full shadow-2xs"
            />
          ))}
        </Suggestions>
      </div>

      {/* Bubble Prompt Input Footer — No Borders */}
      <div className="p-3 bg-background">
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
            placeholder="Ask AI to customize your trip..."
            className="w-full rounded-full border-none bg-muted/40 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputText.trim()}
            className="absolute right-1.5 size-7 rounded-full bg-foreground text-background hover:opacity-90 disabled:opacity-30 transition-opacity"
          >
            <SendIcon className="size-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
