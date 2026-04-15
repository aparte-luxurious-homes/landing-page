import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type FormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
} & Omit<TextFieldProps, 'name'>;

export default function FormField<T extends FieldValues>({
  name,
  control,
  label,
  ...textFieldProps
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const isPasswordField = name.toLowerCase().includes('password');
        return (
        <TextField
          {...field}
          {...textFieldProps}
          label={label}
          value={field.value ?? ''}
          onChange={(e) => {
            const val = isPasswordField
              ? e.target.value.replace(/\s/g, '')
              : e.target.value;
            field.onChange(val);
          }}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          size="small"
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
        />
      ); }}
    />
  );
}
