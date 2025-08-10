import { useState } from "react";
import { useForm } from "@mantine/form";
import { Autocomplete, Box, Button, Loader, MultiSelect } from "@mantine/core";
import { Book, useAllBooks } from "../hooks/useBooks";
import { ErrorMessage } from "../archive_pages/book/[id]";
import { ReadingForm } from "../archive_pages";

type RecordFormProps = {
  handleSubmit: (record: ReadingForm) => void;
};

const RecordForm = ({ handleSubmit }: RecordFormProps) => {
  const { data: books, isError, isLoading } = useAllBooks();
  const [selectedBook, setSelectedBook] = useState<Book>();

  const form = useForm<{ book: string; chapters: string[] }>({
    initialValues: {
      book: "",
      chapters: [],
    },
    validate: {
      book: (value) => (!value ? "Please select a book" : null),
      chapters: (value) =>
        !value || value.length === 0
          ? "Please select at least one chapter"
          : null,
    },
  });

  const handleBookChange = (bookName: string | null) => {
    const book = books?.find((book) => book.name === bookName);
    setSelectedBook(book);
    form.setFieldValue("book", bookName || "");
    // Reset chapters when book changes
    form.setFieldValue("chapters", []);
  };

  const handleChapterChange = (chapters: string[]) => {
    const sortedChapters = chapters
      ? [...chapters].sort((a: string, b: string) => Number(a) - Number(b))
      : [];
    form.setFieldValue("chapters", sortedChapters);
  };

  const handleFormSave = ({
    book,
    chapters,
  }: {
    book: string | undefined;
    chapters: string[];
  }) => {
    handleSubmit({
      book,
      chapters: chapters.map((chapter) => Number(chapter)),
    });
  };

  if (isLoading) return <Loader />;
  if (!books || isError) return <ErrorMessage />;

  const getBookChapters = (book: Book | undefined): string[] => {
    if (!book || !book.chapters) {
      return [];
    }

    const numChapters = book.chapters;
    // Create all chapters as simple string array
    const chapters: string[] = [];
    for (let i = 1; i <= numChapters; i++) {
      chapters.push(i.toString());
    }

    // Filter out already selected chapters
    const selectedChapters = form.values.chapters;
    return chapters.filter(chapter => !selectedChapters.includes(chapter));
  };

  return (
    <Box>
      <form
        onSubmit={form.onSubmit((values) =>
          handleFormSave({ book: values.book, chapters: values.chapters })
        )}
      >
        <Autocomplete
          data={books?.map((book) => book.name) || []}
          label="Bible Book"
          value={form.values.book}
          onChange={handleBookChange}
          error={form.errors.book}
          placeholder="Begin typing to select"
        />
        <MultiSelect
          data={getBookChapters(selectedBook)}
          disabled={!selectedBook}
          label="Chapters"
          placeholder={
            selectedBook
              ? form.values.chapters.length > 0
                ? "Add more chapters"
                : "Select chapters"
              : "Select a book first"
          }
          searchable
          clearable
          value={form.values.chapters}
          onChange={handleChapterChange}
          error={form.errors.chapters}
          nothingFoundMessage="All chapters selected"
        />
        <Button type="submit">Save</Button>
      </form>
    </Box>
  );
};

export default RecordForm;
