export interface OperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface ApiRestaurant {
  id: number;
  name: string;
  description?: string;
  cuisine_type?: string;
  phone?: string;
  email?: string;
  operating_hours?: OperatingHours[] | null;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  category?: string;
  is_available: boolean;
  image_url?: string;
}

export interface RestaurantTable {
  id: number;
  table_number: string;
  capacity: number;
  location_description?: string;
  position_x: number;
  position_y: number;
  is_active?: boolean;
}

export interface TableAvailability {
  id: number;
  table_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "available" | "reserved" | "occupied";
  table_number: string;
  capacity: number;
  location_description?: string;
  position_x: number;
  position_y: number;
}

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export type ServiceType = "dine-in" | "takeaway" | "delivery";
export type PaymentMethod = "card" | "cash" | "upi" | "wallet";

export type BookingStep =
  | "service"
  | "datetime"
  | "table"
  | "menu"
  | "checkout"
  | "done";
