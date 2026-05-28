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
  deleteRestaurantLocation,
  addMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  addWaiter,
  getWaiters,
  getWaiterById,
  updateWaiter,
  deleteWaiter,
  addWaiterAvailability,
  getWaiterAvailability,
  getAvailabilityByDate,
  updateWaiterAvailability,
  setAvailabilityTaken,
  deleteWaiterAvailability,
  addRestaurantTable,
  getRestaurantTables,
  getRestaurantTableById,
  updateRestaurantTable,
  deleteRestaurantTable,
  addTableAvailability,
  getTableAvailability,
  getTableAvailabilityByDate,
  updateTableAvailability,
  updateTableStatus,
  deleteTableAvailability,
} from "../models/restaurantModel.js";

// ------------------------------
// Restaurants
// ------------------------------

export const createRestaurantController = async (req, res) => {
  try {
    const restaurant = await createRestaurant({
      ...req.body,
      user_id: req.user.id,
    });
    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    console.error("Create restaurant error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create restaurant" });
  }
};

export const getAllRestaurantsController = async (req, res) => {
  try {
    const restaurants = await getAllRestaurants();
    res.json({ success: true, restaurants });
  } catch (error) {
    console.error("Get restaurants error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get restaurants" });
  }
};

export const getRestaurantByIdController = async (req, res) => {
  try {
    const restaurant = await getRestaurantById(req.params.id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Get restaurant error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get restaurant" });
  }
};

export const getMyRestaurantsController = async (req, res) => {
  try {
    const restaurants = await getRestaurantsByUserId(req.user.id);
    res.json({ success: true, restaurants });
  } catch (error) {
    console.error("Get my restaurants error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get restaurants" });
  }
};

export const updateRestaurantController = async (req, res) => {
  try {
    const restaurant = await updateRestaurant(req.params.id, req.body);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Update restaurant error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update restaurant" });
  }
};

export const deleteRestaurantController = async (req, res) => {
  try {
    const restaurant = await deleteRestaurant(req.params.id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    res.json({ success: true, message: "Restaurant deleted" });
  } catch (error) {
    console.error("Delete restaurant error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete restaurant" });
  }
};

// ------------------------------
// Restaurant Locations
// ------------------------------

export const addLocationController = async (req, res) => {
  try {
    const location = await addRestaurantLocation({
      ...req.body,
      restaurant_id: req.params.restaurantId,
    });
    res.status(201).json({ success: true, location });
  } catch (error) {
    console.error("Add location error:", error);
    res.status(500).json({ success: false, message: "Failed to add location" });
  }
};

export const getLocationsController = async (req, res) => {
  try {
    const locations = await getRestaurantLocations(req.params.restaurantId);
    res.json({ success: true, locations });
  } catch (error) {
    console.error("Get locations error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get locations" });
  }
};

export const updateLocationController = async (req, res) => {
  try {
    const location = await updateRestaurantLocation(req.params.id, req.body);
    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    res.json({ success: true, location });
  } catch (error) {
    console.error("Update location error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update location" });
  }
};

export const deleteLocationController = async (req, res) => {
  try {
    const location = await deleteRestaurantLocation(req.params.id);
    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }
    res.json({ success: true, message: "Location deleted" });
  } catch (error) {
    console.error("Delete location error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete location" });
  }
};

// ------------------------------
// Menu Items
// ------------------------------

export const addMenuItemController = async (req, res) => {
  try {
    const menuItem = await addMenuItem({
      ...req.body,
      restaurant_id: req.params.restaurantId,
    });
    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    console.error("Add menu item error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add menu item" });
  }
};

export const getMenuItemsController = async (req, res) => {
  try {
    const menuItems = await getMenuItems(req.params.restaurantId);
    res.json({ success: true, menuItems });
  } catch (error) {
    console.error("Get menu items error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get menu items" });
  }
};

export const getMenuItemByIdController = async (req, res) => {
  try {
    const menuItem = await getMenuItemById(req.params.id);
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    res.json({ success: true, menuItem });
  } catch (error) {
    console.error("Get menu item error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get menu item" });
  }
};

export const updateMenuItemController = async (req, res) => {
  try {
    const menuItem = await updateMenuItem(req.params.id, req.body);
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    res.json({ success: true, menuItem });
  } catch (error) {
    console.error("Update menu item error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update menu item" });
  }
};

export const deleteMenuItemController = async (req, res) => {
  try {
    const menuItem = await deleteMenuItem(req.params.id);
    if (!menuItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete menu item" });
  }
};

// ------------------------------
// Waiters
// ------------------------------

export const addWaiterController = async (req, res) => {
  try {
    const waiter = await addWaiter({
      ...req.body,
      restaurant_id: req.params.restaurantId,
    });
    res.status(201).json({ success: true, waiter });
  } catch (error) {
    console.error("Add waiter error:", error);
    res.status(500).json({ success: false, message: "Failed to add waiter" });
  }
};

export const getWaitersController = async (req, res) => {
  try {
    const waiters = await getWaiters(req.params.restaurantId);
    res.json({ success: true, waiters });
  } catch (error) {
    console.error("Get waiters error:", error);
    res.status(500).json({ success: false, message: "Failed to get waiters" });
  }
};

export const getWaiterByIdController = async (req, res) => {
  try {
    const waiter = await getWaiterById(req.params.id);
    if (!waiter) {
      return res
        .status(404)
        .json({ success: false, message: "Waiter not found" });
    }
    res.json({ success: true, waiter });
  } catch (error) {
    console.error("Get waiter error:", error);
    res.status(500).json({ success: false, message: "Failed to get waiter" });
  }
};

export const updateWaiterController = async (req, res) => {
  try {
    const waiter = await updateWaiter(req.params.id, req.body);
    if (!waiter) {
      return res
        .status(404)
        .json({ success: false, message: "Waiter not found" });
    }
    res.json({ success: true, waiter });
  } catch (error) {
    console.error("Update waiter error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update waiter" });
  }
};

