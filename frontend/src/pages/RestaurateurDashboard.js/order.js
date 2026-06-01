import React from "react";

export default function OrdersDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-5">
        <h1 className="text-xl font-bold mb-8">Heritage Excellence</h1>

        <nav className="space-y-4 text-gray-600">
          <p className="cursor-pointer hover:text-black">Dashboard</p>
          <p className="cursor-pointer hover:text-black">Menu</p>
          <p className="cursor-pointer font-semibold text-black border-r-4 border-black pr-2">
            Orders
          </p>
          <p className="cursor-pointer hover:text-black">Notifications</p>
        </nav>

        <button className="mt-10 w-full bg-red-900 text-white py-2 rounded-lg">
          View Reports
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Orders Overview</h2>

          <div className="flex gap-3">
            <button className="px-3 py-1 bg-red-900 text-white rounded">
              All Orders
            </button>
            <button className="px-3 py-1 bg-white rounded">Pending</button>
            <button className="px-3 py-1 bg-white rounded">Preparing</button>
            <button className="px-3 py-1 bg-white rounded">Ready</button>
            <button className="px-3 py-1 bg-white rounded">Completed</button>
          </div>
        </div>

        {/* GRID CARDS */}
        <div className="grid grid-cols-3 gap-6">

          {/* CARD 1 */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">Table 12</h3>
            <p className="text-sm text-gray-500">Order #2389</p>

            <ul className="mt-3 text-sm space-y-1">
              <li>Beef Steak</li>
              <li>Chicken Pasta</li>
              <li>White Wine</li>
            </ul>

            <p className="mt-4 font-bold">$106.00</p>

            <button className="mt-3 bg-red-900 text-white px-3 py-1 rounded">
              Mark as Ready
            </button>
          </div>

          {/* CARD 2 */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">Delivery</h3>
            <p className="text-sm text-gray-500">Arthur Morgan</p>

            <p className="mt-2 text-sm">To: Downtown Avenue</p>

            <p className="mt-4 font-bold">$72.00</p>

            <button className="mt-3 bg-gray-300 px-3 py-1 rounded">
              Dispatch Order
            </button>
          </div>

          {/* CARD 3 - STATS */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">Live Stats</h3>

            <div className="mt-4 space-y-3 text-sm">
              <p>🍽 Orders: 18</p>
              <p>📊 Completion Rate: 84%</p>
              <p>⏱ Avg Time: 24 min</p>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">Takeaway</h3>
            <p className="text-sm text-gray-500">Order #4551</p>

            <p className="mt-4 font-bold">$45.00</p>

            <button className="mt-3 bg-red-900 text-white px-3 py-1 rounded">
              Mark as Ready
            </button>
          </div>

          {/* CARD 5 */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">Table 05</h3>
            <p className="text-sm text-gray-500">Order #1190</p>

            <p className="mt-4 font-bold">$370.00</p>

            <button className="mt-3 bg-red-900 text-white px-3 py-1 rounded">
              Mark as Ready
            </button>
          </div>

          {/* CARD 6 - KITCHEN */}
          <div className="bg-red-900 text-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">Kitchen Capacity</h3>

            <p className="mt-3 text-sm">
              Manage kitchen workflow and adjust preparation speed.
            </p>

            <button className="mt-4 bg-white text-red-900 px-3 py-1 rounded">
              Adjust Settings
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}