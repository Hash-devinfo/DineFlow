import { Router } from "express";
import {
  getFeaturedRestaurant,
  getRestaurant,
  getRestaurantAvaliability,
  getRestaurantBySlug,
} from "../controllers/restaurantController.js";

const restaurantRouter = Router();

restaurantRouter.get("/", getRestaurant);
restaurantRouter.get("/featured", getFeaturedRestaurant);
restaurantRouter.get("/:slug", getRestaurantBySlug);
restaurantRouter.get("/:id/avaliability", getRestaurantAvaliability);

export default restaurantRouter;
