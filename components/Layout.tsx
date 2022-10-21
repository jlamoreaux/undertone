import Link from "next/link";
import React, { ReactNode } from "react";
import styles from "../styles/Home.module.css";

const Layout = ({ children }: {children: ReactNode | ReactNode[]}) => {
  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}><Link href="/">Undrtone</Link></h1>
      </header>
      <main className={styles.main}>{children} </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Layout;
