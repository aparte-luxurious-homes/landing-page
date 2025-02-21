import React from 'react';
import DateRangePicker from '../../DateRangePicker';

interface DatePickerProps {
  onCheckInDateSelect: (date: Date | null) => void;
  onCheckOutDateSelect: (date: Date | null) => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  availableDates?: Date[];
}

const DatePicker: React.FC<DatePickerProps> = ({
  onCheckInDateSelect,
  onCheckOutDateSelect,
  checkInDate,
  checkOutDate,
  availableDates = []
}) => {
  return (
    <div className="px-0 py-3 pb-0">
      <DateRangePicker
        startDate={checkInDate}
        endDate={checkOutDate}
        onStartDateChange={onCheckInDateSelect}
        onEndDateChange={onCheckOutDateSelect}
        availableDates={availableDates}
      />
    </div>
  );
};

export default DatePicker;
