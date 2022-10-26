import { useState } from "react"
import { useForm } from "@mantine/form";
import { Autocomplete, Box, Button, Loader, MultiSelect } from "@mantine/core";
import { useAllBooks } from "../hooks/useBooks";
import { ErrorMessage } from "../pages/book/[id]";
import { Book } from "./Tile";
import { ReadingForm, ReadingRecord } from "../pages";
import { getStickyValue } from "../hooks/useStickyState";

type RecordFormProps = {
  handleSubmit: (record: ReadingForm) => void;
}


const RecordForm = ({  handleSubmit }: RecordFormProps) => {
  const { data: books, isError, isLoading } = useAllBooks();
  const [selectedBook, setSelectedBook] = useState<Book>();
  const [chapters, setChapters] = useState<string[]>([]);

  const handleBookChange = (bookName: string) => {
    setSelectedBook(books?.find(book => book.name === bookName));
    form.setValues({ book: bookName });
  }

  const handleChapterChange = (chapters: string[]) => {
    const sortedChapters = chapters.sort(
      (a: string, b: string) => Number(a) - Number(b)
    );
    setChapters(sortedChapters);
    form.setValues({ chapters: sortedChapters });
  }

  const form = useForm({
    initialValues: {
      book: selectedBook?.name,
      chapters,
    },
    validate: {
      book: (value: string) => !value ? "Please select a book" : null,
      chapters: (value) => !value ? "Please select at least one chapter" : null,
    },
  });

  const handleFormSave = ({ book, chapters }: {book: string | undefined, chapters: string[]}) => {
    handleSubmit({ book, chapters: chapters.map(chapter => Number(chapter)) })
  }


  if (isLoading) return <Loader />
  if (!books || isError) return <ErrorMessage />

  const getBookChapters = (book: Book | undefined) => {
    const numChapters = book?.chapters;
    const readingRecord = getStickyValue<ReadingRecord>("readingRecord");
    const readChapters = book && readingRecord && readingRecord[book?.name];
    const chaptersToAdd: { value: string, label: string, group: string }[] = [];
    const readChaptersToAdd: { value: string, label: string, group: string }[] = [];
    if (numChapters) {
      for (let i = 1; i <= numChapters; i++) {
        let group = "Chapters";
        if (readChapters && readChapters[i]) {
          group = "Previously Read Chapters";
          readChaptersToAdd.push({ value: i.toString(), label: i.toString(), group });
        } else {
          chaptersToAdd.push({ value: i.toString(), label: i.toString(), group });
        }
      }
    }
    return [...chaptersToAdd, ...readChaptersToAdd]
  }

  return (
    <Box>
      <form onSubmit={form.onSubmit((values) => handleFormSave({ book: values.book, chapters: values.chapters }))}>
        <Autocomplete
          data={books.map((book) => book.name)}
          label="Bible Book"
          value={selectedBook?.name}
          {...form.getInputProps("book")}
          onChange={handleBookChange}
          placeholder="Begin typing to select"
        />
        <MultiSelect
          data={getBookChapters(selectedBook)}
          disabled={!selectedBook}
          label="Chapters"
          placeholder={
            selectedBook ? "Chapters" : "Chapters -- Select a book first"
          }
          searchable
          {...form.getInputProps("chapters")}
          onChange={handleChapterChange}
          value={chapters}
        />
        <Button type="submit">Save</Button>
      </form>
    </Box>
  );
}


export default RecordForm