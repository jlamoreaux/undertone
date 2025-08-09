"use client";

import { useState, useEffect, useRef } from "react";
import { Loader, Text, Box } from "@mantine/core";
import { useAllBooks, ChaptersRead } from "../../hooks/useBooks";
import GridLayout from "../../components/Grid";
import { BookTile } from "../../components/tiles/BookTile";
import ModalButton from "../../components/ModalButton";
import RecordForm from "../../components/RecordForm";
import {
  convertFromLegacyStorage,
  getLastDatePlayed,
  setLastDatePlayed,
  sortNumerically,
} from "../../utils";
import { getStickyValue, setStickyValue } from "../../hooks/useStickyState";
import { useAuth } from "@/contexts/AuthContext";

export type ReadingRecord = {
  [book: string]: number[];
};

export type ReadingForm = {
  book: string | undefined;
  chapters: number[];
};

export const sortAndRemoveDuplicateChapters = (chapters: number[]) => {
  chapters = sortNumerically(chapters);
  const alreadySeenChapters: { [chapter: number]: boolean } = {};
  return chapters.filter((chapter) => {
    return alreadySeenChapters[chapter]
      ? false
      : (alreadySeenChapters[chapter] = true);
  });
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

const checkIfRecordedToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDatePlayed = getLastDatePlayed();
  if (!lastDatePlayed || new Date(lastDatePlayed) < today) {
    return false;
  }
  return true;
};

export default function HomePage() {
  const { data: books, isError, isLoading } = useAllBooks();
  const { performSync, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDoneRecordingToday, setIsDoneRecordingToday] = useState<boolean>(
    checkIfRecordedToday()
  );
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastUpdatedBook, setLastUpdatedBook] = useState<string | null>(null);

  // Effect to trigger sync after reading activity with debounce
  useEffect(() => {
    if (lastUpdatedBook && user) {
      console.log(`Reading activity detected for book: ${lastUpdatedBook}, scheduling sync...`);
      
      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      // Set a new timeout for 3 seconds
      syncTimeoutRef.current = setTimeout(() => {
        console.log('Triggering automatic sync after reading activity');
        performSync();
        setLastUpdatedBook(null);
      }, 3000); // 3 second debounce
    }
    
    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [lastUpdatedBook, user, performSync]);

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleSubmitRecord = (record: ReadingForm) => {
    const updatedBook = recordReading(record);
    if (updatedBook) {
      setLastUpdatedBook(updatedBook);
    }
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
      <Box style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "8px" }}>Undrtone</h1>
        <Text size="sm" c="dimmed">Your Bible Reading Tracker</Text>
      </Box>
      <section>
        <Box
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "16px"
          }}
        >
          <Text style={{ margin: "8px" }}>
            {isDoneRecordingToday
              ? "Great job doing your reading! Need to record more?"
              : "Record today's Bible reading?"}
          </Text>
          <ModalButton
            buttonLabel="📖"
            buttonTitle="Record Your Reading"
            modalTitle="Record your reading for the day"
            opened={isModalOpen}
            closeModal={handleModalClose}
            openModal={handleModalOpen}
          >
            {isModalOpen && <RecordForm handleSubmit={handleSubmitRecord} />}
          </ModalButton>
        </Box>
      </section>
      <GridLayout>
        {books.map((book, i) => {
          return <BookTile book={book} bookId={i} key={book.name} />;
        })}
      </GridLayout>
    </>
  );
}
