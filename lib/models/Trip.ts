import mongoose, { Schema } from "mongoose";

const TripSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    tripLocation: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    noOfPeople: { type: Number, required: true },
    budget: { type: Number, required: true },
    tripPreferences: { type: Schema.Types.Mixed, required: true },
    foodPreferences: { type: Schema.Types.Mixed, required: true },
    preferStayingIn: { type: Schema.Types.Mixed, required: true },
    itinerary: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Trip = mongoose.models.Trip || mongoose.model("Trip", TripSchema);