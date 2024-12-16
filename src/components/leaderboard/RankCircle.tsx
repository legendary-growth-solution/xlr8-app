import { alpha, keyframes, styled } from '@mui/material/styles';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 167, 38, 0.4);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(255, 167, 38, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 167, 38, 0);
  }
`;

const StyledRankCircle = styled('div')<{ rank: number }>(({ theme, rank }) => ({
  fontSize: '1.5rem',
  fontWeight: rank <= 3 ? 'bold' : 'normal',
  color: getRankColor(rank, theme, true),
  borderRadius: '50%',
  border: `2px solid ${getRankColor(rank, theme, true)}`,
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto',
  ...(rank === 1 && {
    animation: `${pulseAnimation} 5s infinite`,
  }),
}));

const getRankColor = (rank: number, theme: any, primary: boolean = false) => {
  switch (rank) {
    case 1:
      return primary ? theme.palette.warning.main : alpha(theme.palette.warning.main, 0.1);
    case 2:
      return primary ? '#C0C0C0' : alpha('#C0C0C0', 0.1);
    case 3:
      return primary ? '#CD7F32' : alpha('#CD7F32', 0.1);
    default:
      return primary ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.1);
  }
};

interface RankCircleProps {
  rank: number;
}

export const RankCircle = ({ rank }: RankCircleProps) => <StyledRankCircle rank={rank}>{rank}</StyledRankCircle>;

