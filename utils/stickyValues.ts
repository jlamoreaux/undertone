import { getStickyValue, setStickyValue } from "../hooks/useStickyState"

const LAST_DATE_RECORDED = "lastDayRecorded";
const START_OF_STREAK = "startOfStreak";

export const getLastDateRecorded = (): string | null => {
  return getStickyValue(LAST_DATE_RECORDED);
}

export const setLastDateRecorded = (date: Date) => {
  setStickyValue(LAST_DATE_RECORDED, date);
};

export const getStartOfStreak = (): string | null => {
  return getStickyValue(START_OF_STREAK);
};

export const setStartOfStreak = (date: Date) => {
  setStickyValue(START_OF_STREAK, date);
};