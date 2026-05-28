import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getRestaurantsByUserId,
  updateRestaurant,
  deleteRestaurant,
  addRestaurantLocation,
  getRestaurantLocations,
  updateRestaurantLocation,
  deleteRestaurantLocation
} from "../models/restaurantModel.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";
import { adminOnly } from "../middleware/authMiddleWare.js";
import express from "express";
const Restaurantrouter = express.Router();
Restaurantrouter.post("/create", authMiddleware,adminOnly, createRestaurant);
Restaurantrouter.get("/all", authMiddleware, getAllRestaurants);
Restaurantrouter.get("/id", authMiddleware, getRestaurantById);
Restaurantrouter.get("/user/:id", authMiddleware, getRestaurantsByUserId);
Restaurantrouter.put("/id", authMiddleware,adminOnly, updateRestaurant);
Restaurantrouter.delete("/id", authMiddleware,adminOnly, deleteRestaurant);
Restaurantrouter.post("/location", authMiddleware,adminOnly, addRestaurantLocation);
Restaurantrouter.get("/location/:id", authMiddleware, getRestaurantLocations);
Restaurantrouter.put("/location/:id", authMiddleware, updateRestaurantLocation);
Restaurantrouter.delete("/location/:id", authMiddleware,deleteRestaurantLocation);
export default Restaurantrouter;
