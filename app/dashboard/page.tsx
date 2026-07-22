"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function DashboardPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center text-center">
          <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            You don&apos;t have any trips created yet.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your created trip plans will be listed below
          </p>

          <Button className="mt-8" size="lg" nativeButton={false} render={<Link href="/create-trip" />}>
            <PlusIcon className="size-4" />
            Create Trip Plan
          </Button>
        </div>
      </main>
    </div>
  );
}
