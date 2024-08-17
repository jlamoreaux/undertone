import { getLastDateRecorded, getStartOfStreak } from "./stickyValues";

export const getStreakLength = (): number => {
  const startOfStreak = getStartOfStreak();
  const lastDayRecorded = getLastDateRecorded();
  if (!startOfStreak) {
    return 0;
  }
  if (lastDayRecorded && new Date(lastDayRecorded).getTime() !== new Date().setHours(0, 0, 0, 0)) {
    return 0;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const streakStart = new Date(startOfStreak);
  streakStart.setHours(0, 0, 0, 0);
  const timeDiff = today.getTime() - streakStart.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
}