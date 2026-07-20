"use client";
import { Button } from "@/components/ui/button";
import { logOut } from "./actions/logout";
import { toast } from "sonner";

export default function DashboardPage() {
  return (
    <div>
      <h1>Hello World!</h1>
      <form action={logOut}>
        <Button variant={"destructive"} type="submit">
          Log Out
        </Button>
      </form>
    </div>
  );
}
