'use client';

import React, { useMemo } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { useGetLocationSuggestionsQuery } from "../../api/propertiesApi";

interface LocationOption {
  name: string;
  count: number;
  kind: "city" | "state";
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired when the guest picks a known city/state, not free-typed text. */
  onSelectOption?: (option: LocationOption) => void;
  onClose: () => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onSelectOption,
  onClose,
}) => {
  const { data } = useGetLocationSuggestionsQuery();

  const options: LocationOption[] = useMemo(() => {
    const cities = data?.data?.cities ?? [];
    const states = data?.data?.states ?? [];
    const merged = new Map<string, LocationOption>();
    for (const c of cities) {
      const key = c.name.toLowerCase();
      merged.set(key, { name: c.name, count: c.count, kind: "city" });
    }
    for (const s of states) {
      const key = s.name.toLowerCase();
      const existing = merged.get(key);
      if (!existing || s.count > existing.count) {
        merged.set(key, { name: s.name, count: s.count, kind: "state" });
      }
    }
    return Array.from(merged.values()).sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <Box className="relative">
      <Autocomplete
        freeSolo
        inputValue={value}
        onInputChange={(_, newInput) => onChange(newInput)}
        onChange={(_, selected) => {
          if (typeof selected === "string") {
            onChange(selected);
          } else if (selected) {
            onChange(selected.name);
            onSelectOption?.(selected);
          }
          onClose();
        }}
        options={options}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.name)}
        renderOption={(props, option) => (
          <li {...props} key={`${option.kind}-${option.name}`}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span>{option.name}</span>
              <span style={{ color: "#888", fontSize: "0.8em" }}>
                {option.count} {option.count === 1 ? "property" : "properties"}
              </span>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            size="small"
            placeholder="Try “2 bedroom in Lekki under 150k with a pool”"
            sx={{
              backgroundColor: "white",
              borderRadius: "10px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                fontSize: "0.875rem",
                "& fieldset": { borderColor: "#e5e7eb" },
                "&:hover fieldset": { borderColor: "#0e7490" },
                "&.Mui-focused fieldset": { borderColor: "#0e7490" },
              },
            }}
          />
        )}
        sx={{ width: "100%" }}
      />
    </Box>
  );
};

export default LocationInput;
