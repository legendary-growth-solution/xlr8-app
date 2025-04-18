export const formatLapTime = (time: number): string => {
  if (!time) return '0.00s';
    const formattedTime = time.toString().length >= 4 
    ? (time / 100).toFixed(2)
    : time.toFixed(2);
    
  return `${formattedTime}s`;
}; 