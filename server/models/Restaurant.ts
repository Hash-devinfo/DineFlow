import { Schema, model, Document, Types } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  cuisine: string;
  description: string;
  priceRange: "Rs" | "RsRs" | "RsRsRs" | "RsRsRsRs";
  rating: number;
  reviewCount: number;
  location: string;
  address: string;
  image: string;
  chef: string;
  tags: string[];
  avaliableSlots: string[];
  featured: boolean;
  exclesive: boolean;
  owner: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  totalSeats: number;
  createdAt: Date;
  updatedAt: Date;
}
const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, requireed: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, required: true },
    cuisine: { type: String, required: true },
    priceRange: {
      type: String,
      enum: ["Rs", "RsRs", "RsRsRs", "RsRsRsRs"],
      required: true,
    },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    location: { type: String, required: true, trim: true },
    address: { type: String, Required: true },
    image: { type: String, default: "" },
    chef: { type: String, required: true },
    tags: [{ type: String }],
    avaliableSlots: [{ type: String }],
    featured: { type: Boolean, default: false },
    exclesive: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    totalSeats: { type: Number, default: 20 },
  },
  { timestamps: true },
);

export const Restaurant = model<IRestaurant>("Restaurant", RestaurantSchema);
