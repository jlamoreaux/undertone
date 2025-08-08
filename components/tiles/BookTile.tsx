import Link from "next/link";
import { FC, CSSProperties } from "react";
import { Book } from "../../hooks/useBooks";
import { BACKGROUND_COLOR, BaseTile } from "./BaseTile";

type BookTileProps = {
  book: Book;
  bookId: number;
};

export const BookTile: FC<BookTileProps> = ({ book, bookId }) => {
  const readPercentage =
    (book.chaptersRead &&
      Math.floor(
        ((Object.keys(book.chaptersRead).length || 0) / book.chapters) * 100
      )) ||
    0;
  const generateBookTileStyle = (readPercentage: number): CSSProperties => {
    return {
      cursor: "pointer",
      background: `linear-gradient(90deg, ${BACKGROUND_COLOR.READ} ${readPercentage}%, ${BACKGROUND_COLOR.UNREAD} ${readPercentage}%)`,
    };
  };
  return (
    <Link href={`/book/${bookId}`} style={{ textDecoration: "none" }}>
      <BaseTile
        label={book.shortName}
        style={generateBookTileStyle(readPercentage)}
      />
    </Link>
  );
};
