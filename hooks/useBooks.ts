import useSWR from "swr";
import { Book } from "../components/Tile";
import { jsonFetcher } from "../utils";
import { getStickyValue } from "../hooks/useStickyState";

type BaseBookResponse = {
  isLoading: boolean;
  isError: Error | undefined;
};

type AllBooksResponse = BaseBookResponse & {
  data: Book[] | undefined;
}

export type SingleBookResponse = BaseBookResponse & {
  data: Book | undefined;
}

export type ChaptersRead = {
  [chapter: number]: Date[];
}


export const useAllBooks = (): AllBooksResponse => {
  const { data, error } = useSWR<Book[], Error>("/api/books", jsonFetcher);

  if (data) {
    data.forEach((book, i) => {
      data[i].chaptersRead = getStickyValue<ChaptersRead>(book.name);
    })
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
    data.chaptersRead = getStickyValue<ChaptersRead>(data.name)
  }

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}