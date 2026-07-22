"use client";

import Link from "next/link";
import { CompassIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logOut } from "@/app/dashboard/actions/logout";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <CompassIcon className="size-5" />
          <span className="font-heading text-lg font-semibold tracking-tight">
            Kova
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <form action={logOut}>
            <Button variant="destructive" type="submit" size="sm">
              Log out
            </Button>
          </form>
          <Avatar size="sm">
            <AvatarFallback>
              <UserIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
