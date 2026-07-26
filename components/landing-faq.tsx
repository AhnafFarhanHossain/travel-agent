"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircleIcon } from "lucide-react";

const FAQS = [
  {
    question: "Is Kova free to use?",
    answer:
      "Yes! You can create and save personalized AI travel itineraries for free. Simply sign up for an account to start planning your next getaway.",
  },
  {
    question: "How does Kova customize my day-by-day itinerary?",
    answer:
      "Kova analyzes your destination, trip dates, group size, and budget tier. It calculates geographic distance between attractions, ideal time slots, local advisories, and dining recommendations to deliver a logical, stress-free schedule.",
  },
  {
    question: "Can I customize or tweak the generated itinerary?",
    answer:
      "Absolutely. You can use Kova's built-in AI Assistant to swap activities, adjust pace, add coffee stops, or change dining options via simple conversational prompts.",
  },
  {
    question: "What are AI Travel Advisories?",
    answer:
      "Kova automatically flags seasonal crowd spikes, daylight hours, required ticket reservations, and local events so you avoid unexpected travel delays.",
  },
  {
    question: "Can I save and access my trips on mobile?",
    answer:
      "Yes. All your saved itineraries live in your personal Dashboard and are fully optimized for smartphones, tablets, and desktop devices.",
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 border-b border-border/40 bg-muted/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <HelpCircleIcon className="size-3.5 text-primary" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to know about planning trips with Kova.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs">
          <Accordion className="w-full space-y-2">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/60">
                <AccordionTrigger className="text-sm font-semibold text-foreground text-left py-4 hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
