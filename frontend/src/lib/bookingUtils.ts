import type { OperatingHours } from "../types/booking";

export const DEFAULT_OPERATING_HOURS: OperatingHours[] = [
  { day: "Monday", openTime: "11:00", closeTime: "22:00", isOpen: true },
  { day: "Tuesday", openTime: "11:00", closeTime: "22:00", isOpen: true },
  { day: "Wednesday", openTime: "11:00", closeTime: "22:00", isOpen: true },
  { day: "Thursday", openTime: "11:00", closeTime: "22:00", isOpen: true },
  { day: "Friday", openTime: "11:00", closeTime: "23:00", isOpen: true },
  { day: "Saturday", openTime: "10:00", closeTime: "23:00", isOpen: true },
  { day: "Sunday", openTime: "10:00", closeTime: "21:00", isOpen: true },
];

export const parseOperatingHours = (
  hours: OperatingHours[] | Record<string, unknown> | null | undefined,
): OperatingHours[] => {
  if (!hours) return DEFAULT_OPERATING_HOURS;
  if (Array.isArray(hours)) return hours;
  return DEFAULT_OPERATING_HOURS;
};

export const getDayName = (dateStr: string) => {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

export const formatTime = (time: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
};

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const generateTimeSlots = (
  hours: OperatingHours[],
  dateStr: string,
  intervalMinutes = 30,
): string[] => {
  const dayName = getDayName(dateStr);
  const dayHours = hours.find(
    (entry) => entry.day.toLowerCase() === dayName.toLowerCase(),
  );

  if (!dayHours || !dayHours.isOpen) return [];

  const start = timeToMinutes(dayHours.openTime);
  const end = timeToMinutes(dayHours.closeTime);
  const slots: string[] = [];

  for (let minute = start; minute < end; minute += intervalMinutes) {
    const h = Math.floor(minute / 60)
      .toString()
      .padStart(2, "0");
    const m = (minute % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }

  return slots;
};

export const slotMatchesTime = (
  slotStart: string,
  slotEnd: string,
  selectedTime: string,
) => {
  const selected = timeToMinutes(selectedTime.slice(0, 5));
  const start = timeToMinutes(slotStart.slice(0, 5));
  const end = timeToMinutes(slotEnd.slice(0, 5));
  return selected >= start && selected < end;
};

export const DEMO_MENU = [
  {
    id: -1,
    name: "Margherita Pizza",
    description: "Fresh tomato, mozzarella, basil",
    price: 12.99,
    category: "Mains",
    is_available: true,
  },
  {
    id: -2,
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan, croutons",
    price: 8.5,
    category: "Starters",
    is_available: true,
  },
  {
    id: -3,
    name: "Grilled Salmon",
    description: "Lemon butter, seasonal vegetables",
    price: 18.99,
    category: "Mains",
    is_available: true,
  },
  {
    id: -4,
    name: "Chocolate Lava Cake",
    description: "Warm center, vanilla ice cream",
    price: 7.5,
    category: "Desserts",
    is_available: true,
  },
];

export const DEMO_TABLES = [
  {
    id: -1,
    table_number: "T1",
    capacity: 2,
    location_description: "Window",
    position_x: 12,
    position_y: 18,
  },
  {
    id: -2,
    table_number: "T2",
    capacity: 4,
    location_description: "Center",
    position_x: 38,
    position_y: 18,
  },
  {
    id: -3,
    table_number: "T3",
    capacity: 4,
    location_description: "Patio",
    position_x: 64,
    position_y: 18,
  },
  {
    id: -4,
    table_number: "T4",
    capacity: 6,
    location_description: "Private booth",
    position_x: 12,
    position_y: 52,
  },
  {
    id: -5,
    table_number: "T5",
    capacity: 2,
    location_description: "Bar side",
    position_x: 38,
    position_y: 52,
  },
  {
    id: -6,
    table_number: "T6",
    capacity: 8,
    location_description: "Garden",
    position_x: 64,
    position_y: 52,
  },
];
