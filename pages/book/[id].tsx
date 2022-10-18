import { useRouter } from 'next/router';
import GridLayout from '../../components/Grid';
import { ChapterTile } from '../../components/Tile';
import { SingleBookResponse, useBook } from '../../hooks/useBooks';
import { getStickyValue } from '../../hooks/useStickyState';

export const ErrorMessage = () => <div>Uh oh! Something went wrong!</div>
export const LoadingMessage = () => <div>Loading...</div>

const BookPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, isError, isLoading } = useBook(id as string);

  if (isLoading ) return <LoadingMessage /> 
  if (isError || !data) return <ErrorMessage />

  const { name, chapters, chaptersRead } = data;
  let chapterTiles = [];
  for (let i = 1; i <= chapters; i++) {
    chapterTiles.push(<ChapterTile chapter={i} isRead={chaptersRead?.includes(i) || false} key={i} />)
  }
  return <GridLayout>{chapterTiles}</GridLayout>
};

export default BookPage;
