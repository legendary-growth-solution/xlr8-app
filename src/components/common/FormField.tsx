import { TextField, TextFieldProps } from '@mui/material';

interface FormFieldProps extends Omit<TextFieldProps, 'variant'> {
  fullWidth?: boolean;
}

export default function FormField({ fullWidth = true, ...props }: FormFieldProps) {
  return (
    <TextField
      variant="outlined"
      fullWidth={fullWidth}
      {...props}
    />
  );
} 