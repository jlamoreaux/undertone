import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import GridLayout from '../components/Grid';
import {BookTile, Book} from '../components/Tile';
import { useAllBooks } from '../hooks/useBooks';
import useStickyState, {getStickyValue} from '../hooks/useStickyState';
import ModalButton from '../components/ModalButton';
import RecordForm from '../components/RecordForm';
import { useState } from 'react';

export type ReadingRecord = {
  [book: string]: number[];
}

export type ReadingForm = {
  book: string | undefined;
  chapters: number[];
}

const sortNumerically = (numbers: number[]) => {
  return numbers.sort((a: number, b: number) => a - b)
}

const Home: NextPage = () => {
  const { data: books, isError, isLoading } = useAllBooks();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDoneRecordingToday, setIsDoneRecordingToday] = useStickyState<boolean>(false, 'isDoneRecordingToday');
  const [readingRecord, setReadingRecord] = useStickyState<ReadingRecord>({}, 'readingRecord');

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  
  const handleSubmitRecord = (record: ReadingForm) => {
    const { book, chapters } = record;
    if (!book) {
      return;
    }
    const currentRecord = getStickyValue('readingRecord');
    if (currentRecord && Object.keys(currentRecord).length !== 0) {
      if (currentRecord[book]) {
        currentRecord[book] = sortNumerically(currentRecord[book].concat(chapters));
      } else {
        currentRecord[book] = chapters.sort();
      }
      setReadingRecord(currentRecord);
    } else {
      setReadingRecord({ [book]: sortNumerically(chapters) });
    }
    setIsDoneRecordingToday(true);
    handleModalClose();
  }
  
  if (isLoading) return <span>Loading...</span>
  if (isError) return <span>Uh Oh! Something went wrong!</span>

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}>Undertone</h1>
      </header>
      <main className={styles.main}>
        <section>
          <div style={{textAlign: "center"}}>
            {isDoneRecordingToday ? "Great job doing your reading! Need to record more?" : "Record today's Bible reading?"}
            <br />
            <ModalButton buttonLabel='📖' opened={isModalOpen} closeModal={handleModalClose} openModal={handleModalOpen}><></><RecordForm handleSubmit={handleSubmitRecord}/></ModalButton>
          </div>
        </section>
        <GridLayout>
          {books.map((book, i) => {
            return <BookTile book={book} bookId={i} key={i} />;
          })}
        </GridLayout>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}

export default Home
