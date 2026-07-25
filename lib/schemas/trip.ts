import { z } from "zod";

export enum TripPreferences {
  niche = "Niche",
  adventure = "Adventure",
  cultural = "Cultural",
  luxury = "Luxury",
  wellness = "Wellness",
  familyFriendly = "Family-Friendly",
  romantic = "Romantic",
  offTheBeatenPath = "Off-the-Beaten-Path",
  ecoTourism = "Eco-Tourism",
  historical = "Historical",
  beachVacation = "Beach Vacation",
  wildlifeSafari = "Wildlife Safari",
  foodAndCulinary = "Food and Culinary",
  roadTrip = "Road Trip",
  skiOrSnowboardTrip = "Ski or Snowboard Trip",
}

export enum FoodPreferences {
  vegetarian = "Vegetarian",
  vegan = "Vegan",
  glutenFree = "Gluten-Free",
  dairyFree = "Dairy-Free",
  pescatarian = "Pescatarian",
  keto = "Keto",
  paleo = "Paleo",
  halal = "Halal",
  kosher = "Kosher",
  lowCarb = "Low-Carb",
  highProtein = "High-Protein",
  organic = "Organic",
}

export enum PreferStayingIn {
  hotel = "Hotel",
  airbnb = "Airbnb",
  hostel = "Hostel",
  resort = "Resort",
}

export const tripFormSchema = z
  .object({
    location: z.string().min(1, "Please select a destination location"),
    startDate: z.string().min(1, "Please select a check-in date"),
    endDate: z.string().min(1, "Please select a check-out date"),
    noOfPeople: z
      .number()
      .min(1, "At least 1 person is required")
      .max(99, "Maximum 99 people allowed"),
    budget: z
      .number()
      .min(100, "Minimum budget is $100")
      .max(50000, "Maximum budget is $50,000"),
    tripPreferences: z.nativeEnum(TripPreferences),
    foodPreferences: z.nativeEnum(FoodPreferences),
    preferStayingIn: z.nativeEnum(PreferStayingIn),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Check-out date must be on or after check-in date",
      path: ["endDate"],
    }
  );

export type TripFormData = z.infer<typeof tripFormSchema>;

export const defaultTripValues: TripFormData = {
  location: "",
  startDate: "",
  endDate: "",
  noOfPeople: 1,
  budget: 1000,
  tripPreferences: TripPreferences.niche,
  foodPreferences: FoodPreferences.vegetarian,
  preferStayingIn: PreferStayingIn.hotel,
};
