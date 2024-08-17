import Link from "next/link";
import React, { ReactNode, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Title } from "@mantine/core";
import { getStreakLength } from "../utils";

const Layout = ({ children }: { children: ReactNode | ReactNode[]; }) => {
  const [streakLength, setStreakLength] = useState<number>(0);
  useEffect(() => {
    setStreakLength(getStreakLength());
  }, []);

  return (
    <div className={styles.container}>
      <header>
        <Title order={1} className={styles.title}><Link href="/">Undrtone</Link></Title>
        <Title order={4} className={styles.subtitle}>{streakLength > 0 && `You're on a ${streakLength} day streak!`}</Title>
      </header>
      <main className={styles.main}>{children} </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Layout;
