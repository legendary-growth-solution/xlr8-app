import { Tooltip, Typography, type TypographyProps } from '@mui/material';

interface TruncatedTextProps extends Omit<TypographyProps, 'children'> {
  text: string;
  maxLength?: number;
}

export function TruncatedText({ text, maxLength = 30, ...typographyProps }: TruncatedTextProps) {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  if (!shouldTruncate) {
    return <Typography {...typographyProps} noWrap>{text}</Typography>;
  }

  return (
    <Tooltip title={text} arrow placement="top">
      <Typography {...typographyProps} noWrap sx={{ cursor: 'default', ...typographyProps.sx }}>
        {displayText}
      </Typography>
    </Tooltip>
  );
}

