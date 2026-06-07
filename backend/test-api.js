
// Let's test the API endpoints using the same logic as the backend
import pool from './config/db.js';
import { getMenuItems, getRestaurantAnalytics, getTopMenuItems } from './models/restaurantModel.js';

async function testAPI() {
  console.log("Testing getMenuItems(1):");
  const menuItems1 = await getMenuItems(1);
  console.log(menuItems1);
  
  console.log("\nTesting getMenuItems(2):");
  const menuItems2 = await getMenuItems(2);
  console.log(menuItems2);
  
  console.log("\nTesting getRestaurantAnalytics(1):");
  const analytics = await getRestaurantAnalytics(1);
  console.log(analytics);
  
  console.log("\nTesting getTopMenuItems(1):");
  const topItems = await getTopMenuItems(1);
  console.log(topItems);
}

testAPI().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
