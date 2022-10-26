import { getStickyValue, setStickyValue } from "../hooks/useStickyState"

const LAST_DATE_PLAYED = "lastDayPlayed";

export const getLastDatePlayed = (): string | null => {
  return getStickyValue(LAST_DATE_PLAYED);
}

export const setLastDatePlayed = (date: Date) => {
  setStickyValue(LAST_DATE_PLAYED, date);
}