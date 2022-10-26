import { useState } from "react";
import type { NextPage } from "next";
import { Loader } from "@mantine/core";
import GridLayout from "../components/Grid";
import { BookTile } from "../components/Tile";
import { useAllBooks } from "../hooks/useBooks";
import useStickyState, { getStickyValue, setStickyValue } from "../hooks/useStickyState";
import ModalButton from "../components/ModalButton";
import RecordForm from "../components/RecordForm";
import { sortNumerically } from "../utils/sortNumerically";

export type ReadingRecord = {
  [book: string]: number[];
}

export type ReadingForm = {
  book: string | undefined;
  chapters: number[];
}

export type BookRecord = {
  [chapter: string]:  Date[];
};

export const sortAndRemoveDuplicateChapters = (chapters: number[]) => {
  chapters = sortNumerically(chapters);
  const alreadySeenChapters: {[chapter: number]: boolean} = {};
  return chapters.filter((chapter) => {
    return alreadySeenChapters[chapter] ? false : (alreadySeenChapters[chapter] = true);
  });
}

const Home: NextPage = () => {
  const { data: books, isError, isLoading } = useAllBooks();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDoneRecordingToday, setIsDoneRecordingToday] = useStickyState<boolean>(false, "isDoneRecordingToday");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [readingRecord, setReadingRecord] = useStickyState<ReadingRecord>({}, "readingRecord");

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleSubmitRecord = (record: ReadingForm) => {
    const { book, chapters } = record;
    if (!book) {
      return;
    }
    // Get existing record from local storage.
    // Doing this twice until ready to cut over to new method.
    const currentRecord = getStickyValue<ReadingRecord>("readingRecord");
    const currentBookRecord = getStickyValue<BookRecord>(book);

    let newBookRecord: BookRecord = {};

    const date = new Date();
    date.setHours(0, 0, 0, 0);

    // Use original localstorage to update new version of local storage
    if (!currentBookRecord || Object.keys(currentBookRecord).length === 0) {
      if (currentRecord && currentRecord[book]) {
          newBookRecord =
            currentRecord[book].reduce((acc: BookRecord, chapter) => {
              return (acc[chapter] = [date]), acc;
            }, {}) || {};
      }
    }

    chapters.forEach(chapter => {
      if (currentBookRecord && currentBookRecord[chapter]) {
        if (currentBookRecord[chapter].indexOf(date) !== -1) {
          newBookRecord[chapter].push(date)
        }
      } else {
        newBookRecord[chapter] = [date]
      }
    })
    setStickyValue(book, newBookRecord);
    setIsDoneRecordingToday(true);
    handleModalClose();
  }

  if (isLoading) return <Loader />
  if (isError) return <span>Uh Oh! Something went wrong!</span>

  return (
    <>
        <section>
          <div style={{ textAlign: "center" }}>
            {isDoneRecordingToday ? "Great job doing your reading! Need to record more?" : "Record today's Bible reading?"}
            <br />
            <ModalButton buttonLabel='📖' opened={isModalOpen} closeModal={handleModalClose} openModal={handleModalOpen}><></><RecordForm handleSubmit={handleSubmitRecord}/></ModalButton>
          </div>
        </section>
        <GridLayout>
          {books.map((book, i) => {
            return <BookTile book={book} bookId={i} key={i} />;
          })}
        </GridLayout>
          </>
  );
}

export default Home
