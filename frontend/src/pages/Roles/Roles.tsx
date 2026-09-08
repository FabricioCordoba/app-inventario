import { FormEvent, useEffect, useMemo, useState } from 'react';
import styles from './Roles.module.css';

type Permission = {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
};

type RolePermission = {
  permiso?: Permission;
};

type RoleRecord = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  rolPermisos?: RolePermission[];
};

export function RolesPage() {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState({ codigo: '', nombre: '', descripcion: '' });

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const apiHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const loadData = async () => {
    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para administrar roles.');
      setLoading(false);
      return;
    }

    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/roles`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/permissions`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!rolesResponse.ok || !permissionsResponse.ok) {
        throw new Error('No tiene permisos para administrar roles.');
      }

      const rolePayload = (await rolesResponse.json()) as RoleRecord[];
      const permissionPayload = (await permissionsResponse.json()) as Permission[];

      setRoles(rolePayload);
      setPermissions(permissionPayload);
      if (!selectedRoleId && rolePayload[0]) {
        setSelectedRoleId(rolePayload[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!selectedRole) {
      return;
    }

    setDraft({
      codigo: selectedRole.codigo,
      nombre: selectedRole.nombre,
      descripcion: selectedRole.descripcion ?? '',
    });
  }, [selectedRole]);

  const handleSelectRole = (roleId: number) => {
    setSelectedRoleId(roleId);
  };

  const handleCreateOrUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para guardar cambios.');
      return;
    }

    setIsSaving(true);

    try {
      const isCreating = !selectedRole;
      const url = isCreating ? `${apiUrl}/api/roles` : `${apiUrl}/api/roles/${selectedRole.id}`;
      const method = isCreating ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: apiHeaders(token),
        body: JSON.stringify({
          codigo: draft.codigo,
          nombre: draft.nombre,
          descripcion: draft.descripcion,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo guardar el rol');
      }

      setError(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRole = async () => {
    if (!selectedRole) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para cambiar el estado del rol.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/roles/${selectedRole.id}/active`, {
        method: 'PATCH',
        headers: apiHeaders(token),
        body: JSON.stringify({ activo: !selectedRole.activo }),
      });

      if (!response.ok) {
        throw new Error('No se pudo cambiar el estado del rol');
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handlePermissionChange = async (permissionId: number, checked: boolean) => {
    if (!selectedRole) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Debe iniciar sesión para cambiar permisos.');
      return;
    }

    const currentPermissions = selectedRole.rolPermisos ?? [];
    const selectedIds = checked
      ? [...new Set([...currentPermissions.map((item) => item.permiso?.id).filter(Boolean), permissionId])]
      : currentPermissions
          .map((item) => item.permiso?.id)
          .filter((id): id is number => Boolean(id) && id !== permissionId);

    try {
      const response = await fetch(`${apiUrl}/api/permissions/roles/${selectedRole.id}`, {
        method: 'PATCH',
        headers: apiHeaders(token),
        body: JSON.stringify({ permisoIds: selectedIds }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? 'No se pudo actualizar permisos');
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Roles y permisos</h1>
          <p className={styles.subtitle}>Administración de roles, validación y permisos por endpoint</p>
        </div>
      </div>

      {loading && <div className={styles.state}>Cargando roles...</div>}
      {error && <div className={styles.alert}>{error}</div>}

      {!loading && !error && roles.length === 0 && (
        <div className={styles.state}>No hay roles registrados.</div>
      )}

      {!loading && !error && (
        <div className={styles.grid}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className={selectedRoleId === role.id ? styles.selectedRow : ''}>
                    <td>{role.codigo}</td>
                    <td>{role.nombre}</td>
                    <td>
                      <span className={role.activo ? styles.statusActive : styles.statusInactive}>
                        {role.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className={styles.linkButton} onClick={() => handleSelectRole(role.id)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form className={styles.formCard} onSubmit={handleCreateOrUpdate}>
            <div className={styles.formHeader}>
              <h2>{selectedRole ? 'Editar rol' : 'Crear rol'}</h2>
              {selectedRole && (
                <button type="button" className={styles.secondaryButton} onClick={handleToggleRole}>
                  {selectedRole.activo ? 'Desactivar' : 'Activar'}
                </button>
              )}
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Código</span>
                <input
                  value={draft.codigo}
                  onChange={(event) => setDraft((current) => ({ ...current, codigo: event.target.value }))}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Nombre</span>
                <input
                  value={draft.nombre}
                  onChange={(event) => setDraft((current) => ({ ...current, nombre: event.target.value }))}
                  required
                />
              </label>

              <label className={styles.fieldFull}>
                <span>Descripción</span>
                <textarea
                  value={draft.descripcion}
                  rows={3}
                  onChange={(event) => setDraft((current) => ({ ...current, descripcion: event.target.value }))}
                />
              </label>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                {isSaving ? 'Guardando...' : selectedRole ? 'Guardar cambios' : 'Crear rol'}
              </button>
            </div>
          </form>

          {selectedRole && (
            <div className={styles.permissionsCard}>
              <h3>Permisos del rol</h3>
              <div className={styles.permissionList}>
                {permissions.map((permission) => {
                  const isChecked = (selectedRole.rolPermisos ?? []).some(
                    (rolePermission) => rolePermission.permiso?.id === permission.id,
                  );

                  return (
                    <label key={permission.id} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(event) => handlePermissionChange(permission.id, event.target.checked)}
                      />
                      <span>
                        <strong>{permission.codigo}</strong>
                        <small>{permission.modulo}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
