import express from "express";
import { authMiddleware } from "../middleware/authMiddleWare.js";
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
} from "../controller/restaurantController.js";

const restaurantRouter = express.Router();

restaurantRouter.post("/", authMiddleware, createRestaurantController);
restaurantRouter.get("/", getAllRestaurantsController);
restaurantRouter.get("/my", authMiddleware, getMyRestaurantsController);
restaurantRouter.get("/:id", getRestaurantByIdController);
restaurantRouter.put("/:id", authMiddleware, updateRestaurantController);
restaurantRouter.delete("/:id", authMiddleware, deleteRestaurantController);

restaurantRouter.post(
  "/:restaurantId/locations",
  authMiddleware,
  addLocationController,
);
restaurantRouter.get("/:restaurantId/locations", getLocationsController);
restaurantRouter.put(
  "/locations/:id",
  authMiddleware,
  updateLocationController,
);
restaurantRouter.delete(
  "/locations/:id",
  authMiddleware,
  deleteLocationController,
);

restaurantRouter.post(
  "/:restaurantId/menu",
  authMiddleware,
  addMenuItemController,
);
restaurantRouter.get("/:restaurantId/menu", getMenuItemsController);
restaurantRouter.get("/menu/:id", getMenuItemByIdController);
restaurantRouter.put("/menu/:id", authMiddleware, updateMenuItemController);
restaurantRouter.delete("/menu/:id", authMiddleware, deleteMenuItemController);

restaurantRouter.post(
  "/:restaurantId/waiters",
  authMiddleware,
  addWaiterController,
);
restaurantRouter.get("/:restaurantId/waiters", getWaitersController);
restaurantRouter.get("/waiters/:id", getWaiterByIdController);
restaurantRouter.put("/waiters/:id", authMiddleware, updateWaiterController);
restaurantRouter.delete("/waiters/:id", authMiddleware, deleteWaiterController);

restaurantRouter.post(
  "/waiters/:waiterId/availability",
  authMiddleware,
  addWaiterAvailabilityController,
);
restaurantRouter.get(
  "/waiters/:waiterId/availability",
  getWaiterAvailabilityController,
);
restaurantRouter.get(
  "/:restaurantId/availability/:date",
  getAvailabilityByDateController,
);
restaurantRouter.put(
  "/availability/:id",
  authMiddleware,
  updateWaiterAvailabilityController,
);
restaurantRouter.patch(
  "/availability/:id/taken",
  authMiddleware,
  setAvailabilityTakenController,
);
restaurantRouter.delete(
  "/availability/:id",
  authMiddleware,
  deleteWaiterAvailabilityController,
);

// ------------------------------
// Restaurant Tables
// ------------------------------
restaurantRouter.post(
  "/:restaurantId/tables",
  authMiddleware,
  addTableController,
);
restaurantRouter.get("/:restaurantId/tables", getTablesController);
restaurantRouter.get("/tables/:id", getTableByIdController);
restaurantRouter.put("/tables/:id", authMiddleware, updateTableController);
restaurantRouter.delete("/tables/:id", authMiddleware, deleteTableController);

// ------------------------------
// Table Availability
// ------------------------------
restaurantRouter.post(
  "/tables/:tableId/availability",
  authMiddleware,
  addTableAvailabilityController,
);
restaurantRouter.get(
  "/tables/:tableId/availability",
  getTableAvailabilityController,
);
restaurantRouter.get(
  "/:restaurantId/tables/availability/:date",
  getTableAvailabilityByDateController,
);
restaurantRouter.put(
  "/tables/availability/:id",
  authMiddleware,
  updateTableAvailabilityController,
);
restaurantRouter.patch(
  "/tables/availability/:id/status",
  authMiddleware,
  updateTableStatusController,
);
restaurantRouter.delete(
  "/tables/availability/:id",
  authMiddleware,
  deleteTableAvailabilityController,
);

export default restaurantRouter;
