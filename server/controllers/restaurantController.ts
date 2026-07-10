import { Request, Response } from "express";
import { Restaurant } from "../models/Restaurant.js";
import { read } from "node:fs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

// Get all restaurant with search and filters
// GET /api/restaurants
export const getRestaurant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { search, priceRange, rating, location, sort } = req.query;
    // Build a querry object
    const querryObj: any = { status: "approved" };

    if (search) {
      querryObj.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (priceRange) {
      const price = Array.isArray(priceRange) ? priceRange : [priceRange];
      querryObj.priceRange = { $in: price };
    }
    if (rating) {
      querryObj.rating = { $gte: parseFloat(rating as string) };
    }
    if (location) {
      querryObj.location = { $regex: location as string, $options: "i" };
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "price_low") {
      sortOption = { priceRange: 1 };
    } else if (sort === "price_high") {
      sortOption = { priceRange: -1 };
    }
    const restaurant = await Restaurant.find(querryObj).sort(sortOption);
    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get featured and exclusive restaurant
// GET /api/restaurants/featured
export const getFeaturedRestaurant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const featured = await Restaurant.find({
      status: "approved",
      $or: [{ featured: true }, { exclusive: true }],
    });
  } catch (error: any) {
    console.error("Get Featured Restaurants Error", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single restaurant by slug
// GET /api/restaurants/:slug
export const getRestaurantBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    if (restaurant.status !== "approved") {
      let isAuthorized = false;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
          ) as { id: string };

          const user = await User.findById(decoded.id);
          if (
            user &&
            (user.role === "admin" ||
              (user.role === "owner" && restaurant.owner,
              toString() === user._id.toString()))
          ) {
            isAuthorized = true;
          }
        } catch (error) {
          // Ignore token verify error
        }
      }
      if (!isAuthorized) {
        res
          .status(404)
          .json({ message: "Restaurant not found or pending approval" });
        return;
      }
    }
    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get dynamic eats avaliability for slots
// GET /api/restaurants/:id/avaliability
export const getRestaurantAvaliability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.json({ message: "Please provide a date" });
      return;
    }
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    const bookingDate = new Date(date as string);

    // Get all bookings on this date for rhe restaurant
    const bookings = await Booking.find({
      restaurant: restaurant._id,
      date: bookingDate,
      status: "confirmed",
    });
    // Map slot to avaliable capacities
    const avaliability = restaurant.avaliableSlots.map((slot) => {
      const bookedSeats = bookings
        .filter((b) => b.time === slot)
        .reduce((sum, b) => sum + b.guests, 0);

      const totalSeats = restaurant.totalSeats || 20;
      const avaliableSeats = Math.max(0, totalSeats - bookedSeats);
      return {
        time: slot,
        avaliableSeats,
        isAvaliable: avaliableSeats > 0,
      };
    });
    res.json(avaliability);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
