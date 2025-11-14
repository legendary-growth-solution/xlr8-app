import { useState, useEffect } from 'react';

import { Box, TextField, Typography, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

interface PeopleCountSelectorProps {
  count: number;
  onChange: (count: number) => void;
  label?: string;
  min?: number;
  max?: number;
}

export function PeopleCountSelector({
  count,
  onChange,
  label = "Number of People",
  min = 1,
  max = 99
}: PeopleCountSelectorProps) {
  const [inputValue, setInputValue] = useState(() => count.toString());

  useEffect(() => {
    setInputValue(count.toString());
  }, [count]);

  const handleIncrement = () => {
    if (count < max) {
      onChange(count + 1);
    }
  };

  const handleDecrement = () => {
    if (count > min) {
      onChange(count - 1);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue === '') {
      setInputValue('');
      return;
    }

    if (nextValue.length > 2) {
      return;
    }

    const value = parseInt(nextValue, 10);
    if (Number.isNaN(value)) {
      setInputValue(nextValue);
      return;
    }

    if (value >= min && value <= max) {
      setInputValue(nextValue);
      onChange(value);
    } else {
      setInputValue(nextValue);
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      setInputValue(min.toString());
      onChange(min);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton 
          onClick={handleDecrement} 
          disabled={count <= min}
          size="small"
          sx={{ 
            border: 1, 
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main' }
          }}
        >
          <Iconify icon="eva:minus-fill" />
        </IconButton>
        
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          type="number"
          placeholder={min.toString()}
          inputProps={{ min, max, style: { textAlign: 'center' } }}
          sx={{ 
            width: 80,
            '& .MuiOutlinedInput-input': {
              textAlign: 'center'
            }
          }}
          size="small"
        />
        
        <IconButton 
          onClick={handleIncrement} 
          disabled={count >= max}
          size="small"
          sx={{ 
            border: 1, 
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main' }
          }}
        >
          <Iconify icon="eva:plus-fill" />
        </IconButton>
      </Box>
    </Box>
  );
}
