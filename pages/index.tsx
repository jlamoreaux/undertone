import { useState } from "react";
import type { NextPage } from "next";
import { Loader } from "@mantine/core";
import GridLayout from "../components/Grid";
import { BookTile } from "../components/Tile";
import { useAllBooks, ChaptersRead } from "../hooks/useBooks";
import useStickyState, { getStickyValue, setStickyValue } from "../hooks/useStickyState";
import ModalButton from "../components/ModalButton";
import RecordForm from "../components/RecordForm";
import { convertFromLegacyStorage, sortNumerically } from "../utils";

export type ReadingRecord = {
  [book: string]: number[];
}

export type ReadingForm = {
  book: string | undefined;
  chapters: number[];
}

const STICKY_IS_DONE_READING_TODAY = "isDoneRecordingToday";

export const sortAndRemoveDuplicateChapters = (chapters: number[]) => {
  chapters = sortNumerically(chapters);
  const alreadySeenChapters: {[chapter: number]: boolean} = {};
  return chapters.filter((chapter) => {
    return alreadySeenChapters[chapter] ? false : (alreadySeenChapters[chapter] = true);
  });
}

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
  const newBookRecord: ChaptersRead = {};

  const date = new Date();
  date.setHours(0, 0, 0, 0);

  chapters.forEach((chapter) => {
    if (currentBookRecord && currentBookRecord[chapter]) {
      if (currentBookRecord[chapter].indexOf(date) !== -1) {
        newBookRecord[chapter].push(date);
      }
    } else {
      newBookRecord[chapter] = [date];
    }
  });
  setStickyValue(book, newBookRecord);
}

const Home: NextPage = () => {
  const { data: books, isError, isLoading } = useAllBooks();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDoneRecordingToday, setIsDoneRecordingToday] =
    useStickyState<boolean>(false, STICKY_IS_DONE_READING_TODAY);

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleSubmitRecord = (record: ReadingForm) => {
    recordReading(record);
    setIsDoneRecordingToday(true);
    handleModalClose();
  };

  // check if they are using legacy local storage
  const version = getStickyValue("version");
  if (!version) {
    convertFromLegacyStorage();
  }


  if (isLoading) return <Loader />;
  if (!books || isError) return <span>Uh Oh! Something went wrong!</span>;

  return (
    <>
      <section>
        <div style={{ textAlign: "center" }}>
          {isDoneRecordingToday
            ? "Great job doing your reading! Need to record more?"
            : "Record today's Bible reading?"}
          <br />
          <ModalButton
            buttonLabel="📖"
            opened={isModalOpen}
            closeModal={handleModalClose}
            openModal={handleModalOpen}
          >
            <></>
            <RecordForm handleSubmit={handleSubmitRecord} />
          </ModalButton>
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
