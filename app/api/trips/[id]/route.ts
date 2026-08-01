import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/Trip";
import { Itinerary } from "@/lib/schemas/itenerary";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { message: "Invalid trip ID format" },
        { status: 400 },
      );
    }

    const trip = await Trip.findById(id).lean();
    if (!trip) {
      return NextResponse.json({ message: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, trip });
  } catch (error: any) {
    console.error("Error fetching trip:", error);
    return NextResponse.json(
      { message: "Failed to fetch trip" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { message: "Invalid trip ID format" },
        { status: 400 },
      );
    }

    const session = await auth();
    const deleteQuery: any = { _id: id };
    if (session?.user?.id) {
      deleteQuery.userId = session.user.id;
    }

    const deletedTrip = await Trip.findOneAndDelete(deleteQuery);
    if (!deletedTrip) {
      return NextResponse.json(
        { message: "Trip not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { message: "Failed to delete trip" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { id } = await params;
    if (!id || id.length !== 24) {
      return new Response(JSON.stringify({ error: "Invalid trip ID format" }), {
        status: 400,
      });
    }

    const { itinerary }: { itinerary: Itinerary } = await req.json();
    if (!itinerary) {
      return new Response(JSON.stringify({ error: "Itinerary is required" }), {
        status: 400,
      });
    }

    const existingTrip = await Trip.findById(new mongoose.Types.ObjectId(id));
    if (!existingTrip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
      });
    }

    existingTrip.itinerary = itinerary;
    await existingTrip.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Itinerary updated successfully",
      }),
      { status: 200 },
    );
  } catch (error) {
    return Response.json({ error: "Failed to update trip" }, { status: 500 });
  }
}
