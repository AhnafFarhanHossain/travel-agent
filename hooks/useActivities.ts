import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Trip } from "@/lib/models/Trip";
import mongoose from "mongoose";

export async function useActivities({ tripId }: { tripId: string }) {
  await connectDB();
  // fetch activities from user trips
  const session = await auth();
  if (!session || session.user === undefined) {
    console.error("Unauthorized User.");
    return [];
  }

  const result = await Trip.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(tripId),
        userId: session.user.id,
      },
    },
    { $unwind: "$days" },
    { $unwind: "$days.activities" },
    {
      $group: {
        _id: null,
        activities: { $push: "$days.activities" },
      },
    },
    { $project: { _id: 0, activities: 1 } },
  ]);

  const activities = result[0]?.activities || [];

  return activities;
}
