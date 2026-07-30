import { auth } from "@/auth";
import { connectDB } from "../db";
import { Trip } from "../models/Trip";
import mongoose from "mongoose";

export async function getTripFromId(id: string) {
  const session = await auth();
  try {
    await connectDB();
    if (!session) {
      console.error("Unauthorized");
    }

    const query: { _id: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId } = {
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session?.user?.id),
    };

    const response = await Trip.findOne(query).lean();
    if (!response) {
      throw new Error(`Trip with id ${id} not found`);
    }

    return response;
  } catch (error) {
    console.error(`Error fetching trip with id ${id}:`, error);
    throw new Error(`Failed to fetch trip with id ${id}: ${error}`);
  }
}
