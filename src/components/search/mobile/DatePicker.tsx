import React from "react";

interface DatePickerProps {}

const DatePicker: React.FC<DatePickerProps> = () => {
  return (
    <div className="flex gap-7 px-4 py-3 mt-5 rounded-xl bg-zinc-100">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d851753313126f2d263a7f73c68cef937aba1df6fc62af1acd0f1aec236eadd8?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
        alt=""
        className="object-contain shrink-0 self-start aspect-square w-[18px]"
      />
      <button className="basis-auto text-left text-gray-light text-sm">Check in / Check out</button>
    </div>
  );
};

export default DatePicker;
