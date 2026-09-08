import { useEffect, useState } from 'react';
import styles from './Users.module.css';

type UserRole = {
  rol?: {
    id: number;
    nombre: string;
    codigo: string;
  };
};

type UserRecord = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  jerarquia?: {
    id: number;
    nombre: string;
  };
  usuarioRoles?: UserRole[];
};

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para ver usuarios.');
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(response.status === 403 ? 'No tiene permisos para ver usuarios.' : 'No se pudo cargar la lista de usuarios.');
        }

        return (await response.json()) as UserRecord[];
      })
      .then(setUsers)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>Administración de usuarios y roles</p>
        </div>
      </div>

      {loading && <div className={styles.state}>Cargando usuarios...</div>}
      {error && <div className={styles.alert}>{error}</div>}

      {!loading && !error && users.length === 0 && (
        <div className={styles.state}>No hay usuarios registrados.</div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Jerarquía</th>
                <th>Roles</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.nombre} {user.apellido}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.jerarquia?.nombre ?? 'Sin jerarquía'}</td>
                  <td>
                    <div className={styles.chipList}>
                      {(user.usuarioRoles ?? []).map((usuarioRol) => (
                        <span key={`${user.id}-${usuarioRol.rol?.id ?? 'rol'}`} className={styles.chip}>
                          {usuarioRol.rol?.nombre ?? 'Sin rol'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={user.activo ? styles.statusActive : styles.statusInactive}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
