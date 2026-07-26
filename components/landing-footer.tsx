"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16 text-muted-foreground text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="space-y-3 max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <Image
                src="/kova-icon.png"
                alt="Kova Icon"
                width={28}
                height={28}
                className="size-7 rounded-lg object-contain shadow-2xs"
              />
              <Image
                src="/kova-logo-black.png"
                alt="Kova - Personal AI Travel Agent"
                width={80}
                height={22}
                className="h-4.5 w-auto object-contain dark:hidden"
              />
              <Image
                src="/kova-logo.png"
                alt="Kova - Personal AI Travel Agent"
                width={80}
                height={22}
                className="hidden h-4.5 w-auto object-contain dark:block"
              />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kova is an intelligent travel planning assistant that creates personalized, day-by-day itineraries tailored to your dates, group, and budget preferences.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap gap-8 text-xs font-medium text-foreground">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#itineraries" className="hover:text-foreground transition-colors">
                    Sample Itineraries
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Get Started</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/create-trip" className="hover:text-foreground transition-colors">
                    Create Trip Plan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground">
          <p>© {new Date().getFullYear()} Kova AI Travel Agent. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
