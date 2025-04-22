import { useEffect, useRef } from 'react';
import { Box, keyframes, styled, useTheme } from '@mui/material';
import { Iconify } from 'src/components/iconify';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const transformAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
  20% {
    transform: translateY(-20px) rotate(0);
    opacity: 0;
  }
  30% {
    transform: translateY(20px) rotate(0);
    opacity: 0;
  }
  40% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 1;
  }
`;

const sparkAnimation = keyframes`
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(var(--tx), var(--ty)) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(var(--tx) * 2), calc(var(--ty) * 2)) scale(0);
    opacity: 0;
  }
`;

const sparkAnimationCSS = `
  @keyframes sparkAnim {
    0% {
      transform: translate(0, 0) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(var(--tx), var(--ty)) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(calc(var(--tx) * 2), calc(var(--ty) * 2)) scale(0);
      opacity: 0;
    }
  }
`;

const AnimationContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 180,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const BookingIcon = styled(Iconify)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.primary.main,
  animation: `${pulseAnimation} 2s infinite`,
}));

const TransformingIcon = styled(Iconify)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.primary.main,
  position: 'absolute',
  animation: `${transformAnimation} 3s infinite`,
}));

const SessionIcon = styled(Iconify)(({ theme }) => ({
  fontSize: 64,
  color: theme.palette.success.main,
}));

const Spark = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: theme.palette.warning.main,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  animation: `${sparkAnimation} 1s infinite linear`,
}));

interface ConversionAnimationProps {
  state: 'initial' | 'processing' | 'complete';
}

export default function ConversionAnimation({ state }: ConversionAnimationProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!document.getElementById('spark-keyframes')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'spark-keyframes';
      styleEl.innerHTML = sparkAnimationCSS;
      document.head.appendChild(styleEl);
      
      return () => {
        const styleElement = document.getElementById('spark-keyframes');
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
      };
    }
    return undefined;
  }, []);
  
  useEffect(() => {
    if (containerRef.current && state === 'processing') {
      const container = containerRef.current;
      
      const existingSparks = container.querySelectorAll('.spark');
      existingSparks.forEach((spark) => {
        if (spark.parentNode) {
          spark.parentNode.removeChild(spark);
        }
        return undefined;
      });
      
      for (let i = 0; i < 8; i += 1) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.setProperty('--tx', `${(Math.random() * 100 - 50)}px`);
        spark.style.setProperty('--ty', `${(Math.random() * 100 - 50)}px`);
        spark.style.position = 'absolute';
        spark.style.width = '8px';
        spark.style.height = '8px';
        spark.style.borderRadius = '50%';
        spark.style.backgroundColor = theme.palette.warning.main;
        spark.style.top = '50%';
        spark.style.left = '50%';
        spark.style.transform = 'translate(-50%, -50%)';
        spark.style.animation = `sparkAnim ${0.5 + Math.random() * 1}s infinite`;
        spark.style.animationDelay = `${Math.random() * 0.5}s`;
        spark.style.opacity = '0';
        
        container.appendChild(spark);
      }
      
      return () => {
        const sparks = container.querySelectorAll('.spark');
        sparks.forEach((spark) => {
          if (spark.parentNode) {
            spark.parentNode.removeChild(spark);
          }
          return undefined;
        });
      };
    }
    return undefined;
  }, [state, theme.palette.warning.main]);
  
  return (
    <AnimationContainer ref={containerRef}>
      {state === 'initial' && (
        <BookingIcon sx={{ fontSize: '64px' }} icon="mdi:calendar-clock" />
      )}
      {state === 'processing' && (
        <>
          <TransformingIcon icon="mdi:calendar-clock" />
          <TransformingIcon icon="mdi:flag-checkered" sx={{ opacity: 0.5, animationDelay: '1.5s' }} />
        </>
      )}
      
      {state === 'complete' && (
        <SessionIcon icon="mdi:flag-checkered" />
      )}
    </AnimationContainer>
  );
} 