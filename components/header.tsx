"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserIcon, PlusIcon, LayoutDashboardIcon, MessageSquareIcon, LogOutIcon, LogInIcon, UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/app/dashboard/actions/logout";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email
      ? session.user.email.charAt(0).toUpperCase()
      : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Link href={session?.user ? "/dashboard" : "/"} className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <Image
              src="/kova-icon.png"
              alt="Kova Icon"
              width={28}
              height={28}
              className="size-7 rounded-lg object-contain shadow-2xs"
              priority
            />
            <Image
              src="/kova-logo-black.png"
              alt="Kova - Personal AI Travel Agent"
              width={90}
              height={24}
              className="h-5 w-auto object-contain dark:hidden"
              priority
            />
            <Image
              src="/kova-logo.png"
              alt="Kova - Personal AI Travel Agent"
              width={90}
              height={24}
              className="hidden h-5 w-auto object-contain dark:block"
              priority
            />
          </Link>

          {/* Navigation Links (Logged In) */}
          {session?.user && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  pathname === "/dashboard"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <LayoutDashboardIcon className="size-3.5" />
                Dashboard
              </Link>
              <Link
                href="/chat"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  pathname === "/chat"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <MessageSquareIcon className="size-3.5" />
                AI Assistant
              </Link>
            </nav>
          )}
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {session?.user ? (
            <>
              {pathname !== "/create-trip" && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
                  nativeButton={false}
                  render={<Link href="/create-trip" />}
                >
                  <PlusIcon className="size-3.5" />
                  Create Trip
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar size="sm" className="cursor-pointer hover:ring-2 hover:ring-border transition-all">
                    <AvatarFallback className="bg-muted text-foreground font-semibold text-xs border border-border/60">
                      {userInitial ? userInitial : <UserIcon className="size-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuLabel className="font-normal p-2">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {session.user.name || "Logged In User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{session.user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <form action={logOut} className="w-full">
                    <button type="submit" className="w-full text-left">
                      <DropdownMenuItem variant="destructive" className="cursor-pointer">
                        <LogOutIcon className="size-3.5 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-medium cursor-pointer"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Log in
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-semibold cursor-pointer shadow-2xs"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                <UserPlusIcon className="size-3.5 mr-1" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
