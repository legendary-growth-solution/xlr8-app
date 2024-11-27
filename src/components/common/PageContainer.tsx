import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function PageContainer({ title, children }: PageContainerProps) {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </>
  );
} 