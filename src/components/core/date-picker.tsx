import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField, TextFieldProps } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  maxDate?: Dayjs;
  minDate?: Dayjs;
}

export function ModernDatePicker({
  label,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  maxDate,
  minDate,
}: DatePickerProps) {
  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      onChange(newValue.format('YYYY-MM-DD'));
    } else {
      onChange('');
    }
  };

  const dayjsValue = value ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={dayjsValue}
        onChange={handleDateChange}
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        slotProps={{
          textField: {
            fullWidth: true,
            error: error,
            helperText: helperText,
            InputLabelProps: { shrink: true },
            placeholder: 'Select date...',
          } as TextFieldProps,
          popper: {
            sx: {
              '& .MuiPaper-root': {
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                borderRadius: '12px',
              },
            },
          },
        }}
        sx={{
          '& .MuiInputBase-root': {
            borderRadius: '8px',
          },
        }}
      />
    </LocalizationProvider>
  );
} 