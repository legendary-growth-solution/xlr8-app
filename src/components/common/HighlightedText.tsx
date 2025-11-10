import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface HighlightedTextProps extends Omit<TypographyProps, 'children'> {
  text: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  ...typographyProps
}) => {
  if (!text.includes('<em>')) {
    return <Typography {...typographyProps}>{text}</Typography>;
  }

  const parts = text.split(/(<em>|<\/em>)/);

  return (
    <Typography {...typographyProps}>
      {parts.map((part, index) => {
        if (part === '<em>' || part === '</em>') {
          return null;
        }

        const isEmphasized = parts[index - 1] === '<em>' && parts[index + 1] === '</em>';

        if (isEmphasized) {
          return (
            <span
              key={index}
              style={{
                backgroundColor: 'rgba(255, 193, 7, 0.16)',
                padding: '2px 4px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {part}
            </span>
          );
        }

        return part;
      })}
    </Typography>
  );
};
