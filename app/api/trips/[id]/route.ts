import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/Trip";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { message: "Invalid trip ID format" },
        { status: 400 }
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
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { message: "Invalid trip ID format" },
        { status: 400 }
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
        { status: 404 }
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
      { status: 500 }
    );
  }
}

