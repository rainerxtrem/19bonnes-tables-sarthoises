"use client";

import { cn } from "@/lib/utils/cn";

export interface OpeningSlot {
  start: string;
  end: string;
}

export interface OpeningDay {
  day: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
  closed: boolean;
  slots: OpeningSlot[];
}

const DAYS: OpeningDay["day"][] = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

export function defaultOpeningHours(): OpeningDay[] {
  return DAYS.map((day) => ({ day, closed: false, slots: [{ start: "12:00", end: "14:00" }] }));
}

export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningDay[];
  onChange: (value: OpeningDay[]) => void;
}) {
  const days = value.length === 7 ? value : defaultOpeningHours();

  function updateDay(index: number, patch: Partial<OpeningDay>) {
    const next = days.map((d, i) => (i === index ? { ...d, ...patch } : d));
    onChange(next);
  }

  function updateSlot(dayIndex: number, slotIndex: number, patch: Partial<OpeningSlot>) {
    const day = days[dayIndex];
    if (!day) return;
    const slots = day.slots.map((s, i) => (i === slotIndex ? { ...s, ...patch } : s));
    updateDay(dayIndex, { slots });
  }

  function addSlot(dayIndex: number) {
    const day = days[dayIndex];
    if (!day) return;
    updateDay(dayIndex, { slots: [...day.slots, { start: "19:00", end: "21:00" }] });
  }

  function removeSlot(dayIndex: number, slotIndex: number) {
    const day = days[dayIndex];
    if (!day) return;
    updateDay(dayIndex, { slots: day.slots.filter((_, i) => i !== slotIndex) });
  }

  return (
    <div className="divide-y divide-gray-100 rounded-md border border-gray-200 bg-white">
      {days.map((day, dayIndex) => (
        <div key={day.day} className="flex flex-wrap items-start gap-3 p-3">
          <div className="w-24 pt-1 text-sm font-medium capitalize text-gray-700">{day.day}</div>
          <label className="flex items-center gap-1.5 pt-1 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={day.closed}
              onChange={(e) => updateDay(dayIndex, { closed: e.target.checked })}
            />
            Fermé
          </label>
          {!day.closed && (
            <div className="flex flex-1 flex-col gap-2">
              {day.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateSlot(dayIndex, slotIndex, { start: e.target.value })}
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                  />
                  <span className="text-xs text-gray-400">à</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(dayIndex, slotIndex, { end: e.target.value })}
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeSlot(dayIndex, slotIndex)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSlot(dayIndex)}
                className={cn("self-start text-xs text-brand hover:underline")}
              >
                + Ajouter un créneau
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
