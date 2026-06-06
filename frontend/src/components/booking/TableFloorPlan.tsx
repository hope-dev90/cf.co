import React from "react";
import type { TableAvailability } from "../../types/booking";

interface TableFloorPlanProps {
  tables: TableAvailability[];
  selectedId: number | null;
  onSelect: (table: TableAvailability) => void;
}

const TableFloorPlan: React.FC<TableFloorPlanProps> = ({
  tables,
  selectedId,
  onSelect,
}) => {
  if (tables.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
        No tables available for the selected date and time.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#e8722a]" />
          Selected
        </span>
      </div>

      <div className="relative h-80 rounded-2xl border-2 border-[#1a1a2e]/10 bg-gradient-to-br from-[#fff8f0] to-[#f3ebe3]">
        <div className="absolute left-4 top-4 rounded-lg bg-[#1a1a2e] px-3 py-1 text-xs font-medium text-white">
          Entrance
        </div>
        <div className="absolute bottom-4 right-4 rounded-lg bg-[#1a1a2e]/80 px-3 py-1 text-xs font-medium text-white">
          Kitchen
        </div>

        {tables.map((table) => {
          const isSelected = selectedId === table.id;
          const x = table.position_x || 20;
          const y = table.position_y || 20;

          return (
            <button
              key={table.id}
              type="button"
              onClick={() => onSelect(table)}
              className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border-2 text-xs font-semibold shadow-md transition-all hover:scale-105 ${
                isSelected
                  ? "border-[#e8722a] bg-[#e8722a] text-white"
                  : "border-green-500 bg-white text-green-800"
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={table.location_description || table.table_number}
            >
              <span>{table.table_number}</span>
              <span className="text-[10px] font-normal opacity-80">
                {table.capacity} seats
              </span>
            </button>
          );
        })}
      </div>

      {selectedId && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          {(() => {
            const selected = tables.find((table) => table.id === selectedId);
            if (!selected) return null;
            return (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Table {selected.table_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selected.location_description || "Main floor"} ·{" "}
                    {selected.capacity} guests · {selected.start_time?.slice(0, 5)}
                    –{selected.end_time?.slice(0, 5)}
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Available
                </span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TableFloorPlan;
