import { Popover, Box, List, ThemeIcon } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconCalendar, IconBook, IconExternalLink, IconPencil } from "@tabler/icons";
import Link from "next/link";
import { FC, useState, CSSProperties } from "react";
import { BACKGROUND_COLOR, BaseTile, RECORDING_BACKGROUND_COLOR } from "./BaseTile";

export type ChapterTileProps = {
  bookTitle: string;
  chapter: number;
  readDates?: Date[];
  isRecording: boolean;
  beginRecording: ({ chapter }: {chapter?: number}) => void;
  toggleTileSelected: (chapter: number) => void;
};

export const ChapterTile: FC<ChapterTileProps> = ({
  bookTitle,
  chapter,
  readDates,
  isRecording,
  toggleTileSelected,
  beginRecording,
}) => {
  const isRead = !!readDates;
  const [isSelected, setIsSelected] = useState<boolean>(isRead);
  const [popoverOpened, setPopoverOpened] = useState<boolean>(false);
  const ref = useClickOutside(() => setPopoverOpened(false));

  const chapterTileStyle: CSSProperties = {
    backgroundColor: isRead ? BACKGROUND_COLOR.READ : BACKGROUND_COLOR.UNREAD,
  };

  const recordingChapterTileStyle: CSSProperties = {
    backgroundColor: isSelected
      ? RECORDING_BACKGROUND_COLOR.SELECTED
      : RECORDING_BACKGROUND_COLOR.DESELECTED,
    color: "var(--mantine-color-dark-9)",
  };

  const handleChapterSelectionChange = () => {
    setIsSelected(!isSelected);
    toggleTileSelected(chapter);
  };

  const handleBeginRecording = () => {
    setIsSelected(true);
    beginRecording({ chapter });
  }

  const togglePopoverOpen = () => {
    setPopoverOpened(!popoverOpened);
  };

  const lastReadDate = isRead
    ? new Date(readDates[readDates.length - 1]).toDateString()
    : "Never";

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
                  onClickCapture={handleBeginRecording}
                  style={{ cursor: "pointer" }}
                  icon={
                    <ThemeIcon color={"gray"} size={24} radius="xl">
                      <IconPencil size={24} />
                    </ThemeIcon>
                  }
                >
                  <span>Record reading</span>
                </List.Item>
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
                  icon={
                    <ThemeIcon color={"gray"} size={24} radius="xl">
                      <IconCalendar size={24} />
                    </ThemeIcon>
                  }
                >
                  <span>Last read: {lastReadDate}</span>
                </List.Item>
              </List>
            </Box>
          </Popover.Dropdown>
        </Popover>
      )}
    </div>
  );
};
