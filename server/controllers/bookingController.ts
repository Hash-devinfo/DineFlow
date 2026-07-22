import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";

// Create a new booking
// POST /api/booking
// @access private
export const createBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { restaurantId, date, time, guests, occasion, specialRequests } =
      req.body;
    if (!restaurantId || !date || !time || !guests) {
      res
        .status(400)
        .json({ message: "Please provide all required reservation details" });
      return;
    }
    // Check if restaurant exist
    const restraurant = await Restaurant.findById(restaurantId);
    if (!restraurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    // Verify restaurant is approved
    if (restraurant.status !== "approved") {
      res
        .status(400)
        .json({ message: "Reservation are not open for this restaurant yet" });
      return;
    }
    // verify seat avaliability
    const requestedGuests = Number(guests);

    const existingBooking = await Booking.find({
      restaurant: restaurantId,
      date: new Date(date),
      time,
      status: "confirmed",
    });
    const bookedSeats = existingBooking.reduce((sum, b) => sum + b.guests, 0);

    const totalSeats = restraurant.totalSeats || 20;
    const avaliableSeats = totalSeats - bookedSeats;
    if (requestedGuests > avaliableSeats) {
      res.status(400).json({
        message: `unable to reserve. Only ${avaliableSeats} seats are avaliable for this time slot.`,
      });
      return;
    }
    const booking = await Booking.create({
      user: req.user?._id,
      restaurant: restaurantId,
      date: new Date(date),
      time,
      guests: Number(guests),
      occasion,
      specialRequests,
      status: "confirmed",
    });
    // Populate restaurant info before returning
    const populatedBooking = await booking.populate(
      "restaurant",
      "name location image address",
    );
    res.status(201).json(populatedBooking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// get loggef in user booking
// GET /api/booking/my
// @access private
export const getMyBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate("restaurant", "name location image address slug")
      .sort({ date: -1, time: -1 });
    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Booking Cancilation
// PUT /api/booking/:id/cancel
// @access private
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (booking.user.toString() !== req.user?._id.toString()) {
      res
        .status(403)
        .json({ message: "You are not authorized to cancel this booking" });
      return;
    }
    booking.status = "cancelled";
    await booking.save();

    const populatedBooking = await booking.populate(
      "restaurant",
      "name location image address",
    );
    res.json(populatedBooking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};