import useSWR from "swr";
import { Book } from "../components/Tile";
import { jsonFetcher } from "../utils/jsonFetcher";

type BaseBookResponse = {
  isLoading: boolean;
  isError: any;
};

type AllBooksResponse = BaseBookResponse & {
  data: Book[];
}

type SinbgleBookResponse = BaseBookResponse & {
  data: Book;
}

export const useAllBooks = (): AllBooksResponse => {
  const { data, error } = useSWR("/api/books", jsonFetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error
  }
}

export const useBook = (id: string | undefined): SinbgleBookResponse => {
  const { data, error } = useSWR(`/api/books?id=${id}`, jsonFetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}