import express from "express";
import { authMiddleware, adminOnly, restaurateurOnly } from "../middleware/authMiddleWare.js";
import {
  createRestaurantController,
  getAllRestaurantsController,
  getRestaurantByIdController,
  getMyRestaurantsController,
  updateRestaurantController,
  deleteRestaurantController,
  addLocationController,
  getLocationsController,
  updateLocationController,
  deleteLocationController,
  addMenuItemController,
  filterByCategoryController,
  getMenuItemsController,
  getMenuItemByIdController,
  updateMenuItemController,
  deleteMenuItemController,
  addWaiterController,
  getWaitersController,
  getWaiterByIdController,
  updateWaiterController,
  deleteWaiterController,
  addWaiterAvailabilityController,
  getWaiterAvailabilityController,
  getAvailabilityByDateController,
  updateWaiterAvailabilityController,
  setAvailabilityTakenController,
  deleteWaiterAvailabilityController,
  addTableController,
  getTablesController,
  getTableByIdController,
  updateTableController,
  deleteTableController,
  addTableAvailabilityController,
  getTableAvailabilityController,
  getTableAvailabilityByDateController,
  updateTableAvailabilityController,
  updateTableStatusController,
  deleteTableAvailabilityController,
  reserveTableController,
} from "../controller/restaurantController.js";

const restaurantRouter = express.Router();


restaurantRouter.post("/", authMiddleware, createRestaurantController);
// Everyone can view all restaurants
restaurantRouter.get("/", getAllRestaurantsController);
// Logged in user can view their own restaurants
restaurantRouter.get("/my", authMiddleware, getMyRestaurantsController);
// Everyone can view a single restaurant
restaurantRouter.get("/:id", getRestaurantByIdController);
// Admin or Restaurateur can update restaurants
restaurantRouter.put("/:id", authMiddleware, updateRestaurantController);
// Admin or Restaurateur can delete restaurants
restaurantRouter.delete("/:id", authMiddleware, deleteRestaurantController);

restaurantRouter.post("/:restaurantId/locations", authMiddleware, addLocationController);
restaurantRouter.get("/:restaurantId/locations", getLocationsController);
restaurantRouter.put("/locations/:id", authMiddleware, updateLocationController);
restaurantRouter.delete("/locations/:id", authMiddleware, deleteLocationController);


restaurantRouter.post("/:restaurantId/menu", authMiddleware, addMenuItemController);
restaurantRouter.get("/:restaurantId/menu", getMenuItemsController);
restaurantRouter.get("/menu/:id", getMenuItemByIdController);
restaurantRouter.put("/menu/:id", authMiddleware, updateMenuItemController);
restaurantRouter.delete("/menu/:id", authMiddleware, deleteMenuItemController);
restaurantRouter.get('/menu/:category',authMiddleware,filterByCategoryController);

restaurantRouter.post("/:restaurantId/waiters", authMiddleware, addWaiterController);
restaurantRouter.get("/:restaurantId/waiters", getWaitersController);
restaurantRouter.get("/waiters/:id", getWaiterByIdController);
restaurantRouter.put("/waiters/:id", authMiddleware, updateWaiterController);
restaurantRouter.delete("/waiters/:id", authMiddleware, deleteWaiterController);

restaurantRouter.post("/waiters/:waiterId/availability", authMiddleware, addWaiterAvailabilityController);
restaurantRouter.get("/waiters/:waiterId/availability", getWaiterAvailabilityController);
restaurantRouter.get("/:restaurantId/availability/:date", getAvailabilityByDateController);
restaurantRouter.put("/availability/:id", authMiddleware, updateWaiterAvailabilityController);
restaurantRouter.patch("/availability/:id/taken", authMiddleware, setAvailabilityTakenController);
restaurantRouter.delete("/availability/:id", authMiddleware, deleteWaiterAvailabilityController);

restaurantRouter.post("/:restaurantId/tables", authMiddleware, addTableController);
restaurantRouter.get("/:restaurantId/tables", getTablesController);
restaurantRouter.get("/tables/:id", getTableByIdController);
restaurantRouter.put("/tables/:id", authMiddleware, updateTableController);
restaurantRouter.delete("/tables/:id", authMiddleware, deleteTableController);

restaurantRouter.post("/tables/:tableId/availability", authMiddleware, addTableAvailabilityController);
restaurantRouter.get("/tables/:tableId/availability", getTableAvailabilityController);
restaurantRouter.get("/:restaurantId/tables/availability/:date", getTableAvailabilityByDateController);
restaurantRouter.put("/tables/availability/:id", authMiddleware, updateTableAvailabilityController);
restaurantRouter.patch("/tables/availability/:id/status", authMiddleware, updateTableStatusController);
restaurantRouter.delete("/tables/availability/:id", authMiddleware, deleteTableAvailabilityController);

restaurantRouter.patch("/tables/availability/:id/reserve", authMiddleware, reserveTableController);

export default restaurantRouter;
