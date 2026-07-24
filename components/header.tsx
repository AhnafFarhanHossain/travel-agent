"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CompassIcon,
  UserIcon,
  PlusIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  LogOutIcon,
  LogInIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CompassIcon className="size-4 shrink-0" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">
              Kova
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <MessageSquareIcon className="size-3.5" />
              AI Assistant
            </Link>
          </nav>
        </div>

        {/* Action Buttons & User Menu */}
        <div className="flex items-center gap-3">
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
              <Avatar size="sm" className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {userInitial ? userInitial : <UserIcon className="size-3.5" />}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              {session?.user ? (
                <>
                  <DropdownMenuLabel className="font-normal p-2">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {session.user.name || "Logged In User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {session.user.email}
                    </p>
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
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="font-normal p-2">
                    <p className="text-xs font-medium text-muted-foreground">Guest User</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem nativeButton={false} render={<Link href="/login" />}>
                    <LogInIcon className="size-3.5 mr-2 text-muted-foreground" />
                    Log in
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
