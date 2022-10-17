import { useState } from 'react'
import { useForm } from '@mantine/form';
import { Autocomplete, Box, Button, MultiSelect } from '@mantine/core';
import { useAllBooks } from '../hooks/useBooks';
import { ErrorMessage, LoadingMessage } from '../pages/book/[id]';
import { Book } from './Tile';
import { ReadingForm } from '../pages';
import { getStickyValue } from '../hooks/useStickyState';

type RecordFormProps = {
  initialValues?: any
  handleSubmit: (record: ReadingForm) => void;
}


const RecordForm = ({ initialValues, handleSubmit }: RecordFormProps) => {
  const { data: books, isError, isLoading } = useAllBooks();
  const [selectedBook, setSelectedBook] = useState<Book>();
  const [chapters, setChapters] = useState<string[]>([]);

  const handleBookChange = (bookName: string) => {
    setSelectedBook(books.find(book => book.name === bookName));
    form.setValues({ book: bookName });
  }

  const handleChapterChange = (chapters: string[]) => {
    setChapters(chapters.sort());
    form.setValues({ chapters });
  }

  const form = useForm({
    initialValues: {
      book: selectedBook?.name,
      chapters,
    },
    validate: {
      book: (value: string) => !value ? 'Please select a book' : null,
      chapters: (value) => !value ? 'Please select at least one chapter' : null,
    },
  });

  const handleFormSave = ({book, chapters}: {book: string | undefined, chapters: String[]}) => {
    handleSubmit({book, chapters: chapters.map(chapter => Number(chapter))})
  }

  
  if (isLoading) return <LoadingMessage />
  if (isError) return <ErrorMessage />
  
  const getBookChapters = (book: Book | undefined) => {
    const numChapters = book?.chapters;
    const readingRecord = getStickyValue('readingRecord');
    const readChapters = book && readingRecord && readingRecord[book?.name];
    let chapters: { value: string, label: string, group: string }[] = [];
    if (numChapters) {
      for (let i = 1; i <= numChapters; i++) {
        let group = "Chapters";
        if (readChapters && readChapters.includes(i)) {
          group = "Previously Read Chapters"
        }
        chapters.push({ value: i.toString(), label: i.toString(), group });
      }
    }
    return chapters
  }

  return (
    <Box>
      <form onSubmit={form.onSubmit((values) => handleFormSave({book: values.book, chapters: values.chapters}))}>
        <Autocomplete
          data={books.map((book) => book.name)}
          label="Bible Book"
          value={selectedBook?.name}
          {...form.getInputProps('book')}
          onChange={handleBookChange}
          placeholder="Begin typing to select"
        />
        <MultiSelect
          data={getBookChapters(selectedBook)}
          disabled={!selectedBook}
          label="Chapters"
          placeholder={
            selectedBook ? 'Chapters' : 'Chapters -- Select a book first'
          }
          searchable
          {...form.getInputProps('chapters')}
          onChange={handleChapterChange}
          value={chapters}
        />
        <Button type="submit">Save</Button>
      </form>
    </Box>
  );
}


export default RecordForm