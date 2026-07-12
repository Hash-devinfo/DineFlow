import { Router } from "express";
import { getRestaurant } from "../controllers/restaurantController.js";
import { createOwnerRestaurant, getOwnerBookings, updateBookingStatus, updateOwnerRestaurant } from "../controllers/ownerController.js";
import upload from "../config/multer.js";
import { ownerOnly, protect } from "../middlewares/auth.js";


const ownerRouter = Router()

ownerRouter.use(protect)
ownerRouter.use(ownerOnly)

ownerRouter.get("/restaurant", getRestaurant)
ownerRouter.post("/restaurant",upload.single('image'), createOwnerRestaurant)
ownerRouter.put("/restaurant",upload.single('image'), updateOwnerRestaurant)
ownerRouter.get("/booking", getOwnerBookings)
ownerRouter.put("/bookings/:id/status", updateBookingStatus)


export default ownerRouter;
