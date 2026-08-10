import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  TextField,
  ListSubheader,
  InputAdornment,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import ccData from './ccData.json';

export interface CountryItem {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const COUNTRY_LIST: CountryItem[] = ccData.map((item) => ({
  ...item,
  flag: getFlagEmoji(item.code),
}));

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  sx?: any;
  size?: 'small' | 'medium';
}

export function CountryCodeSelect({ value, onChange, sx, size = 'medium' }: CountryCodeSelectProps) {
  const [search, setSearch] = useState('');

  const filteredCountries = COUNTRY_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial_code.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRY_LIST.find((c) => c.dial_code === value) || {
    flag: '🇮🇳',
    dial_code: value || '+91',
    name: 'India',
  };

  return (
    <Select
      value={value || '+91'}
      onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
      size={size}
      sx={sx}
      renderValue={() => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <span>{selectedCountry.flag}</span>
          <Typography variant="body2" fontWeight={600}>
            {selectedCountry.dial_code}
          </Typography>
        </Box>
      )}
      MenuProps={{
        PaperProps: {
          sx: { maxHeight: 350, width: 300 },
        },
        autoFocus: false,
      }}
    >
      <ListSubheader
        sx={{
          p: 1,
          backgroundColor: 'background.paper',
        }}
      >
        <TextField
          size="small"
          autoFocus
          placeholder="Search country or code..."
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </ListSubheader>

      {filteredCountries.map((country, index) => (
        <MenuItem key={`${country.code}-${country.dial_code}-${index}`} value={country.dial_code}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body1">{country.flag}</Typography>
            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {country.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {country.dial_code}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
