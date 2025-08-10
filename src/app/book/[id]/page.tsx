"use client";

import { useParams } from "next/navigation";
import { Loader, ActionIcon, Title, Group } from "@mantine/core";
import GridLayout from "../../../../components/Grid";
import { ChapterTile } from "../../../../components/tiles/ChapterTile";
import { useBook } from "../../../../hooks/useBooks";
import Link from "next/link";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { recordReading } from "@/utils/readingUtils";
import { useAuth } from "@/contexts/AuthContext";

const ErrorMessage = () => <div>Uh oh! Something went wrong!</div>;

interface BookPageHeaderProps {
  pageTitle: string;
  isRecording: boolean;
  cancelRecording: () => void;
  saveRecording: () => void;
}

interface ChapterSelection {
  [key: number]: boolean;
}

const BookPageHeader = ({
  pageTitle,
  isRecording,
  cancelRecording,
  saveRecording,
}: BookPageHeaderProps) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "24px"
    }}>
      <Group gap="sm">
        <Link href="/">
          <ActionIcon
            title="Go Back"
            aria-label="Go Back"
            variant="subtle"
            size="lg"
          >
            <IconArrowLeft size={24} />
          </ActionIcon>
        </Link>
        {isRecording && (
          <>
            <ActionIcon
              onClick={cancelRecording}
              title="Cancel"
              aria-label="cancel"
              variant="subtle"
              size="lg"
            >
              <IconX size={24} color="red" />
            </ActionIcon>
            <ActionIcon
              onClick={saveRecording}
              title="Save"
              aria-label="save"
              variant="subtle"
              size="lg"
            >
              <IconCheck size={24} color="green" />
            </ActionIcon>
          </>
        )}
      </Group>
      <Title order={2} style={{ textAlign: "center", flex: 1 }}>
        {pageTitle}
      </Title>
      <div style={{ width: "48px" }}></div>
    </div>
  );
};

export default function BookPage() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [chapterSelection, setChapterSelection] = useState<ChapterSelection>(
    {}
  );
  const params = useParams();
  const id = params.id as string;
  const { performSync, user } = useAuth();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastUpdatedBook, setLastUpdatedBook] = useState<string | null>(null);

  const { data, isError, isLoading } = useBook(id);

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

  const beginRecording = () => {
    setIsRecording(true);
    if (Object.keys(chapterSelection).length < 1 && chaptersRead) {
      const chapterSelection: ChapterSelection = {};
      Object.keys(chaptersRead).forEach((key) => {
        chapterSelection[Number(key)] = true;
      });
      setChapterSelection(chapterSelection);
    }
  };
  const cancelRecording = () => setIsRecording(false);
  const saveRecording = () => {
    const chapters: number[] = [];
    Object.keys(chapterSelection).forEach((key: string) => {
      const chapter = Number(key);
      if (chapterSelection[chapter] === true) chapters.push(chapter);
    });
    const updatedBook = recordReading({ book: name, chapters });
    if (updatedBook) {
      setLastUpdatedBook(updatedBook);
    }
    setIsRecording(false);
  };
  const toggleTileSelected = (chapter: number) => {
    const updatedChapterSelection = { ...chapterSelection };
    updatedChapterSelection[chapter] = !chapterSelection[chapter];
    setChapterSelection(updatedChapterSelection);
  };

  if (isLoading) return <Loader />;
  if (isError || !data) return <ErrorMessage />;

  const { name, chapters, chaptersRead = {} } = data;

  const chapterTiles = [...Array(chapters).keys()].map((index) => {
    const chapter = index + 1;
    return (
      <ChapterTile
        beginRecording={beginRecording}
        bookTitle={name}
        chapter={chapter}
        readDates={chaptersRead?.[chapter]}
        isRecording={isRecording}
        key={chapter}
        toggleTileSelected={toggleTileSelected}
      />
    );
  });

  return (
    <>
      <BookPageHeader
        pageTitle={name}
        isRecording={isRecording}
        cancelRecording={cancelRecording}
        saveRecording={saveRecording}
      />
      <GridLayout>{chapterTiles}</GridLayout>
    </>
  );
}
