const { addDays, isBefore, startOfToday } = require('date-fns');

const currentEndDate = "2026-04-22";

const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currentEndDateObj = parseDate(currentEndDate);

// simulate availabilityData
const rawData = [
  "2026-04-18", "2026-04-19", "2026-04-20", "2026-04-21", 
  "2026-04-22", "2026-04-23", "2026-04-24"
].map(d => ({ date: d, count: 0, is_blackout: false }));

const dateMap = new Map();
rawData.forEach((item) => {
  const dateStr = item.date;
  const isBlackout = item.isBlackout || false;
  const isBooked = item.count === 0;
  if (isBlackout || isBooked) {
    dateMap.set(dateStr, { isBlackout, isBooked: isBooked && !isBlackout });
  }
});

const sortedBlockedDates = Array.from(dateMap.keys())
  .filter(dateStr => {
    const d = parseDate(dateStr);
    return d.getTime() >= currentEndDateObj.getTime();
  })
  .sort();

console.log("sortedBlockedDates", sortedBlockedDates)

const firstBlockedDate = sortedBlockedDates.length > 0
  ? parseDate(sortedBlockedDates[0])
  : undefined;

console.log("firstBlockedDate:", firstBlockedDate);

const minDate = addDays(currentEndDateObj, 1);
const today = startOfToday();

const isDateDisabled = (date) => {
  if (date <= currentEndDateObj) return true;
  if (isBefore(date, today)) return true;

  const dateStr = formatDateLocal(date);
  const entry = dateMap.get(dateStr);

  if (entry?.isBlackout) return true;

  if (firstBlockedDate && date > firstBlockedDate) {
    return true;
  }

  if (firstBlockedDate && date.getTime() === firstBlockedDate.getTime()) {
    const blockedEntry = dateMap.get(formatDateLocal(firstBlockedDate));
    if (blockedEntry?.isBlackout) return true;
    return false;
  }

  return false;
};

console.log("isDateDisabled(minDate):", isDateDisabled(minDate));

