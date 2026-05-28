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
export const createRestaurant = async (req, res) => {
  const { name, description, cuisine_type, phone, email, website, operating_hours } = req.body;
  const user_id = req.user.id;
  const restaurant = await createRestaurant({
    name,
    description,
    cuisine_type,
    phone,
    email,
    website,
    operating_hours,
    user_id,
  });
  return res.status(201).json({
    success: true,
    message: "Restaurant created successfully",
    restaurant,
  });
}
export const getAllRestaurants = async (req, res) => {
  const restaurants = await getAllRestaurants();
  return res.status(200).json({
    success: true,
    message: "Restaurants retrieved successfully",
    restaurants,
  });
}
export const getRestaurantById = async (req, res) => {
  const id = req.params.id;
  const restaurant = await getRestaurantById(id);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Restaurant retrieved successfully",
    restaurant,
  });
}
export const getRestaurantsByUserId = async (req, res) => {
  const user_id = req.user.id;
  const restaurants = await getRestaurantsByUserId(user_id);
  return res.status(200).json({
    success: true,
    message: "Restaurants retrieved successfully",
    restaurants,
  });
}
export const updateRestaurant = async (req, res) => {
  const id = req.params.id;
  const restaurantData = req.body;
  const updatedRestaurant = await updateRestaurant(id, restaurantData);
  if (!updatedRestaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Restaurant updated successfully",
    restaurant: updatedRestaurant,
  });
}
export const deleteRestaurant = async (req, res) => {
  const id = req.params.id;
  const deletedRestaurant = await deleteRestaurant(id);
  if (!deletedRestaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Restaurant deleted successfully",
    restaurant: deletedRestaurant,
  });
}
export const addRestaurantLocation = async (req, res) => {
  const restaurant_id = req.params.id;
  const locationData = req.body;
  const addedLocation = await addRestaurantLocation({
    restaurant_id,
    ...locationData,
  });
  return res.status(201).json({
    success: true,
    message: "Location added successfully",
    location: addedLocation,
  });
}   
export const getRestaurantLocations = async (req, res) => {
  const restaurant_id = req.params.id;
  const locations = await getRestaurantLocations(restaurant_id);
  return res.status(200).json({
    success: true,
    message: "Locations retrieved successfully",
    locations,
  });
}
export const updateRestaurantLocation = async (req, res) => {
  const restaurant_id = req.params.id;
  const locationData = req.body;
  const updatedLocation = await updateRestaurantLocation(restaurant_id, locationData);
  if (!updatedLocation) {
    return res.status(404).json({
      success: false,
      message: "Location not found",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Location updated successfully",
    location: updatedLocation,
  });
}
export const deleteRestaurantLocation = async (req, res) => {
  const restaurant_id = req.params.id;
  const deletedLocation = await deleteRestaurantLocation(restaurant_id);
  if (!deletedLocation) {
    return res.status(404).json({
      success: false,
      message: "Location not found",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Location deleted successfully",
    location: deletedLocation,
  });
}