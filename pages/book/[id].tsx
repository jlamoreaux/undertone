import { useRouter } from "next/router";
import { Loader, ActionIcon } from "@mantine/core";
import GridLayout from "../../components/Grid";
import { ChapterTile } from "../../components/Tile";
import { useBook } from "../../hooks/useBooks";
import styles from "../../styles/Home.module.css";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons";

export const ErrorMessage = () => <div>Uh oh! Something went wrong!</div>

const BookPageHeader = ({ pageTitle }: { pageTitle: string }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Link href="/">
        <ActionIcon title="Go Back" aria-label='Go Back'>
          <IconArrowLeft size={32} />
        </ActionIcon>
      </Link>
    <h2 className={styles.title} style={{ width: "100%", textAlign: "right" }}>
      {pageTitle}
    </h2>
  </div>
  )
}

const BookPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, isError, isLoading } = useBook(id as string);

  if (isLoading) return <Loader />
  if (isError || !data) return <ErrorMessage />

  const { name, chapters, chaptersRead } = data;
  const chapterTiles = [];
  for (let i = 1; i <= chapters; i++) {
    chapterTiles.push(<ChapterTile chapter={i} isRead={chaptersRead?.includes(i) || false} key={i} />)
  }
  return (
    <section>
      <BookPageHeader pageTitle={name} />
      <GridLayout>{chapterTiles}</GridLayout>
    </section>
  )
};

export default BookPage;
