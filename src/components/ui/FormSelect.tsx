import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type Option = { value: string; label: string };

type FormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  placeholder?: string;
} & Omit<TextFieldProps, 'name' | 'select'>;

export default function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder,
  ...textFieldProps
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...textFieldProps}
          select
          label={label}
          value={field.value ?? ''}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          size="small"
          SelectProps={{ native: true }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f9fafb',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#f3f4f6' },
              '&.Mui-focused': {
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#028090',
                  borderWidth: 2,
                },
              },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#028090' },
            ...((textFieldProps.sx as object) || {}),
          }}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </TextField>
      )}
    />
  );
}
