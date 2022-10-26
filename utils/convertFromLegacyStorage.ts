import { ChaptersRead } from "../hooks/useBooks";
import { getStickyValue, clearStickyValues, setStickyValue } from "../hooks/useStickyState";
import { ReadingRecord, saveChaptersRead } from "../pages";

const IS_DONE_READING_TODAY = "isDoneRecordingToday";

export const convertFromLegacyStorage = () => {
  // Get existing record from local storage.
  const legacyRecord = getStickyValue<ReadingRecord>("readingRecord");

  if (legacyRecord) {
    // Convert to new version of storage
    const booksToConvert = Object.keys(legacyRecord);
    booksToConvert.forEach((book) => {
      const bookRecord = getStickyValue<ChaptersRead>(book);
      if (!bookRecord) {

        const chaptersRead: ChaptersRead = {};
        legacyRecord[book].forEach((chapter) => {
          chaptersRead[chapter];
        });

        saveChaptersRead({ book, chaptersRead });
      }
    });
    clearStickyValues(["readingRecord"]);
    clearStickyValues([IS_DONE_READING_TODAY]);
  }
  setStickyValue("version", "1.0");
};
