import { CSSProperties, FC, useState } from "react";
import Link from "next/link";
import { Box, List, Popover, ThemeIcon } from "@mantine/core";
import { IconBook, IconExternalLink, IconPencil } from "@tabler/icons";
import { useClickOutside } from "@mantine/hooks";
import { ChaptersRead } from "../hooks/useBooks";


export interface Book {
  name: string;
  metadata: {
    bookType: string;
    jwLink: string;
  };
  chapters: number;
  shortName: string;
  chaptersRead?: ChaptersRead;
}

type BaseTileProps = React.DOMAttributes<HTMLDivElement> & {
  label: string;
  style?: CSSProperties;
};

type BookTileProps = {
  book: Book;
  bookId: number;
}

type ChapterTileProps = {
  bookTitle: string;
  chapter: number;
  isRead: boolean;
  isRecording: boolean;
  isSelectedByDefault: boolean;
  beginRecording: () => void;
  toggleTileSelected: (chapter: number)=> void;
};

export enum BACKGROUND_COLOR {
  UNREAD = "var(--mantine-color-gray-6)",
  READ = "var(--mantine-color-gray-8)",
}

enum RECORDING_BACKGROUND_COLOR {
  SELECTED = "var(--mantine-color-indigo-6)",
  DESELECTED = "var(--mantine-color-indigo-2)",
}

const TILE_SIZE = "48px";
const HOVER_SIZE = "52px";


export const BaseTile: FC<BaseTileProps> = ({ label, style, ...attributes }) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const handleMouseEnter = () => setIsHover(true); // change this to true after getting things figured out
  const handleMouseLeave = () => setIsHover(false);


  const baseTileStyle: CSSProperties = {
    width: isHover ? HOVER_SIZE : TILE_SIZE,
    height: isHover ? HOVER_SIZE : TILE_SIZE,
    cursor: "pointer",
    color: "#efefef",
    textAlign: "center",
    lineHeight: isHover ? HOVER_SIZE : TILE_SIZE,
    margin: isHover ? "-2px" : "auto",
    // transition: "all .2s", // not sure how to get this to work without everything "jumping"
  };
  return (
    <div style={{ ...baseTileStyle, ...style }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...attributes}>
        {label}
    </div>
  );
}

export const BookTile: FC<BookTileProps> = ({ book, bookId }) => {

  const readPercentage = book.chaptersRead && Math.floor(
    ((Object.keys(book.chaptersRead).length || 0) / book.chapters) * 100
  ) || 0;
  const generateBookTileStyle = (readPercentage: number): CSSProperties => {
    return {
      cursor: "pointer",
      background: `linear-gradient(90deg, ${BACKGROUND_COLOR.READ} ${readPercentage}%, ${BACKGROUND_COLOR.UNREAD} ${readPercentage}%)`,
    };
  };
  return (
    <Link href={`/book/${bookId}`}>
      <a>
        <BaseTile
          label={book.shortName}
          style={generateBookTileStyle(readPercentage)}
        />
      </a>
    </Link>
  );
};

export const ChapterTile: FC<ChapterTileProps> = ({ bookTitle, chapter, isRead, isRecording, isSelectedByDefault, toggleTileSelected, beginRecording }) => {
  const [isSelected, setIsSelected] = useState<boolean>(isSelectedByDefault);
  const [popoverOpened, setPopoverOpened] = useState<boolean>(false);
  const ref = useClickOutside(() => setPopoverOpened(false));

  const chapterTileStyle: CSSProperties = {
    backgroundColor: isRead ? BACKGROUND_COLOR.READ : BACKGROUND_COLOR.UNREAD,
  }

  const recordingChapterTileStyle: CSSProperties = {
    backgroundColor: isSelected ? RECORDING_BACKGROUND_COLOR.SELECTED : RECORDING_BACKGROUND_COLOR.DESELECTED,
    color: "var(--mantine-color-dark-9)",
  }

  const handleChapterSelectionChange = () => {
    setIsSelected(!isSelected);
    toggleTileSelected(chapter);
  }

  const togglePopoverOpen = () => {
    setPopoverOpened(!popoverOpened);
  }

  return (
    <div style={{ margin: "auto", verticalAlign: "middle" }}>
      {isRecording ? (
        <BaseTile
          label={chapter.toString()}
          style={recordingChapterTileStyle}
          onClickCapture={handleChapterSelectionChange}
        />
      ) : (
        <Popover
          closeOnClickOutside={true}
          opened={popoverOpened}
          position="bottom"
          transition="slide-down"
        >
          <Popover.Target>
            <BaseTile
              label={chapter.toString()}
              style={chapterTileStyle}
              onClickCapture={togglePopoverOpen}
            />
          </Popover.Target>
          <Popover.Dropdown>
            <Box ref={ref}>
              <List spacing="xs" size="lg">
                <List.Item
                  icon={
                    <ThemeIcon color={"gray"} size={24} radius="xl">
                      <IconBook size={24} />
                    </ThemeIcon>
                  }
                >
                  <Link
                    href={`https://www.jw.org/en/library/bible/nwt/books/${bookTitle}/${chapter}/`}
                  >
                    <a>
                      Read <IconExternalLink />
                    </a>
                  </Link>
                </List.Item>
                <List.Item
                  onClickCapture={beginRecording}
                  style={{ cursor: "pointer" }}
                  icon={
                    <ThemeIcon color={"gray"} size={24} radius="xl">
                      <IconPencil size={24} />
                    </ThemeIcon>
                  }
                >
                  <span>Record reading</span>
                </List.Item>
              </List>
            </Box>
          </Popover.Dropdown>
        </Popover>
      )}
    </div>
  );
}