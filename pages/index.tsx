import { useState } from "react";
import type { NextPage } from "next";
import { Loader } from "@mantine/core";
import GridLayout from "../components/Grid";
import { BookTile } from "../components/tiles/BookTile";
import { useAllBooks, ChaptersRead } from "../hooks/useBooks";
import { getStickyValue, setStickyValue } from "../hooks/useStickyState";
import ModalButton from "../components/ModalButton";
import RecordForm from "../components/RecordForm";
import { convertFromLegacyStorage, getLastDatePlayed, setLastDatePlayed, sortNumerically } from "../utils";

export type ReadingRecord = {
  [book: string]: number[];
}

export type ReadingForm = {
  book: string | undefined;
  chapters: number[];
}

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
}

const checkIfRecordedToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDatePlayed = getLastDatePlayed();
  if (!lastDatePlayed || new Date(lastDatePlayed) < today) {
    return false
  }
  return true;
};

const Home: NextPage = () => {
  const { data: books, isError, isLoading } = useAllBooks();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDoneRecordingToday, setIsDoneRecordingToday] = useState<boolean>(checkIfRecordedToday());

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
        <div style={{ textAlign: "center", display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
          <span style={{ margin: "8px" }}>
          {isDoneRecordingToday
            ? "Great job doing your reading! Need to record more?"
            : "Record today's Bible reading?"}
          </span>
          <ModalButton
            buttonLabel="📖"
            buttonTitle="Record Your Reading"
            modalTitle="Record your reading for the day"
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
