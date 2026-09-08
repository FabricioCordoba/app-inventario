import { Link, Outlet, useNavigate } from 'react-router-dom';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <div className={styles.brand}>BV Barker — Inventarios</div>
          <nav className={styles.nav}>
            {isAuthenticated ? (
              <>
                <Link to="/">Inicio</Link>
                <Link to="/usuarios">Usuarios</Link>
                <Link to="/roles">Roles</Link>
                <Link to="/catalogos">Catálogos</Link>
                <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login">Iniciar sesión</Link>
            )}
          </nav>
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
