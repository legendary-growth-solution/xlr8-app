export type LiveLeaderboardEntry = {
  rank: number;
  name: string;
  cartName: string;
  groupName: string;
  totalLaps: number;
  bestLapTime: number | null;
  timeInMinutes: number;
  raceStatus: string;
  endTime: string | null;
}; 