import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Card, keyframes } from '@mui/material';
import { RegistrationForm } from '../components/register/RegistrationForm';
import { SuccessMessage } from '../components/register/SuccessMessage';
import { PageContainer } from '../components/register/PageContainer';
import { Logo } from '../components/register/Logo';

export default function RegisterUserPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <PageContainer>
      <Helmet>
        <title>Register User</title>
      </Helmet>

      <Logo />

      <Card 
        sx={{ 
          p: 4, 
          maxWidth: 600, 
          width: '100%',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 2,
        }}
      >
        {isSuccess ? (
          <SuccessMessage />
        ) : (
          <RegistrationForm onSuccess={() => setIsSuccess(true)} />
        )}
      </Card>
    </PageContainer>
  );
}
