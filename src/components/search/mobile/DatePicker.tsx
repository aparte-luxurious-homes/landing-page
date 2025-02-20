import React from 'react';
import DateRangePicker from '../../DateRangePicker';

interface DatePickerProps {
  onCheckInDateSelect: (date: Date) => void;
  onCheckOutDateSelect: (date: Date) => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
}

const DatePicker: React.FC<DatePickerProps> = ({
  onCheckInDateSelect,
  onCheckOutDateSelect,
  checkInDate,
  checkOutDate
}) => {
  return (
    <div className="px-0 py-3 pb-0">
      <DateRangePicker
        startDate={checkInDate}
        endDate={checkOutDate}
        onStartDateChange={onCheckInDateSelect}
        onEndDateChange={onCheckOutDateSelect}
      />
    </div>
  );
};

export default DatePicker;
