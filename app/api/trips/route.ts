import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/Trip";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    let query: any = {};
    if (session?.user?.id) {
      query.userId = session.user.id;
    }

    const trips = await Trip.find(query).sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ success: true, trips });
  } catch (error: any) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ message: "Failed to fetch trips" }, { status: 500 });
  }
}
