import { ChaptersRead } from "../../hooks/useBooks";
import { setStickyValue, getStickyValue } from "../../hooks/useStickyState";
import { setLastDatePlayed } from "../../utils";

export type ReadingRecord = {
  [book: string]: number[];
};

export type ReadingForm = {
  book: string | undefined;
  chapters: number[];
};

export const saveChaptersRead = ({
  book,
  chaptersRead,
}: {
  book: string;
  chaptersRead: ChaptersRead;
}) => {
  setStickyValue<ChaptersRead>(book, chaptersRead);
};

export const recordReading = (record: ReadingForm) => {
  const { book, chapters } = record;
  if (!book) {
    return;
  }

  const currentBookRecord = getStickyValue<ChaptersRead>(book);
  const newBookRecord: ChaptersRead = currentBookRecord || {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  chapters.forEach((chapter) => {
    if (currentBookRecord && currentBookRecord[chapter]) {
      if (currentBookRecord[chapter].indexOf(today) !== -1) {
        newBookRecord[chapter].push(today);
      }
      return;
    } else {
      newBookRecord[chapter] = [today];
    }
  });
  setStickyValue(book, newBookRecord);
  setLastDatePlayed(today);

  // Return the book that was updated for sync tracking
  return book;
};
