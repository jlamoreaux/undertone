import { CSSProperties, FC, useState } from 'react';
import Link from 'next/link';


export interface Book {
  name: string;
  metadata: {
    bookType: string;
    jwLink: string;
  };
  chapters: number;
  shortName: string;
  chaptersRead?: number[];
}

type BaseTileProps = {
  label: string;
  style?: CSSProperties;
}

type BookTileProps = {
  book: Book;
  bookId: number;
}

type ChapterTileProps = {
  chapter: number;
  isRead: boolean;
}

enum BACKGROUND_COLOR {
  READ = '#4b4b4b',
  UNREAD = '#9a9a9a',
}

const TILE_SIZE = '48px';
const HOVER_SIZE = '52px';


export const BaseTile: FC<BaseTileProps> = ({ label, style }) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const handleMouseEnter = () => setIsHover(false); // change this to true after getting things figured out
  const handleMouseLeave = () => setIsHover(false);


  const baseTileStyle: CSSProperties = {
    width: isHover ? HOVER_SIZE : TILE_SIZE,
    height: isHover ? HOVER_SIZE : TILE_SIZE,
    color: '#efefef',
    textAlign: 'center',
    lineHeight: isHover ? HOVER_SIZE : TILE_SIZE,
    margin: isHover ? '-2px' : 'auto',
    // transition: 'all .2s', not sure how to get this to work without everything "jumping"
  };
  return (
    <div style={{ ...baseTileStyle, ...style }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {label}
    </div>
  );
}

export const BookTile: FC<BookTileProps> = ({ book, bookId }) => {
  
  const readPercentage = Math.floor(
    ((book.chaptersRead?.length || 0) / book.chapters) * 100
  );
  const generateBookTileStyle = (readPercentage: number): CSSProperties => {
    return {
      cursor: 'pointer',
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

export const ChapterTile: FC<ChapterTileProps> = ({ chapter, isRead }) => {
  const chapterTileStyle: CSSProperties = {
    "backgroundColor": isRead ? BACKGROUND_COLOR.READ : BACKGROUND_COLOR.UNREAD
  }
  return (
    <BaseTile label={chapter.toString()} style={chapterTileStyle} />
  )
}