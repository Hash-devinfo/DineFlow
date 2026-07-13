import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

// get all restaurants for admin management
// GET /api/admin/restaturants
export const getAllRestaurants = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurant = await Restaurant.find({})
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });
    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Aprove/reject a restaurants profile
// PUT /api/admin/restaturants/:id/approve
export const approveRestaurants = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      res
        .status(400)
        .json({ message: "Please provide a valid approval status" });
      return;
    }
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(400).json({ message: "Restaurant profile not found" });
      return;
    }
    restaurant.status = status;
    await restaurant.save();

    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// get system stats
// GET /api/admin/stats
export const getAdminStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalBookings = await Booking.countDocuments({});
    const totalRestaurants = await Restaurant.countDocuments({});
    const latestBookings = await Booking.find({})
      .populate("user", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({
      users: {
        totalUsers,
        totalOwners,
        total: totalUsers + totalOwners,
      },
      restaurants: {
        total: totalRestaurants,
      },
      bookings: {
        total: totalBookings,
      },
      latestBookings,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
