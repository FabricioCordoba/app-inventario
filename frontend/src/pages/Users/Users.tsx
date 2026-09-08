import { FormEvent, useEffect, useMemo, useState } from 'react';
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

type UserForm = {
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
};

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>({ nombre: '', apellido: '', email: '', activo: true });
  const [isSaving, setIsSaving] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const loadUsers = async () => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para ver usuarios.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? 'No tiene permisos para ver usuarios.'
            : 'No se pudo cargar la lista de usuarios.',
        );
      }

      const payload = (await response.json()) as UserRecord[];
      setUsers(payload);
      if (!selectedUserId && payload[0]) {
        setSelectedUserId(payload[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setForm({
      nombre: selectedUser.nombre,
      apellido: selectedUser.apellido,
      email: selectedUser.email,
      activo: selectedUser.activo,
    });
  }, [selectedUser]);

  const handleSelectUser = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleToggleActive = async () => {
    if (!selectedUser) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${apiUrl}/api/users/${selectedUser.id}/active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !selectedUser.activo }),
      });

      if (!response.ok) {
        throw new Error('No se pudo cambiar el estado del usuario');
      }

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');
    setIsSaving(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo guardar la edición');
      }

      await loadUsers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSaving(false);
    }
  };

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
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Jerarquía</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={selectedUserId === user.id ? styles.selectedRow : ''}>
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
                    <td>
                      <button type="button" className={styles.linkButton} onClick={() => handleSelectUser(user.id)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <form className={styles.formCard} onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                <h2>Editar usuario</h2>
                <button type="button" className={styles.secondaryButton} onClick={handleToggleActive}>
                  {selectedUser.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Nombre</span>
                  <input
                    value={form.nombre}
                    onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Apellido</span>
                  <input
                    value={form.apellido}
                    onChange={(event) => setForm((current) => ({ ...current, apellido: event.target.value }))}
                    required
                  />
                </label>

                <label className={styles.fieldFull}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </label>

                <label className={styles.fieldBoolean}>
                  <span>Estado</span>
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
                  />
                  <small>{form.activo ? 'Usuario activo' : 'Usuario inactivo'}</small>
                </label>
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
