"use client";
import { useChat } from "@ai-sdk/react";
import { useState, type FormEvent } from "react";

import { MessageSquareIcon } from "lucide-react";

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

const ChatPage = () => {
  const { sendMessage, status, error, messages } = useChat();
  const [input, setInput] = useState("");

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
      <Conversation className="mx-auto w-full max-w-3xl px-4 pt-6">
        <ConversationContent className="min-h-0 px-0 pb-28 pt-0">
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="Messages will appear here as the conversation progresses."
              icon={<MessageSquareIcon className="size-6" />}
              title="Start a conversation"
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
        className="sticky bottom-0 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <Input
            aria-label="Message"
            className="h-11 flex-1"
            disabled={status !== "ready"}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Say something..."
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
