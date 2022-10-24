import useSWR from "swr";
import { Book } from "../components/Tile";
import { jsonFetcher } from "../utils/jsonFetcher";
import { getStickyValue } from "../hooks/useStickyState";
import { ReadingRecord } from "../pages";

type BaseBookResponse = {
  isLoading: boolean;
  isError: Error | undefined;
};

type AllBooksResponse = BaseBookResponse & {
  data: Book[];
}

export type SingleBookResponse = BaseBookResponse & {
  data: Book | undefined;
}

export type ChaptersRead = {
  [key: number]: boolean;
}


export const useAllBooks = (): AllBooksResponse => {
  const { data, error } = useSWR("/api/books", jsonFetcher);

  if (data) {
    const readingRecord = getStickyValue<ReadingRecord>("readingRecord");
    if (readingRecord) {
      Object.keys(readingRecord).forEach(book => {
        data.find((b: Book) => b.name === book).chaptersRead =
          readingRecord[book].reduce((acc: ChaptersRead, chapter) => {
            return (acc[chapter] = true), acc;
          }, {}) || {};
      })
    }
  }

  return {
    data,
    isLoading: !error && !data,
    isError: error
  }
}

export const useBook = (id: string | undefined): SingleBookResponse => {
  const { data, error } = useSWR<Book, Error>(`/api/books?id=${id}`, jsonFetcher);

  if (data) {
    const readingRecord = getStickyValue<ReadingRecord>("readingRecord")
    if (readingRecord) {
      data.chaptersRead =
        readingRecord[data.name].reduce((acc: ChaptersRead, chapter) => {
          return (acc[chapter] = true), acc;
        }, {}) || {};
    }
  }

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}