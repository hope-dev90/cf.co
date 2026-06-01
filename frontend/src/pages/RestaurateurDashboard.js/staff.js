import React from "react";

export default function ManagementDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-5">
        <h1 className="text-xl font-bold mb-8">Restaurant Manager</h1>

        <nav className="space-y-4 text-gray-600">
          <p className="font-semibold text-black border-r-4 border-black pr-2">
            Dashboard
          </p>
          <p>Menu</p>
          <p>Orders</p>
          <p>Notifications</p>
        </nav>

        <button className="mt-10 w-full bg-red-900 text-white py-2 rounded-lg">
          View Reports
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Management Dashboard</h2>

          <div className="flex items-center gap-4">
            <input
              className="px-3 py-1 border rounded-lg"
              placeholder="Search dashboard..."
            />
            <button className="bg-red-900 text-white px-3 py-1 rounded">
              Add Staff Member
            </button>
          </div>
        </div>

        {/* CARDS ROW */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Staff</p>
            <h3 className="text-2xl font-bold">42</h3>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Currently On Duty</p>
            <h3 className="text-2xl font-bold">18</h3>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Weekly Hours</p>
            <h3 className="text-2xl font-bold">1,640</h3>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-6">

          {/* TEAM REGISTRY */}
          <div className="col-span-2 bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Team Registry</h3>

            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody className="space-y-2">
                <tr className="border-t">
                  <td>Alexander Monroe</td>
                  <td>Executive Chef</td>
                  <td className="text-green-600">On Duty</td>
                  <td>✏️ 🗑️</td>
                </tr>

                <tr className="border-t">
                  <td>Elena Laurent</td>
                  <td>Sous Chef</td>
                  <td className="text-green-600">On Duty</td>
                  <td>✏️ 🗑️</td>
                </tr>

                <tr className="border-t">
                  <td>Samuel Reed</td>
                  <td>Head Server</td>
                  <td className="text-red-500">Off Duty</td>
                  <td>✏️ 🗑️</td>
                </tr>

                <tr className="border-t">
                  <td>Clara Dupont</td>
                  <td>Manager</td>
                  <td className="text-green-600">On Duty</td>
                  <td>✏️ 🗑️</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* UPCOMING SHIFTS */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Upcoming Shifts</h3>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">Dinner Service</p>
                  <p className="text-gray-500">12 Staff</p>
                </div>
                <span>→</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">Brunch Service</p>
                  <p className="text-gray-500">8 Staff</p>
                </div>
                <span>→</span>
              </div>

              <button className="text-red-900 mt-2">
                View Full Schedule
              </button>
            </div>
          </div>

          {/* ELITE CARD */}
          <div className="bg-red-900 text-white p-5 rounded-xl shadow">
            <h3 className="font-semibold">Elite Excellence</h3>
            <p className="text-sm mt-2">
              Track high performance staff and productivity insights.
            </p>

            <button className="mt-4 bg-white text-red-900 px-3 py-1 rounded">
              Review Standards
            </button>
          </div>

          {/* STAFF MORALE */}
          <div className="col-span-2 bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold mb-3">Staff Morale</h3>

            <div className="h-2 bg-gray-200 rounded">
              <div className="h-2 bg-green-500 w-[82%] rounded"></div>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Overall morale is improving across departments.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}