import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Utensils,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { orderApi, restaurantApi } from "../../lib/api";
import {
  DEMO_TABLES,
  formatTime,
  generateTimeSlots,
  parseOperatingHours,
  slotMatchesTime,
} from "../../lib/bookingUtils";
import type {
  ApiRestaurant,
  BookingStep,
  CartItem,
  MenuItem,
  PaymentMethod,
  ServiceType,
  TableAvailability,
} from "../../types/booking";
import TableFloorPlan from "./TableFloorPlan";

interface BookingFlowProps {
  restaurant: ApiRestaurant;
  profileName: string;
  profileEmail: string;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS: { id: BookingStep; label: string }[] = [
  { id: "service", label: "Service" },
  { id: "datetime", label: "Date & Time" },
  { id: "table", label: "Table" },
  { id: "menu", label: "Menu" },
  { id: "checkout", label: "Checkout" },
];

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "upi", label: "UPI" },
  { id: "wallet", label: "Digital Wallet" },
  { id: "cash", label: "Pay at Restaurant" },
];

const BookingFlow: React.FC<BookingFlowProps> = ({
  restaurant,
  profileName,
  profileEmail,
  onClose,
  onComplete,
}) => {
  const today = new Date().toISOString().slice(0, 10);

  const [step, setStep] = useState<BookingStep>("service");
  const [serviceType, setServiceType] = useState<ServiceType>("dine-in");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [availableTables, setAvailableTables] = useState<TableAvailability[]>(
    [],
  );
  const [selectedTable, setSelectedTable] = useState<TableAvailability | null>(
    null,
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useDemoData, setUseDemoData] = useState(false);

  const operatingHours = useMemo(
    () => parseOperatingHours(restaurant.operating_hours),
    [restaurant.operating_hours],
  );

  const timeSlots = useMemo(
    () => generateTimeSlots(operatingHours, selectedDate),
    [operatingHours, selectedDate],
  );

  const visibleSteps = useMemo(() => {
    if (serviceType === "dine-in") return STEPS;
    return STEPS.filter((entry) => entry.id !== "table");
  }, [serviceType]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    if (!selectedTime && timeSlots.length > 0) {
      setSelectedTime(timeSlots[0]);
    }
  }, [timeSlots, selectedTime]);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await restaurantApi.getMenu(restaurant.id);
        const items = data.menuItems || [];
        const availableItems = items.filter(
          (item: MenuItem) => item.is_available,
        );
        setMenuItems(availableItems);
        setUseDemoData(false);
      } catch (err) {
        console.error("Error loading menu:", err);
        setMenuItems([]);
        setUseDemoData(false);
      } finally {
        setLoading(false);
      }
    };

    if (step === "menu" || step === "checkout") {
      loadMenu();
    }
  }, [restaurant.id, step]);

  useEffect(() => {
    const loadTables = async () => {
      if (serviceType !== "dine-in" || !selectedDate || !selectedTime) return;

      setLoading(true);
      setError("");
      try {
        const [tablesRes, availabilityRes] = await Promise.all([
          restaurantApi.getTables(restaurant.id),
          restaurantApi.getTableAvailability(restaurant.id, selectedDate),
        ]);

        const tables = tablesRes.tables || [];
        const availability = availabilityRes.availability || [];

        const available = availability.filter(
          (slot: TableAvailability) =>
            slot.status === "available" &&
            slotMatchesTime(slot.start_time, slot.end_time, selectedTime),
        );

        if (available.length > 0) {
          setAvailableTables(available);
          setUseDemoData(false);
        } else if (tables.length > 0) {
          const fallback = tables.map(
            (table: Record<string, unknown>, index: number) => ({
              id: -(index + 1),
              table_id: table.id as number,
              date: selectedDate,
              start_time: selectedTime,
              end_time: selectedTime,
              status: "available" as const,
              table_number: table.table_number as string,
              capacity: table.capacity as number,
              location_description: table.location_description as string,
              position_x: (table.position_x as number) ?? 12 + (index % 3) * 26,
              position_y:
                (table.position_y as number) ?? 18 + Math.floor(index / 3) * 34,
            }),
          );
          setAvailableTables(fallback);
          setUseDemoData(true);
        } else {
          const fallback = DEMO_TABLES.map((table, index) => ({
            ...table,
            table_id: table.id,
            date: selectedDate,
            start_time: selectedTime,
            end_time: selectedTime,
            status: "available" as const,
          }));
          setAvailableTables(fallback);
          setUseDemoData(true);
        }
      } catch {
        const fallback = DEMO_TABLES.map((table) => ({
          ...table,
          table_id: table.id,
          date: selectedDate,
          start_time: selectedTime,
          end_time: selectedTime,
          status: "available" as const,
        }));
        setAvailableTables(fallback);
        setUseDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    if (step === "table") {
      loadTables();
    }
  }, [restaurant.id, selectedDate, selectedTime, serviceType, step]);

  const addToCart = (item: MenuItem) => {
    const price = Number(item.price);
    setCart((current) => {
      const existing = current.find((entry) => entry.menuItemId === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.menuItemId === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }
      return [
        ...current,
        { menuItemId: item.id, name: item.name, price, quantity: 1 },
      ];
    });
  };

  const updateQuantity = (menuItemId: number, delta: number) => {
    setCart((current) =>
      current
        .map((entry) =>
          entry.menuItemId === menuItemId
            ? { ...entry, quantity: entry.quantity + delta }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const goNext = () => {
    setError("");
    const index = visibleSteps.findIndex((entry) => entry.id === step);
    if (index < visibleSteps.length - 1) {
      setStep(visibleSteps[index + 1].id);
    }
  };

  const goBack = () => {
    setError("");
    const index = visibleSteps.findIndex((entry) => entry.id === step);
    if (index > 0) {
      setStep(visibleSteps[index - 1].id);
    }
  };

  const validateStep = () => {
    if (step === "datetime") {
      if (!selectedDate || !selectedTime) {
        setError("Please choose a date and time.");
        return false;
      }
      if (timeSlots.length === 0) {
        setError("Restaurant is closed on the selected day.");
        return false;
      }
    }

    if (step === "table" && serviceType === "dine-in" && !selectedTable) {
      setError("Please select an available table.");
      return false;
    }

    if (step === "menu" && cart.length === 0) {
      setError("Add at least one item to your cart.");
      return false;
    }

    if (step === "checkout") {
      if (!customerPhone.trim()) {
        setError("Phone number is required.");
        return false;
      }
      if (serviceType === "delivery" && !deliveryAddress.trim()) {
        setError("Delivery address is required.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    goNext();
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setSubmitting(true);
    setError("");

    try {
      let tableAvailabilityId: number | null = null;

      if (
        serviceType === "dine-in" &&
        selectedTable &&
        selectedTable.id > 0 &&
        !useDemoData
      ) {
        const reservation = await restaurantApi.reserveTable(selectedTable.id, {
          customer_name: profileName,
          customer_phone: customerPhone,
          notes: notes || `Table ${selectedTable.table_number}`,
        });
        tableAvailabilityId = reservation.availability?.id ?? selectedTable.id;
      }

      let orderItems = cart.map((item) => ({
        menu_item_id: item.menuItemId > 0 ? item.menuItemId : null,
        menu_item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      if (orderItems.length === 0) {
        setError("Add at least one item to your cart.");
        setSubmitting(false);
        return;
      }

      await orderApi.create({
        restaurant_id: restaurant.id,
        table_availability_id: tableAvailabilityId,
        customer_name: profileName,
        customer_phone: customerPhone,
        order_type: serviceType,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        notes:
          serviceType === "dine-in" && selectedTable
            ? `${notes ? `${notes} · ` : ""}Table ${selectedTable.table_number} at ${selectedTime}`
            : notes,
        delivery_address: serviceType === "delivery" ? deliveryAddress : null,
        items: orderItems,
      });

      setStep("done");
      onComplete();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentStepIndex = visibleSteps.findIndex((entry) => entry.id === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a2e]">
              Book at {restaurant.name}
            </h2>
            <p className="text-sm text-gray-500">
              {restaurant.cuisine_type || "Restaurant"} · Choose your experience
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {step !== "done" && (
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {visibleSteps.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                    index <= currentStepIndex
                      ? "bg-[#1a1a2e] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}. {entry.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === "service" && (
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setServiceType("dine-in")}
                className={`rounded-2xl border-2 p-6 text-left transition-all ${
                  serviceType === "dine-in"
                    ? "border-[#e8722a] bg-[#fff5f0]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Utensils className="mb-3 text-[#e8722a]" size={28} />
                <h3 className="text-lg font-semibold text-[#1a1a2e]">
                  Book a Table
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Dine in, pick an available table on the floor plan, and
                  pre-order your meal.
                </p>
              </button>

              <div
                onClick={() =>
                  setServiceType(
                    serviceType === "dine-in" ? "takeaway" : serviceType,
                  )
                }
                className={`rounded-2xl border-2 p-6 text-left transition-all cursor-pointer ${
                  serviceType === "takeaway" || serviceType === "delivery"
                    ? "border-[#e8722a] bg-[#fff5f0]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <ShoppingCart className="mb-3 text-[#e8722a]" size={28} />
                <h3 className="text-lg font-semibold text-[#1a1a2e]">
                  Order Online
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Order for takeaway or delivery without reserving a table.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setServiceType("takeaway");
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-medium ${
                      serviceType === "takeaway"
                        ? "bg-[#1a1a2e] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Takeaway
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setServiceType("delivery");
                    }}
                    className={`rounded-lg px-3 py-1 text-xs font-medium ${
                      serviceType === "delivery"
                        ? "bg-[#1a1a2e] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "datetime" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar size={16} />
                  Select Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock size={16} />
                  Select Time
                </label>
                {timeSlots.length === 0 ? (
                  <p className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    Closed on this day. Pick another date.
                  </p>
                ) : (
                  <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          selectedTime === slot
                            ? "bg-[#e8722a] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 rounded-xl bg-[#faf5f0] p-4 text-sm text-gray-600">
                <p className="font-medium text-[#1a1a2e]">Operating Hours</p>
                <div className="mt-2 grid gap-1 md:grid-cols-2">
                  {operatingHours.map((entry) => (
                    <p key={entry.day}>
                      {entry.day}:{" "}
                      {entry.isOpen
                        ? `${formatTime(entry.openTime)} – ${formatTime(entry.closeTime)}`
                        : "Closed"}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "table" && (
            <div>
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="animate-spin text-[#e8722a]" size={32} />
                </div>
              ) : (
                <>
                  {useDemoData && (
                    <p className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      Showing sample floor plan. Connect restaurant tables in
                      the owner dashboard for live availability.
                    </p>
                  )}
                  <TableFloorPlan
                    tables={availableTables}
                    selectedId={selectedTable?.id ?? null}
                    onSelect={setSelectedTable}
                  />
                </>
              )}
            </div>
          )}

          {step === "menu" && (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div>
                {loading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2
                      className="animate-spin text-[#e8722a]"
                      size={32}
                    />
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="flex h-48 items-center justify-center">
                    <p className="text-lg text-gray-500">No menu right now</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-[#1a1a2e]">
                              {item.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.description}
                            </p>
                            <p className="mt-2 font-semibold text-[#e8722a]">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="rounded-full bg-[#1a1a2e] p-2 text-white hover:bg-[#0f0f1e]"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#faf5f0] p-4">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-[#1a1a2e]">
                  <ShoppingCart size={18} />
                  Your Cart ({cart.length})
                </h4>
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500">No items yet.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                            className="rounded-full bg-white p-1"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                            className="rounded-full bg-white p-1"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-3 font-semibold text-[#1a1a2e]">
                      Total: ${cartTotal.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "checkout" && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              {/* Left Column: Order & Customer Details */}
              <div className="space-y-4">
                {/* Order Summary Card */}
                <div className="rounded-2xl bg-[#faf5f0] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-6 h-6 text-[#e8722a]" />
                    <h4 className="text-xl font-bold text-[#1a1a2e]">
                      Booking Details
                    </h4>
                  </div>

                  {/* Service & Timing Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </p>
                      <p className="text-sm font-semibold text-[#1a1a2e] capitalize mt-1">
                        {serviceType}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </p>
                      <p className="text-sm font-semibold text-[#1a1a2e] mt-1">
                        {selectedDate} • {formatTime(selectedTime)}
                      </p>
                    </div>
                  </div>

                  {/* Table Info (if dine-in) */}
                  {selectedTable && (
                    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Table
                      </p>
                      <p className="text-sm font-semibold text-[#1a1a2e] mt-1">
                        Table {selectedTable.table_number} •{" "}
                        {selectedTable.location_description || "Main floor"}
                      </p>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Order Items
                    </p>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.menuItemId}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#1a1a2e]">
                              {item.quantity}x {item.name}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-[#e8722a]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-[#e8722a]">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-[#1a1a2e]">Total</p>
                      <p className="text-2xl font-extrabold text-[#e8722a]">
                        ${cartTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <label className="mb-3 block text-sm font-semibold text-[#1a1a2e]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white"
                  />
                </div>

                {/* Delivery Address (if needed) */}
                {serviceType === "delivery" && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1a1a2e]">
                      <MapPin size={18} className="text-[#e8722a]" />
                      Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(event.target.value)
                      }
                      rows={3}
                      placeholder="123 Main St, City, State"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white"
                    />
                  </div>
                )}

                {/* Special Requests */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <label className="mb-3 block text-sm font-semibold text-[#1a1a2e]">
                    Special Requests
                  </label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                    placeholder="Allergies, celebrations, seating preferences..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:outline-none focus:border-[#e8722a] focus:bg-white"
                  />
                </div>
              </div>

              {/* Right Column: Payment Method */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#1a1a2e]">
                    <CreditCard size={20} className="text-[#e8722a]" />
                    Payment Method
                  </h4>
                  <div className="space-y-3">
                    {PAYMENT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        className={`w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-semibold transition-all ${
                          paymentMethod === option.id
                            ? "border-[#e8722a] bg-[#fff5f0] text-[#1a1a2e] shadow-md"
                            : "border-gray-200 text-gray-700 hover:border-[#e8722a] hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-6 text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg">
                    🔒 Logged in as{" "}
                    <span className="font-medium text-gray-700">
                      {profileEmail}
                    </span>
                    . Payment is recorded with your booking; no real charge is
                    processed in this demo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 shadow-xl">
                <Check size={48} />
              </div>
              <h3 className="text-3xl font-extrabold text-[#1a1a2e] mb-3">
                Booking Confirmed! 🎉
              </h3>
              <p className="text-gray-600 max-w-md leading-relaxed mb-6">
                Your {serviceType === "dine-in" ? "table reservation and " : ""}
                order at{" "}
                <span className="font-semibold text-[#1a1a2e]">
                  {restaurant.name}
                </span>{" "}
                has been placed successfully.
              </p>
              <div className="bg-[#faf5f0] rounded-2xl px-8 py-6 max-w-sm w-full">
                <p className="text-sm text-gray-600 mb-2">Order Total</p>
                <p className="text-4xl font-extrabold text-[#e8722a]">
                  ${cartTotal.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {step !== "done" && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-5">
            <button
              type="button"
              onClick={step === "service" ? onClose : goBack}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={18} />
              {step === "service" ? "Cancel" : "Back"}
            </button>

            {step === "checkout" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#e8722a] to-[#d4651f] px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl hover:from-[#d4651f] hover:to-[#c4561f] disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Confirm Booking
                    <Check size={20} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-8 py-3 font-bold text-white hover:bg-[#0f0f1e] shadow-md hover:shadow-lg transition-all"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="border-t border-gray-100 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#2d2d4a] px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
