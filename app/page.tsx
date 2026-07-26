import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingFeatures } from "@/components/landing-features";
import { LandingHowItWorks } from "@/components/landing-how-it-works";
import { LandingSampleItineraries } from "@/components/landing-sample-itineraries";
import { LandingFAQ } from "@/components/landing-faq";
import { LandingFooter } from "@/components/landing-footer";
import { LandingFloatingDock } from "@/components/landing-floating-dock";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

export default async function Home() {
  const session = await auth();

  // Redirect signed-in users straight to the dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground selection:bg-primary/20">
      <LandingNavbar />

      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingSampleItineraries />
        <LandingFAQ />

        {/* High-Impact Closing CTA Banner */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background via-primary/5 to-background border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-2xs">
              <SparklesIcon className="size-3.5 text-primary" />
              <span>Start Planning Today</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Ready to experience travel planning made effortless?
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Join thousands of spontaneous explorers and detailed planners who use Kova to turn travel research chaos into clear master itineraries.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-7 text-sm font-semibold cursor-pointer shadow-xs gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Create Free Account
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-7 text-sm font-medium cursor-pointer"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Log In to Existing Account
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
      <LandingFloatingDock />
    </div>
  );
}