export const deleteWaiterController = async (req, res) => {
  try {
    const waiter = await deleteWaiter(req.params.id);
    if (!waiter) {
      return res
        .status(404)
        .json({ success: false, message: "Waiter not found" });
    }
    res.json({ success: true, message: "Waiter deleted" });
  } catch (error) {
    console.error("Delete waiter error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete waiter" });
  }
};

// ------------------------------
// Waiter Availability
// ------------------------------

export const addWaiterAvailabilityController = async (req, res) => {
  try {
    const availability = await addWaiterAvailability({
      ...req.body,
      waiter_id: req.params.waiterId,
    });
    res.status(201).json({ success: true, availability });
  } catch (error) {
    console.error("Add availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add availability" });
  }
};

export const getWaiterAvailabilityController = async (req, res) => {
  try {
    const availability = await getWaiterAvailability(req.params.waiterId);
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Get availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get availability" });
  }
};

export const getAvailabilityByDateController = async (req, res) => {
  try {
    const availability = await getAvailabilityByDate(
      req.params.restaurantId,
      req.params.date,
    );
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Get availability by date error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get availability" });
  }
};

export const updateWaiterAvailabilityController = async (req, res) => {
  try {
    const availability = await updateWaiterAvailability(
      req.params.id,
      req.body,
    );
    if (!availability) {
      return res
        .status(404)
        .json({ success: false, message: "Availability not found" });
    }
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Update availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update availability" });
  }
};

export const setAvailabilityTakenController = async (req, res) => {
  try {
    const availability = await setAvailabilityTaken(
      req.params.id,
      req.body.is_taken,
    );
    if (!availability) {
      return res
        .status(404)
        .json({ success: false, message: "Availability not found" });
    }
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Set availability taken error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update availability" });
  }
};

export const deleteWaiterAvailabilityController = async (req, res) => {
  try {
    const availability = await deleteWaiterAvailability(req.params.id);
    if (!availability) {
      return res
        .status(404)
        .json({ success: false, message: "Availability not found" });
    }
    res.json({ success: true, message: "Availability deleted" });
  } catch (error) {
    console.error("Delete availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete availability" });
  }
};

// ------------------------------
// Restaurant Tables
// ------------------------------

export const addTableController = async (req, res) => {
  try {
    const table = await addRestaurantTable({
      ...req.body,
      restaurant_id: req.params.restaurantId,
    });
    res.status(201).json({ success: true, table });
  } catch (error) {
    console.error("Add table error:", error);
    res.status(500).json({ success: false, message: "Failed to add table" });
  }
};

export const getTablesController = async (req, res) => {
  try {
    const tables = await getRestaurantTables(req.params.restaurantId);
    res.json({ success: true, tables });
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({ success: false, message: "Failed to get tables" });
  }
};

export const getTableByIdController = async (req, res) => {
  try {
    const table = await getRestaurantTableById(req.params.id);
    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }
    res.json({ success: true, table });
  } catch (error) {
    console.error("Get table error:", error);
    res.status(500).json({ success: false, message: "Failed to get table" });
  }
};

export const updateTableController = async (req, res) => {
  try {
    const table = await updateRestaurantTable(req.params.id, req.body);
    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }
    res.json({ success: true, table });
  } catch (error) {
    console.error("Update table error:", error);
    res.status(500).json({ success: false, message: "Failed to update table" });
  }
};

export const deleteTableController = async (req, res) => {
  try {
    const table = await deleteRestaurantTable(req.params.id);
    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }
    res.json({ success: true, message: "Table deleted" });
  } catch (error) {
    console.error("Delete table error:", error);
    res.status(500).json({ success: false, message: "Failed to delete table" });
  }
};

// ------------------------------
// Table Availability
// ------------------------------

export const addTableAvailabilityController = async (req, res) => {
  try {
    const availability = await addTableAvailability({
      ...req.body,
      table_id: req.params.tableId,
    });
    res.status(201).json({ success: true, availability });
  } catch (error) {
    console.error("Add table availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add table availability" });
  }
};

export const getTableAvailabilityController = async (req, res) => {
  try {
    const availability = await getTableAvailability(req.params.tableId);
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Get table availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get table availability" });
  }
};

export const getTableAvailabilityByDateController = async (req, res) => {
  try {
    const availability = await getTableAvailabilityByDate(
      req.params.restaurantId,
      req.params.date,
    );
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Get table availability by date error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get table availability" });
  }
};

export const updateTableAvailabilityController = async (req, res) => {
  try {
    const availability = await updateTableAvailability(req.params.id, req.body);
    if (!availability) {
      return res
        .status(404)
        .json({ success: false, message: "Table availability not found" });
    }
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Update table availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update table availability" });
  }
};

export const updateTableStatusController = async (req, res) => {
  try {
    const availability = await updateTableStatus(
      req.params.id,
      req.body.status,
    );
    if (!availability) {
      return res
        .status(404)
        .json({ success: false, message: "Table availability not found" });
    }
    res.json({ success: true, availability });
  } catch (error) {
    console.error("Update table status error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update table status" });
  }
};

export const deleteTableAvailabilityController = async (req, res) => {
  try {
    const availability = await deleteTableAvailability(req.params.id);
    if (!availability) {
      return res
        .status(404)
        .json({ success: false, message: "Table availability not found" });
    }
    res.json({ success: true, message: "Table availability deleted" });
  } catch (error) {
    console.error("Delete table availability error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete table availability" });
  }
};
