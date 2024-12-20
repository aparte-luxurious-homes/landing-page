import React, { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";

interface DatePickerProps {}

const DatePicker: React.FC<DatePickerProps> = () => {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const toggleCheckIn = () => {
    setIsCheckInOpen((prev) => !prev);
    setIsCheckOutOpen(false);
  };

  const toggleCheckOut = () => {
    setIsCheckOutOpen((prev) => !prev);
    setIsCheckInOpen(false);
  };

  const handleDateSelect = (date: Date, type: "checkin" | "checkout") => {
    if (type === "checkin") {
      setCheckInDate(date);
      setIsCheckInOpen(false);
    } else {
      setCheckOutDate(date);
      setIsCheckOutOpen(false);
    }
  };

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderCalendar = (type: "checkin" | "checkout") => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const firstDayIndex = startOfMonth.getDay();

    return (
      <div className="absolute mt-2 p-4 bg-white border border-gray-300 rounded shadow-lg z-10 right-0 w-72">
        {/* Header with Month Navigation */}
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={handlePrevMonth}
            className="text-gray-600 hover:text-gray-900"
          >
            &lt;
          </button>
          <span className="font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={handleNextMonth}
            className="text-gray-600 hover:text-gray-900"
          >
            &gt;
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold">
          {weekdays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              onClick={() =>
                handleDateSelect(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  ),
                  type
                )
              }
              className="p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Check-in Button */}
      <div
        className="flex gap-7 px-4 py-3 mt-5 rounded-xl bg-zinc-100 cursor-pointer"
        onClick={toggleCheckIn}
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/d851753313126f2d263a7f73c68cef937aba1df6fc62af1acd0f1aec236eadd8?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt="calendar icon"
          className="object-contain shrink-0 self-start aspect-square w-[18px]"
        />
        <button className="basis-auto text-left text-gray-600 text-sm">
          {checkInDate ? `${format(checkInDate, "MM/dd/yyyy")}` : "Check in"}
        </button>
      </div>
      {isCheckInOpen && renderCalendar("checkin")}

      {/* Check-out Button */}
      <div
        className="flex gap-7 px-4 py-3 mt-5 rounded-xl bg-zinc-100 cursor-pointer"
        onClick={toggleCheckOut}
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/d851753313126f2d263a7f73c68cef937aba1df6fc62af1acd0f1aec236eadd8?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt="calendar icon"
          className="object-contain shrink-0 self-start aspect-square w-[18px]"
        />
        <button className="basis-auto text-left text-gray-600 text-sm">
          {checkOutDate ? `${format(checkOutDate, "MM/dd/yyyy")}` : "Check out"}
        </button>
      </div>
      {isCheckOutOpen && renderCalendar("checkout")}
    </div>
  );
};

export default DatePicker;
