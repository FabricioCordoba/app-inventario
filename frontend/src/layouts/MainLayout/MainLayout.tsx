import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.css';

export function MainLayout() {
  return (
    <div>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <div className={styles.brand}>BV Barker — Inventarios</div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
