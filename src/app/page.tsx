"use client";

import { useState, useEffect, useRef } from "react";
import { Loader, Text, Box } from "@mantine/core";
import { useAllBooks } from "../../hooks/useBooks";
import GridLayout from "../../components/Grid";
import { BookTile } from "../../components/tiles/BookTile";
import ModalButton from "../../components/ModalButton";
import RecordForm from "../../components/RecordForm";
import {
  convertFromLegacyStorage,
  getLastDatePlayed,
} from "../../utils";
import { getStickyValue } from "../../hooks/useStickyState";
import { useAuth } from "@/contexts/AuthContext";
import { ReadingForm, recordReading } from "@/utils/readingUtils";

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

      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Set a new timeout for 3 seconds
      syncTimeoutRef.current = setTimeout(() => {

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
