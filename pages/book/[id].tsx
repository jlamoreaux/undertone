import { useRouter } from "next/router";
import { Loader, ActionIcon, Title, Group } from "@mantine/core";
import GridLayout from "../../components/Grid";
import { ChapterTile } from "../../components/tiles/ChapterTile";
import { useBook } from "../../hooks/useBooks";
import Link from "next/link";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons";
import { useState } from "react";
import { recordReading } from "..";

export const ErrorMessage = () => <div>Uh oh! Something went wrong!</div>

interface BookPageHeaderProps {
  pageTitle: string;
  isRecording: boolean;
  cancelRecording: () => void;
  saveRecording: () => void;
}

interface ChapterSelection {
  [key: number]: boolean;
}

const BookPageHeader = ({ pageTitle, isRecording, cancelRecording, saveRecording }: BookPageHeaderProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Group noWrap={true}>
        <Link href="/">
            <ActionIcon title="Go Back" aria-label="Go Back">
              <IconArrowLeft size={32} />
            </ActionIcon>
        </Link>
        {isRecording && (
          <>
            <ActionIcon
              onClickCapture={cancelRecording}
              title="Cancel"
              aria-label="cancel"
            >
              <IconX size={32} color="red" />
            </ActionIcon>
            <ActionIcon
              onClickCapture={saveRecording}
              title="Save"
              aria-label="save"
            >
              <IconCheck size={32} color="green" />
            </ActionIcon>
          </>
        )}
      </Group>
      <Title order={2} style={{ width: "100%", textAlign: "right" }}>
        {pageTitle}
      </Title>
    </div>
  );
}

const BookPage = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [chapterSelection, setChapterSelection] = useState<ChapterSelection>({});
  const router = useRouter();
  const { id } = router.query;

  const { data, isError, isLoading } = useBook(id as string);

  const beginRecording = () => {
    setIsRecording(true);
    if (Object.keys(chapterSelection).length < 1 && chaptersRead) {
      const chapterSelection: ChapterSelection = {};
      Object.keys(chaptersRead).forEach((key) => {
        chapterSelection[Number(key)] = true;
      });
      setChapterSelection(chapterSelection);
    }
  }
  const cancelRecording = () => setIsRecording(false);
  const saveRecording = () => {
    const chapters: number[] = [];
    Object.keys(chapterSelection).forEach((key: string) => {
      const chapter = Number(key);
      if (chapterSelection[chapter] === true)
        chapters.push(chapter);
    });
    recordReading({ book: name, chapters })
    setIsRecording(false);
  }
  const toggleTileSelected = (chapter: number) => {
    const updatedChapterSelection = chapterSelection;
    updatedChapterSelection[chapter] = !chapterSelection[chapter];
    setChapterSelection(updatedChapterSelection);
  }


  if (isLoading) return <Loader />
  if (isError || !data) return <ErrorMessage />

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
    <section>
      <BookPageHeader pageTitle={name} isRecording={isRecording} cancelRecording={cancelRecording} saveRecording={saveRecording} />
      <GridLayout>
        {chapterTiles}
      </GridLayout>
    </section>
  )
};

export default BookPage;
