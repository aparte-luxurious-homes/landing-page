import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  startOfToday,
} from "date-fns";
import { Paper, Typography, IconButton, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CloseIcon from "@mui/icons-material/Close";

interface DateInputProps {
  onClose: () => void;
  onDateSelect: (date: Date) => void;
}

const DateInput: React.FC<DateInputProps> = ({ onClose, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Handlers for navigating months
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Function to render calendar days
  const renderCalendar = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    return (
      <Grid container spacing={1}>
        {/* Days Header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Grid size={{ xs: 1.7 }} key={day}>
            <Typography
              variant="subtitle2"
              align="center"
              color="textSecondary"
            >
              {day}
            </Typography>
          </Grid>
        ))}
        {/* Calendar Days */}
        {days.map((day) => (
          <Grid size={{ xs: 1.7 }} key={day.toString()}>
            <Paper
              elevation={1}
              className={`p-2 text-center ${
                isSameMonth(day, currentMonth)
                  ? "bg-white"
                  : "bg-gray-100 text-gray-400"
              }`}
              sx={{
                padding: 1,
                textAlign: "center",
                backgroundColor: isSameMonth(day, currentMonth)
                  ? "white"
                  : "grey.100",
                color: isSameMonth(day, currentMonth)
                  ? "text.primary"
                  : "text.disabled",
              }}
              onClick={() => onDateSelect(day)}
            >
              <Typography>{format(day, "d")}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        p: 2,
        zIndex: 40,
      }}
    >
      <Grid container justifyContent="flex-end" mb={2}>
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: "lightgray",
            borderRadius: "50%",
            p: 1,
          }}
        >
          <CloseIcon sx={{ color: "black" }} />
        </IconButton>
      </Grid>
      {/* Calendar Header */}
      {/* Navigation Buttons */}
      <Grid container justifyContent="flex-end" spacing={1}>
        <Grid></Grid>
        <Grid></Grid>
      </Grid>

      {/* Render Calendar Days */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <IconButton
              onClick={handlePrevMonth}
              disabled={isBefore(currentMonth, startOfToday())}
            >
              <NavigateBeforeIcon
                sx={{
                  color: isBefore(currentMonth, startOfToday())
                    ? "grey.500"
                    : "inherit",
                }}
              />
            </IconButton>
            <Box flexGrow={1} textAlign="center">
              <Typography variant="h6" gutterBottom>
                {format(currentMonth, "MMMM yyyy")}
              </Typography>
            </Box>
          </Grid>
          {renderCalendar(currentMonth)}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Box flexGrow={1} textAlign="center">
              <Typography variant="h6" gutterBottom>
                {format(addMonths(currentMonth, 1), "MMMM yyyy")}
              </Typography>
            </Box>
            <IconButton onClick={handleNextMonth}>
              <NavigateNextIcon sx={{ color: "inherit" }} />
            </IconButton>
          </Grid>
          {renderCalendar(addMonths(currentMonth, 1))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DateInput;
